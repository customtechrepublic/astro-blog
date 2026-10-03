import { glob, file } from "astro/loaders";
import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";

// ─────────────────────────────────────────────────────────────
// Content collections. Each folder in src/content/ has a README
// describing its frontmatter; templates live in /templates.
// ─────────────────────────────────────────────────────────────

const blog = defineCollection({
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		author: z.string().default("Custom PC Republic"),
		category: z.enum(["builds", "openwrt", "security", "news", "guides", "brand"]).default("news"),
		tags: z.array(z.string()).default([]),
		/** Link the post to a project page. */
		project: reference("projects").optional(),
		draft: z.boolean().default(false),
		featured: z.boolean().default(false),
	}),
});

const projects = defineCollection({
	loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		status: z.enum(["idea", "planning", "in-development", "beta", "released", "paused"]),
		/** owner/repo on GitHub, used by the GitHub pipeline. */
		repo: z.string().optional(),
		tags: z.array(z.string()).default([]),
		startDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		order: z.number().default(100),
	}),
});

// OpenWrt documentation. Hand-written pages AND READMEs synced from
// GitHub by `npm run sync:docs` (those carry `source`).
const docs = defineCollection({
	loader: glob({ base: "./src/content/docs", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		section: z.string().default("openwrt"),
		order: z.number().default(100),
		source: z
			.object({
				repo: z.string(),
				path: z.string(),
				ref: z.string().default("main"),
				syncedAt: z.coerce.date().optional(),
			})
			.optional(),
	}),
});

// Downloadable OpenWrt configs. Body = explanation; `files` = the raw
// config files stored under public/configs/<slug>/.
const configs = defineCollection({
	loader: glob({ base: "./src/content/configs", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		openwrtVersion: z.string(),
		devices: z.array(z.string()).default([]),
		category: z.enum(["firewall", "wireless", "vpn", "dns", "vlan", "qos", "system", "full-image"]),
		files: z.array(
			z.object({
				name: z.string(),
				/** Path under /public, e.g. /configs/secure-baseline/firewall */
				path: z.string(),
				/** Where the file goes on the router, e.g. /etc/config/firewall */
				target: z.string().optional(),
			}),
		),
		updatedDate: z.coerce.date(),
		project: reference("projects").optional(),
		tags: z.array(z.string()).default([]),
	}),
});

// Storefront catalogue. Rendered read-only until FEATURES.shop is on.
const products = defineCollection({
	loader: glob({ base: "./src/content/products", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		name: z.string(),
		sku: z.string(),
		summary: z.string(),
		/** Price in minor units (cents) to avoid float bugs. */
		priceCents: z.number().int().nonnegative().optional(),
		currency: z.string().length(3).default("AUD"),
		availability: z.enum(["coming-soon", "preorder", "in-stock", "sold-out", "discontinued"]),
		category: z.enum(["router", "pc-build", "service", "accessory", "digital"]),
		images: z.array(z.string()).default([]),
		/** Filled in once a payment provider is chosen (see docs/STOREFRONT.md). */
		checkout: z
			.object({
				provider: z.enum(["stripe", "shopify", "snipcart", "lemonsqueezy", "external"]),
				productId: z.string().optional(),
				url: z.string().url().optional(),
			})
			.optional(),
		order: z.number().default(100),
	}),
});

// Advertising / promo slots (JSON, no body).
const promos = defineCollection({
	loader: file("./src/content/promos/promos.json"),
	schema: z.object({
		title: z.string(),
		blurb: z.string(),
		cta: z.string(),
		href: z.string(),
		badge: z.string().optional(),
		image: z.string().optional(),
		/** Where the promo may render. */
		slots: z.array(z.enum(["home", "sidebar", "post-footer", "openwrt"])),
		active: z.boolean().default(true),
		sponsored: z.boolean().default(false),
	}),
});

export const collections = { blog, projects, docs, configs, products, promos };
