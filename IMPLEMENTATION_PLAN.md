# Wisdom Technosoft — Implementation Plan

**Project:** Static multi-section site with scroll-driven brand mark, pinned horizontal services track, and contact form.
**Baseline:** `index.html`, `styles.css`, `script.js`, `README.md` (v2, scroll-driven), plus `polish.patch` already applied.
**Goal of this pass:**
1. Expand services from 3 → **5** panels (add Business Process & Industrial + Healthcare Support / US Medical Billing).
2. Make scroll interactions **super smooth and fluid** (no layout thrash, GPU-only transforms).
3. Ship **`privacy.html`** and **`404.html`** stubs that match the site's visual language.
4. Reconcile factual data and update `README.md` launch checklist.

**Deployment target:** Cloudflare Pages (per existing `functions/api/contact.js`).
**Browser baseline:** Evergreen (Chrome/Edge 111+, Safari 16.4+, Firefox 128+). Uses `svh`, `clip-path`, `text-wrap: balance`, `@property`, `content-visibility`.

---

## Table of contents

1. Scope summary
2. Files touched
3. `index.html` changes
4. `styles.css` changes
5. `script.js` changes
6. New: `privacy.html`
7. New: `404.html`
8. New: `_headers` / `_redirects` (Cloudflare)
9. `README.md` updates
10. Smoothness pass (the full list)
11. Order of work
12. QA checklist
13. Open items requiring client input

---

## 1. Scope summary

| Area | Before | After |
|---|---|---|
| Services panels | 3 | **5** |
| Dots in pinned nav | 3 | **5** |
| Colour palette stops (`PC`) | 3 | **5** |
| Pinned track width | `300vw` | `500vw` |
| Pinned section height | `400svh` | `520svh` |
| Contact form service options | 3 | **5** |
| Stub pages | none | `privacy.html`, `404.html` |
| Orb repaint strategy | per-frame `--ac` + `--sp` writes | per-frame throttled; `--sp` wired to stroke |
| Track transform | JS string rebuild per frame | CSS `@property --track` (compositor-only) |
| Layout reads per frame | multiple `getBoundingClientRect()` | zero (all cached in `measure()`) |
| Nav hide/show | single threshold, sticky after scroll | debounced, auto-unhides after 600 ms |

---

## 2. Files touched

| File | Status |
|---|---|
| `index.html` | edit |
| `styles.css` | edit |
| `script.js` | edit |
| `README.md` | edit |
| `privacy.html` | **new** |
| `404.html` | **new** |
| `_headers` | **new** (optional, recommended) |

Assets required before launch: `assets/logo-ghost.png`, `assets/logo-mark-light.png`, `assets/favicon-32.png`, `assets/favicon.png`, `assets/apple-touch-icon.png`, `assets/og.png` (1200×630). All except `og.png` already exist in v1.

---

## 3. `index.html` changes

### 3.1 Add `has-orb` class to `<body>`

```html
<body class="has-orb">
```

Purpose: gates `.chap` / `.bar` visibility so they stay hidden on stub pages (see §4.8).

### 3.2 Update `<title>`, meta description, and OG tags

```html
<title>Wisdom Technosoft — Software, Telecalling, Data &amp; Healthcare BPO | Nagpur</title>
<meta name="description" content="Wisdom Technosoft is a Nagpur-based BPO and software studio delivering software development, telecalling, data management, industrial process support and US medical billing.">
<meta property="og:title" content="Wisdom Technosoft — Software, Telecalling, Data &amp; Healthcare BPO">
<meta property="og:description" content="A Nagpur studio that builds your software, runs your customer calls, keeps your data accurate and supports your back-office operations.">
```

### 3.3 Update hero copy

```html
<p>A Nagpur studio that builds your software, runs your customer calls, keeps your data accurate and supports the operations behind them &mdash; one team, one standard.</p>
```

### 3.4 Replace `.dots` list (3 → 5 items)

