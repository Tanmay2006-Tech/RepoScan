import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HiringInsights } from "@shared/schema";
import { Trophy, Star, Pin } from "lucide-react";

interface TopProjectsProps {
  projects: HiringInsights["topProjects"];
  onAnalyzeRepo: (repoName: string) => void;
  ownerLogin: string;
}

export function TopProjects({ projects, onAnalyzeRepo, ownerLogin }: TopProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Trophy className="w-4 h-4 text-muted-foreground" />
          Top Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {projects.map((project, i) => (
          <div
            key={project.name}
            className={`flex items-start gap-3 p-3 rounded-md ${project.pinned ? "bg-primary/5 border border-primary/10" : "bg-muted/30"}`}
            data-testid={`card-top-project-${i}`}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary text-xs font-bold shrink-0">
              {project.pinned ? <Pin className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <button
                  type="button"
                  onClick={() => onAnalyzeRepo(`https://github.com/${ownerLogin}/${project.name}`)}
                  className="text-sm font-semibold hover:underline underline-offset-4 truncate"
                  data-testid={`link-top-project-${i}`}
                >
                  {project.name}
                </button>
                {project.pinned && (
                  <Badge variant="secondary" className="text-[9px] gap-0.5" data-testid={`badge-pinned-${i}`}>
                    <Pin className="w-2.5 h-2.5" />
                    Pinned
                  </Badge>
                )}
                {project.language && (
                  <Badge variant="outline" className="text-[10px] font-mono">{project.language}</Badge>
                )}
                {project.stars > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Star className="w-3 h-3" />
                    {project.stars}
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
