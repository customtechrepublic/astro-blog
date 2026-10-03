# Content collections

All content lives in `src/content/`. Schemas are in `src/content.config.ts`; **a bad field fails the build** with a clear error. Starter files are in `/templates`.

## `blog/`: posts → `/blog/<file-name>`

| Field         | Required | Notes                                                 |
| ------------- | -------- | ----------------------------------------------------- |
| `title`       | ✅       |                                                       |
| `description` | ✅       | Cards, SEO, RSS                                       |
| `pubDate`     | ✅       | `2026-10-03`                                          |
| `updatedDate` |          |                                                       |
| `heroImage`   |          | Path under `public/`, 1200×630                        |
| `author`      |          | Default "Custom PC Republic"                          |
| `category`    |          | `builds` `openwrt` `security` `news` `guides` `brand` |
| `tags`        |          | List; generates `/blog/tags/<tag>`                    |
| `project`     |          | A project id. Links the post to `/projects/<id>`      |
| `draft`       |          | `true` hides it from production builds                |
| `featured`    |          | Reserved for a featured slot                          |

## `projects/`: projects in development → `/projects/<file-name>`

`title`, `summary`, `status` (`idea` `planning` `in-development` `beta` `released` `paused`), optional `repo` (`owner/name`), `tags`, `order`.

## `docs/`: documentation → `/openwrt/docs/<path>`

`title`, `description`, `section` (default `openwrt`), `order`.

- **Hand-written:** `src/content/docs/openwrt/*.md`
- **Generated:** `src/content/docs/openwrt/repos/*.md` from `npm run sync:docs`. **Don't edit these**; edit the source README on GitHub.

## `configs/`: OpenWrt configs → `/openwrt/configs/<file-name>`

Metadata in `src/content/configs/<slug>.md`; raw files in `public/configs/<slug>/`. Each item in `files` has `name`, `path` (public URL path) and optional `target` (router path).

## `products/`: storefront → `/shop/<file-name>`

See [STOREFRONT.md](STOREFRONT.md). `priceCents` is an integer in cents.

## `promos/promos.json`: advertising / promo slots

Array of `{ id, title, blurb, cta, href, badge?, image?, slots[], active, sponsored }`. Slots are `home`, `sidebar`, `post-footer` and `openwrt`. Rendered by `<PromoSlot slot="…" />`.