```html
<ol class="dots" aria-hidden="true">
  <li class="dot is-on">Software</li>
  <li class="dot">Telecalling</li>
  <li class="dot">Data</li>
  <li class="dot">Business process</li>
  <li class="dot">Healthcare</li>
</ol>
```

### 3.5 Add two new `<article class="panel">` blocks inside `.track`

Insert **after** the existing "Data entry &amp; management" panel, before the closing `</div>` of `.track`:

```html
<article class="panel">
  <p class="pword" aria-hidden="true">Scale</p>
  <div class="pbody">
    <h2>Business process &amp; industrial solutions</h2>
    <p>End-to-end BPO and operational support &mdash; supply-chain workflows on SAP, e-commerce and web builds, plus environmental and industrial systems (STP, ETP, chemical machinery, monitoring instrumentation). Clean processes, a healthier operation.</p>
    <ul class="tags">
      <li>BPO</li>
      <li>SAP / SCM</li>
      <li>E-commerce</li>
      <li>Web design</li>
      <li>STP / ETP</li>
      <li>Instrumentation</li>
    </ul>
  </div>
</article>

<article class="panel">
  <p class="pword" aria-hidden="true">Care</p>
  <div class="pbody">
    <h2>Healthcare support services</h2>
    <p>Accurate, compliant back-office support for healthcare providers &mdash; including US medical billing, claims preparation and revenue-cycle workflows, handled by a trained team with documented quality checks at every step.</p>
    <ul class="tags">
      <li>US medical billing</li>
      <li>Claims support</li>
      <li>Revenue cycle</li>
      <li>Compliance-aware QA</li>
    </ul>
  </div>
</article>
```

### 3.6 Extend contact form `<select name="service">`

```html
<select name="service">
  <option>Software Development</option>
  <option>Telecalling Services</option>
  <option>Data Entry &amp; Management</option>
  <option>Business Process &amp; Industrial Solutions</option>
  <option>Healthcare Support / US Medical Billing</option>
  <option>General Inquiry</option>
</select>
```

### 3.7 Reconcile address (pending client confirmation)

Current site shows **Parsodi / 440022**; PDF page 11 + WhatsApp flyer show **Kalamna Road, Kamptee / 441002**. Confirm with client, then update `.cinfo dl > div:last-child > dd > a` and the corresponding `maps.google.com` query.

### 3.8 Add `<link rel="canonical">` and `og:image` once domain is confirmed

```html
<link rel="canonical" href="https://wisdomtechnosoft.com/">
<meta property="og:image" content="https://wisdomtechnosoft.com/assets/og.png">
<meta property="og:url" content="https://wisdomtechnosoft.com/">
```

### 3.9 Add optional honeypot offset fix

In `styles.css` (§4.7), add `left:-9999px;top:0` to `.hp`.

---

## 4. `styles.css` changes

### 4.1 Widen pinned track for 5 panels

Replace:

```css
.services.is-pin{height:400svh}
```

With:

```css
.services.is-pin{height:520svh;overscroll-behavior:contain}
```

Replace:

```css
.is-pin .track{display:flex;flex:1 1 auto;min-height:0;width:300vw;will-change:transform}
```

With:

```css
@property --track {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}
.is-pin .track{
  display:flex;
  flex:1 1 auto;
  min-height:0;
  width:500vw;
  transform:translate3d(calc(var(--track) * -20%), 0, 0); /* −100% / 5 */
  will-change:transform;
}
```

`-20%` = `-100% / 5`. If panel count changes later, update this divisor.

### 4.2 Short-word panel `.pword` sizing

The new panel words `Scale` and `Care` are shorter than `Software` / `Conversations`. Add per-panel override:

```css
.is-pin .panel:nth-child(4) .pword,
.is-pin .panel:nth-child(5) .pword{font-size:clamp(7rem,26vw,28rem)}
```

### 4.3 Wire `--sp` to the orb ring stroke

Replace:

```css
.o-ring{fill:none;stroke:var(--ac,#C9A27E);stroke-width:1.2;stroke-dasharray:1.5 7;opacity:.7}
```

With:

