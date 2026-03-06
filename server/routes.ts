import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeRequestSchema, profileRequestSchema } from "@shared/schema";
import type {
  RepoDetails,
  Contributor,
  LanguageBreakdown,
  TreeItem,
  TechStackItem,
  RepoScore,
  ReadmeSummary,
  AnalysisResult,
  ProjectComplexity,
  RepoHealth,
  GitHubUserProfile,
  UserRepoSummary,
  ProfileAnalysisResult,
  ProfileScore,
  HiringInsights,
  ContributionDay,
  SkillDomain,
  ProfileAnalysisResultFull,
} from "@shared/schema";

const GITHUB_API = "https://api.github.com";

async function githubFetch(path: string, retries = 0): Promise<any> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "repo-intelligence-dashboard",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  if (res.status === 202 && retries < 2) {
    await new Promise((r) => setTimeout(r, 2000));
    return githubFetch(path, retries + 1);
  }
  if (!res.ok) {
    if (res.status === 403) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      if (remaining === "0") {
        throw new Error("GitHub API rate limit exceeded. Try again later or add a GITHUB_TOKEN.");
      }
    }
    if (res.status === 404) {
      throw new Error("Not found on GitHub. Please check the URL or username.");
    }
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function parseGitHubUrl(url: string): { owner: string; repo: string } {
  let normalized = url.trim();
  if (!normalized.startsWith("http")) {
    normalized = `https://${normalized}`;
  }
  const match = normalized.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  return { owner: match[1], repo: match[2].replace(/\.git$/, "").replace(/\/$/, "") };
}

function detectTechStack(tree: TreeItem[], languages: LanguageBreakdown): TechStackItem[] {
  const stack: TechStackItem[] = [];
  const filePaths = new Set(tree.map((t) => t.path.toLowerCase()));
  const fileNames = new Set(tree.map((t) => t.path.split("/").pop()?.toLowerCase() || ""));

  if (fileNames.has("package.json")) {
    stack.push({ name: "Node.js", category: "runtime" });
  }
  if (fileNames.has("next.config.js") || fileNames.has("next.config.mjs") || fileNames.has("next.config.ts")) {
    stack.push({ name: "Next.js", category: "framework" });
  }
  if (fileNames.has("nuxt.config.js") || fileNames.has("nuxt.config.ts")) {
    stack.push({ name: "Nuxt.js", category: "framework" });
  }
  if (fileNames.has("vite.config.js") || fileNames.has("vite.config.ts")) {
    stack.push({ name: "Vite", category: "tool" });
  }
  if (fileNames.has("webpack.config.js") || fileNames.has("webpack.config.ts")) {
    stack.push({ name: "Webpack", category: "tool" });
  }
  if (fileNames.has("tailwind.config.js") || fileNames.has("tailwind.config.ts")) {
    stack.push({ name: "Tailwind CSS", category: "library" });
  }
  if (fileNames.has("tsconfig.json")) {
    stack.push({ name: "TypeScript", category: "language" });
  }
  if (fileNames.has("requirements.txt") || fileNames.has("setup.py") || fileNames.has("pyproject.toml")) {
    stack.push({ name: "Python", category: "language" });
  }
  if (fileNames.has("go.mod")) {
    stack.push({ name: "Go", category: "language" });
  }
  if (fileNames.has("cargo.toml")) {
    stack.push({ name: "Rust", category: "language" });
  }
  if (fileNames.has("gemfile")) {
    stack.push({ name: "Ruby", category: "language" });
  }
  if (fileNames.has("pom.xml") || fileNames.has("build.gradle") || fileNames.has("build.gradle.kts")) {
    stack.push({ name: "Java", category: "language" });
  }
  if (fileNames.has("dockerfile") || fileNames.has("docker-compose.yml") || fileNames.has("docker-compose.yaml")) {
    stack.push({ name: "Docker", category: "tool" });
  }
  if (fileNames.has(".github")) {
    stack.push({ name: "GitHub Actions", category: "tool" });
  }
  if (fileNames.has("vercel.json")) {
    stack.push({ name: "Vercel", category: "cloud" });
  }
  if (fileNames.has(".eslintrc.js") || fileNames.has(".eslintrc.json") || fileNames.has("eslint.config.js") || fileNames.has("eslint.config.mjs")) {
    stack.push({ name: "ESLint", category: "tool" });
  }
  if (fileNames.has("jest.config.js") || fileNames.has("jest.config.ts")) {
    stack.push({ name: "Jest", category: "tool" });
  }
  if (fileNames.has("prisma")) {
    stack.push({ name: "Prisma", category: "database" });
  }
  if (fileNames.has(".env") || fileNames.has(".env.example")) {
    stack.push({ name: "dotenv", category: "tool" });
  }

  const langNames = Object.keys(languages);
  for (const lang of langNames) {
    const existing = stack.find((s) => s.name.toLowerCase() === lang.toLowerCase());
    if (!existing) {
      stack.push({ name: lang, category: "language" });
    }
  }

  return stack;
}

