# Deploying to Cloudflare

The site deploys as a **single Cloudflare Worker with static assets** (`cpr-blog`). This is Cloudflare's current replacement for Pages. It appears under **Workers & Pages** in the dashboard and serves both the static pages and the server routes (`/api/contact`, `/api/checkout`).

- **Account:** cpr-tech (`f7a53ffe65d1e81b7492569090b1582f`)
- **Domain:** `blog.custompcrepublic.com` (Custom Domain, created automatically on first deploy)
- **Fallback URL:** `https://cpr-blog.<your-subdomain>.workers.dev`

## Bindings

All bindings are declared in `wrangler.json`. Types are in `worker-configuration.d.ts` (`npm run cf-typegen`).

| Binding            | Type              | Resource / value                                        | Used by                           |
| ------------------ | ----------------- | ------------------------------------------------------- | --------------------------------- |
| `ASSETS`           | Static assets     | `./dist`                                                | Every static page                 |
| `CONTACT_KV`       | KV                | `cpr-blog-contact` (`2422730c00f9480ca78ea1f1a7d02588`) | Contact submissions + rate limits |
| `SESSION`          | KV                | `cpr-blog-session` (`92c6b3dc4a77435f847e72a105a4cca8`) | Astro sessions (future cart)      |
| `CONTACT_EMAIL`    | Send Email        | Allowed: `daniel@` and `ai@custompcrepublic.com`        | Contact notifications             |
| `CONTACT_TO`       | Var               | `daniel@custompcrepublic.com,ai@custompcrepublic.com`   | Contact recipients                |
| `CONTACT_FROM`     | Var               | `blog@custompcrepublic.com`                             | Sender address                    |
| `TURNSTILE_SECRET` | Secret (optional) | `wrangler secret put TURNSTILE_SECRET`                  | Contact spam protection           |

**Suggested later:** `STRIPE_SECRET_KEY` (secret) for the shop, a **D1** database for orders, and **R2** for large downloads such as firmware images.

## One-time setup

### 1. Let GitHub deploy (recommended)

1. Cloudflare dashboard → **My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"** template. Scope it to the **cpr-tech** account and the **custompcrepublic.com** zone.
2. GitHub → repo **Settings → Secrets and variables → Actions → New secret**: `CLOUDFLARE_API_TOKEN`.
3. Merge to `main`, or run **Actions → Deploy → Run workflow**.

Alternative: dashboard → **Workers & Pages → Create → Import a repository**, with build command `npm run build` and deploy command `npx wrangler deploy`.

Manual alternative: `npx wrangler login && npm run deploy`.

### 2. Make the contact email deliver 📧

The Worker sends from `blog@custompcrepublic.com`. Pick **one** option:

- **A. Onboard the domain to Email Sending (recommended).** Dashboard → **Compute → Email Service → Email Sending → Onboard Domain → custompcrepublic.com**. After that, mail goes to any recipient.
- **B. Email Routing only.** Dashboard → **Email Routing → Destination addresses**: add and **verify** both `daniel@custompcrepublic.com` and `ai@custompcrepublic.com`. Sends to verified addresses are free.

Until one of these is done, submissions **are still saved to KV**: the record shows `email_status: "failed"` and the error appears in the Worker logs.

### 3. Spam protection (optional, recommended)

1. Dashboard → **Turnstile → Add widget** for `blog.custompcrepublic.com`.
2. Set the **site key** as the GitHub Actions _variable_ `PUBLIC_TURNSTILE_SITE_KEY`.
3. Set the **secret**: `npx wrangler secret put TURNSTILE_SECRET`.

Without Turnstile, the form still has a honeypot field and a per-IP rate limit of 5 messages per 10 minutes.

## Reading submissions

```bash
npx wrangler kv key list --binding CONTACT_KV --remote --prefix submission:
npx wrangler kv key get "submission:<id>" --binding CONTACT_KV --remote
```

Each record holds the name, email, topic, message, time, country, a hashed IP and `email_status` (`sent` / `partial` / `failed`). Records expire after one year.
