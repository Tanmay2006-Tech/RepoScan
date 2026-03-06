# RepoScan - GitHub Hiring & Repository Intelligence

## Overview
A dual-purpose tool for both HR teams and developers. HR managers can evaluate candidates, compare profiles, and generate hiring reports. Developers can see how recruiters view their GitHub, get profile scores, and receive actionable improvement tips. Also supports deep repository analysis. Vercel-compatible (no database).

## Architecture
- **Frontend**: React + TypeScript + TailwindCSS (Vite dev server)
- **Backend**: Express.js API routes (serverless-style)
- **External API**: GitHub REST API (no auth required, optional GITHUB_TOKEN for higher rate limits)
- **No database needed** - all data is fetched live from GitHub API
- **Client-side persistence**: localStorage for search history, team stack, scoring weights, theme preference, user purpose

## Dual Purpose Mode
On first visit, users choose "I'm Hiring" or "I'm a Developer". This changes the entire UI:
- **HR Mode**: Candidate Report, Hiring Verdict, Areas of Concern, Red Flags, Team Fit, Compare Candidates, Custom Scoring Weights
- **Developer Mode**: Your Profile Analysis, Profile Rating, What You're Doing Well, Improvement Tips, Things to Fix. Hides HR-only features (compare, team fit, scoring weights)
- Purpose is saved in localStorage and can be switched via header button

## Key Features

### User Profile Mode
1. **Profile Header** - Avatar, name, bio, location, company, social links, experience level badge, stats
2. **Assessment** - Recommendation/rating, experience level, strengths, concerns (HR) or improvement tips (candidate)
3. **Red Flag / Things to Fix** - Detects: mostly forks, inactive accounts, activity spikes, empty repos, archived majority
4. **Improvement Tips** (Developer mode) - Actionable tips like "pin your best repos", "add a bio", "contribute regularly"
5. **Top Projects** - Best repos with pinned repo detection (scraped from GitHub profile)
6. **Team Fit Analysis** (HR only) - Enter team tech stack, see match % and skill breakdown
7. **Developer Score** - 0-100 with optional custom weights (HR only)
8. **Compare Candidates** (HR only) - Side-by-side comparison of up to 4 profiles
9. **Technical Skills** - Primary skill badges, language diversity bar chart
10. **Repository List** - All owned repos; click any to deep-analyze
11. **Activity Timeline** - Monthly activity chart

### Repository Analysis Mode
1. **Quality Score** - 0-100 scoring system with breakdown
2. **Project Complexity Analyzer** - Beginner/Intermediate/Advanced/Enterprise
3. **Repository Health Monitor** - Status, activity, issue resolution, maintenance
4. **Tech Stack Detection** - Frameworks, languages, tools from file tree
5. **File Tree Viewer** - Collapsible repository structure
6. **Contributor Insights** - Top contributors with commit counts
7. **Language Breakdown** - Visual bar chart
8. **Commit Activity** - Weekly commit chart
9. **README Summary** - Parsed with overview, installation, usage tabs

### Cross-cutting Features
- **Contribution Heatmap** - GitHub-style calendar grid showing daily activity from last 90 days (Events API, 3 pages)
- **Skills Radar Chart** - SVG spider chart mapping languages to 6 skill domains (Frontend, Backend, Systems, Mobile, Data & ML, DevOps)
- **Export to PDF** - Professional PDF reports for both modes
- **Dark Mode** - Light/dark toggle persisted in localStorage
- **Search History** - Recent searches (max 10) with dropdown on focus

## Project Structure
```
shared/schema.ts          - TypeScript interfaces (UserPurpose, HiringInsights with improvementTips)
server/routes.ts          - POST /api/analyze + POST /api/profile, pinned repos scraper, improvement tips
client/src/pages/dashboard.tsx  - Main dashboard with purpose selector and dual-mode rendering
client/src/lib/
  export-pdf.ts            - PDF generation
  search-history.ts        - localStorage search history
client/src/components/
  contribution-heatmap.tsx - GitHub-style activity heatmap (90 days, SVG)
  skills-radar.tsx         - Spider/radar chart of skill domains (SVG)
  scan-input.tsx           - Dual-mode input + search history dropdown
  hiring-assessment.tsx    - Assessment card (adapts language for HR vs developer)
  profile-tips.tsx         - Developer-only improvement tips with numbered action items
  top-projects.tsx         - Top projects with pinned badges
  team-fit.tsx             - Team stack match (HR only)
  scoring-weights.tsx      - Custom scoring sliders (HR only)
  compare-candidates.tsx   - Side-by-side comparison (HR only)
  theme-toggle.tsx         - Dark/light mode toggle
  profile-header.tsx       - User profile card
  profile-score.tsx        - Score ring + breakdown
  profile-repos.tsx        - Repository list
  profile-activity.tsx     - Activity timeline
  skills-overview.tsx      - Language skills
  repo-stats/score/etc     - Repository analysis components
```

## API
- `POST /api/analyze` - Accepts `{ url }`, returns `AnalysisResult`
- `POST /api/profile` - Accepts `{ username }`, returns `ProfileAnalysisResult` with `hiringInsights` (redFlags, improvementTips, pinned projects)

## Environment Variables
- `GITHUB_TOKEN` (optional) - GitHub personal access token for higher rate limits