function calculateScore(
  repo: RepoDetails,
  contributors: Contributor[],
  commitActivity: number[],
  hasReadme: boolean,
): RepoScore {
  let stars = 0;
  if (repo.stargazers_count >= 10000) stars = 25;
  else if (repo.stargazers_count >= 1000) stars = 20;
  else if (repo.stargazers_count >= 100) stars = 15;
  else if (repo.stargazers_count >= 10) stars = 10;
  else if (repo.stargazers_count >= 1) stars = 5;

  let contribScore = 0;
  if (contributors.length >= 50) contribScore = 20;
  else if (contributors.length >= 20) contribScore = 15;
  else if (contributors.length >= 5) contribScore = 10;
  else if (contributors.length >= 2) contribScore = 5;

  const totalCommits = commitActivity.reduce((a, b) => a + b, 0);
  let commitFrequency = 0;
  if (totalCommits >= 200) commitFrequency = 20;
  else if (totalCommits >= 100) commitFrequency = 15;
  else if (totalCommits >= 50) commitFrequency = 10;
  else if (totalCommits >= 10) commitFrequency = 5;

  const readmeScore = hasReadme ? 15 : 0;

  let issueRatio = 0;
  const totalIssues = repo.open_issues_count;
  if (totalIssues === 0) issueRatio = 10;
  else if (totalIssues < 10) issueRatio = 8;
  else if (totalIssues < 50) issueRatio = 5;
  else issueRatio = 2;

  const docScore = (repo.has_wiki ? 5 : 0) + (repo.license ? 5 : 0);

  const total = stars + contribScore + commitFrequency + readmeScore + issueRatio + docScore;

  let label: RepoScore["label"];
  if (total >= 80) label = "Excellent";
  else if (total >= 60) label = "Good";
  else if (total >= 40) label = "Average";
  else label = "Needs Improvement";

  return {
    total,
    breakdown: {
      stars,
      contributors: contribScore,
      commitFrequency,
      hasReadme: readmeScore,
      issueRatio,
      documentation: docScore,
    },
    label,
  };
}

function analyzeComplexity(
  tree: TreeItem[],
  languages: LanguageBreakdown,
  contributors: Contributor[],
  commitActivity: number[],
): ProjectComplexity {
  const fileCount = tree.filter((t) => t.type === "blob").length;
  const folderCount = tree.filter((t) => t.type === "tree").length;
  const languageCount = Object.keys(languages).length;
  const contributorCount = contributors.length;
  const totalCommits = commitActivity.reduce((a, b) => a + b, 0);

  const indicators: string[] = [];
  let score = 0;

  if (fileCount >= 500) { score += 3; indicators.push("Large codebase"); }
  else if (fileCount >= 100) { score += 2; indicators.push("Medium codebase"); }
  else { score += 1; indicators.push("Small codebase"); }

  if (languageCount >= 5) { score += 3; indicators.push("Multiple languages"); }
  else if (languageCount >= 3) { score += 2; indicators.push("Several languages"); }
  else { score += 1; }

  if (contributorCount >= 20) { score += 3; indicators.push("Large team"); }
  else if (contributorCount >= 5) { score += 2; indicators.push("Active team"); }
  else { score += 1; }

  if (totalCommits >= 200) { score += 3; indicators.push("High commit activity"); }
  else if (totalCommits >= 50) { score += 2; indicators.push("Regular commits"); }
  else { score += 1; }

  if (folderCount >= 50) { indicators.push("Deep directory structure"); }

  let level: ProjectComplexity["level"];
  if (score >= 10) level = "Enterprise";
  else if (score >= 7) level = "Advanced";
  else if (score >= 4) level = "Intermediate";
  else level = "Beginner";

  return { level, fileCount, folderCount, languageCount, contributorCount, totalCommits, indicators };
}

