# RepoScan - GitHub Hiring & Repository Intelligence

## Overview
A professional tool for HR teams and developers. Analyze GitHub user profiles to generate candidate reports with hiring recommendations, experience assessment, strengths/concerns analysis, and technical skill evaluation. Also supports deep-diving into individual repositories for quality scores, tech stack, and project health.

## Architecture
- **Frontend**: React + TypeScript + TailwindCSS (Vite dev server)
- **Backend**: Express.js API routes (serverless-style)
- **External API**: GitHub REST API (no auth required, optional GITHUB_TOKEN for higher rate limits)
- **No database needed** - all data is fetched live from GitHub API

## Key Features

### User Profile / Candidate Report Mode (HR-focused)
1. **Profile Header** - Avatar, name, bio, location, company, social links, experience level badge, follower/following stats
2. **Candidate Assessment** - Hiring recommendation (Strongly Recommend / Recommend / Consider / Needs Review), experience level, strengths, concerns, summary paragraph
3. **Assessment Metrics** - Code quality, collaboration indicator, project diversity, experience level
4. **Top Projects** - Best repos ranked by stars with language badges and descriptions
5. **Developer Score** - 0-100 scoring based on repos, stars, followers, language diversity, consistency
6. **Technical Skills** - Primary skill badges, language diversity bar chart with per-language breakdowns
7. **Repository List** - All owned repos; click any to deep-analyze
8. **Activity Timeline** - Monthly activity chart

### Repository Analysis Mode
1. **Repository Analyzer** - Fetches repo details, stars, forks, watchers, language, topics
2. **Quality Score** - 0-100 scoring system
3. **Project Complexity Analyzer** - Beginner/Intermediate/Advanced/Enterprise classification
4. **Repository Health Monitor** - Health status, activity level, issue resolution, maintenance status
5. **Tech Stack Detection** - Detects frameworks, languages, tools from file tree
6. **File Tree Viewer** - Collapsible repository structure
7. **Contributor Insights** - Top contributors with commit counts
8. **Language Breakdown** - Visual bar chart of language composition
9. **Commit Activity** - Weekly commit activity chart
10. **README Summary** - Parsed README with overview, installation, and usage tabs

## Project Structure
```
shared/schema.ts          - TypeScript interfaces (repo, profile, hiring insights)
server/routes.ts          - POST /api/analyze + POST /api/profile endpoints
server/storage.ts         - Empty storage (no DB needed)
client/src/App.tsx         - Router setup
client/src/pages/dashboard.tsx  - Main dashboard page (dual-mode)
client/src/components/
  scan-input.tsx           - Dual-mode input with repo/profile toggle
  hiring-assessment.tsx    - HR candidate assessment card with recommendation
  top-projects.tsx         - Top projects ranked by stars
  skills-overview.tsx      - Technical skills with language bars
  profile-header.tsx       - User profile card with experience badge
  profile-score.tsx        - Developer score ring + breakdown
  profile-repos.tsx        - User's repository list
  profile-activity.tsx     - Monthly activity timeline
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
- `POST /api/profile` - Accepts `{ username: string }`, returns `ProfileAnalysisResult` with `hiringInsights`

## Environment Variables
- `GITHUB_TOKEN` (optional) - GitHub personal access token for higher rate limits
