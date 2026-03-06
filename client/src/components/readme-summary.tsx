import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReadmeSummary } from "@shared/schema";
import { BookOpen } from "lucide-react";

interface ReadmeSummaryViewProps {
  readme: ReadmeSummary;
}

export function ReadmeSummaryView({ readme }: ReadmeSummaryViewProps) {
  if (!readme.raw) return null;

  const tabs = [
    { id: "overview", label: "Overview", content: readme.description },
    { id: "install", label: "Installation", content: readme.installation },
    { id: "usage", label: "Usage", content: readme.usage },
  ].filter((t) => t.content.trim().length > 0);

  if (tabs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          README Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={tabs[0]?.id} className="w-full">
          <TabsList className="w-full justify-start" data-testid="tabs-readme">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs" data-testid={`tab-${tab.id}`}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div
                className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-md p-4 max-h-64 overflow-y-auto"
                data-testid={`content-${tab.id}`}
              >
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                  {tab.content}
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
