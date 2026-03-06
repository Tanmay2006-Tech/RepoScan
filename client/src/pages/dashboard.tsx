import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AnalysisResult, ProfileAnalysisResult } from "@shared/schema";
import { ScanInput } from "@/components/scan-input";
import { RepoStats } from "@/components/repo-stats";
import { RepoScoreCard } from "@/components/repo-score";
import { TechStackView } from "@/components/tech-stack";
import { ContributorsView } from "@/components/contributors";
import { FileTreeView } from "@/components/file-tree";
import { ReadmeSummaryView } from "@/components/readme-summary";
import { LanguageChart } from "@/components/language-chart";
import { CommitActivity } from "@/components/commit-activity";
import { ComplexityAnalyzer } from "@/components/complexity-analyzer";
import { HealthMonitor } from "@/components/health-monitor";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileScoreCard } from "@/components/profile-score";
import { ProfileRepos } from "@/components/profile-repos";
import { ProfileActivity } from "@/components/profile-activity";
import { HiringAssessment } from "@/components/hiring-assessment";
import { TopProjects } from "@/components/top-projects";
import { SkillsOverview } from "@/components/skills-overview";
import { Loader2, GitBranch, User, FileText } from "lucide-react";

type ViewMode = "idle" | "repo" | "profile";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("idle");
  const [repoResult, setRepoResult] = useState<AnalysisResult | null>(null);
  const [profileResult, setProfileResult] = useState<ProfileAnalysisResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/analyze", { url });
      return (await res.json()) as AnalysisResult;
    },
    onSuccess: (data) => {
      setRepoResult(data);
      setProfileResult(null);
      setViewMode("repo");
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest("POST", "/api/profile", { username });
      return (await res.json()) as ProfileAnalysisResult;
    },
    onSuccess: (data) => {
      setProfileResult(data);
      setRepoResult(null);
      setViewMode("profile");
    },
  });

  const isLoading = analyzeMutation.isPending || profileMutation.isPending;
  const error = analyzeMutation.error?.message || profileMutation.error?.message || null;

  const handleAnalyzeRepo = (url: string) => {
    analyzeMutation.reset();
    profileMutation.reset();
    analyzeMutation.mutate(url);
  };

  const handleAnalyzeProfile = (username: string) => {
    analyzeMutation.reset();
    profileMutation.reset();
    profileMutation.mutate(username);
  };

  const showHero = viewMode === "idle" && !isLoading;
  const showRepoResults = viewMode === "repo" && repoResult && !isLoading;
  const showProfileResults = viewMode === "profile" && profileResult && !isLoading;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                <circle cx="12" cy="12" r="4" />
                <path d="M15 15l2.5 2.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">
                RepoScan
              </h1>
              <p className="text-xs text-muted-foreground">
                GitHub Hiring & Repository Intelligence
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showHero && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <GitBranch className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-3" data-testid="text-hero-title">
              GitHub Intelligence for Hiring
            </h2>
            <p className="text-muted-foreground text-center max-w-lg mb-8 text-sm sm:text-base">
              Evaluate developer candidates by analyzing their GitHub profile, or deep-dive into
              any repository for quality scores, tech stack, and project health.
            </p>
            <div className="w-full max-w-2xl">
              <ScanInput
                onSubmitRepo={handleAnalyzeRepo}
                onSubmitProfile={handleAnalyzeProfile}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" data-testid="icon-loading" />
            <p className="text-muted-foreground font-medium">
              {analyzeMutation.isPending ? "Analyzing repository..." : "Generating candidate report..."}
            </p>
            <p className="text-xs text-muted-foreground">Fetching data from GitHub API</p>
          </div>
        )}

        {showRepoResults && repoResult && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={repoResult.repo.owner.avatar_url}
                  alt={repoResult.repo.owner.login}
                  className="w-10 h-10 rounded-md"
                  data-testid="img-owner-avatar"
                />
                <div>
                  <h2 className="text-xl font-semibold tracking-tight" data-testid="text-repo-name">
                    {repoResult.repo.full_name}
                  </h2>
                  {repoResult.repo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1" data-testid="text-repo-description">
                      {repoResult.repo.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full sm:w-auto sm:max-w-md">
                <ScanInput
                  onSubmitRepo={handleAnalyzeRepo}
                  onSubmitProfile={handleAnalyzeProfile}
                  isLoading={isLoading}
                  error={error}
                  compact
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <RepoStats repo={repoResult.repo} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LanguageChart languages={repoResult.languages} />
                  <CommitActivity activity={repoResult.commitActivity} />
                </div>
                <TechStackView items={repoResult.techStack} />
                <FileTreeView tree={repoResult.tree} />
                <ReadmeSummaryView readme={repoResult.readme} />
              </div>
              <div className="space-y-6">
                <RepoScoreCard score={repoResult.score} />
                {repoResult.complexity && <ComplexityAnalyzer complexity={repoResult.complexity} />}
                {repoResult.health && <HealthMonitor health={repoResult.health} />}
                <ContributorsView contributors={repoResult.contributors} />
              </div>
            </div>
          </div>
        )}

        {showProfileResults && profileResult && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h2 className="text-xl font-semibold tracking-tight" data-testid="text-profile-heading">
                    Candidate Report
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    GitHub profile analysis for {profileResult.user.name || profileResult.user.login}
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto sm:max-w-md">
                <ScanInput
                  onSubmitRepo={handleAnalyzeRepo}
                  onSubmitProfile={handleAnalyzeProfile}
                  isLoading={isLoading}
                  error={error}
                  compact
                />
              </div>
            </div>

            <ProfileHeader
              user={profileResult.user}
              totalStars={profileResult.totalStars}
              totalForks={profileResult.totalForks}
              accountAgeDays={profileResult.accountAgeDays}
              experienceLevel={profileResult.hiringInsights.experienceLevel}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <HiringAssessment
                  insights={profileResult.hiringInsights}
                  candidateName={profileResult.user.name || profileResult.user.login}
                />
                <TopProjects
                  projects={profileResult.hiringInsights.topProjects}
                  onAnalyzeRepo={handleAnalyzeRepo}
                  ownerLogin={profileResult.user.login}
                />
                <ProfileRepos
                  repos={profileResult.repos}
                  onAnalyzeRepo={handleAnalyzeRepo}
                />
                <ProfileActivity timeline={profileResult.activityTimeline} />
              </div>
              <div className="space-y-6">
                <ProfileScoreCard score={profileResult.profileScore} />
                <SkillsOverview
                  primarySkills={profileResult.hiringInsights.primarySkills}
                  languages={profileResult.languages}
                  totalRepos={profileResult.repos.length}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