```css
.o-ring{
  fill:none;
  stroke:var(--ac,#C9A27E);
  stroke-width:1.2;
  stroke-dasharray:calc(1.5px + var(--sp, 0) * 5px) 7px;
  opacity:.7;
}
```

This makes the `--sp` value actually visible (the chevron "spread" animates as the track progresses).

### 4.4 `content-visibility` for offscreen sections

Append:

```css
.approach, .strip, .team { content-visibility: auto; contain-intrinsic-size: 100svh; }
```

**Do not** apply to `#services` or `#vision` — both rely on sticky positioning that `content-visibility` breaks.

### 4.5 `.chap` legibility on tan backgrounds

Append:

```css
.chap{text-shadow:0 0 12px rgba(0,0,0,.45)}
```

### 4.6 WhatsApp button tap-target

Append:

```css
.wa{min-height:48px;padding:14px 22px}
```

### 4.7 Honeypot positioning

Replace:

```css
.hp{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
```

With:

```css
.hp{position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
```

### 4.8 Hide `.chap` / `.bar` on stub pages

Append:

```css
body:not(.has-orb) .chap{display:none}
body:not(.has-orb) .bar{display:none}
```

### 4.9 Form select custom chevron (fix Android light-closed control)

Append:

```css
.cform select{
  appearance:none;
  background-image:linear-gradient(45deg, transparent 50%, var(--ivory) 50%),
                   linear-gradient(135deg, var(--ivory) 50%, transparent 50%);
  background-position:calc(100% - 18px) calc(50% - 2px), calc(100% - 12px) calc(50% - 2px);
  background-size:6px 6px, 6px 6px;
  background-repeat:no-repeat;
  padding-right:40px;
}
```

### 4.10 Remove low-frequency `will-change`

Delete `will-change:transform` from:

- `.hl`
- `.pword`
- `.card`
- `.row`
- `.tr`

Keep only on:

- `.orb svg`
- `.track`
- `.vring`

### 4.11 Append stub-page styles

Append at the **very end** of `styles.css` (after `@media (prefers-reduced-motion)`):

```css
/* Static stub pages (privacy.html, 404.html) */
.stub{min-height:100svh;display:flex;flex-direction:column;padding:calc(var(--nav) + 4vh) 0 max(6vh,64px)}
.stub .w{flex:1 1 auto}
.stub-head{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:20px;padding-inline:var(--g);height:var(--nav);border-bottom:1px solid rgba(244,240,232,.14)}
.stub-head .brand{color:var(--ivory);mix-blend-mode:normal}
.stub-back{font-weight:500;text-underline-offset:6px;text-decoration:underline;color:var(--ivory);opacity:.85}
.stub-back:hover{color:var(--tan)}
.stub-main{padding-top:clamp(48px,9vw,120px);padding-bottom:clamp(48px,9vw,120px)}
.stub-main .big{max-width:16ch}
.stub-main p{max-width:60ch;opacity:.78;margin-top:clamp(18px,3vw,28px);font-size:clamp(1rem,1.3vw,1.125rem)}
.stub-main p + p{margin-top:14px}
.stub-main .lnk{margin-top:clamp(28px,4vw,44px);display:inline-block;color:var(--tan);text-underline-offset:6px}
.stub-main .lnk:hover{color:#dcb994}
.stub-h{font:700 clamp(1.25rem,2vw,1.5rem)/1.2 var(--disp);letter-spacing:-.02em;margin-top:clamp(36px,5vw,56px);max-width:50ch}
.stub-main ul{max-width:60ch;margin-top:16px;display:flex;flex-direction:column;gap:10px;opacity:.78}
.stub-main ul li{padding-left:22px;position:relative}
.stub-main ul li::before{content:"";position:absolute;left:0;top:.75em;width:8px;height:1px;background:var(--tan)}
.stub-main a{color:var(--tan);text-underline-offset:4px}
.stub-main a:hover{color:#dcb994}
.stub-nav{margin-top:clamp(32px,5vw,56px);font-size:13px;opacity:.6}
.stub-nav a{text-decoration:none}
.stub-nav a:hover{opacity:1}
```

