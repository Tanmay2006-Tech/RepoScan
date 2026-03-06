import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, User, GitBranch, Clock, Trash2 } from "lucide-react";
import { getSearchHistory, addSearchHistory, clearSearchHistory, type SearchHistoryEntry } from "@/lib/search-history";

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
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    const trimmed = value.trim();
    if (mode === "repo") {
      addSearchHistory({ type: "repo", value: trimmed, label: trimmed.replace(/https?:\/\/(www\.)?github\.com\//, "") });
      onSubmitRepo(trimmed);
    } else {
      addSearchHistory({ type: "profile", value: trimmed, label: trimmed.replace(/^(https?:\/\/)?(www\.)?github\.com\//, "").replace(/\/$/, "") });
      onSubmitProfile(trimmed);
    }
    setHistory(getSearchHistory());
    setShowHistory(false);
  };

  const handleHistoryClick = (entry: SearchHistoryEntry) => {
    setValue(entry.value);
    setMode(entry.type);
    setShowHistory(false);
    if (entry.type === "repo") {
      addSearchHistory({ type: entry.type, value: entry.value, label: entry.label });
      onSubmitRepo(entry.value);
    } else {
      addSearchHistory({ type: entry.type, value: entry.value, label: entry.label });
      onSubmitProfile(entry.value);
    }
    setHistory(getSearchHistory());
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory();
    setHistory([]);
    setShowHistory(false);
  };

  const handleInputFocus = () => {
    const h = getSearchHistory();
    setHistory(h);
    if (h.length > 0 && !value) {
      setShowHistory(true);
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
        <div className="relative flex-1" ref={historyRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={mode === "repo" ? "owner/repo" : "username"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={handleInputFocus}
            className="pl-9 font-mono text-xs"
            data-testid="input-scan-compact"
          />
          {showHistory && history.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-1.5 border-b">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Recent</span>
                <button onClick={handleClearHistory} className="text-[10px] text-muted-foreground hover:text-foreground" data-testid="button-clear-history-compact">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {history.map((entry, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleHistoryClick(entry)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/50 text-left"
                  data-testid={`button-history-compact-${i}`}
                >
                  {entry.type === "repo" ? <GitBranch className="w-3 h-3 text-muted-foreground shrink-0" /> : <User className="w-3 h-3 text-muted-foreground shrink-0" />}
                  <span className="font-mono truncate">{entry.label}</span>
                </button>
              ))}
            </div>
          )}
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
        <div className="relative flex-1" ref={historyRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              mode === "repo"
                ? "https://github.com/vercel/next.js"
                : "github.com/username or just username"
            }
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (!e.target.value) {
                const h = getSearchHistory();
                if (h.length > 0) setShowHistory(true);
              }
            }}
            onFocus={handleInputFocus}
            className="pl-9 font-mono text-sm"
            data-testid="input-scan-value"
          />
          {showHistory && history.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Recent Searches</span>
                <button onClick={handleClearHistory} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground" data-testid="button-clear-history">
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
              {history.map((entry, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleHistoryClick(entry)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/50 text-left transition-colors"
                  data-testid={`button-history-${i}`}
                >
                  <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  {entry.type === "repo" ? <GitBranch className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  <span className="font-mono text-xs truncate">{entry.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          )}
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
