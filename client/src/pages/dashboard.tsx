import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AnalysisResult, ProfileAnalysisResultFull, ProfileScore, UserPurpose } from "@shared/schema";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { TeamFit } from "@/components/team-fit";
import { ScoringWeights } from "@/components/scoring-weights";
import { CompareCandidates } from "@/components/compare-candidates";
import { ProfileTips } from "@/components/profile-tips";
import { ContributionHeatmap } from "@/components/contribution-heatmap";
import { SkillsRadar } from "@/components/skills-radar";
import { exportProfilePDF, exportRepoPDF } from "@/lib/export-pdf";
import { Loader2, GitBranch, FileText, Download, UserPlus, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewMode = "idle" | "repo" | "profile";

const PURPOSE_STORAGE_KEY = "reposcan-purpose";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("idle");
  const [repoResult, setRepoResult] = useState<AnalysisResult | null>(null);
  const [profileResult, setProfileResult] = useState<ProfileAnalysisResultFull | null>(null);
  const [compareList, setCompareList] = useState<ProfileAnalysisResultFull[]>([]);
  const [customScore, setCustomScore] = useState<{ total: number; label: ProfileScore["label"] } | null>(null);
  const [purpose, setPurpose] = useState<UserPurpose | null>(() => {
    try {
      const saved = localStorage.getItem(PURPOSE_STORAGE_KEY);
      return saved === "hr" || saved === "candidate" ? saved : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (purpose) {
      localStorage.setItem(PURPOSE_STORAGE_KEY, purpose);
    }
  }, [purpose]);

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/analyze", { url });
      return (await res.json()) as AnalysisResult;
    },
    onSuccess: (data) => {
      setRepoResult(data);
      setProfileResult(null);
      setViewMode("repo");
      setCustomScore(null);
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest("POST", "/api/profile", { username });
      return (await res.json()) as ProfileAnalysisResultFull;
    },
    onSuccess: (data) => {
      setProfileResult(data);
      setRepoResult(null);
      setViewMode("profile");
      setCustomScore(null);
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

  const handleAddToCompare = () => {
    if (!profileResult) return;
    const alreadyAdded = compareList.some(c => c.user.login === profileResult.user.login);
    if (alreadyAdded || compareList.length >= 4) return;
    setCompareList([...compareList, profileResult]);
  };

  const handleRemoveFromCompare = (index: number) => {
    setCompareList(compareList.filter((_, i) => i !== index));
  };

  const handlePurposeSelect = (p: UserPurpose) => {
    setPurpose(p);
  };

  const showPurposeSelector = !purpose && viewMode === "idle" && !isLoading;
  const showHero = purpose && viewMode === "idle" && !isLoading;
  const showRepoResults = viewMode === "repo" && repoResult && !isLoading;
  const showProfileResults = viewMode === "profile" && profileResult && !isLoading;
  const isInCompareList = profileResult ? compareList.some(c => c.user.login === profileResult.user.login) : false;
  const isHR = purpose === "hr";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
                  GitHub Intelligence {isHR ? "for Hiring" : purpose === "candidate" ? "for Developers" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {purpose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPurpose(null);
                    setViewMode("idle");
                    setRepoResult(null);
                    setProfileResult(null);
                    setCompareList([]);
                    localStorage.removeItem(PURPOSE_STORAGE_KEY);
                  }}
                  className="text-xs text-muted-foreground gap-1.5"
                  data-testid="button-switch-purpose"
                >
                  {isHR ? <Briefcase className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  {isHR ? "HR Mode" : "Developer Mode"}
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPurposeSelector && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <GitBranch className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-3" data-testid="text-hero-title">
              Welcome to RepoScan
            </h2>
            <p className="text-muted-foreground text-center max-w-lg mb-10 text-sm sm:text-base">
              GitHub profile and repository intelligence — for both sides of the hiring table.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              <button
                onClick={() => handlePurposeSelect("hr")}
                className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                data-testid="button-purpose-hr"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Briefcase className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">I'm Hiring</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Evaluate candidates, compare profiles, get hiring recommendations, and export reports.
                  </p>
                </div>
              </button>
              <button
                onClick={() => handlePurposeSelect("candidate")}
                className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                data-testid="button-purpose-candidate"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">I'm a Developer</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    See how your GitHub looks to recruiters, get your profile score, and find ways to improve.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {showHero && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <GitBranch className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-3" data-testid="text-hero-title">
              {isHR ? "GitHub Intelligence for Hiring" : "Make Your GitHub Stand Out"}
            </h2>
            <p className="text-muted-foreground text-center max-w-lg mb-8 text-sm sm:text-base">
              {isHR
                ? "Evaluate developer candidates by analyzing their GitHub profile, or deep-dive into any repository for quality scores, tech stack, and project health."
                : "See exactly how recruiters evaluate your GitHub profile. Get your score, discover your strengths, and get actionable tips to improve."}
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
              {analyzeMutation.isPending
                ? "Analyzing repository..."
                : isHR
                  ? "Generating candidate report..."
                  : "Analyzing your profile..."}
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportRepoPDF(repoResult)}
                  className="gap-1.5"
                  data-testid="button-export-repo-pdf"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PDF
                </Button>
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
                    {isHR ? "Candidate Report" : "Your Profile Analysis"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isHR
                      ? `GitHub profile analysis for ${profileResult.user.name || profileResult.user.login}`
                      : `Here's how recruiters see your GitHub, ${profileResult.user.name || profileResult.user.login}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportProfilePDF(profileResult)}
                  className="gap-1.5"
                  data-testid="button-export-profile-pdf"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PDF
                </Button>
                {isHR && (
                  <Button
                    variant={isInCompareList ? "secondary" : "outline"}
                    size="sm"
                    onClick={handleAddToCompare}
                    disabled={isInCompareList || compareList.length >= 4}
                    className="gap-1.5"
                    data-testid="button-add-compare"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {isInCompareList ? "Added" : "Compare"}
                  </Button>
                )}
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
                  purpose={purpose || "hr"}
                />
                {!isHR && profileResult.hiringInsights.improvementTips && profileResult.hiringInsights.improvementTips.length > 0 && (
                  <ProfileTips tips={profileResult.hiringInsights.improvementTips} />
                )}
                <TopProjects
                  projects={profileResult.hiringInsights.topProjects}
                  onAnalyzeRepo={handleAnalyzeRepo}
                  ownerLogin={profileResult.user.login}
                />
                {isHR && (
                  <TeamFit
                    candidateSkills={profileResult.hiringInsights.primarySkills}
                    candidateLanguages={profileResult.languages}
                  />
                )}
                {profileResult.contributionHeatmap && profileResult.contributionHeatmap.length > 0 && (
                  <ContributionHeatmap data={profileResult.contributionHeatmap} />
                )}
                <ProfileRepos
                  repos={profileResult.repos}
                  onAnalyzeRepo={handleAnalyzeRepo}
                />
                <ProfileActivity timeline={profileResult.activityTimeline} />
              </div>
              <div className="space-y-6">
                <ProfileScoreCard
                  score={customScore ? { ...profileResult.profileScore, total: customScore.total, label: customScore.label } : profileResult.profileScore}
                />
                {isHR && (
                  <ScoringWeights
                    breakdown={profileResult.profileScore.breakdown}
                    onScoreChange={(total, label) => setCustomScore({ total, label })}
                  />
                )}
                {profileResult.skillDomains && profileResult.skillDomains.length > 0 && (
                  <SkillsRadar domains={profileResult.skillDomains} />
                )}
                <SkillsOverview
                  primarySkills={profileResult.hiringInsights.primarySkills}
                  languages={profileResult.languages}
                  totalRepos={profileResult.repos.length}
                />
              </div>
            </div>
          </div>
        )}

        {isHR && compareList.length >= 2 && (
          <div className="mt-8">
            <CompareCandidates
              candidates={compareList}
              onRemove={handleRemoveFromCompare}
              onClear={() => setCompareList([])}
            />
          </div>
        )}
      </main>
    </div>
  );
}