---

## 5. `script.js` changes

### 5.1 Extend colour palette (3 → 5 stops)

Replace:

```js
var PC = ["#7FB0D0", "#D9B48F", "#8FD1B5"];
```

With:

```js
var PC = ["#7FB0D0", "#D9B48F", "#8FD1B5", "#C9A27E", "#A8C0D8"];
var PANEL_NAMES = ["Software", "Telecalling", "Data", "Business process", "Healthcare"];
```

### 5.2 Cache layout measurements in `measure()`

Replace the body of `measure()` with:

```js
var M = {};
function measure() {
  fitRing();
  H = window.innerHeight;
  var W = window.innerWidth;
  tops = els.map(function (e) { return e.getBoundingClientRect().top + window.scrollY; });

  if (cardBox) {
    M.cardsTop = cardBox.getBoundingClientRect().top + window.scrollY;
  }
  M.rowTops = rows.map(function (r) {
    return r.getBoundingClientRect().top + window.scrollY;
  });

  if (brandLogo) {
    var rect = brandLogo.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = (nav.classList.contains("hide") ? 36 : rect.top + rect.height / 2);
    header_x = ((cx - W / 2) / W) * 100;
    header_y = ((cy - H / 2) / H) * 100;
    var orbBase = Math.min(0.62 * Math.min(W, H), 640);
    var imgBaseHeight = orbBase * (162.5 / 300);
    header_s = rect.height / (imgBaseHeight || 1);
  }
}
```

### 5.3 Replace `getBoundingClientRect()` calls inside `update()`

**Cards:**

Replace:

```js
var R = cardBox.getBoundingClientRect();
cards.forEach(function (c, n) {
  var e = sm(clamp((H - (R.top + d) - n * H * 0.06) / (H * 0.5)));
  …
});
```

With:

```js
var Rtop = M.cardsTop - y;
cards.forEach(function (c, n) {
  var e = sm(clamp((H - Rtop - n * H * 0.06) / (H * 0.5)));
  …
});
```

**Rows:**

Replace:

```js
rows.forEach(function (r, n) {
  var rc = r.getBoundingClientRect();
  var e = sm(clamp((H * 0.95 - (rc.top + d)) / (H * 0.4)));
  …
});
```

With:

```js
rows.forEach(function (r, n) {
  var rcTop = M.rowTops[n] - y;
  var e = sm(clamp((H * 0.95 - rcTop) / (H * 0.4)));
  …
});
```

### 5.4 Frame-rate-independent lerp

In `tick()`, replace:

```js
cur = reduce.matches ? target : lerp(cur, target, 0.12);
```

With:

```js
var prevNow = performance.now();
function tick() {
  var now = performance.now();
  var dt = Math.min(64, now - prevNow);
  prevNow = now;
  var k = reduce.matches ? 1 : 1 - Math.exp(-dt / 90);
  cur = lerp(cur, target, k);
  if (Math.abs(target - cur) < 0.5) cur = target;
  update(cur, cur - prev);
  prev = cur;
  raf = cur !== target ? requestAnimationFrame(tick) : 0;
}
```

### 5.5 Replace track transform string with CSS custom property

In `update()`, inside `if (pinOn)`, replace:

```js
track.style.transform = "translate3d(" + (-f / panels.length * 100).toFixed(3) + "%,0,0)";
```

With:

```js
track.style.setProperty("--track", f.toFixed(3));
```

(Requires `@property --track` from §4.1 and the `translate3d(calc(var(--track) * -20%), …)` track rule.)

### 5.6 Fix `lastT` and nav debounce

Replace:

```js
var dy = target - lastT;
if (Math.abs(dy) > 1) { nav.classList.toggle("hide", y > 320 && dy > 0); lastT = target; }
```

With:

```js
var dy = target - lastT;
lastT = target;
if (Math.abs(dy) > 1) handleNav(dy);
```

Add near the top of the IIFE:

