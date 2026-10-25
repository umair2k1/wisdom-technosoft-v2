# Wisdom Technosoft — v2 (Astro + Cloudflare Pages)

Component-driven, maintainable brochure site built with [Astro](https://astro.build) and deployed to Cloudflare Pages.

## Project Structure

```text
├── public/
│   ├── assets/        # Logos, favicons, branding images
│   ├── _headers       # Cloudflare Pages security headers
│   └── _redirects     # Cloudflare Pages 301 redirects
├── src/
│   ├── components/    # Modular section components
│   │   ├── Approach.astro
│   │   ├── ContactForm.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── Marquee.astro
│   │   ├── Nav.astro
│   │   ├── ScrollOrb.astro
│   │   ├── Services.astro
│   │   ├── Team.astro
│   │   └── Vision.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── index.astro
│   │   ├── privacy.astro
│   │   └── api/
│   │       └── contact.ts  # On-demand Cloudflare Pages function endpoint
│   ├── scripts/
│   │   └── scroll.js       # Client-side scroll physics and chapter tracking
│   └── styles/
│       └── global.css      # Design tokens, typography, and utility classes
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Commands

- `npm run dev` — Start local development server
- `npm run build` — Build static pages and Cloudflare Pages worker to `dist/`
- `npm run preview` — Preview the built site locally

## Deployment (Cloudflare Pages)

- **Framework preset:** Astro
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variables:**
  - `DESTINATION_EMAIL` (optional): Destination email for inquiry notifications (defaults to `wisdomtechnosoft04@gmail.com`).
  - `FORM_SERVICE_KEY` (optional): Web3Forms access key for automatic forwarding.
