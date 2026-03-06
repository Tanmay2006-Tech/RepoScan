import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TechStackItem } from "@shared/schema";
import { Layers, Code, Wrench, Database, Cloud, Library, Cpu, Box } from "lucide-react";

interface TechStackViewProps {
  items: TechStackItem[];
}

const categoryConfig: Record<
  TechStackItem["category"],
  { label: string; icon: typeof Code; variant: "default" | "secondary" | "outline" }
> = {
  framework: { label: "Frameworks", icon: Layers, variant: "default" },
  language: { label: "Languages", icon: Code, variant: "secondary" },
  tool: { label: "Tools", icon: Wrench, variant: "secondary" },
  library: { label: "Libraries", icon: Library, variant: "outline" },
  runtime: { label: "Runtimes", icon: Cpu, variant: "secondary" },
  database: { label: "Databases", icon: Database, variant: "secondary" },
  cloud: { label: "Cloud", icon: Cloud, variant: "outline" },
};

export function TechStackView({ items }: TechStackViewProps) {
  if (items.length === 0) return null;

  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, TechStackItem[]>,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Box className="w-4 h-4 text-muted-foreground" />
          Detected Tech Stack
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped).map(([category, catItems]) => {
          const config = categoryConfig[category as TechStackItem["category"]];
          if (!config) return null;
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <config.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {config.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5" data-testid={`container-stack-${category}`}>
                {catItems.map((item) => (
                  <Badge
                    key={item.name}
                    variant={config.variant}
                    className="font-mono text-xs"
                    data-testid={`badge-tech-${item.name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {item.name}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
