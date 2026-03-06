import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contributor } from "@shared/schema";
import { Users } from "lucide-react";

interface ContributorsViewProps {
  contributors: Contributor[];
}

function formatContributions(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

export function ContributorsView({ contributors }: ContributorsViewProps) {
  if (contributors.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Users className="w-4 h-4 text-muted-foreground" />
            Top Contributors
          </div>
          <span className="text-xs text-muted-foreground font-normal">{contributors.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {contributors.slice(0, 10).map((contributor, index) => (
          <a
            key={contributor.login}
            href={contributor.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 rounded-md hover-elevate"
            data-testid={`link-contributor-${index}`}
          >
            <img
              src={contributor.avatar_url}
              alt={contributor.login}
              className="w-7 h-7 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{contributor.login}</p>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {formatContributions(contributor.contributions)} commits
            </span>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
