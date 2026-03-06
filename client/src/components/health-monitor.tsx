import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RepoHealth } from "@shared/schema";
import { HeartPulse, Activity, CircleDot, Wrench, Clock } from "lucide-react";

interface HealthMonitorProps {
  health: RepoHealth;
}

function StatusDot({ status }: { status: string }) {
  const isPositive =
    status === "Healthy" || status === "Active" || status === "High" ||
    status === "Excellent" || status === "Good" || status === "Maintained" || status === "Moderate";

  return <span className={`w-2 h-2 rounded-full shrink-0 ${isPositive ? "bg-primary" : "bg-muted-foreground/40"}`} />;
}

function StatusRow({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Activity }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot status={value} />
        <span className="text-xs font-medium">{value}</span>
      </div>
    </div>
  );
}

export function HealthMonitor({ health }: HealthMonitorProps) {
  const lastCommitText =
    health.lastCommitDaysAgo === 0
      ? "Today"
      : health.lastCommitDaysAgo === 1
        ? "Yesterday"
        : `${health.lastCommitDaysAgo} days ago`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <HeartPulse className="w-4 h-4 text-muted-foreground" />
          Repository Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-md p-3 bg-muted/40">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Status</div>
            <div className="text-lg font-bold" data-testid="text-health-status">
              {health.status}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Last Commit</div>
            <div className="text-sm font-medium" data-testid="text-last-commit">{lastCommitText}</div>
          </div>
        </div>

        <div className="divide-y">
          <StatusRow label="Activity" value={health.activityLevel} icon={Activity} />
          <StatusRow label="Issue Resolution" value={health.issueResolution} icon={CircleDot} />
          <StatusRow label="Maintenance" value={health.maintenance} icon={Wrench} />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold font-mono" data-testid="text-health-issues">{health.openIssues}</div>
            <div className="text-[10px] text-muted-foreground">Open Issues</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold font-mono" data-testid="text-health-commits">{health.totalCommitsRecent}</div>
            <div className="text-[10px] text-muted-foreground">Recent Commits</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold font-mono" data-testid="text-health-contributors">{health.contributorActivity}</div>
            <div className="text-[10px] text-muted-foreground">Contributors</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
