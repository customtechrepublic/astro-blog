// Global site + brand configuration. Import from anywhere:
//   import { SITE, NAV, FEATURES } from "../consts";

export const SITE = {
	title: "Custom PC Republic",
	shortTitle: "CPR Blog",
	tagline: "Plug in. Play secure.",
	description:
		"Builds, OpenWrt router configs, security-first networking and project updates from Custom PC Republic.",
	url: "https://blog.custompcrepublic.com",
	mainSite: "https://custompcrepublic.com",
	githubOrg: "customtechrepublic",
	defaultOgImage: "/og/default.jpg",
	locale: "en-AU",
} as const;

// Backwards-compatible names used by the Astro starter (rss etc).
export const SITE_TITLE = SITE.title;
export const SITE_DESCRIPTION = SITE.description;

export const NAV = [
	{ href: "/blog", label: "Blog" },
	{ href: "/projects", label: "Projects" },
	{ href: "/openwrt", label: "OpenWrt" },
	{ href: "/github", label: "GitHub" },
	{ href: "/shop", label: "Shop" },
	{ href: "/about", label: "About" },
	{ href: "/contact", label: "Contact" },
] as const;

export const SOCIAL = [
	{ href: `https://github.com/customtechrepublic`, label: "GitHub", icon: "github" },
	{ href: "/rss.xml", label: "RSS feed", icon: "rss" },
] as const;

// Feature flags. Flip these when a pipeline is ready (see docs/PIPELINES.md).
// Env vars override at build time, e.g. PUBLIC_SHOP_ENABLED=true npm run build
const flag = (v: string | undefined, fallback: boolean) =>
	v === undefined || v === "" ? fallback : v === "true" || v === "1";

export const FEATURES = {
	/** Show prices + add-to-cart. While false, /shop renders as "coming soon". */
	shop: flag(import.meta.env.PUBLIC_SHOP_ENABLED, false),
	/** Pull live repos / PRs from the GitHub API at build time. */
	githubLive: flag(import.meta.env.PUBLIC_GITHUB_LIVE, false),
	/** Render promo / advertising slots. */
	promos: flag(import.meta.env.PUBLIC_PROMOS_ENABLED, true),
} as const;