function analyzeHealth(
  repo: RepoDetails,
  contributors: Contributor[],
  commitActivity: number[],
): RepoHealth {
  const now = new Date();
  const lastPush = new Date(repo.pushed_at);
  const lastCommitDaysAgo = Math.floor((now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24));

  const recentWeeks = commitActivity.slice(-12);
  const totalCommitsRecent = recentWeeks.reduce((a, b) => a + b, 0);
  const contributorActivity = contributors.length;

  let activityLevel: RepoHealth["activityLevel"];
  if (totalCommitsRecent >= 50) activityLevel = "High";
  else if (totalCommitsRecent >= 20) activityLevel = "Moderate";
  else if (totalCommitsRecent >= 5) activityLevel = "Low";
  else activityLevel = "Inactive";

  let maintenance: RepoHealth["maintenance"];
  if (lastCommitDaysAgo <= 7) maintenance = "Active";
  else if (lastCommitDaysAgo <= 30) maintenance = "Maintained";
  else if (lastCommitDaysAgo <= 90) maintenance = "Sporadic";
  else maintenance = "Unmaintained";

  let issueResolution: RepoHealth["issueResolution"];
  const issueCount = repo.open_issues_count;
  if (issueCount === 0) issueResolution = "Excellent";
  else if (issueCount < 20) issueResolution = "Good";
  else if (issueCount < 100) issueResolution = "Needs Attention";
  else issueResolution = "Poor";

  let healthScore = 0;
  if (activityLevel === "High") healthScore += 3;
  else if (activityLevel === "Moderate") healthScore += 2;
  else if (activityLevel === "Low") healthScore += 1;

  if (maintenance === "Active") healthScore += 3;
  else if (maintenance === "Maintained") healthScore += 2;
  else if (maintenance === "Sporadic") healthScore += 1;

  if (issueResolution === "Excellent" || issueResolution === "Good") healthScore += 2;
  else if (issueResolution === "Needs Attention") healthScore += 1;

  let status: RepoHealth["status"];
  if (healthScore >= 7) status = "Healthy";
  else if (healthScore >= 5) status = "Good";
  else if (healthScore >= 3) status = "Warning";
  else status = "Critical";

  return {
    status,
    activityLevel,
    issueResolution,
    maintenance,
    lastCommitDaysAgo,
    openIssues: issueCount,
    totalCommitsRecent,
    contributorActivity,
  };
}

