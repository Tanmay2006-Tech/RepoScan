import type { VercelRequest, VercelResponse } from "@vercel/node";

const GITHUB_API = "https://api.github.com";

async function fetchRateLimit(useToken: boolean): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "repo-intelligence-dashboard",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token && useToken) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`${GITHUB_API}/rate_limit`, { headers });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let response = await fetchRateLimit(true);
    if (!response.ok && process.env.GITHUB_TOKEN) {
      response = await fetchRateLimit(false);
    }
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
