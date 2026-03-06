import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCommit } from "lucide-react";

interface CommitActivityProps {
  activity: number[];
}

export function CommitActivity({ activity }: CommitActivityProps) {
  if (activity.length === 0) return null;

  const recent = activity.slice(-26);
  const max = Math.max(...recent, 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GitCommit className="w-4 h-4 text-muted-foreground" />
            Commit Activity
          </div>
          <span className="text-xs text-muted-foreground font-normal">Last 6 months</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-[3px] h-24" data-testid="chart-commit-activity">
          {recent.map((count, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/20 rounded-t-sm relative group"
              style={{
                height: `${Math.max((count / max) * 100, 4)}%`,
                transition: "height 0.5s ease-in-out",
              }}
            >
              <div
                className="absolute inset-0 bg-primary rounded-t-sm"
                style={{
                  height: `${Math.max((count / max) * 100, count > 0 ? 20 : 0)}%`,
                  bottom: 0,
                  top: "auto",
                  position: "absolute",
                }}
              />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded invisible group-hover:visible whitespace-nowrap font-mono z-10">
                {count}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>26 weeks ago</span>
          <span>Now</span>
        </div>
      </CardContent>
    </Card>
  );
}