```js
var navTimer;
function handleNav(dy) {
  if (dy > 1 && window.scrollY > 320) {
    nav.classList.add("hide");
    clearTimeout(navTimer);
    navTimer = setTimeout(function () { nav.classList.remove("hide"); }, 600);
  } else if (dy < -1) {
    nav.classList.remove("hide");
    clearTimeout(navTimer);
  }
}
```

### 5.7 Throttle `resize` with `requestAnimationFrame`

Replace:

```js
window.addEventListener("resize", function () { setMode(); });
```

With:

```js
var resizeRaf = 0;
window.addEventListener("resize", function () {
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(function () { resizeRaf = 0; setMode(); });
}, { passive: true });
```

### 5.8 Per-panel chapter label while pinned

Inside `update()`, within `if (i === 1 && pinOn)`, after the existing `sa` assignment:

```js
if (i === 1 && pinOn) {
  var ci = Math.min(Math.floor(f), PC.length - 2);
  ca = mix(PC[ci], PC[ci + 1], f - ci);
  sa = 0.6 + p * 1.4;

  var pi = Math.round(clamp(f, 0, panels.length - 1));
  if (PANEL_NAMES[pi] !== lastChap) {
    lastChap = PANEL_NAMES[pi];
    chap.textContent = lastChap;
  }
}
```

Then guard the generic chapter-label write so it doesn't immediately overwrite the per-panel label:

Replace:

```js
if (S[activeChapter].n !== lastChap) { lastChap = S[activeChapter].n; chap.textContent = lastChap; }
```

With:

```js
if (activeChapter !== 1) {
  if (S[activeChapter].n !== lastChap) {
    lastChap = S[activeChapter].n;
    chap.textContent = lastChap;
  }
}
```

### 5.9 Hide chapter label at top of page

Before the `if (y <= introDist)` branch, add:

```js
chap.style.opacity = y > introDist ? 1 : 0;
```

### 5.10 `scrollRestoration` manual

At the top of the IIFE, after `"use strict";`:

```js
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
```

### 5.11 Re-measure on visibility return

After `document.fonts.ready` handling, add:

```js
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) { measure(); update(cur, 0); }
});
```

### 5.12 Clear status text on form submit

Already in `polish.patch`, keep:

```js
send.disabled = true; send.textContent = "Sending…"; status.className = "status"; status.textContent = "";
```

### 5.13 Soften success message (unconfirmed claim)

Replace:

```js
status.textContent = "Thank you. We will reply within 1 business day.";
```

With (until client confirms the SLA):

```js
status.textContent = "Thank you. We will be in touch shortly.";
```

Revert to the 1-business-day wording once the client signs off on the promise.

---

## 6. New: `privacy.html`

