import type { VercelRequest, VercelResponse } from "@vercel/node";

const GITHUB_API = "https://api.github.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "repo-intelligence-dashboard",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${GITHUB_API}/rate_limit`, { headers });
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch rate limit" });
    }
    const data = await response.json();
    const core = data.resources?.core || data.rate;
    return res.json({
      remaining: core.remaining,
      limit: core.limit,
      reset: core.reset,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch rate limit" });
  }
}
