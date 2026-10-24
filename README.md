# Wisdom Technosoft — v2 (scroll-driven)

Static site, no build step, no dependencies. Open `index.html` or run `npx serve .`

## What moves on scroll
- Fixed brand mark: rotates (3D flip + spin), travels between chapters, scales, spreads its chevrons and changes colour.
- Hero headline lines slide apart in opposite directions.
- Services: pinned horizontal scroll across **5 panels** (Software, Telecalling, Data, Business Process & Industrial, Healthcare). Stacks vertically on mobile / reduced motion.
- Principle cards tilt up in 3D into place.
- Marquee strip scrolls sideways and skews with scroll speed.
- Vision ring of text turns as you scroll.
- Team rows slide in from alternating sides.
- Smoothed scrolling values, chapter label, progress bar. `prefers-reduced-motion` disables the effects.

## Deploying with the existing project
- Form posts JSON to `/api/contact`. Copy `functions/api/contact.js` (and `worker.js` / `wrangler.jsonc` if used) from the v1 repo.
- Copy `privacy.html`, `404.html` and the `assets/` favicons from v1 (they link to `styles.css`; give them their own styles or reuse v1's).
- Mark uses the client's official logo assets from `assets/` across the scroll orb, header brand mark, and favicons.
- Team rows are role placeholders, same as v1. Add names/photos once confirmed.
- Tweak chapter positions in the `S` array at the top of `script.js`.
- `privacy.html` and `404.html` are static stubs that reuse `styles.css` — no JS, no orb. Both are `noindex`. The 404 is auto-served by Cloudflare Pages from the project root.
- Add `class="has-orb"` to `<body>` in `index.html` so the fixed `.chap` / `.bar` stay hidden on the stub pages (see `styles.css` `body:not(.has-orb)` rule).

## Needs client input before launch
- Team: replace the role rows with real names, roles and photos.
- Confirm copy claims: multilingual calling, "small, senior team", documented checks at every step.
- Confirm the Business Process & Industrial claims (SAP/SCM, STP, ETP, chemical machinery, instrumentation).
- Confirm Healthcare Support claims — specifically **US medical billing** — scope, compliance posture (HIPAA awareness), and whether it's a live service or roadmap.
- **Address mismatch:** site shows Parsodi / 440022; PDF + WhatsApp flyer show Kalamna Road, Kamptee / 441002. Pick one and update `index.html` + Maps link.
- Business email is a Gmail address; a domain email reads more credible.
- Add `assets/` (logos, favicons, social image) and `functions/api/contact.js`.
- Once the domain is known: add `<link rel="canonical">`, `og:image`, `og:url`, and an `og.png` (1200×630).
- ~~Add `privacy.html`, `404.html`, …~~