```html
<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Privacy notice — Wisdom Technosoft</title>
<meta name="description" content="How Wisdom Technosoft handles the details you share through this website — and what we do not collect.">
<meta name="robots" content="noindex,follow">
<meta name="theme-color" content="#04222B">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="512x512" href="assets/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body class="stub">

<a class="skip" href="#main">Skip to content</a>

<header class="stub-head">
  <a class="brand" href="index.html" aria-label="Wisdom Technosoft home">
    <img src="assets/logo-mark-light.png" alt="" class="brand-logo" width="42" height="34">
    <span>Wisdom Technosoft</span>
  </a>
  <a class="stub-back" href="index.html">Back to site</a>
</header>

<main id="main" tabindex="-1" class="stub-main">
  <div class="w">
    <p class="eyebrow">Privacy</p>
    <h1 class="big">Privacy notice.</h1>

    <p>Wisdom Technosoft (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This notice explains what happens to the information you share through <strong>wisdomtechnosoft.com</strong> and our contact form. It does not cover how we handle client project data once an engagement begins &mdash; that is governed by the specific agreement between us and the client.</p>

    <h2 class="stub-h">What we collect</h2>
    <ul>
      <li><strong>Contact form:</strong> your name, email address, optional phone number, chosen service and your message. These are used only to respond to your inquiry.</li>
      <li><strong>Email and phone:</strong> if you write to <a href="mailto:wisdomtechnosoft04@gmail.com">wisdomtechnosoft04@gmail.com</a> or call <a href="tel:+917447331127">+91 74473 31127</a>, your message and reply history are retained for correspondence.</li>
      <li><strong>Server logs:</strong> like most websites, our hosting provider records standard request data (IP address, timestamp, requested URL, user-agent) for security and reliability. These are not used for advertising or analytics.</li>
    </ul>

    <h2 class="stub-h">What we do not do</h2>
    <ul>
      <li>No advertising or tracking cookies.</li>
      <li>No third-party analytics scripts (Google Analytics, Meta Pixel, etc.).</li>
      <li>No selling, renting or sharing of your information with third parties for marketing.</li>
      <li>No automated decision-making based on your inquiry.</li>
    </ul>

    <h2 class="stub-h">How long we keep it</h2>
    <p>Contact-form submissions and correspondence are kept for as long as needed to respond to your inquiry and, if a project begins, for the duration of that project and any statutory record-keeping requirement. You may ask us to delete your inquiry at any time.</p>

    <h2 class="stub-h">Your choices</h2>
    <p>You can ask us to access, correct or delete the information you have sent us by writing to <a href="mailto:wisdomtechnosoft04@gmail.com">wisdomtechnosoft04@gmail.com</a>. We will respond within a reasonable time and no later than 30 days.</p>

    <h2 class="stub-h">Security</h2>
    <p>The website is served over HTTPS. We apply reasonable technical and organisational measures to protect information against loss, misuse and unauthorised access. No transmission over the internet is completely secure, and we cannot guarantee absolute security.</p>

    <h2 class="stub-h">Changes</h2>
    <p>If this notice changes in a way that affects how we handle your information, we will update the date below and, where appropriate, notify you.</p>

    <p class="stub-nav">Last updated: <time datetime="2026-10-25">25 October 2026</time> &middot; Wisdom Technosoft, Nagpur, Maharashtra, India &middot; <a href="index.html">Back to site</a></p>
  </div>
</main>
</body>
</html>
```

---

## 7. New: `404.html`

```html
<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found — Wisdom Technosoft</title>
<meta name="description" content="That page is not here. Head back to the Wisdom Technosoft home page, or get in touch.">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#04222B">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="512x512" href="assets/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body class="stub">

<a class="skip" href="#main">Skip to content</a>

<header class="stub-head">
  <a class="brand" href="index.html" aria-label="Wisdom Technosoft home">
    <img src="assets/logo-mark-light.png" alt="" class="brand-logo" width="42" height="34">
    <span>Wisdom Technosoft</span>
  </a>
  <a class="stub-back" href="index.html">Back to site</a>
</header>

<main id="main" tabindex="-1" class="stub-main">
  <div class="w">
    <p class="eyebrow">404</p>
    <h1 class="big">That page isn&rsquo;t here.</h1>
    <p>The link may be old, or the address may have a typo. The rest of the site is where you left it.</p>

    <p><a class="lnk" href="index.html">Go to the home page</a></p>

    <h2 class="stub-h">Quick links</h2>
    <ul>
      <li><a href="index.html#services">What we do</a> &mdash; software, telecalling, data, business process &amp; industrial, healthcare support</li>
      <li><a href="index.html#approach">How we deliver</a></li>
      <li><a href="index.html#vision">Our vision &amp; mission</a></li>
      <li><a href="index.html#team">Our team</a></li>
      <li><a href="index.html#contact">Get in touch</a></li>
    </ul>

    <p class="stub-nav">Wisdom Technosoft, Nagpur, Maharashtra, India &middot; <a href="mailto:wisdomtechnosoft04@gmail.com">wisdomtechnosoft04@gmail.com</a> &middot; <a href="tel:+917447331127">+91 74473 31127</a></p>
  </div>
</main>
</body>
</html>
```

---

## 8. New: `_headers` / `_redirects` (Cloudflare Pages)

Cloudflare Pages auto-serves `404.html` for any unmatched path — no `_redirects` entry needed. Optional `_headers` at project root:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/privacy.html
  X-Robots-Tag: noindex, follow

