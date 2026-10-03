/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_SHOP_ENABLED?: string;
	readonly PUBLIC_GITHUB_LIVE?: string;
	readonly PUBLIC_PROMOS_ENABLED?: string;
	/** Optional, build-time only. Raises GitHub API rate limits. Never expose to the client. */
	readonly GITHUB_TOKEN?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}
