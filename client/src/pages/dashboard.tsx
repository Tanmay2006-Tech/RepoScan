import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AnalysisResult } from "@shared/schema";
import { RepoInput } from "@/components/repo-input";
import { RepoStats } from "@/components/repo-stats";
import { RepoScoreCard } from "@/components/repo-score";
import { TechStackView } from "@/components/tech-stack";
import { ContributorsView } from "@/components/contributors";
import { FileTreeView } from "@/components/file-tree";
import { ReadmeSummaryView } from "@/components/readme-summary";
import { LanguageChart } from "@/components/language-chart";
import { CommitActivity } from "@/components/commit-activity";
import { Loader2, GitBranch, Scan } from "lucide-react";

export default function Dashboard() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/analyze", { url });
      return (await res.json()) as AnalysisResult;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">
                RepoScan
              </h1>
              <p className="text-xs text-muted-foreground">
                GitHub Repository Intelligence
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result && !analyzeMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <GitBranch className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-3" data-testid="text-hero-title">
              Analyze Any GitHub Repository
            </h2>
            <p className="text-muted-foreground text-center max-w-lg mb-8 text-sm sm:text-base">
              Paste a repository URL to get detailed insights including quality scores,
              tech stack detection, contributor analysis, and more.
            </p>
            <div className="w-full max-w-2xl">
              <RepoInput
                onSubmit={(url) => analyzeMutation.mutate(url)}
                isLoading={analyzeMutation.isPending}
                error={analyzeMutation.error?.message || null}
              />
            </div>
          </div>
        )}

        {analyzeMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" data-testid="icon-loading" />
            <p className="text-muted-foreground font-medium">Analyzing repository...</p>
            <p className="text-xs text-muted-foreground">Fetching data from GitHub API</p>
          </div>
        )}

        {result && !analyzeMutation.isPending && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={result.repo.owner.avatar_url}
                  alt={result.repo.owner.login}
                  className="w-10 h-10 rounded-md"
                  data-testid="img-owner-avatar"
                />
                <div>
                  <h2 className="text-xl font-semibold tracking-tight" data-testid="text-repo-name">
                    {result.repo.full_name}
                  </h2>
                  {result.repo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1" data-testid="text-repo-description">
                      {result.repo.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full sm:w-auto sm:max-w-md">
                <RepoInput
                  onSubmit={(url) => analyzeMutation.mutate(url)}
                  isLoading={analyzeMutation.isPending}
                  error={analyzeMutation.error?.message || null}
                  compact
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <RepoStats repo={result.repo} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LanguageChart languages={result.languages} />
                  <CommitActivity activity={result.commitActivity} />
                </div>
                <TechStackView items={result.techStack} />
                <FileTreeView tree={result.tree} />
                <ReadmeSummaryView readme={result.readme} />
              </div>
              <div className="space-y-6">
                <RepoScoreCard score={result.score} />
                <ContributorsView contributors={result.contributors} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
