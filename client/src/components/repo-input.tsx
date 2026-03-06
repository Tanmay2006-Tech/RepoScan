import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";

interface RepoInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error: string | null;
  compact?: boolean;
}

export function RepoInput({ onSubmit, isLoading, error, compact }: RepoInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2" data-testid="form-repo-input-compact">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="github.com/owner/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-9 font-mono text-xs"
            data-testid="input-repo-url-compact"
          />
        </div>
        <Button type="submit" size="icon" disabled={isLoading || !url.trim()} data-testid="button-analyze-compact">
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2" data-testid="form-repo-input">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="https://github.com/vercel/next.js"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-9 font-mono text-sm"
            data-testid="input-repo-url"
          />
        </div>
        <Button type="submit" disabled={isLoading || !url.trim()} data-testid="button-analyze">
          Analyze
        </Button>
      </form>
      {error && (
        <p className="text-sm text-destructive" data-testid="text-error">{error}</p>
      )}
    </div>
  );
}
