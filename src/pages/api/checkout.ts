// Server-rendered endpoint (runs on the Cloudflare Worker, not prerendered).
// The storefront's cart POSTs here; it hands off to the configured provider.
import type { APIRoute } from "astro";
import { FEATURES } from "../../consts";
import { getShopProvider, ShopNotConfiguredError, type CartLine } from "../../lib/shop/provider";

export const prerender = false;

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const POST: APIRoute = async ({ request, locals, url }) => {
	if (!FEATURES.shop) return json({ error: "Shop is not open yet." }, 503);

	let lines: CartLine[];
	try {
		const body = (await request.json()) as { lines?: CartLine[] };
		lines = (body.lines ?? []).filter(
			(l) => typeof l.sku === "string" && Number.isInteger(l.quantity) && l.quantity > 0,
		);
	} catch {
		return json({ error: "Invalid JSON body." }, 400);
	}
	if (lines.length === 0) return json({ error: "Cart is empty." }, 400);

	try {
		const provider = getShopProvider(locals.runtime?.env);
		const session = await provider.createCheckout(lines, {
			successUrl: new URL("/shop/thanks", url).toString(),
			cancelUrl: new URL("/shop", url).toString(),
		});
		return json(session);
	} catch (err) {
		if (err instanceof ShopNotConfiguredError) return json({ error: err.message }, 501);
		throw err;
	}
};
