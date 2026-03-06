import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity } from "lucide-react";

interface RateLimitData {
  remaining: number;
  limit: number;
  reset: number;
}

export function RateLimit() {
  const [countdown, setCountdown] = useState<string | null>(null);

  const { data } = useQuery<RateLimitData>({
    queryKey: ["/api/rate-limit"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!data || data.remaining > 0) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = data.reset - now;
      if (diff <= 0) {
        setCountdown(null);
        return;
      }
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data]);

  if (!data) return null;

  const isLow = data.remaining < 10;
  const isExhausted = data.remaining === 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={isExhausted ? "destructive" : isLow ? "secondary" : "outline"}
          className="gap-1 font-mono text-xs cursor-default"
          data-testid="text-rate-limit"
        >
          <Activity className="w-3 h-3" />
          {isExhausted && countdown
            ? `Reset ${countdown}`
            : `${data.remaining}/${data.limit}`}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>GitHub API calls remaining</p>
        {isExhausted && <p className="text-xs text-muted-foreground">Rate limit resets soon</p>}
        {isLow && !isExhausted && <p className="text-xs text-muted-foreground">Running low on API calls</p>}
      </TooltipContent>
    </Tooltip>
  );
}
