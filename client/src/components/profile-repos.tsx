import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserRepoSummary } from "@shared/schema";
import { BookOpen, Star, GitFork, ExternalLink } from "lucide-react";

interface ProfileReposProps {
  repos: UserRepoSummary[];
  onAnalyzeRepo: (url: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ProfileRepos({ repos, onAnalyzeRepo }: ProfileReposProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? repos : repos.slice(0, 6);

  if (repos.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            Repositories
          </div>
          <span className="text-xs text-muted-foreground font-normal">{repos.length} owned</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayed.map((repo) => (
          <div
            key={repo.full_name}
            className="flex items-start justify-between gap-3 p-3 rounded-md bg-muted/30"
            data-testid={`card-repo-${repo.name}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => onAnalyzeRepo(repo.html_url)}
                  className="text-sm font-semibold hover:underline underline-offset-4 truncate"
                  data-testid={`link-analyze-${repo.name}`}
                >
                  {repo.name}
                </button>
                {repo.archived && <Badge variant="secondary" className="text-[10px]">archived</Badge>}
                {repo.language && (
                  <Badge variant="outline" className="text-[10px] font-mono">{repo.language}</Badge>
                )}
              </div>
              {repo.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">{repo.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {repo.forks_count}
                </span>
                <span>Updated {formatDate(repo.updated_at)}</span>
              </div>
            </div>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground"
              data-testid={`link-github-${repo.name}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
        {repos.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs mt-1"
            onClick={() => setShowAll(!showAll)}
            data-testid="button-toggle-repos"
          >
            {showAll ? "Show less" : `Show all ${repos.length} repositories`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
