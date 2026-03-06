import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HiringInsights } from "@shared/schema";
import {
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Briefcase,
  Star,
  Users,
  FolderGit2,
} from "lucide-react";

interface HiringAssessmentProps {
  insights: HiringInsights;
  candidateName: string;
}

function RecommendationBadge({ recommendation }: { recommendation: HiringInsights["recommendation"] }) {
  const config = {
    "Strongly Recommend": { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: ShieldCheck },
    "Recommend": { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800", icon: UserCheck },
    "Consider": { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800", icon: AlertTriangle },
    "Needs Review": { color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800", icon: XCircle },
  };
  const c = config[recommendation];

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-md border ${c.color}`} data-testid="badge-recommendation">
      <c.icon className="w-5 h-5" />
      <span className="font-semibold text-sm">{recommendation}</span>
    </div>
  );
}

function MetricPill({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Briefcase }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/40 border">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-xs font-semibold" data-testid={`text-metric-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</div>
      </div>
    </div>
  );
}

export function HiringAssessment({ insights, candidateName }: HiringAssessmentProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          Candidate Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RecommendationBadge recommendation={insights.recommendation} />

        <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-hiring-summary">
          {insights.summary}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <MetricPill label="Experience" value={insights.experienceLevel} icon={Briefcase} />
          <MetricPill label="Code Quality" value={insights.repoQuality} icon={Star} />
          <MetricPill label="Collaboration" value={insights.collaborationIndicator} icon={Users} />
          <MetricPill label="Diversity" value={insights.projectDiversity} icon={FolderGit2} />
        </div>

        {insights.strengths.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Strengths
            </h4>
            <div className="space-y-1.5">
              {insights.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs" data-testid={`text-strength-${i}`}>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.concerns.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Areas of Concern
            </h4>
            <div className="space-y-1.5">
              {insights.concerns.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs" data-testid={`text-concern-${i}`}>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
