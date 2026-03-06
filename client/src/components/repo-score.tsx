import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RepoScore } from "@shared/schema";
import { Trophy, Star, Users, GitCommit, FileText, CircleDot, BookOpen } from "lucide-react";

interface RepoScoreCardProps {
  score: RepoScore;
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/50"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" data-testid="text-score-value">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-muted-foreground" data-testid="text-score-label">{label}</span>
    </div>
  );
}

export function RepoScoreCard({ score }: RepoScoreCardProps) {
  const breakdownItems = [
    { label: "Stars", value: score.breakdown.stars, max: 25, icon: Star },
    { label: "Contributors", value: score.breakdown.contributors, max: 20, icon: Users },
    { label: "Commit Activity", value: score.breakdown.commitFrequency, max: 20, icon: GitCommit },
    { label: "README", value: score.breakdown.hasReadme, max: 15, icon: FileText },
    { label: "Issue Management", value: score.breakdown.issueRatio, max: 10, icon: CircleDot },
    { label: "Documentation", value: score.breakdown.documentation, max: 10, icon: BookOpen },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Trophy className="w-4 h-4 text-muted-foreground" />
          Quality Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5 pt-2">
        <ScoreRing score={score.total} label={score.label} />
        <div className="w-full space-y-3">
          {breakdownItems.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <item.icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-mono font-medium" data-testid={`text-breakdown-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                  {item.value}/{item.max}
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${(item.value / item.max) * 100}%`,
                    transition: "width 0.8s ease-in-out",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
