import { getCollection, type CollectionEntry } from "astro:content";

/** Published posts, newest first. Drafts show in `astro dev` only. */
export async function getPosts(): Promise<CollectionEntry<"blog">[]> {
	const posts = await getCollection("blog", ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getProjects(): Promise<CollectionEntry<"projects">[]> {
	return (await getCollection("projects")).sort((a, b) => a.data.order - b.data.order);
}

export async function getPromos(slot: CollectionEntry<"promos">["data"]["slots"][number]) {
	return await getCollection("promos", ({ data }) => data.active && data.slots.includes(slot));
}

export function uniqueTags(posts: CollectionEntry<"blog">[]): string[] {
	return [...new Set(posts.flatMap((p) => p.data.tags))].sort();
}

export const slugify = (s: string) =>
	s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

/** "openwrt/getting-started" → "getting-started"; "openwrt/index" → undefined (the docs root). */
export const docSlug = (id: string): string | undefined =>
	id.replace(/^openwrt\/?/, "").replace(/\/?index$/, "") || undefined;
