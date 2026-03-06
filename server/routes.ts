import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeRequestSchema } from "@shared/schema";
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
      throw new Error("Repository not found. Please check the URL.");
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

  return httpServer;
}
