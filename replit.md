# RepoScan - GitHub Repository & Profile Intelligence Dashboard

## Overview
A developer tool that allows users to either paste a GitHub repository URL for detailed repo insights OR enter a GitHub username to analyze an entire user profile. Supports dual-mode analysis from the same interface.

## Architecture
- **Frontend**: React + TypeScript + TailwindCSS (Vite dev server)
- **Backend**: Express.js API routes (serverless-style)
- **External API**: GitHub REST API (no auth required, optional GITHUB_TOKEN for higher rate limits)
- **No database needed** - all data is fetched live from GitHub API

## Key Features

### Repository Analysis Mode
1. **Repository Analyzer** - Fetches repo details, stars, forks, watchers, language, topics
2. **Quality Score** - 0-100 scoring system based on stars, contributors, commit frequency, README presence, issue management, documentation
3. **Project Complexity Analyzer** - Classifies projects as Beginner/Intermediate/Advanced/Enterprise
4. **Repository Health Monitor** - Evaluates health status, activity level, issue resolution, and maintenance status
5. **Tech Stack Detection** - Analyzes file tree to detect frameworks, languages, tools
6. **File Tree Viewer** - Collapsible repository structure visualization
7. **Contributor Insights** - Top contributors with avatars and commit counts
8. **Language Breakdown** - Visual bar chart of language composition
9. **Commit Activity** - Weekly commit activity chart for last 6 months
10. **README Summary** - Parsed README with overview, installation, and usage tabs

### User Profile Analysis Mode
1. **Profile Header** - Avatar, name, bio, location, company, social links, follower/following stats
2. **Developer Score** - 0-100 scoring based on repos, stars, followers, language diversity, consistency
3. **Repository List** - All owned repos with stars, forks, language, descriptions; click to deep-analyze any repo
4. **Language Diversity** - Color-coded bar chart of languages used across all repos
5. **Activity Timeline** - Monthly bar chart of repo update activity

## Project Structure
```
shared/schema.ts          - TypeScript interfaces for all data types (repo + profile)
server/routes.ts          - POST /api/analyze + POST /api/profile endpoints
server/storage.ts         - Empty storage (no DB needed)
client/src/App.tsx         - Router setup
client/src/pages/dashboard.tsx  - Main dashboard page (dual-mode)
client/src/components/
  scan-input.tsx           - Dual-mode input with repo/profile toggle
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
  profile-header.tsx       - User profile card with avatar and stats
  profile-score.tsx        - Developer score ring + breakdown
  profile-repos.tsx        - User's repository list
  profile-languages.tsx    - Cross-repo language diversity chart
  profile-activity.tsx     - Monthly activity timeline
```

## API
- `POST /api/analyze` - Accepts `{ url: string }` body, returns `AnalysisResult`
- `POST /api/profile` - Accepts `{ username: string }` body, returns `ProfileAnalysisResult`

## Environment Variables
- `GITHUB_TOKEN` (optional) - GitHub personal access token for higher rate limits
