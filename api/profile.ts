import type { VercelRequest, VercelResponse } from "@vercel/node";
import { profileRequestSchema } from "./_lib/schema";
import type {
  GitHubUserProfile,
  UserRepoSummary,
  LanguageBreakdown,
  ProfileScore,
  ProfileAnalysisResultFull,
} from "./_lib/schema";
import {
  githubFetch,
  fetchPinnedRepoNames,
  fetchContributionHeatmap,
  generateHiringInsights,
  buildSkillDomains,
} from "./_lib/github";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parsed = profileRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    let username = parsed.data.username.trim();
    username = username.replace(/^(https?:\/\/)?(www\.)?github\.com\//, "").replace(/\/$/, "");

    const [userData, reposData] = await Promise.all([
      githubFetch(`/users/${username}`),
      githubFetch(`/users/${username}/repos?per_page=100&sort=updated&type=owner`).catch(() => []),
    ]);

    const user: GitHubUserProfile = {
      login: userData.login,
      name: userData.name,
      avatar_url: userData.avatar_url,
      html_url: userData.html_url,
      bio: userData.bio,
      company: userData.company,
      location: userData.location,
      blog: userData.blog,
      twitter_username: userData.twitter_username,
      public_repos: userData.public_repos,
      public_gists: userData.public_gists,
      followers: userData.followers,
      following: userData.following,
      created_at: userData.created_at,
    };

    const repos: UserRepoSummary[] = Array.isArray(reposData)
      ? reposData.map((r: any) => ({
          name: r.name,
          full_name: r.full_name,
          html_url: r.html_url,
          description: r.description,
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
          language: r.language,
          updated_at: r.updated_at,
          topics: r.topics || [],
          archived: r.archived,
          fork: r.fork,
        }))
      : [];

    const ownRepos = repos.filter((r) => !r.fork);
    const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = ownRepos.reduce((sum, r) => sum + r.forks_count, 0);
    const avgStarsPerRepo = ownRepos.length > 0 ? Math.round((totalStars / ownRepos.length) * 10) / 10 : 0;

    const languages: LanguageBreakdown = {};
    for (const repo of ownRepos) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    }
    const topLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    const now = new Date();
    const created = new Date(user.created_at);
    const accountAgeDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    const activityTimeline: { month: string; repos: number }[] = [];
    const monthMap = new Map<string, number>();
    for (const repo of ownRepos) {
      const d = new Date(repo.updated_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    }
    const sortedMonths = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
    for (const [month, count] of sortedMonths) {
      activityTimeline.push({ month, repos: count });
    }

    let repoScore = 0;
    if (ownRepos.length >= 30) repoScore = 25;
    else if (ownRepos.length >= 15) repoScore = 20;
    else if (ownRepos.length >= 5) repoScore = 12;
    else if (ownRepos.length >= 1) repoScore = 5;

    let starsScore = 0;
    if (totalStars >= 500) starsScore = 25;
    else if (totalStars >= 100) starsScore = 20;
    else if (totalStars >= 20) starsScore = 12;
    else if (totalStars >= 1) starsScore = 5;

    let followersScore = 0;
    if (user.followers >= 500) followersScore = 20;
    else if (user.followers >= 100) followersScore = 15;
    else if (user.followers >= 20) followersScore = 10;
    else if (user.followers >= 5) followersScore = 5;

    let diversityScore = 0;
    if (topLanguages.length >= 5) diversityScore = 15;
    else if (topLanguages.length >= 3) diversityScore = 10;
    else if (topLanguages.length >= 2) diversityScore = 5;

    let consistencyScore = 0;
    if (activityTimeline.length >= 10) consistencyScore = 15;
    else if (activityTimeline.length >= 6) consistencyScore = 10;
    else if (activityTimeline.length >= 3) consistencyScore = 5;

    const totalProfileScore = repoScore + starsScore + followersScore + diversityScore + consistencyScore;
    let profileLabel: ProfileScore["label"];
    if (totalProfileScore >= 80) profileLabel = "Outstanding";
    else if (totalProfileScore >= 55) profileLabel = "Strong";
    else if (totalProfileScore >= 30) profileLabel = "Growing";
    else profileLabel = "Beginner";

    const profileScore: ProfileScore = {
      total: totalProfileScore,
      label: profileLabel,
      breakdown: {
        repos: repoScore,
        stars: starsScore,
        followers: followersScore,
        diversity: diversityScore,
        consistency: consistencyScore,
      },
    };

    const [pinnedRepoNames, contributionHeatmap] = await Promise.all([
      fetchPinnedRepoNames(username),
      fetchContributionHeatmap(username),
    ]);

    const hiringInsights = generateHiringInsights(
      user, ownRepos, repos, totalStars, totalForks, topLanguages,
      accountAgeDays, avgStarsPerRepo, profileScore, activityTimeline, pinnedRepoNames
    );

    const skillDomains = buildSkillDomains(languages);

    const result: ProfileAnalysisResultFull = {
      user, repos: ownRepos, totalStars, totalForks, languages, topLanguages,
      accountAgeDays, avgStarsPerRepo, profileScore, activityTimeline,
      hiringInsights, contributionHeatmap, skillDomains,
    };

    return res.json(result);
  } catch (err: any) {
    const message = err.message || "Profile analysis failed";
    const status = message.includes("rate limit") ? 429 : message.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: message });
  }
}
