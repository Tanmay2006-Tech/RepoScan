import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Check, X, Percent } from "lucide-react";

interface TeamFitProps {
  candidateSkills: string[];
  candidateLanguages: Record<string, number>;
}

const STORAGE_KEY = "reposcan-team-stack";

function normalizeSkill(s: string): string {
  return s.trim().toLowerCase().replace(/[.\s-]+/g, "");
}

export function TeamFit({ candidateSkills, candidateLanguages }: TeamFitProps) {
  const [input, setInput] = useState("");
  const [stack, setStack] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  }, [stack]);

  const addSkill = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const skills = trimmed.split(",").map(s => s.trim()).filter(Boolean);
    const newStack = [...stack];
    for (const skill of skills) {
      if (!newStack.some(s => normalizeSkill(s) === normalizeSkill(skill))) {
        newStack.push(skill);
      }
    }
    setStack(newStack);
    setInput("");
  };

  const removeSkill = (index: number) => {
    setStack(stack.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const allCandidateSkills = new Set([
    ...candidateSkills.map(normalizeSkill),
    ...Object.keys(candidateLanguages).map(normalizeSkill),
  ]);

  const matched = stack.filter(s => allCandidateSkills.has(normalizeSkill(s)));
  const missing = stack.filter(s => !allCandidateSkills.has(normalizeSkill(s)));
  const matchPercent = stack.length > 0 ? Math.round((matched.length / stack.length) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Target className="w-4 h-4 text-muted-foreground" />
          Team Fit Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter tech stack (e.g., React, Node.js, Python)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-xs"
            data-testid="input-team-stack"
          />
          <Button size="sm" onClick={addSkill} disabled={!input.trim()} data-testid="button-add-stack">
            Add
          </Button>
        </div>

        {stack.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {stack.map((s, i) => {
                const isMatch = allCandidateSkills.has(normalizeSkill(s));
                return (
                  <Badge
                    key={i}
                    variant={isMatch ? "default" : "secondary"}
                    className="text-[11px] gap-1 cursor-pointer"
                    onClick={() => removeSkill(i)}
                    data-testid={`badge-stack-${i}`}
                  >
                    {isMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {s}
                  </Badge>
                );
              })}
            </div>

            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40 border">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary">
                <span className="text-sm font-bold" data-testid="text-fit-percent">{matchPercent}%</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold mb-1" data-testid="text-fit-label">
                  {matchPercent >= 80 ? "Excellent Fit" :
                   matchPercent >= 60 ? "Good Fit" :
                   matchPercent >= 40 ? "Partial Fit" : "Low Fit"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {matched.length} of {stack.length} required skills matched
                </div>
              </div>
              <Percent className="w-4 h-4 text-muted-foreground" />
            </div>

            {matched.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Matched Skills
                </div>
                <div className="flex flex-wrap gap-1">
                  {matched.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] gap-1" data-testid={`badge-matched-${i}`}>
                      <Check className="w-2.5 h-2.5 text-primary" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {missing.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Missing Skills
                </div>
                <div className="flex flex-wrap gap-1">
                  {missing.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] gap-1 opacity-60" data-testid={`badge-missing-${i}`}>
                      <X className="w-2.5 h-2.5" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {stack.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Add your team's tech stack to see how well this candidate fits.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
