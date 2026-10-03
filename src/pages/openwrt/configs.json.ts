// Machine-readable config index, e.g. for a router-side fetch script.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
	const configs = await getCollection("configs");
	const body = configs.map((c) => ({
		slug: c.id,
		title: c.data.title,
		category: c.data.category,
		openwrtVersion: c.data.openwrtVersion,
		devices: c.data.devices,
		updated: c.data.updatedDate.toISOString(),
		files: c.data.files.map((f) => ({ ...f, url: new URL(f.path, site).toString() })),
	}));
	return new Response(JSON.stringify(body, null, 2), { headers: { "content-type": "application/json" } });
};
