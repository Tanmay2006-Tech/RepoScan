import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeRequestSchema } from "./_lib/schema";
import type {
  RepoDetails,
  Contributor,
  LanguageBreakdown,
  TreeItem,
  AnalysisResult,
} from "./_lib/schema";
import {
  githubFetch,
  parseGitHubUrl,
  detectTechStack,
  calculateScore,
  analyzeComplexity,
  analyzeHealth,
  parseReadme,
} from "./_lib/github";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
    } catch {}

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
    } catch {}

    const hasReadme = readmeRaw.length > 0;
    const score = calculateScore(repo, contributors, commitActivity, hasReadme);
    const readme = parseReadme(readmeRaw);
    const complexity = analyzeComplexity(tree, languages, contributors, commitActivity);
    const health = analyzeHealth(repo, contributors, commitActivity);

    const result: AnalysisResult = {
      repo, contributors, languages, tree, techStack, score, readme, commitActivity, complexity, health,
    };

    return res.json(result);
  } catch (err: any) {
    const message = err.message || "Analysis failed";
    const status = message.includes("rate limit") ? 429 : message.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: message });
  }
}