/404.html
  X-Robots-Tag: noindex, nofollow
```

`_redirects` — leave empty for now. Add when renaming pages.

---

## 9. `README.md` updates

Under **"What moves on scroll"**, replace the services bullet:

```markdown
- Services: pinned horizontal scroll across **5 panels** (Software, Telecalling, Data, Business Process & Industrial, Healthcare). Stacks vertically on mobile / reduced motion.
```

Under **"Deploying with the existing project"**, add:

```markdown
- `privacy.html` and `404.html` are static stubs that reuse `styles.css` — no JS, no orb. Both are `noindex`. The 404 is auto-served by Cloudflare Pages from the project root.
- Add `class="has-orb"` to `<body>` in `index.html` so the fixed `.chap` / `.bar` stay hidden on the stub pages (see `styles.css` `body:not(.has-orb)` rule).
```

Under **"Needs client input before launch"**, replace the entire list with:

```markdown
- Team: replace the role rows with real names, roles and photos.
- Confirm copy claims: multilingual calling, "small, senior team", documented checks at every step.
- Confirm the Business Process & Industrial claims (SAP/SCM, STP, ETP, chemical machinery, instrumentation).
- Confirm Healthcare Support claims — specifically **US medical billing** — scope, compliance posture (HIPAA awareness), and whether it's a live service or roadmap.
- **Address mismatch:** site shows Parsodi / 440022; PDF + WhatsApp flyer show Kalamna Road, Kamptee / 441002. Pick one and update `index.html` + Maps link.
- Business email is a Gmail address; a domain email reads more credible.
- Add `assets/` (logos, favicons, social image) and `functions/api/contact.js`.
- Once the domain is known: add `<link rel="canonical">`, `og:image`, `og:url`, and an `og.png` (1200×630).
```

Strike this item (now done):

```markdown
- ~~Add `privacy.html`, `404.html`, …~~
```

---

## 10. Smoothness pass (the full list)

These are the interventions that produce the "super smooth and fluid" feel. Each is applied in §4/§5; the summary here is the *why*.

| # | Change | Effect |
|---|---|---|
| 1 | Cache every `getBoundingClientRect` in `measure()` | Eliminates layout thrash; `update()` becomes layout-read-free |
| 2 | rAF-throttle `resize` | Resize no longer fires hundreds of re-measures per second on mobile |
| 3 | Frame-rate-independent lerp (`1 - exp(-dt/90)`) | Identical scroll inertia at 60 Hz and 120 Hz |
| 4 | `@property --track` + CSS `translate3d(calc(...))` | Pinned track transform moves to compositor thread; no per-frame string rebuild |
| 5 | `content-visibility: auto` on `.approach`, `.strip`, `.team` | Off-screen sections skip layout; scroll frame budget freed |
| 6 | Remove `will-change` from low-frequency elements | Fewer GPU layers → less memory pressure on mobile Safari |
| 7 | Fixed `lastT` + debounced nav hide/unhide | Nav no longer sticks hidden after scroll pauses |
| 8 | `overscroll-behavior: contain` on pinned section | Prevents iOS rubber-band from visually breaking the pin |
| 9 | `scrollRestoration = manual` | Page reload doesn't animate-in from the old scroll position |
| 10 | `visibilitychange` re-measure | Returning from a background tab recalculates `tops` before the first frame |
| 11 | `--sp` wired to `.o-ring` stroke-dasharray | The per-frame `--sp` write (already happening) now produces a visible, compositor-friendly chevron spread |
| 12 | Guarded generic `#chap` write (`activeChapter !== 1`) | Per-panel labels not overwritten by the section label |
| 13 | `--ac` colour computed once per frame via `mix()` | Already batched; no change needed but verified |

Verification: Chrome DevTools → Performance → record a scroll from hero to contact. Target frame times: **< 8 ms per frame** at 60 Hz (i.e. comfortably 120 fps headroom). Before the pass, expect 18–25 ms frames around panel transitions.

---

