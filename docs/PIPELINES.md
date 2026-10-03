# Content pipelines: outstanding work

The **scaffold is done**. This is the checklist of pipelines and decisions still needed before the site is fully functional. Tick items off in PRs.

Legend: **🔴 blocking launch** · **🟡 needed soon** · **🟢 nice to have**

---

## 1. Deployment & domain 🔴

- [ ] **Connect the Workers project** to this repo (Cloudflare dashboard → Workers → Import from GitHub), or deploy with `npm run deploy`.
- [ ] **Custom domain:** attach `blog.custompcrepublic.com` to the Worker (dashboard → Worker → Settings → Domains & Routes), or add to `wrangler.json`:

  ```json
  "routes": [{ "pattern": "blog.custompcrepublic.com", "custom_domain": true }]
  ```

- [ ] **Build env vars** in Cloudflare: `PUBLIC_GITHUB_LIVE`, `GITHUB_TOKEN` (secret), and later `PUBLIC_SHOP_ENABLED`.
- [ ] Decide whether `SESSION` KV is needed (only if server-side sessions are used for the cart). The adapter warns about it at build time.

## 2. Real content 🔴

- [ ] **Replace placeholder copy** in `src/content/projects/*`, `src/pages/about.astro`, and `src/content/products/*` (all marked "Placeholder").
- [ ] **Confirm the OpenWrt project name:** "OpenWrt WLT" and repo `customtechrepublic/openwrt-wlt` are placeholders. Update `src/content/projects/openwrt-wlt.md`, `src/content/promos/promos.json` and `src/data/github.json`.
- [ ] Write the **first real posts** (use `templates/blog-post.md`).
- [ ] **Per-post hero images** at 1200×630 in `public/images/blog/`.

## 3. OpenWrt docs sync (README → docs) 🟡

The script and workflow exist. To switch on:

- [ ] List the real repos and files in `src/data/github.json` (`section: "openwrt"`, `docs: ["README.md", "docs/setup.md"]`).
- [ ] Create a **fine-grained PAT** with read-only _Contents_ on those repos and save it as the repo secret `DOCS_SYNC_TOKEN`.
- [ ] Run **Actions → Sync GitHub docs → Run workflow** once and merge the PR it opens.
- [ ] 🟢 Optional: trigger the sync from the source repos on push (`repository_dispatch`) instead of nightly.
- [ ] 🟢 Optional: support images committed in source repos (currently rewritten to `raw.githubusercontent.com`, which only works for public repos).

## 4. OpenWrt config library 🟡

- [ ] Move real configs into `public/configs/<slug>/` with a metadata file in `src/content/configs/` (`templates/openwrt-config.md`).
- [ ] **Decide the source of truth:** keep configs here, or sync them from the OpenWrt repo like the docs (extend `scripts/sync-github-docs.mjs` with a `configs` list).
- [ ] 🟢 Publish SHA-256 checksums next to each file and show them on the config page.
- [ ] 🟢 Router-side helper script that reads `/openwrt/configs.json`.

## 5. GitHub activity and pull requests 🟡

- [ ] Set `PUBLIC_GITHUB_LIVE=true` and `GITHUB_TOKEN` in the Cloudflare build env.
- [ ] Add every public repo to `src/data/github.json`.
- [ ] **Freshness:** the PR list is built at deploy time. Options:
  - [ ] Cloudflare **Deploy Hook** + a GitHub webhook or scheduled Action to rebuild hourly/daily, **or**
  - [ ] Convert `/github` to a server route (`export const prerender = false`) with KV caching.
- [ ] 🟢 Show recent commits and releases alongside PRs.

## 6. Storefront 🟡 → 🔴 at launch

See **[STOREFRONT.md](STOREFRONT.md)**. Summary:

- [ ] Choose a provider (Stripe Checkout recommended).
- [ ] Implement one adapter in `src/lib/shop/provider.ts`.
- [ ] Add secrets with `wrangler secret put STRIPE_SECRET_KEY`.
- [ ] Prices (`priceCents`) and `checkout.productId` on every product.
- [ ] Payment webhook endpoint for order confirmation and email.
- [ ] Legal pages: terms, privacy, shipping, refunds (AU consumer law).
- [ ] Flip `PUBLIC_SHOP_ENABLED=true`.

## 7. Advertising / promos 🟢

- [x] Promo slot component and JSON source (`src/content/promos/promos.json`), OpenWrt WLT promo live.
- [ ] Decide whether third-party / sponsored ads are allowed. If yes, add the `sponsored: true` label policy and a privacy-friendly ad source (no third-party trackers by default).
- [ ] 🟢 Click tracking via Cloudflare Web Analytics or Zaraz.

## 8. Quality & ops 🟢

- [x] CI: format, markdown lint, build, typecheck (`.github/workflows/ci.yml`).
- [ ] Turn on **Cloudflare Web Analytics** (no cookies).
- [ ] Newsletter / email capture (Buttondown, Resend, or a Worker + D1).
- [ ] Search (Pagefind runs on static output with no server).
- [ ] Per-post OG images generated at build (e.g. `satori`).
- [ ] Comments (Giscus, backed by GitHub Discussions).
- [ ] Pin dependency ranges and enable Dependabot/Renovate.
