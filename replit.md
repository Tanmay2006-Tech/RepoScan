# RepoScan - GitHub Hiring & Repository Intelligence

## Overview
A professional tool for HR teams and developers. Analyze GitHub user profiles to generate candidate reports with hiring recommendations, experience assessment, strengths/concerns analysis, and technical skill evaluation. Also supports deep-diving into individual repositories for quality scores, tech stack, and project health. Vercel-compatible (no database).

## Architecture
- **Frontend**: React + TypeScript + TailwindCSS (Vite dev server)
- **Backend**: Express.js API routes (serverless-style)
- **External API**: GitHub REST API (no auth required, optional GITHUB_TOKEN for higher rate limits)
- **No database needed** - all data is fetched live from GitHub API
- **Client-side persistence**: localStorage for search history, team stack, scoring weights, theme preference

## Key Features

### User Profile / Candidate Report Mode (HR-focused)
1. **Profile Header** - Avatar, name, bio, location, company, social links, experience level badge, follower/following stats
2. **Candidate Assessment** - Hiring recommendation, experience level, strengths, concerns, summary paragraph
3. **Red Flag Alerts** - Detects suspicious patterns: mostly forks, inactive accounts, activity spikes, empty repos, archived majority
4. **Top Projects** - Best repos ranked by stars with pinned repo detection (scraped from GitHub profile)
5. **Team Fit Analysis** - HR enters team tech stack, sees match % and matched/missing skills breakdown
6. **Developer Score** - 0-100 scoring with customizable weights (repos, stars, followers, diversity, consistency)
7. **Custom Scoring Weights** - Adjustable sliders to prioritize what matters for scoring
8. **Compare Candidates** - Side-by-side comparison of up to 4 profiles (scores, stats, skills, recommendations)
9. **Technical Skills** - Primary skill badges, language diversity bar chart
10. **Repository List** - All owned repos; click any to deep-analyze
11. **Activity Timeline** - Monthly activity chart

### Repository Analysis Mode
1. **Quality Score** - 0-100 scoring system with breakdown
2. **Project Complexity Analyzer** - Beginner/Intermediate/Advanced/Enterprise classification
3. **Repository Health Monitor** - Health status, activity level, issue resolution, maintenance status
4. **Tech Stack Detection** - Detects frameworks, languages, tools from file tree
5. **File Tree Viewer** - Collapsible repository structure
6. **Contributor Insights** - Top contributors with commit counts
7. **Language Breakdown** - Visual bar chart of language composition
8. **Commit Activity** - Weekly commit activity chart
9. **README Summary** - Parsed README with overview, installation, and usage tabs

### Cross-cutting Features
- **Export to PDF** - Download professional PDF reports for both profile and repo analysis (uses jspdf)
- **Dark Mode** - Toggle between light/dark themes (persisted in localStorage)
- **Search History** - Recent searches stored in localStorage (max 10), shown as dropdown on input focus

## Project Structure
```
shared/schema.ts          - TypeScript interfaces (repo, profile, hiring insights, red flags)
server/routes.ts          - POST /api/analyze + POST /api/profile endpoints, pinned repos scraper
server/storage.ts         - Empty storage (no DB needed)
client/src/App.tsx         - Router setup
client/src/pages/dashboard.tsx  - Main dashboard page (dual-mode)
client/src/lib/
  export-pdf.ts            - PDF generation for profile and repo reports
  search-history.ts        - localStorage search history manager
  queryClient.ts           - TanStack Query config
client/src/components/
  scan-input.tsx           - Dual-mode input with repo/profile toggle + search history dropdown
  hiring-assessment.tsx    - HR candidate assessment with red flags section
  top-projects.tsx         - Top projects with pinned repo badges
  skills-overview.tsx      - Technical skills with language bars
  profile-header.tsx       - User profile card with experience badge
  profile-score.tsx        - Developer score ring + breakdown
  profile-repos.tsx        - User's repository list
  profile-activity.tsx     - Monthly activity timeline
  team-fit.tsx             - Team tech stack match analysis
  scoring-weights.tsx      - Adjustable scoring weight sliders
  compare-candidates.tsx   - Side-by-side candidate comparison table
  theme-toggle.tsx         - Dark/light mode toggle button
  repo-stats.tsx           - Stats cards (stars, forks, etc.)
  repo-score.tsx           - Quality score ring + breakdown
  complexity-analyzer.tsx  - Project complexity classification
  health-monitor.tsx       - Repository health status
  tech-stack.tsx           - Detected tech stack badges
  contributors.tsx         - Top contributor list
  file-tree.tsx            - Collapsible file tree
  readme-summary.tsx       - README tabs (overview/install/usage)
  language-chart.tsx       - Language breakdown bar
  commit-activity.tsx      - Weekly commit chart
```

## API
- `POST /api/analyze` - Accepts `{ url: string }`, returns `AnalysisResult`
- `POST /api/profile` - Accepts `{ username: string }`, returns `ProfileAnalysisResult` with `hiringInsights` (including redFlags, pinned projects)

## Environment Variables
- `GITHUB_TOKEN` (optional) - GitHub personal access token for higher rate limits

## Dependencies
- jspdf - PDF generation
- html2canvas - HTML to canvas rendering (PDF support)
- @tanstack/react-query - Data fetching
- wouter - Client-side routing
- lucide-react - Icons
- react-icons - Company logos (X/Twitter)