## 11. Order of work

Ship incrementally. Each step is independently shippable and reversible.

1. **Services 3 → 5** (`index.html` §3.2–3.6, `styles.css` §4.1–4.2, `script.js` §5.1). Test on 1440 / 1024 / 390 / reduced-motion. Low risk.
2. **Smoothness pass** (`script.js` §5.2–5.10, `styles.css` §4.3–4.10). Verify with DevTools Performance.
3. **Per-panel chapter label + form label softening** (`script.js` §5.8–5.9, §5.13).
4. **Stubs** (`privacy.html` §6, `404.html` §7, `styles.css` §4.11, `index.html` §3.1). Deploy to a preview branch and `curl -I` the 404.
5. **Headers** (`_headers` §8). Apply after stubs are live.
6. **Reconcile address + copy** (§3.7) once client confirms.
7. **README** (§9) — keep in sync with each step.

---

## 12. QA checklist

### Services (all 5 panels)

- [ ] 1440×900: track sweeps 5 panels cleanly; dots light 1→2→3→4→5; `#chap` morphs Software → Telecalling → Data → Business process → Healthcare.
- [ ] Orb colour passes through 5 palette stops (blue → sand → mint → tan → slate).
- [ ] 1024×768: track still pins (`min-width:900px` breakpoint), no horizontal scrollbar.
- [ ] 390×844: `.is-pin` off, panels stack vertically; dots hidden; `#chap` reads "What we do".
- [ ] Reduced motion on: same as mobile — no pin, no track transform, no per-panel morph.

### Smoothness

- [ ] DevTools Performance: scroll hero→contact on a mid-range device profile. Frame times < 8 ms.
- [ ] No `Layout` entries inside `update()` in the flame chart (only `Recalculate Style` + `Paint` where expected).
- [ ] Nav hides on scroll down, re-shows after 600 ms pause.

### Contact form

- [ ] Submit with each of the 5 service options; verify JSON payload carries correct `service` string to `/api/contact`.
- [ ] Honeypot `website_url` fill → silent success, no network request.
- [ ] Network failure → inline error shows mailto + tel fallbacks.

### Stubs

- [ ] `/privacy.html` direct URL: brand mark renders, "Back to site" works, fonts load, no horizontal scroll at 390 px.
- [ ] `/404.html` via `curl -I https://…/nope | head -1` → `HTTP/2 404`.
- [ ] No orb, no bar, no "Welcome" label on either stub.
- [ ] From `404.html` → "What we do" → lands on `index.html#services` at panel 1.
- [ ] From `404.html` → "Get in touch" → lands on `#contact` with form visible.
- [ ] Lighthouse accessibility on `/privacy.html` → 100.

### Headers

- [ ] `curl -I https://…/privacy.html | grep -i x-robots-tag` → `noindex, follow`.
- [ ] `curl -I https://…/` → `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

### Content

- [ ] Address matches what the client confirmed (§3.7).
- [ ] Form success message reverted to 1-business-day *only if* client signs off (§5.13).
- [ ] Team section either has real names + photos, or a clear "coming soon" treatment.

---

## 13. Open items requiring client input

Block launch:

- [ ] **Address reconciliation** — Parsodi / 440022 vs Kalamna Road, Kamptee / 441002.
- [ ] **Healthcare Support scope** — confirm US medical billing is a live service or roadmap; confirm HIPAA-awareness posture in copy.
- [ ] **Business Process & Industrial scope** — confirm SAP/SCM, STP, ETP, chemical machinery, instrumentation are all live service lines.
- [ ] **Team** — real names, roles, photos.
- [ ] **"1 business day" reply SLA** — confirm or remove.

Non-blocking but recommended:

- [ ] Domain email to replace `wisdomtechnosoft04@gmail.com`.
- [ ] `assets/og.png` (1200×630) and domain-locked `<link rel="canonical">` + `og:image` + `og:url`.
- [ ] Copy claim: "multilingual calling" — confirm languages supported.
- [ ] Copy claim: "documented checks at every step" — confirm QA process exists.
