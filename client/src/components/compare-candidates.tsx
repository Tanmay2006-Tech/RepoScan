import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X, Users, Trophy } from "lucide-react";
import type { ProfileAnalysisResult } from "@shared/schema";

interface CompareCandidatesProps {
  candidates: ProfileAnalysisResult[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

function StatCell({ value, best }: { value: number | string; best?: boolean }) {
  return (
    <div className={`text-center p-2 rounded-md ${best ? "bg-primary/10 font-bold" : "bg-muted/40"}`}>
      <span className="text-sm font-mono">{value}</span>
    </div>
  );
}

export function CompareCandidates({ candidates, onRemove, onClear }: CompareCandidatesProps) {
  if (candidates.length < 2) return null;

  const maxScore = Math.max(...candidates.map(c => c.profileScore.total));
  const maxStars = Math.max(...candidates.map(c => c.totalStars));
  const maxRepos = Math.max(...candidates.map(c => c.repos.length));
  const maxFollowers = Math.max(...candidates.map(c => c.user.followers));
  const maxLangs = Math.max(...candidates.map(c => c.topLanguages.length));

  const rows: { label: string; values: { value: string | number; best: boolean }[] }[] = [
    {
      label: "Score",
      values: candidates.map(c => ({ value: c.profileScore.total, best: c.profileScore.total === maxScore })),
    },
    {
      label: "Recommendation",
      values: candidates.map(c => ({ value: c.hiringInsights.recommendation, best: c.hiringInsights.recommendation === "Strongly Recommend" })),
    },
    {
      label: "Experience",
      values: candidates.map(c => ({ value: c.hiringInsights.experienceLevel, best: c.hiringInsights.experienceLevel === "Senior" })),
    },
    {
      label: "Repositories",
      values: candidates.map(c => ({ value: c.repos.length, best: c.repos.length === maxRepos })),
    },
    {
      label: "Total Stars",
      values: candidates.map(c => ({ value: c.totalStars, best: c.totalStars === maxStars })),
    },
    {
      label: "Followers",
      values: candidates.map(c => ({ value: c.user.followers, best: c.user.followers === maxFollowers })),
    },
    {
      label: "Languages",
      values: candidates.map(c => ({ value: c.topLanguages.length, best: c.topLanguages.length === maxLangs })),
    },
    {
      label: "Top Skills",
      values: candidates.map(c => ({ value: c.topLanguages.slice(0, 3).join(", ") || "—", best: false })),
    },
    {
      label: "Code Quality",
      values: candidates.map(c => ({ value: c.hiringInsights.repoQuality, best: c.hiringInsights.repoQuality === "High" })),
    },
    {
      label: "Strengths",
      values: candidates.map(c => ({ value: c.hiringInsights.strengths.length, best: false })),
    },
    {
      label: "Concerns",
      values: candidates.map(c => ({ value: c.hiringInsights.concerns.length, best: false })),
    },
    {
      label: "Red Flags",
      values: candidates.map(c => ({ value: c.hiringInsights.redFlags?.length || 0, best: false })),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Users className="w-4 h-4 text-muted-foreground" />
            Candidate Comparison ({candidates.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs" data-testid="button-clear-compare">
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 text-muted-foreground font-medium w-28"></th>
                {candidates.map((c, i) => (
                  <th key={i} className="p-2 min-w-[140px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative">
                        <Avatar className="w-10 h-10" data-testid={`img-compare-avatar-${i}`}>
                          <AvatarImage src={c.user.avatar_url} alt={c.user.login} />
                          <AvatarFallback>{(c.user.name || c.user.login).slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => onRemove(i)}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted border flex items-center justify-center"
                          data-testid={`button-remove-compare-${i}`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <span className="font-semibold text-xs" data-testid={`text-compare-name-${i}`}>
                        {c.user.name || c.user.login}
                      </span>
                      {c.profileScore.total === maxScore && (
                        <Badge variant="secondary" className="text-[9px] gap-0.5">
                          <Trophy className="w-2.5 h-2.5" />
                          Top
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "" : "bg-muted/20"}>
                  <td className="p-2 text-muted-foreground font-medium">{row.label}</td>
                  {row.values.map((v, vi) => (
                    <td key={vi} className="p-1">
                      <StatCell value={v.value} best={v.best} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
