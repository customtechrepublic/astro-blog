// Build-time GitHub data for /github.
// Live API calls only happen when FEATURES.githubLive is on; otherwise
// (and on any failure) the page falls back to the static repo list.
import { FEATURES } from "../consts";
import sources from "../data/github.json";

export interface RepoSummary {
	name: string;
	label: string;
	url: string;
	description?: string;
	stars?: number;
	pushedAt?: string;
}

export interface PullSummary {
	repo: string;
	number: number;
	title: string;
	url: string;
	state: "open" | "closed" | "merged";
	author: string;
	updatedAt: string;
}

const API = "https://api.github.com";

async function gh<T>(path: string): Promise<T> {
	const headers: Record<string, string> = {
		accept: "application/vnd.github+json",
		"user-agent": "cpr-blog-build",
	};
	const token = import.meta.env.GITHUB_TOKEN;
	if (token) headers.authorization = `Bearer ${token}`;
	const res = await fetch(`${API}${path}`, { headers });
	if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
	return (await res.json()) as T;
}

export async function getRepos(): Promise<RepoSummary[]> {
	const base = sources.repos.map((r) => ({
		name: r.name,
		label: r.label,
		url: `https://github.com/${sources.org}/${r.name}`,
	}));
	if (!FEATURES.githubLive) return base;

	return Promise.all(
		base.map(async (r) => {
			try {
				const d = await gh<{ description: string | null; stargazers_count: number; pushed_at: string }>(
					`/repos/${sources.org}/${r.name}`,
				);
				return {
					...r,
					description: d.description ?? undefined,
					stars: d.stargazers_count,
					pushedAt: d.pushed_at,
				};
			} catch (e) {
				console.warn(`[github] ${r.name}: ${(e as Error).message}`);
				return r;
			}
		}),
	);
}

export async function getRecentPulls(perRepo = 5): Promise<PullSummary[]> {
	if (!FEATURES.githubLive) return [];
	const all = await Promise.all(
		sources.repos.map(async (r) => {
			try {
				type Raw = {
					number: number;
					title: string;
					html_url: string;
					state: "open" | "closed";
					merged_at: string | null;
					user: { login: string } | null;
					updated_at: string;
				};
				const pulls = await gh<Raw[]>(
					`/repos/${sources.org}/${r.name}/pulls?state=all&sort=updated&direction=desc&per_page=${perRepo}`,
				);
				return pulls.map<PullSummary>((p) => ({
					repo: r.name,
					number: p.number,
					title: p.title,
					url: p.html_url,
					state: p.merged_at ? "merged" : p.state,
					author: p.user?.login ?? "unknown",
					updatedAt: p.updated_at,
				}));
			} catch (e) {
				console.warn(`[github] pulls ${r.name}: ${(e as Error).message}`);
				return [];
			}
		}),
	);
	return all.flat().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
