import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, User, GitBranch } from "lucide-react";

export type ScanMode = "repo" | "profile";

interface ScanInputProps {
  onSubmitRepo: (url: string) => void;
  onSubmitProfile: (username: string) => void;
  isLoading: boolean;
  error: string | null;
  compact?: boolean;
}

export function ScanInput({ onSubmitRepo, onSubmitProfile, isLoading, error, compact }: ScanInputProps) {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<ScanMode>("repo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    if (mode === "repo") {
      onSubmitRepo(value.trim());
    } else {
      onSubmitProfile(value.trim());
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2" data-testid="form-scan-input-compact">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={mode === "repo" ? "default" : "ghost"}
            size="icon"
            onClick={() => setMode("repo")}
            data-testid="button-mode-repo-compact"
          >
            <GitBranch className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant={mode === "profile" ? "default" : "ghost"}
            size="icon"
            onClick={() => setMode("profile")}
            data-testid="button-mode-profile-compact"
          >
            <User className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={mode === "repo" ? "owner/repo" : "username"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="pl-9 font-mono text-xs"
            data-testid="input-scan-compact"
          />
        </div>
        <Button type="submit" size="icon" disabled={isLoading || !value.trim()} data-testid="button-scan-compact">
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-1 mb-4" data-testid="container-mode-toggle">
        <Button
          type="button"
          variant={mode === "repo" ? "default" : "secondary"}
          size="sm"
          onClick={() => setMode("repo")}
          data-testid="button-mode-repo"
        >
          <GitBranch className="w-4 h-4 mr-1.5" />
          Repository
        </Button>
        <Button
          type="button"
          variant={mode === "profile" ? "default" : "secondary"}
          size="sm"
          onClick={() => setMode("profile")}
          data-testid="button-mode-profile"
        >
          <User className="w-4 h-4 mr-1.5" />
          User Profile
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2" data-testid="form-scan-input">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={
              mode === "repo"
                ? "https://github.com/vercel/next.js"
                : "github.com/username or just username"
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="pl-9 font-mono text-sm"
            data-testid="input-scan-value"
          />
        </div>
        <Button type="submit" disabled={isLoading || !value.trim()} data-testid="button-scan">
          Analyze
        </Button>
      </form>
      {error && (
        <p className="text-sm text-destructive" data-testid="text-error">{error}</p>
      )}
    </div>
  );
}
