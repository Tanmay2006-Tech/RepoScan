import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ProfileActivityProps {
  timeline: { month: string; repos: number }[];
}

export function ProfileActivity({ timeline }: ProfileActivityProps) {
  if (timeline.length === 0) return null;

  const max = Math.max(...timeline.map((t) => t.repos), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Activity Timeline
          </div>
          <span className="text-xs text-muted-foreground font-normal">Repos updated per month</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-[3px] h-24" data-testid="chart-profile-activity">
          {timeline.map((entry, i) => (
            <div
              key={entry.month}
              className="flex-1 bg-primary/20 rounded-t-sm relative group"
              style={{
                height: `${Math.max((entry.repos / max) * 100, 8)}%`,
                transition: "height 0.5s ease-in-out",
              }}
            >
              <div
                className="absolute inset-x-0 bottom-0 bg-primary rounded-t-sm"
                style={{
                  height: `${Math.max((entry.repos / max) * 100, entry.repos > 0 ? 30 : 0)}%`,
                }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded invisible group-hover:visible whitespace-nowrap font-mono z-10">
                {entry.repos} repos
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>{timeline[0]?.month}</span>
          <span>{timeline[timeline.length - 1]?.month}</span>
        </div>
      </CardContent>
    </Card>
  );
}
