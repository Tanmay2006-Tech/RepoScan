import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LanguageBreakdown } from "@shared/schema";
import { Code } from "lucide-react";

interface LanguageChartProps {
  languages: LanguageBreakdown;
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
  SCSS: "#c6538c",
  Shell: "#89e051",
  Lua: "#000080",
  Vim: "#199f4b",
  Dockerfile: "#384d54",
  Makefile: "#427819",
};

function getColor(lang: string, index: number): string {
  if (LANG_COLORS[lang]) return LANG_COLORS[lang];
  const fallback = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#14b8a6",
    "#06b6d4",
    "#84cc16",
    "#eab308",
  ];
  return fallback[index % fallback.length];
}

export function LanguageChart({ languages }: LanguageChartProps) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Code className="w-4 h-4 text-muted-foreground" />
          Languages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-full h-3 rounded-full overflow-hidden" data-testid="chart-language-bar">
          {entries.map(([lang, bytes], i) => (
            <div
              key={lang}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${(bytes / total) * 100}%`,
                backgroundColor: getColor(lang, i),
                minWidth: "2px",
              }}
              title={`${lang}: ${((bytes / total) * 100).toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {entries.slice(0, 8).map(([lang, bytes], i) => (
            <div key={lang} className="flex items-center gap-2 text-xs" data-testid={`text-lang-${lang.toLowerCase()}`}>
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: getColor(lang, i) }}
              />
              <span className="truncate">{lang}</span>
              <span className="text-muted-foreground font-mono ml-auto">
                {((bytes / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
