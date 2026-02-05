# viewport-truth

> Fastest way to measure the real visible mobile viewport without 100vh glitches, resize/scroll jitter, or keyboard hacks.

[![npm version](https://img.shields.io/npm/v/viewport-truth.svg?style=flat-square)](https://www.npmjs.com/package/viewport-truth)
[![npm downloads](https://img.shields.io/npm/dm/viewport-truth.svg?style=flat-square)](https://www.npmjs.com/package/viewport-truth)
[![license](https://img.shields.io/npm/l/viewport-truth.svg?style=flat-square)](https://github.com/AntonVoronezh/viewport-truth/blob/main/LICENSE)
[![tests](https://img.shields.io/github/actions/workflow/status/AntonVoronezh/viewport-truth/ci.yml?branch=main&style=flat-square&label=tests)](https://github.com/AntonVoronezh/viewport-truth/actions/workflows/ci.yml)
[![Boosty](https://img.shields.io/badge/Support-Boosty-orange?style=flat-square&logo=boosty)](https://boosty.to/antonvoronezh/donate)
[![Crypto](https://img.shields.io/badge/Donate-Crypto-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/AntonVoronezhh/4)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/viewport-truth?style=flat-square)](https://bundlephobia.com/package/viewport-truth)

```bash
npm i viewport-truth
# or: yarn add viewport-truth
# or: pnpm add viewport-truth
```


Stop guessing mobile viewport sizes. viewport-truth delivers stable, keyboard-aware visible viewport metrics (VisualViewport-first) across iOS Safari, Android Chrome, PWAs, and webviews—framework adapters included, SSR-safe, zero runtime deps.
### Quick Start
Minimal flow: import → create → subscribe → get { width, height, isKeyboardOpen, isStable }.

```js
import { createViewportTruth } from "viewport-truth/vanilla";

const vt = createViewportTruth();

const unsub = vt.subscribe((v) => {
    if (!v) return;

    console.log(
        `visible=${v.width}x${v.height} keyboard=${v.isKeyboardOpen} stable=${v.isStable}`
    );
});

// later:
// unsub();
// vt.destroy();
```

## Quick Start test (clean environment)

This verifies the Quick Start code runs end-to-end in a fresh project.

```bash
mkdir vt-smoke && cd vt-smoke
npm init -y
npm i viewport-truth vite
npm pkg set type=module
```
Create index.html:

```html
<!doctype html>
<html>
  <body>
    <pre id="out">loading…</pre>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

Create main.js:

```js
import { createViewportTruth } from "viewport-truth/vanilla";

const out = document.getElementById("out");
const vt = createViewportTruth();

vt.subscribe((v) => {
  out.textContent = JSON.stringify(v, null, 2);
});
```

Run:

```bash
npx vite
```

Open the URL on mobile (or device emulator) and focus an input to see `isKeyboardOpen` change.

## Wow example (keyboard eats UI… and you can see it)

A tiny bottom bar that stays visible and shows exactly how much viewport you lost.

> Run it in a real page (Vite/Parcel/Next) — the snippet won’t execute inside README.  
> On mobile: scroll a bit (URL bar), then focus the input (keyboard).

```html
<div id="app" style="padding:16px 16px 96px">
  <input
    placeholder="Focus me to open keyboard"
    style="width:100%;padding:12px;font-size:16px;box-sizing:border-box"
  />
  <p style="margin:12px 0 0;color:#444">
    Tip: scroll a bit (URL bar animates), then focus the input.
  </p>

  <div style="height:120vh"></div>
  <div id="bar"></div>
</div>

<script type="module">
  import { createViewportTruth } from "viewport-truth/vanilla";

  const bar = document.getElementById("bar");
  Object.assign(bar.style, {
    position: "fixed",
    left: "0",
    right: "0",
    bottom: "0",
    padding: "10px 12px",
    font: "12px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    background: "rgba(0,0,0,.86)",
    color: "white",
    zIndex: "9999",
    whiteSpace: "pre",
  });

  const vt = createViewportTruth();

  vt.subscribe((v) => {
    if (!v) return;

    // Fallback keeps the snippet working even if layoutWidth/layoutHeight aren't present.
    const layoutW = v.layoutWidth ?? v.width;
    const layoutH = v.layoutHeight ?? v.height;

    const lost = Math.max(0, layoutH - v.height);

    bar.textContent =
`visible:  ${v.width}×${v.height}
layout:   ${layoutW}×${layoutH}
lost:     ${lost}px
keyboard: ${v.isKeyboardOpen}
stable:   ${v.isStable}`;
  });
</script>
```

## Features

A few concrete, technical reasons it behaves well on mobile:

- **Tiny:** ~< 2 KB min+gzip (check the Bundlephobia badge).
- **Fast updates:** emits at most **1 update per animation frame** (rAF throttling).
- **Zero runtime deps:** **0 dependencies** at runtime (tree-shakeable ESM).
- **Stable signal:** `isStable` flips after **150ms** (default) without geometry changes.

---

## API (snapshot)

Core snapshot fields you’ll typically use:

- `width`, `height` — visible viewport size (CSS px)
- `layoutWidth`, `layoutHeight` — layout viewport (basis for keyboard detection)
- `isKeyboardOpen` — geometry-based keyboard inference
- `isStable` — “animations settled” signal for UI decisions

Framework adapters:

- **React:** `useViewportTruth` from `viewport-truth/react`
- **Vue:** `useViewportTruth` from `viewport-truth/vue`
- **Svelte:** `viewportTruth` from `viewport-truth/svelte`
- **Solid:** `createViewportTruth` from `viewport-truth/solid`
- **Angular:** `ViewportTruthDirective` from `viewport-truth/angular`

Docs: [React](https://github.com/AntonVoronezh/viewport-truth/blob/main/docs/react.md) •
[Vue](https://github.com/AntonVoronezh/viewport-truth/blob/main/docs/vue.md) •
[Svelte](https://github.com/AntonVoronezh/viewport-truth/blob/main/docs/svelte.md) •
[Solid](https://github.com/AntonVoronezh/viewport-truth/blob/main/docs/solid.md) •
[Angular](https://github.com/AntonVoronezh/viewport-truth/blob/main/docs/angular.md)
> **Tip:** Open links in a new tab with **Ctrl+Click** (Windows/Linux) or **Cmd+Click** (macOS).

## Support the project 

> “We ate the Geometry Hell for you: jumping `100vh`, jittery `resize`, modals under the keyboard.  
> You saved hours (and sanity). A donation is a fair trade for a rock-solid UI and weekends free from debugging.”

If this library saved you time, please consider supporting the development:

1. **Fiat (Cards/PayPal):** via **[Boosty](https://boosty.to/antonvoronezh/donate)** (one-time or monthly).
2. **Crypto (USDT/TON/BTC/ETH):** view wallet addresses on **[Telegram](https://t.me/AntonVoronezhh/4)**.

[![Support on Boosty](https://img.shields.io/badge/Support_on-Boosty-orange?style=for-the-badge&logo=boosty)](https://boosty.to/antonvoronezh/donate)
[![Crypto via Telegram](https://img.shields.io/badge/Crypto_via-Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/AntonVoronezhh/4)

## License
MIT
