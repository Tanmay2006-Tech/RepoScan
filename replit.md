# RepoScan - GitHub Repository Intelligence Dashboard

## Overview
A developer tool that allows users to paste a GitHub repository URL and receive detailed insights about the project including repository statistics, tech stack detection, project structure visualization, contributor insights, and repository quality scoring.

## Architecture
- **Frontend**: React + TypeScript + TailwindCSS (Vite dev server)
- **Backend**: Express.js API routes (serverless-style)
- **External API**: GitHub REST API (no auth required, optional GITHUB_TOKEN for higher rate limits)
- **No database needed** - all data is fetched live from GitHub API

## Key Features
1. **Repository Analyzer** - Fetches repo details, stars, forks, watchers, language, topics
2. **Quality Score** - 0-100 scoring system based on stars, contributors, commit frequency, README presence, issue management, documentation
3. **Project Complexity Analyzer** - Classifies projects as Beginner/Intermediate/Advanced/Enterprise based on file count, languages, contributors, commits
4. **Repository Health Monitor** - Evaluates health status, activity level, issue resolution, and maintenance status
5. **Tech Stack Detection** - Analyzes file tree to detect frameworks, languages, tools
6. **File Tree Viewer** - Collapsible repository structure visualization
7. **Contributor Insights** - Top contributors with avatars and commit counts
8. **Language Breakdown** - Visual bar chart of language composition
9. **Commit Activity** - Weekly commit activity chart for last 6 months
10. **README Summary** - Parsed README with overview, installation, and usage tabs

## Project Structure
```
shared/schema.ts          - TypeScript interfaces for all data types
server/routes.ts          - POST /api/analyze endpoint
server/storage.ts         - Empty storage (no DB needed)
client/src/App.tsx         - Router setup
client/src/pages/dashboard.tsx  - Main dashboard page
client/src/components/
  repo-input.tsx           - URL input form
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
- `POST /api/analyze` - Accepts `{ url: string }` body, returns `AnalysisResult`

## Environment Variables
- `GITHUB_TOKEN` (optional) - GitHub personal access token for higher rate limits
