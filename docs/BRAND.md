# Brand

**Name:** Custom PC Republic (short: **CPR**)
**Tagline:** **Plug in. Play secure.**

## Logo

| File                                   | Use                          |
| -------------------------------------- | ---------------------------- |
| `public/brand/logo-mark.svg`           | Icon, favicon, avatars       |
| `public/brand/logo-wordmark.svg`       | Mark + name on dark          |
| `public/brand/logo-wordmark-light.svg` | Mark + name on light         |
| `public/brand/openwrt-badge.svg`       | OpenWrt WLT project badge    |
| `public/og/default.jpg`                | Social share image, 1200×630 |
| `public/brand/hero-tower.jpg`          | Home hero (text-free crop)   |

**The mark:** a shield (secure) holding three stacked case fans (the build).

> ⚠️ The wordmark SVGs use live `<text>` in Michroma. Before print or third-party use, **outline the text** in Figma/Inkscape so it renders without the font installed.

## Colour

| Token        | Hex       | Use                         |
| ------------ | --------- | --------------------------- |
| Midnight     | `#05070f` | Page background             |
| Navy         | `#0a1024` | Surfaces, cards             |
| Navy 2       | `#111a38` | Raised surfaces             |
| **Electric** | `#1f6bff` | Primary buttons, active nav |
| **Ice**      | `#5cc8ff` | Links, highlights           |
| Ice soft     | `#9fe0ff` | Hover, inline code          |
| Signal       | `#22e3a6` | Success, promos, prices     |
| Amber        | `#ffb547` | Warnings, "coming soon"     |
| Danger       | `#ff5c7a` | Errors                      |

All tokens are CSS variables in `src/styles/global.css`.

## Type

- **Display / headings:** Michroma (uppercase, tracked), from `@fontsource/michroma`
- **Body:** Atkinson Hyperlegible, chosen for readability, including for readers with low vision or astigmatism
- **Code:** system monospace
