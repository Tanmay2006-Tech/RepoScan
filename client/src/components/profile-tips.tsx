import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ArrowRight } from "lucide-react";

interface ProfileTipsProps {
  tips: string[];
}

export function ProfileTips({ tips }: ProfileTipsProps) {
  if (tips.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="w-4 h-4 text-muted-foreground" />
          How to Improve Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 p-3 rounded-md bg-primary/5 border border-primary/10"
            data-testid={`card-tip-${i}`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed">{tip}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
