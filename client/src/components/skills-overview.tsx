import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LanguageBreakdown } from "@shared/schema";
import { Wrench } from "lucide-react";

interface SkillsOverviewProps {
  primarySkills: string[];
  languages: LanguageBreakdown;
  totalRepos: number;
}

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

function getColor(lang: string, index: number): string {
  if (LANG_COLORS[lang]) return LANG_COLORS[lang];
  const fallback = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6", "#06b6d4", "#84cc16", "#eab308"];
  return fallback[index % fallback.length];
}

export function SkillsOverview({ primarySkills, languages, totalRepos }: SkillsOverviewProps) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          Technical Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1.5" data-testid="container-primary-skills">
          {primarySkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs" data-testid={`badge-skill-${skill}`}>
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex w-full h-2.5 rounded-full overflow-hidden" data-testid="chart-skills-bar">
          {entries.map(([lang, count], i) => (
            <div
              key={lang}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: getColor(lang, i),
                minWidth: "3px",
              }}
              title={`${lang}: ${count} repos`}
            />
          ))}
        </div>

        <div className="space-y-2">
          {entries.map(([lang, count], i) => {
            const pct = Math.round((count / total) * 100);
            return (
              <div key={lang} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: getColor(lang, i) }}
                />
                <span className="font-medium min-w-[80px]">{lang}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getColor(lang, i),
                      transition: "width 0.8s ease-in-out",
                    }}
                  />
                </div>
                <span className="text-muted-foreground font-mono w-16 text-right">
                  {count} {count === 1 ? "repo" : "repos"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
