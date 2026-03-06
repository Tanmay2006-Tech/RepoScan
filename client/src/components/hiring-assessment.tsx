import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HiringInsights } from "@shared/schema";
import {
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Minus,
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
    "Strongly Recommend": { icon: ShieldCheck },
    "Recommend": { icon: UserCheck },
    "Consider": { icon: Minus },
    "Needs Review": { icon: AlertTriangle },
  };
  const c = config[recommendation];

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-md bg-primary/10 border border-primary/20" data-testid="badge-recommendation">
      <c.icon className="w-5 h-5 text-primary" />
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Hiring Verdict</div>
        <div className="text-sm font-bold text-foreground">{recommendation}</div>
      </div>
    </div>
  );
}

function MetricPill({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Briefcase }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-md bg-muted/40 border">
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
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
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
                  <Minus className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
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
