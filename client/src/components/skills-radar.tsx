import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SkillDomain } from "@shared/schema";
import { Radar } from "lucide-react";

interface SkillsRadarProps {
  domains: SkillDomain[];
}

export function SkillsRadar({ domains }: SkillsRadarProps) {
  const displayDomains = useMemo(() => {
    if (domains.length === 0) return [];
    const padded = [...domains];
    while (padded.length < 3) {
      padded.push({ domain: padded.length === 1 ? "Other" : "Misc", score: 0, languages: [] });
    }
    return padded.slice(0, 6);
  }, [domains]);

  if (displayDomains.length === 0) return null;

  const cx = 140;
  const cy = 130;
  const maxR = 95;
  const levels = [25, 50, 75, 100];
  const n = displayDomains.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  function polarToXY(angle: number, r: number): [number, number] {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  const axes = displayDomains.map((d, i) => {
    const angle = startAngle + i * angleStep;
    const [ex, ey] = polarToXY(angle, maxR);
    const [lx, ly] = polarToXY(angle, maxR + 16);
    return { domain: d, angle, ex, ey, lx, ly };
  });

  const dataPoints = displayDomains.map((d, i) => {
    const angle = startAngle + i * angleStep;
    const r = (d.score / 100) * maxR;
    return polarToXY(angle, r);
  });

  const dataPath = dataPoints.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ") + "Z";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Radar className="w-4 h-4 text-muted-foreground" />
          Skills Radar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center" data-testid="chart-skills-radar">
          <svg width={280} height={270} viewBox="0 0 280 270" className="block">
            {levels.map((level) => {
              const r = (level / 100) * maxR;
              const points = Array.from({ length: n }, (_, i) => {
                const angle = startAngle + i * angleStep;
                return polarToXY(angle, r);
              });
              const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ") + "Z";
              return (
                <path
                  key={level}
                  d={path}
                  fill="none"
                  className="stroke-border"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              );
            })}

            {axes.map((a, i) => (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={a.ex}
                y2={a.ey}
                className="stroke-border"
                strokeWidth={0.5}
                opacity={0.4}
              />
            ))}

            <path
              d={dataPath}
              className="fill-primary/15 stroke-primary"
              strokeWidth={2}
              strokeLinejoin="round"
            />

            {dataPoints.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={3.5}
                className="fill-primary stroke-background"
                strokeWidth={1.5}
              />
            ))}

            {axes.map((a, i) => {
              const isTop = a.ly < cy - 20;
              const isBottom = a.ly > cy + 20;
              const textAnchor = Math.abs(a.lx - cx) < 5 ? "middle" : a.lx > cx ? "start" : "end";
              const yOffset = isTop ? -4 : isBottom ? 8 : 0;
              return (
                <text
                  key={i}
                  x={a.lx}
                  y={a.ly + yOffset}
                  textAnchor={textAnchor}
                  className="fill-foreground"
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="system-ui, sans-serif"
                >
                  {a.domain.domain}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="space-y-2 mt-2">
          {displayDomains
            .filter(d => d.score > 0)
            .map((d) => (
              <div key={d.domain} className="flex items-center gap-2.5" data-testid={`row-skill-domain-${d.domain}`}>
                <span className="text-xs font-medium min-w-[70px]">{d.domain}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${d.score}%`, transition: "width 0.6s ease-in-out" }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">{d.score}%</span>
              </div>
            ))}
        </div>

        {displayDomains.some(d => d.languages.length > 0) && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-1.5">
              {displayDomains
                .flatMap(d => d.languages)
                .filter((lang, i, arr) => arr.indexOf(lang) === i)
                .slice(0, 10)
                .map((lang) => (
                  <span
                    key={lang}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    data-testid={`badge-radar-lang-${lang}`}
                  >
                    {lang}
                  </span>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
