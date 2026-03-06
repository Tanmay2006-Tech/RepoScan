import { z } from "zod";

export const analyzeRequestSchema = z.object({
  url: z.string().min(1, "URL is required").refine(
    (val) => /github\.com\/[\w.-]+\/[\w.-]+/.test(val),
    "Invalid GitHub repository URL. Use format: https://github.com/owner/repo"
  ),
});

export const profileRequestSchema = z.object({
  username: z.string().min(1, "Username is required").refine(
    (val) => /^[\w.-]+$/.test(val.replace(/^(https?:\/\/)?(www\.)?github\.com\//, "").replace(/\/$/, "")),
    "Invalid GitHub username"
  ),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type ProfileRequest = z.infer<typeof profileRequestSchema>;

export interface RepoDetails {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
  license: { name: string; spdx_id: string } | null;
  has_wiki: boolean;
  has_issues: boolean;
  archived: boolean;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface TreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

export interface LanguageBreakdown {
  [language: string]: number;
}

export interface TechStackItem {
  name: string;
  category: "framework" | "language" | "tool" | "library" | "runtime" | "database" | "cloud";
  icon?: string;
}

export interface RepoScore {
  total: number;
  breakdown: {
    stars: number;
    contributors: number;
    commitFrequency: number;
    hasReadme: number;
    issueRatio: number;
    documentation: number;
  };
  label: "Excellent" | "Good" | "Average" | "Needs Improvement";
}

export interface ReadmeSummary {
  raw: string;
  description: string;
  installation: string;
  usage: string;
}

export interface ProjectComplexity {
  level: "Beginner" | "Intermediate" | "Advanced" | "Enterprise";
  fileCount: number;
  folderCount: number;
  languageCount: number;
  contributorCount: number;
  totalCommits: number;
  indicators: string[];
}

export interface RepoHealth {
  status: "Healthy" | "Good" | "Warning" | "Critical";
  activityLevel: "High" | "Moderate" | "Low" | "Inactive";
  issueResolution: "Excellent" | "Good" | "Needs Attention" | "Poor";
  maintenance: "Active" | "Maintained" | "Sporadic" | "Unmaintained";
  lastCommitDaysAgo: number;
  openIssues: number;
  totalCommitsRecent: number;
  contributorActivity: number;
}

export interface AnalysisResult {
  repo: RepoDetails;
  contributors: Contributor[];
  languages: LanguageBreakdown;
  tree: TreeItem[];
  techStack: TechStackItem[];
  score: RepoScore;
  readme: ReadmeSummary;
  commitActivity: number[];
  complexity: ProjectComplexity;
  health: RepoHealth;
}

export interface GitHubUserProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface UserRepoSummary {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics: string[];
  archived: boolean;
  fork: boolean;
}

export interface ProfileAnalysisResult {
  user: GitHubUserProfile;
  repos: UserRepoSummary[];
  totalStars: number;
  totalForks: number;
  languages: LanguageBreakdown;
  topLanguages: string[];
  accountAgeDays: number;
  avgStarsPerRepo: number;
  profileScore: ProfileScore;
  activityTimeline: { month: string; repos: number }[];
  hiringInsights: HiringInsights;
}

export interface ProfileScore {
  total: number;
  label: "Outstanding" | "Strong" | "Growing" | "Beginner";
  breakdown: {
    repos: number;
    stars: number;
    followers: number;
    diversity: number;
    consistency: number;
  };
}

export interface HiringInsights {
  recommendation: "Strongly Recommend" | "Recommend" | "Consider" | "Needs Review";
  strengths: string[];
  concerns: string[];
  redFlags: string[];
  improvementTips: string[];
  experienceLevel: "Senior" | "Mid-Level" | "Junior" | "Entry-Level";
  primarySkills: string[];
  repoQuality: "High" | "Above Average" | "Average" | "Below Average";
  collaborationIndicator: "Strong" | "Moderate" | "Limited";
  projectDiversity: "Broad" | "Moderate" | "Narrow";
  topProjects: { name: string; stars: number; language: string | null; description: string | null; pinned: boolean }[];
  summary: string;
}

export type UserPurpose = "hr" | "candidate";
