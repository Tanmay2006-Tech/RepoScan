import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContributionDay } from "@shared/schema";
import { Calendar } from "lucide-react";

interface ContributionHeatmapProps {
  data: ContributionDay[];
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const LEVEL_LABELS = ["No contributions", "Low activity", "Moderate activity", "High activity", "Very high activity"];

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const { weeks, activeDays, monthPositions } = useMemo(() => {
    if (data.length === 0) return { weeks: [], activeDays: 0, monthPositions: [] };

    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const active = sorted.filter(d => d.count > 0).length;

    const weekBuckets: { date: string; level: number; dayOfWeek: number }[][] = [];
    let currentWeek: { date: string; level: number; dayOfWeek: number }[] = [];

    for (const day of sorted) {
      const d = new Date(day.date + "T00:00:00");
      const dow = d.getDay();

      if (dow === 0 && currentWeek.length > 0) {
        weekBuckets.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push({ date: day.date, level: day.count, dayOfWeek: dow });
    }
    if (currentWeek.length > 0) {
      weekBuckets.push(currentWeek);
    }

    const months: { label: string; x: number }[] = [];
    let lastMonth = -1;
    for (let wi = 0; wi < weekBuckets.length; wi++) {
      const firstDay = weekBuckets[wi][0];
      const d = new Date(firstDay.date + "T00:00:00");
      const month = d.getMonth();
      if (month !== lastMonth) {
        months.push({ label: MONTH_LABELS[month], x: wi });
        lastMonth = month;
      }
    }

    return { weeks: weekBuckets, activeDays: active, monthPositions: months };
  }, [data]);

  if (data.length === 0) return null;

  const cellSize = 11;
  const cellGap = 2;
  const step = cellSize + cellGap;
  const leftPad = 28;
  const topPad = 18;
  const svgWidth = leftPad + weeks.length * step + 4;
  const svgHeight = topPad + 7 * step + 4;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Contribution Activity
          </div>
          <span className="text-xs text-muted-foreground font-normal" data-testid="text-contribution-count">
            {activeDays} active days in the last year
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" data-testid="chart-contribution-heatmap">
          <svg
            width={svgWidth}
            height={svgHeight}
            className="block"
            role="img"
            aria-label="Contribution heatmap"
          >
            {monthPositions.map((m, i) => (
              <text
                key={i}
                x={leftPad + m.x * step}
                y={12}
                className="fill-muted-foreground"
                fontSize={9}
                fontFamily="system-ui, sans-serif"
              >
                {m.label}
              </text>
            ))}

            {DAY_LABELS.map((label, i) =>
              label ? (
                <text
                  key={i}
                  x={0}
                  y={topPad + i * step + cellSize - 2}
                  className="fill-muted-foreground"
                  fontSize={9}
                  fontFamily="system-ui, sans-serif"
                >
                  {label}
                </text>
              ) : null
            )}

            {weeks.map((week, wi) =>
              week.map((day) => (
                <rect
                  key={day.date}
                  x={leftPad + wi * step}
                  y={topPad + day.dayOfWeek * step}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  ry={2}
                  className={
                    day.level === 0
                      ? "fill-muted/50"
                      : day.level === 1
                        ? "fill-primary/20"
                        : day.level === 2
                          ? "fill-primary/40"
                          : day.level === 3
                            ? "fill-primary/70"
                            : "fill-primary"
                  }
                  data-testid={`cell-heatmap-${day.date}`}
                >
                  <title>{`${day.date}: ${LEVEL_LABELS[day.level] || "Unknown"}`}</title>
                </rect>
              ))
            )}
          </svg>
        </div>

        <div className="flex items-center justify-end gap-1.5 mt-3">
          <span className="text-[10px] text-muted-foreground mr-1">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              data-testid={`cell-legend-${level}`}
              className={`w-[11px] h-[11px] rounded-[2px] ${
                level === 0
                  ? "bg-muted/50"
                  : level === 1
                    ? "bg-primary/20"
                    : level === 2
                      ? "bg-primary/40"
                      : level === 3
                        ? "bg-primary/70"
                        : "bg-primary"
              }`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
