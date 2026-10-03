# Markdown style guide

Enforced by **markdownlint** (`npm run lint:md`) and **Prettier** (`npm run format`). The rules below cover what a linter can't check.

## Readability first

Many readers skim, and some have low vision. Write for them:

- **Bold the key phrase** of each paragraph or bullet so a skimmer catches it.
- **Keep paragraphs short** (1–3 sentences). Put a blank line between them.
- **Prefer bullets and numbered steps** over long prose.
- **One idea per bullet.**
- Use tables for comparisons, not sentences.

## Structure

- Frontmatter `title` is the page `<h1>`, so **start the body at `##`**.
- Don't skip levels (`##` → `####`).
- Lead with a one-line **bold summary**.

## Code & configs

- Always set a language on fenced blocks: ` ```bash `, ` ```json `, ` ```text `.
- Commands meant to run **on a router** should say so: "Run on the router over SSH."
- **Warn before destructive commands** with a `> ⚠️` blockquote.

## Links & images

- Internal links are root-relative: `/openwrt/configs/secure-baseline`.
- Every image needs alt text, except purely decorative ones (`alt=""`).
- Hero images: **1200×630**, JPEG or WebP, under 300 KB.

## Naming

- File names: `kebab-case.md`. The file name is the URL slug.
- Tags: lowercase, singular, hyphenated (`openwrt`, `pc-build`).
- Spell it **OpenWrt** (not OpenWRT) and **Custom PC Republic** (or **CPR**).
