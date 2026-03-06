import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileScore } from "@shared/schema";
import { Award, BookOpen, Star, Users, Palette, TrendingUp } from "lucide-react";

interface ProfileScoreCardProps {
  score: ProfileScore;
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 80
      ? "text-chart-2"
      : score >= 55
        ? "text-chart-1"
        : score >= 30
          ? "text-chart-4"
          : "text-chart-5";

  const strokeColor =
    score >= 80
      ? "hsl(var(--chart-2))"
      : score >= 55
        ? "hsl(var(--chart-1))"
        : score >= 30
          ? "hsl(var(--chart-4))"
          : "hsl(var(--chart-5))";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/50" />
          <circle
            cx="60" cy="60" r={radius} fill="none" stroke={strokeColor} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${colorClass}`} data-testid="text-profile-score-value">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold ${colorClass}`} data-testid="text-profile-score-label">{label}</span>
    </div>
  );
}

export function ProfileScoreCard({ score }: ProfileScoreCardProps) {
  const breakdownItems = [
    { label: "Repositories", value: score.breakdown.repos, max: 25, icon: BookOpen },
    { label: "Stars Earned", value: score.breakdown.stars, max: 25, icon: Star },
    { label: "Followers", value: score.breakdown.followers, max: 20, icon: Users },
    { label: "Language Diversity", value: score.breakdown.diversity, max: 15, icon: Palette },
    { label: "Consistency", value: score.breakdown.consistency, max: 15, icon: TrendingUp },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Award className="w-4 h-4 text-muted-foreground" />
          Developer Score
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
                <span className="font-mono font-medium">{item.value}/{item.max}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(item.value / item.max) * 100}%`, transition: "width 0.8s ease-in-out" }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
