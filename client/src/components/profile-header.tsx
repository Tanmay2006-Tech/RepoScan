import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { GitHubUserProfile } from "@shared/schema";
import {
  MapPin,
  Building2,
  Link as LinkIcon,
  Calendar,
  Users,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { SiX } from "react-icons/si";

interface ProfileHeaderProps {
  user: GitHubUserProfile;
  totalStars: number;
  totalForks: number;
  accountAgeDays: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export function ProfileHeader({ user, totalStars, totalForks, accountAgeDays }: ProfileHeaderProps) {
  const years = Math.floor(accountAgeDays / 365);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <Avatar className="w-20 h-20 rounded-xl" data-testid="img-profile-avatar">
            <AvatarImage src={user.avatar_url} alt={user.login} />
            <AvatarFallback className="text-xl">{(user.name || user.login).slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold tracking-tight" data-testid="text-profile-name">
                {user.name || user.login}
              </h2>
              <span className="text-sm text-muted-foreground font-mono" data-testid="text-profile-login">
                @{user.login}
              </span>
            </div>
            {user.bio && (
              <p className="text-sm text-muted-foreground mb-3" data-testid="text-profile-bio">
                {user.bio}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-3">
              {user.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {user.company}
                </span>
              )}
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {user.location}
                </span>
              )}
              {user.blog && (
                <a
                  href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline underline-offset-4"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {user.blog.replace(/^https?:\/\//, "")}
                </a>
              )}
              {user.twitter_username && (
                <a
                  href={`https://x.com/${user.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline underline-offset-4"
                >
                  <SiX className="w-3 h-3" />
                  {user.twitter_username}
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(user.created_at)} ({years}y)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="text-center p-2 rounded-md bg-muted/40">
                <div className="text-lg font-bold font-mono" data-testid="text-profile-repos">{user.public_repos}</div>
                <div className="text-[10px] text-muted-foreground">Repos</div>
              </div>
              <div className="text-center p-2 rounded-md bg-muted/40">
                <div className="text-lg font-bold font-mono" data-testid="text-profile-stars">{totalStars}</div>
                <div className="text-[10px] text-muted-foreground">Stars</div>
              </div>
              <div className="text-center p-2 rounded-md bg-muted/40">
                <div className="text-lg font-bold font-mono" data-testid="text-profile-forks">{totalForks}</div>
                <div className="text-[10px] text-muted-foreground">Forks</div>
              </div>
              <div className="text-center p-2 rounded-md bg-muted/40">
                <div className="text-lg font-bold font-mono" data-testid="text-profile-followers">{user.followers}</div>
                <div className="text-[10px] text-muted-foreground">Followers</div>
              </div>
              <div className="text-center p-2 rounded-md bg-muted/40">
                <div className="text-lg font-bold font-mono" data-testid="text-profile-following">{user.following}</div>
                <div className="text-[10px] text-muted-foreground">Following</div>
              </div>
            </div>
          </div>
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start shrink-0"
            data-testid="link-profile-github"
          >
            <Badge variant="outline" className="font-mono text-xs gap-1">
              GitHub
              <ExternalLink className="w-3 h-3" />
            </Badge>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
