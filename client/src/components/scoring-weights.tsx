import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import type { ProfileScore } from "@shared/schema";

interface ScoringWeightsProps {
  breakdown: ProfileScore["breakdown"];
  onScoreChange: (newTotal: number, newLabel: ProfileScore["label"]) => void;
}

interface Weights {
  repos: number;
  stars: number;
  followers: number;
  diversity: number;
  consistency: number;
}

const STORAGE_KEY = "reposcan-scoring-weights";

const DEFAULT_WEIGHTS: Weights = {
  repos: 1,
  stars: 1,
  followers: 1,
  diversity: 1,
  consistency: 1,
};

const LABELS: Record<keyof Weights, string> = {
  repos: "Repositories",
  stars: "Stars",
  followers: "Followers",
  diversity: "Language Diversity",
  consistency: "Consistency",
};

const MAX_SCORES: Record<keyof Weights, number> = {
  repos: 25,
  stars: 25,
  followers: 20,
  diversity: 15,
  consistency: 15,
};

function calculateLabel(total: number): ProfileScore["label"] {
  if (total >= 80) return "Outstanding";
  if (total >= 55) return "Strong";
  if (total >= 30) return "Growing";
  return "Beginner";
}

export function ScoringWeights({ breakdown, onScoreChange }: ScoringWeightsProps) {
  const [weights, setWeights] = useState<Weights>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
    } catch {
      return DEFAULT_WEIGHTS;
    }
  });

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
    const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
    if (totalWeight === 0) {
      onScoreChange(0, "Beginner");
      return;
    }
    let weighted = 0;
    for (const key of Object.keys(weights) as (keyof Weights)[]) {
      const raw = breakdown[key];
      const max = MAX_SCORES[key];
      const normalized = max > 0 ? raw / max : 0;
      weighted += normalized * weights[key];
    }
    const newTotal = Math.round((weighted / totalWeight) * 100);
    onScoreChange(newTotal, calculateLabel(newTotal));
  }, [weights, breakdown]);

  const handleWeightChange = (key: keyof Weights, value: number[]) => {
    setWeights({ ...weights, [key]: value[0] });
  };

  const resetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  const isDefault = Object.keys(DEFAULT_WEIGHTS).every(
    (key) => weights[key as keyof Weights] === DEFAULT_WEIGHTS[key as keyof Weights]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle
            className="flex items-center gap-2 text-sm font-semibold cursor-pointer"
            onClick={() => setExpanded(!expanded)}
            data-testid="button-toggle-weights"
          >
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            Scoring Weights
          </CardTitle>
          {!isDefault && (
            <Button variant="ghost" size="sm" onClick={resetWeights} className="h-7 text-xs gap-1" data-testid="button-reset-weights">
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          )}
        </div>
        {!expanded && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Click to customize what matters most in scoring
          </p>
        )}
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4 pt-2">
          {(Object.keys(LABELS) as (keyof Weights)[]).map((key) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">{LABELS[key]}</label>
                <span className="text-xs font-mono font-semibold" data-testid={`text-weight-${key}`}>
                  {weights[key] === 0 ? "Off" : `${weights[key]}x`}
                </span>
              </div>
              <Slider
                min={0}
                max={3}
                step={0.5}
                value={[weights[key]]}
                onValueChange={(v) => handleWeightChange(key, v)}
                data-testid={`slider-weight-${key}`}
              />
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
