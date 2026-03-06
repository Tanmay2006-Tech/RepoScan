import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectComplexity } from "@shared/schema";
import { Gauge, FileCode, Folder, Languages, Users, GitCommit, Check } from "lucide-react";

interface ComplexityAnalyzerProps {
  complexity: ProjectComplexity;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toLocaleString();
}

export function ComplexityAnalyzer({ complexity }: ComplexityAnalyzerProps) {
  const metrics = [
    { label: "Files", value: formatNumber(complexity.fileCount), icon: FileCode },
    { label: "Folders", value: formatNumber(complexity.folderCount), icon: Folder },
    { label: "Languages", value: complexity.languageCount.toString(), icon: Languages },
    { label: "Contributors", value: formatNumber(complexity.contributorCount), icon: Users },
    { label: "Commits (yr)", value: formatNumber(complexity.totalCommits), icon: GitCommit },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Gauge className="w-4 h-4 text-muted-foreground" />
          Project Complexity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-md p-3 bg-muted/40">
          <div className="text-2xl font-bold" data-testid="text-complexity-level">
            {complexity.level}
          </div>
          <span className="text-xs text-muted-foreground">Level Project</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center gap-2">
              <metric.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold font-mono" data-testid={`text-complexity-${metric.label.toLowerCase().replace(/[^a-z]/g, "")}`}>
                  {metric.value}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">{metric.label}</span>
              </div>
            </div>
          ))}
        </div>

        {complexity.indicators.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t">
            {complexity.indicators.map((indicator) => (
              <div key={indicator} className="flex items-center gap-2 text-xs" data-testid={`text-indicator-${indicator.toLowerCase().replace(/\s/g, "-")}`}>
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{indicator}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
