import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RepoDetails } from "@shared/schema";
import {
  Star,
  GitFork,
  Eye,
  CircleDot,
  Scale,
  Calendar,
  HardDrive,
  ExternalLink,
} from "lucide-react";

interface RepoStatsProps {
  repo: RepoDetails;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatSize(kb: number): string {
  if (kb >= 1024 * 1024) return (kb / (1024 * 1024)).toFixed(1) + " GB";
  if (kb >= 1024) return (kb / 1024).toFixed(1) + " MB";
  return kb + " KB";
}

export function RepoStats({ repo }: RepoStatsProps) {
  const stats = [
    { label: "Stars", value: formatNumber(repo.stargazers_count), icon: Star },
    { label: "Forks", value: formatNumber(repo.forks_count), icon: GitFork },
    { label: "Watchers", value: formatNumber(repo.watchers_count), icon: Eye },
    { label: "Issues", value: formatNumber(repo.open_issues_count), icon: CircleDot },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight" data-testid={`text-stat-${stat.label.toLowerCase()}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            {repo.language && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-chart-1" />
                <span className="text-muted-foreground">Language:</span>
                <span className="font-medium" data-testid="text-primary-language">{repo.language}</span>
              </div>
            )}
            {repo.license && (
              <div className="flex items-center gap-2">
                <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">License:</span>
                <span className="font-medium" data-testid="text-license">{repo.license.spdx_id}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium" data-testid="text-created">{formatDate(repo.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium" data-testid="text-size">{formatSize(repo.size)}</span>
            </div>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium ml-auto underline-offset-4 hover:underline"
              data-testid="link-view-on-github"
            >
              View on GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t" data-testid="container-topics">
              {repo.topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs font-mono" data-testid={`badge-topic-${topic}`}>
                  {topic}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