function parseReadme(raw: string): ReadmeSummary {
  const lines = raw.split("\n");
  let description = "";
  let installation = "";
  let usage = "";

  let currentSection = "description";
  const descLines: string[] = [];
  const installLines: string[] = [];
  const usageLines: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (lower.match(/^#{1,3}\s*(install|getting\s*started|setup|quick\s*start)/)) {
      currentSection = "installation";
      continue;
    }
    if (lower.match(/^#{1,3}\s*(usage|how\s*to\s*use|examples?)/)) {
      currentSection = "usage";
      continue;
    }
    if (lower.match(/^#{1,3}\s/) && currentSection !== "description") {
      currentSection = "other";
      continue;
    }

    if (currentSection === "description" && descLines.length < 15) {
      descLines.push(line);
    } else if (currentSection === "installation" && installLines.length < 20) {
      installLines.push(line);
    } else if (currentSection === "usage" && usageLines.length < 20) {
      usageLines.push(line);
    }
  }

  description = descLines.join("\n").trim();
  installation = installLines.join("\n").trim();
  usage = usageLines.join("\n").trim();

  return { raw, description, installation, usage };
}

async function fetchPinnedRepoNames(username: string): Promise<string[]> {
  try {
    const res = await fetch(`https://github.com/${username}`, {
      headers: { "User-Agent": "repo-intelligence-dashboard" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const pinned: string[] = [];
    const regex = /class="repo"[^>]*>([^<]+)<\/span>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      pinned.push(match[1].trim());
    }
    return pinned;
  } catch {
    return [];
  }
}

function generateHiringInsights(
  user: GitHubUserProfile,
  repos: UserRepoSummary[],
  allReposIncludingForks: UserRepoSummary[],
  totalStars: number,
  totalForks: number,
  topLanguages: string[],
  accountAgeDays: number,
  avgStarsPerRepo: number,
  profileScore: ProfileScore,
  activityTimeline: { month: string; repos: number }[],
  pinnedRepoNames: string[],
): HiringInsights {
  const strengths: string[] = [];
  const concerns: string[] = [];

  const accountYears = Math.floor(accountAgeDays / 365);
  let experienceLevel: HiringInsights["experienceLevel"];
  if (accountYears >= 5 && (repos.length >= 15 || user.followers >= 100 || totalStars >= 100)) experienceLevel = "Senior";
  else if (accountYears >= 3 && (repos.length >= 8 || user.followers >= 20 || totalStars >= 20)) experienceLevel = "Mid-Level";
  else if (accountYears >= 1 && (repos.length >= 3 || user.followers >= 5)) experienceLevel = "Junior";
  else experienceLevel = "Entry-Level";

  if (repos.length >= 20) strengths.push("Extensive project portfolio with " + repos.length + " repositories");
  else if (repos.length >= 10) strengths.push("Solid project portfolio with " + repos.length + " repositories");
  else if (repos.length >= 5) strengths.push("Growing portfolio with " + repos.length + " repositories");

  if (totalStars >= 100) strengths.push("Strong community recognition with " + totalStars + " total stars");
  else if (totalStars >= 10) strengths.push("Some community engagement with " + totalStars + " stars earned");

  if (topLanguages.length >= 4) strengths.push("Versatile developer proficient in " + topLanguages.slice(0, 4).join(", "));
  else if (topLanguages.length >= 2) strengths.push("Skills in " + topLanguages.join(" and "));

  if (user.followers >= 50) strengths.push("Notable community presence with " + user.followers + " followers");
  else if (user.followers >= 10) strengths.push("Developing community presence");

  if (totalForks >= 20) strengths.push("Projects are widely forked, indicating useful work");
  else if (totalForks >= 5) strengths.push("Projects have been forked by other developers");

  if (accountYears >= 3) strengths.push("Consistent GitHub presence over " + accountYears + " years");

  const recentMonths = activityTimeline.slice(-6);
  const activeMonths = recentMonths.filter(m => m.repos > 0).length;
  if (activeMonths >= 5) strengths.push("Highly active in the last 6 months");
  else if (activeMonths >= 3) strengths.push("Regularly active in recent months");

  const hasDescriptions = repos.filter(r => r.description).length;
  const descRatio = repos.length > 0 ? hasDescriptions / repos.length : 0;
  if (descRatio >= 0.7) strengths.push("Well-documented projects with clear descriptions");

  if (repos.length < 3) concerns.push("Limited public repository portfolio");
  if (totalStars === 0 && repos.length > 0) concerns.push("No community engagement through stars yet");
  if (topLanguages.length <= 1) concerns.push("Limited language diversity — may indicate narrow focus");
  if (activeMonths <= 1) concerns.push("Low recent activity on GitHub");
  if (accountYears < 1) concerns.push("Relatively new GitHub account (less than 1 year)");
  if (descRatio < 0.3 && repos.length >= 3) concerns.push("Most repositories lack descriptions — may indicate limited documentation habits");
  if (user.followers === 0 && repos.length >= 5) concerns.push("No followers despite having multiple projects");

  const redFlags: string[] = [];
  const forkCount = allReposIncludingForks.filter(r => r.fork).length;
  const totalRepoCount = allReposIncludingForks.length;
  if (totalRepoCount > 0 && forkCount / totalRepoCount > 0.7) {
    redFlags.push("Over 70% of repositories are forks — limited original work");
  }
  if (activeMonths === 0 && accountYears >= 1) {
    redFlags.push("No activity in the last 6 months — account may be inactive");
  }
  const emptyRepos = repos.filter(r => !r.language && !r.description);
  if (repos.length >= 3 && emptyRepos.length / repos.length > 0.5) {
    redFlags.push("Many repositories appear empty or uninitialized");
  }
  const recentMonthsActivity = activityTimeline.slice(-3);
  const olderMonthsActivity = activityTimeline.slice(-12, -3);
  const recentSum = recentMonthsActivity.reduce((s, m) => s + m.repos, 0);
  const olderSum = olderMonthsActivity.reduce((s, m) => s + m.repos, 0);
  if (recentSum > 10 && olderSum <= 2 && repos.length > 5) {
    redFlags.push("Sudden spike in recent activity after long inactivity — possible resume padding");
  }
  if (repos.length === 0 && accountYears >= 2) {
    redFlags.push("Account exists for " + accountYears + " years but has no original repositories");
  }
  const archivedCount = repos.filter(r => r.archived).length;
  if (repos.length >= 5 && archivedCount / repos.length > 0.6) {
    redFlags.push("Majority of repositories are archived — may indicate abandoned projects");
  }

  let repoQuality: HiringInsights["repoQuality"];
  if (avgStarsPerRepo >= 10 || (descRatio >= 0.7 && repos.length >= 5)) repoQuality = "High";
  else if (avgStarsPerRepo >= 2 || descRatio >= 0.5) repoQuality = "Above Average";
  else if (repos.length >= 3) repoQuality = "Average";
  else repoQuality = "Below Average";

  let collaborationIndicator: HiringInsights["collaborationIndicator"];
  if (totalForks >= 20 || user.followers >= 50) collaborationIndicator = "Strong";
  else if (totalForks >= 5 || user.followers >= 10) collaborationIndicator = "Moderate";
  else collaborationIndicator = "Limited";

  let projectDiversity: HiringInsights["projectDiversity"];
  if (topLanguages.length >= 4) projectDiversity = "Broad";
  else if (topLanguages.length >= 2) projectDiversity = "Moderate";
  else projectDiversity = "Narrow";

  const pinnedSet = new Set(pinnedRepoNames.map(n => n.toLowerCase()));
  const topProjects = [...repos]
    .sort((a, b) => {
      const aPinned = pinnedSet.has(a.name.toLowerCase()) ? 1 : 0;
      const bPinned = pinnedSet.has(b.name.toLowerCase()) ? 1 : 0;
      if (bPinned !== aPinned) return bPinned - aPinned;
      return b.stargazers_count - a.stargazers_count;
    })
    .slice(0, 6)
    .map(r => ({
      name: r.name,
      stars: r.stargazers_count,
      language: r.language,
      description: r.description,
      pinned: pinnedSet.has(r.name.toLowerCase()),
    }));

  let recommendation: HiringInsights["recommendation"];
  const score = profileScore.total;
  if (score >= 75 && strengths.length >= 4) recommendation = "Strongly Recommend";
  else if (score >= 50 && strengths.length >= 3) recommendation = "Recommend";
  else if (score >= 25 && concerns.length <= 3) recommendation = "Consider";
  else recommendation = "Needs Review";

  const name = user.name || user.login;
  let summary = `${name} is `;
  if (experienceLevel === "Senior") summary += `an experienced developer with ${accountYears} years on GitHub. `;
  else if (experienceLevel === "Mid-Level") summary += `a mid-level developer with ${accountYears} years on GitHub. `;
  else if (experienceLevel === "Junior") summary += `a junior developer building their portfolio. `;
  else summary += `a newcomer to open source development. `;

  if (topLanguages.length > 0) {
    summary += `Primary skills include ${topLanguages.slice(0, 3).join(", ")}. `;
  }
  if (repos.length > 0) {
    summary += `Their portfolio includes ${repos.length} original ${repos.length === 1 ? "repository" : "repositories"}`;
    if (totalStars > 0) summary += ` with ${totalStars} total stars`;
    summary += ". ";
  }
  if (recommendation === "Strongly Recommend" || recommendation === "Recommend") {
    summary += "Overall profile suggests a capable candidate worth considering.";
  } else if (recommendation === "Consider") {
    summary += "Profile shows potential but may benefit from further evaluation.";
  } else {
    summary += "Limited public portfolio — recommend reviewing additional qualifications.";
  }

  const improvementTips: string[] = [];
  if (repos.length < 3) {
    improvementTips.push("Create more public repositories to showcase your skills — aim for at least 5 quality projects");
  }
  if (totalStars === 0 && repos.length > 0) {
    improvementTips.push("Share your projects on social media, dev communities, or Reddit to gain visibility and stars");
  }
  if (topLanguages.length <= 1) {
    improvementTips.push("Try building projects in a second language to show versatility — pick one that complements your primary stack");
  }
  if (activeMonths <= 1) {
    improvementTips.push("Commit regularly — even small updates show consistency. Aim for at least weekly activity");
  }
  if (descRatio < 0.3 && repos.length >= 3) {
    improvementTips.push("Add clear descriptions and README files to all your repositories — recruiters check these first");
  }
  if (user.followers === 0) {
    improvementTips.push("Engage with the community — follow other developers, contribute to discussions, and open issues on projects you use");
  }
  if (!user.bio) {
    improvementTips.push("Add a professional bio to your GitHub profile — mention your skills, interests, and what you're working on");
  }
  if (!user.location) {
    improvementTips.push("Add your location to your profile — it helps recruiters looking for developers in specific regions");
  }
  if (forkCount > 0 && repos.length < 5) {
    improvementTips.push("Focus on creating original projects rather than forking — original work stands out more to recruiters");
  }
  const noReadmeRepos = repos.filter(r => !r.description && r.stargazers_count === 0);
  if (noReadmeRepos.length > 0) {
    improvementTips.push("Clean up or archive old/incomplete repos — a curated portfolio makes a stronger impression than quantity");
  }
  if (pinnedRepoNames.length === 0 && repos.length >= 3) {
    improvementTips.push("Pin your best repositories on your GitHub profile — these are the first things visitors see");
  }
  if (topLanguages.length >= 2 && !user.blog) {
    improvementTips.push("Add a portfolio website or blog link to your profile to show off your work beyond code");
  }

  return {
    recommendation,
    strengths: strengths.slice(0, 8),
    concerns: concerns.slice(0, 5),
    redFlags: redFlags.slice(0, 5),
    improvementTips: improvementTips.slice(0, 8),
    experienceLevel,
    primarySkills: topLanguages.slice(0, 6),
    repoQuality,
    collaborationIndicator,
    projectDiversity,
    topProjects,
    summary,
  };
}

const SKILL_DOMAIN_MAP: Record<string, string[]> = {
  "Frontend": ["JavaScript", "TypeScript", "HTML", "CSS", "Vue", "Svelte", "SCSS", "Less", "Astro"],
  "Backend": ["Python", "Java", "Go", "Ruby", "PHP", "Elixir", "Scala", "Clojure", "Groovy", "Perl"],
  "Systems": ["C", "C++", "Rust", "Assembly", "Zig", "Nim", "D"],
  "Mobile": ["Swift", "Kotlin", "Dart", "Objective-C", "Java"],
  "Data & ML": ["Python", "R", "Julia", "Jupyter Notebook", "MATLAB"],
  "DevOps": ["Shell", "Dockerfile", "HCL", "Nix", "PowerShell", "Makefile"],
};

function buildSkillDomains(languages: LanguageBreakdown): SkillDomain[] {
  const totalRepos = Object.values(languages).reduce((s, c) => s + c, 0);
  if (totalRepos === 0) return [];

  const domains: SkillDomain[] = [];
  for (const [domain, domainLangs] of Object.entries(SKILL_DOMAIN_MAP)) {
    const matched: string[] = [];
    let count = 0;
    for (const lang of domainLangs) {
      if (languages[lang]) {
        matched.push(lang);
        count += languages[lang];
      }
    }
    if (matched.length > 0) {
      const raw = (count / totalRepos) * 100;
      const score = Math.min(100, Math.round(raw * 2.5));
      domains.push({ domain, score, languages: matched });
    }
  }
  return domains.sort((a, b) => b.score - a.score);
}

async function fetchContributionHeatmap(username: string): Promise<ContributionDay[]> {
  try {
    const res = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: { "User-Agent": "RepoScan/1.0" },
    });
    if (!res.ok) return [];
    const html = await res.text();

    const result: ContributionDay[] = [];
    const cellRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g;
    let match;
    while ((match = cellRegex.exec(html)) !== null) {
      result.push({ date: match[1], count: parseInt(match[2], 10) });
    }

    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  } catch {
    return [];
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.post("/api/analyze", async (req, res) => {
    try {
      const parsed = analyzeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { owner, repo: repoName } = parseGitHubUrl(parsed.data.url);
      const basePath = `/repos/${owner}/${repoName}`;

      const [repoData, contributorsData, languagesData, commitActivityData] = await Promise.all([
        githubFetch(basePath),
        githubFetch(`${basePath}/contributors?per_page=20`).catch(() => []),
        githubFetch(`${basePath}/languages`).catch(() => ({})),
        githubFetch(`${basePath}/stats/commit_activity`).catch(() => []),
      ]);

      const repo: RepoDetails = {
        name: repoData.name,
        full_name: repoData.full_name,
        description: repoData.description,
        html_url: repoData.html_url,
        stargazers_count: repoData.stargazers_count,
        forks_count: repoData.forks_count,
        watchers_count: repoData.subscribers_count || repoData.watchers_count,
        open_issues_count: repoData.open_issues_count,
        language: repoData.language,
        topics: repoData.topics || [],
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        pushed_at: repoData.pushed_at,
        size: repoData.size,
        default_branch: repoData.default_branch,
        license: repoData.license ? { name: repoData.license.name, spdx_id: repoData.license.spdx_id } : null,
        has_wiki: repoData.has_wiki,
        has_issues: repoData.has_issues,
        archived: repoData.archived,
        owner: {
          login: repoData.owner.login,
          avatar_url: repoData.owner.avatar_url,
          html_url: repoData.owner.html_url,
        },
      };

      const contributors: Contributor[] = Array.isArray(contributorsData)
        ? contributorsData.map((c: any) => ({
            login: c.login,
            avatar_url: c.avatar_url,
            html_url: c.html_url,
            contributions: c.contributions,
          }))
        : [];

      const languages: LanguageBreakdown = languagesData as LanguageBreakdown;

      let tree: TreeItem[] = [];
      try {
        const treeData = await githubFetch(`${basePath}/git/trees/${repo.default_branch}?recursive=1`);
        tree = (treeData.tree || [])
          .filter((t: any) => !t.path.startsWith("."))
          .slice(0, 500)
          .map((t: any) => ({
            path: t.path,
            type: t.type === "tree" ? "tree" : "blob",
            size: t.size,
          }));
      } catch {
        // tree fetch can fail for large repos
      }

      const techStack = detectTechStack(tree, languages);

      const commitActivity: number[] = Array.isArray(commitActivityData)
        ? commitActivityData.map((w: any) => w.total || 0)
        : [];

      let readmeRaw = "";
      try {
        const readmeData = await githubFetch(`${basePath}/readme`);
        if (readmeData.content) {
          readmeRaw = Buffer.from(readmeData.content, "base64").toString("utf-8");
        }
      } catch {
        // no readme
      }

      const hasReadme = readmeRaw.length > 0;
      const score = calculateScore(repo, contributors, commitActivity, hasReadme);
      const readme = parseReadme(readmeRaw);
      const complexity = analyzeComplexity(tree, languages, contributors, commitActivity);
      const health = analyzeHealth(repo, contributors, commitActivity);

      const result: AnalysisResult = {
        repo,
        contributors,
        languages,
        tree,
        techStack,
        score,
        readme,
        commitActivity,
        complexity,
        health,
      };

      return res.json(result);
    } catch (err: any) {
      const message = err.message || "Analysis failed";
      const status = message.includes("rate limit") ? 429 : message.includes("not found") ? 404 : 500;
      return res.status(status).json({ error: message });
    }
  });

  app.post("/api/profile", async (req, res) => {
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
        user,
        repos: ownRepos,
        totalStars,
        totalForks,
        languages,
        topLanguages,
        accountAgeDays,
        avgStarsPerRepo,
        profileScore,
        activityTimeline,
        hiringInsights,
        contributionHeatmap,
        skillDomains,
      };

      return res.json(result);
    } catch (err: any) {
      const message = err.message || "Profile analysis failed";
      const status = message.includes("rate limit") ? 429 : message.includes("not found") ? 404 : 500;
      return res.status(status).json({ error: message });
    }
  });

  app.get("/api/rate-limit", async (_req, res) => {
    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "repo-intelligence-dashboard",
      };
      const token = process.env.GITHUB_TOKEN;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(`${GITHUB_API}/rate_limit`, { headers });
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch rate limit" });
      }
      const data = await response.json();
      const core = data.resources?.core || data.rate;
      return res.json({
        remaining: core.remaining,
        limit: core.limit,
        reset: core.reset,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to fetch rate limit" });
    }
  });

  return httpServer;
}
