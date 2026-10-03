// Storefront provider abstraction.
// ------------------------------------------------------------------
// Pages never talk to Stripe/Shopify/etc directly — they call this
// interface. To go live, implement one adapter (see docs/STOREFRONT.md)
// and return it from getShopProvider().

export interface CartLine {
	sku: string;
	quantity: number;
}

export interface CheckoutSession {
	/** URL to redirect the customer to. */
	url: string;
}

export interface ShopProvider {
	readonly name: string;
	createCheckout(
		lines: CartLine[],
		opts: { successUrl: string; cancelUrl: string },
	): Promise<CheckoutSession>;
}

class NotConfiguredProvider implements ShopProvider {
	readonly name = "not-configured";
	async createCheckout(): Promise<CheckoutSession> {
		throw new ShopNotConfiguredError();
	}
}

export class ShopNotConfiguredError extends Error {
	constructor() {
		super("No shop provider configured. See docs/STOREFRONT.md.");
	}
}

/**
 * `env` is the Cloudflare Worker env (Astro.locals.runtime.env), which is
 * where secrets such as STRIPE_SECRET_KEY will live.
 */
export function getShopProvider(_env?: unknown): ShopProvider {
	// TODO(storefront): return new StripeProvider(env.STRIPE_SECRET_KEY) etc.
	return new NotConfiguredProvider();
}
