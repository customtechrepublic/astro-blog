# Storefront

The shop is **scaffolded and dormant**. Nothing can be bought until a provider is wired up **and** `PUBLIC_SHOP_ENABLED=true`.

## How it fits together

```text
src/content/products/*.md   catalogue (schema: src/content.config.ts → products)
        │
        ▼
/shop, /shop/<slug>          static pages; prices + buy button only when flag is on
        │  POST { lines: [{ sku, quantity }] }
        ▼
/api/checkout                server route on the Worker (prerender = false)
        │
        ▼
src/lib/shop/provider.ts     ShopProvider interface → returns a checkout URL
        │
        ▼
Stripe / Shopify / …         hosted checkout → /shop/thanks
```

**Key rule:** pages never call a payment API directly. Everything goes through `ShopProvider`, so switching provider means changing **one file**.

## Data rules

- **Prices are integer cents** (`priceCents: 19900` = $199.00). No floats.
- **The server is the price authority.** `/api/checkout` receives SKUs and quantities only. The provider adapter must look up prices server-side; never trust a price from the browser.
- `availability` controls the buy button: only `in-stock` and `preorder` are purchasable.

## Launch checklist

1. **Pick a provider.** Stripe Checkout is recommended: hosted page, no card data touches the Worker, works from `fetch` (no Node SDK needed).
2. **Implement the adapter** in `src/lib/shop/provider.ts`:

   ```ts
   class StripeProvider implements ShopProvider {
     readonly name = "stripe";
     constructor(private key: string) {}
     async createCheckout(lines, { successUrl, cancelUrl }) {
       // map SKU → Stripe price id from the products collection,
       // POST https://api.stripe.com/v1/checkout/sessions, return { url }
     }
   }
   ```

3. **Secrets:** `npx wrangler secret put STRIPE_SECRET_KEY`, then add it to the `Env` type (`npm run cf-typegen`).
4. **Webhook:** add `src/pages/api/webhooks/stripe.ts` (verify the signature) to record orders (D1) and send email.
5. **Products:** set `priceCents` and `checkout.productId` for each item, and set `availability`.
6. **Legal pages:** terms, privacy, shipping, returns.
7. **Flip the flag:** `PUBLIC_SHOP_ENABLED=true` in the Cloudflare build environment.

## Later

- Multi-item cart (store in `localStorage` or nanostores, POST all lines to `/api/checkout`)
- Inventory in D1 or KV
- Separate `shop.custompcrepublic.com`: the same components work; move `src/pages/shop` and the API route
