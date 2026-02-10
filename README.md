# viewport-truth

> Fastest way to measure the real visible mobile viewport without 100vh glitches, resize/scroll jitter, or keyboard hacks.

[![npm version](https://img.shields.io/npm/v/viewport-truth.svg?style=flat-square)](https://www.npmjs.com/package/viewport-truth)
[![npm downloads](https://img.shields.io/npm/dm/viewport-truth.svg?style=flat-square)](https://www.npmjs.com/package/viewport-truth)
[![license](https://img.shields.io/npm/l/viewport-truth.svg?style=flat-square)](https://github.com/AntonVoronezh/viewport-truth/blob/main/LICENSE)
[![tests](https://img.shields.io/github/actions/workflow/status/AntonVoronezh/viewport-truth/ci.yml?branch=main&style=flat-square&label=tests)](https://github.com/AntonVoronezh/viewport-truth/actions/workflows/ci.yml)
[![Boosty](https://img.shields.io/badge/Support-Boosty-orange?style=flat-square&logo=boosty)](https://boosty.to/antonvoronezh/donate)
[![Crypto](https://img.shields.io/badge/Donate-Crypto-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/AntonVoronezhh/4)

Stop guessing mobile viewport sizes. viewport-truth delivers stable, keyboard-aware visible viewport metrics (VisualViewport-first) across iOS Safari, Android Chrome, PWAs, and webviews—framework adapters included, SSR-safe, zero runtime deps.

<p align="center">
  <img src="./assets/demo.min..gif" width="900" alt="Demo: stable visible viewport when keyboard opens">
</p>

*Demo: tracks the **visible** viewport (VisualViewport), keeping UI stable when the URL bar / keyboard changes the viewport.*


```bash
npm i viewport-truth
# or: yarn add viewport-truth
# or: pnpm add viewport-truth
```


## Quick Start
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

## Demo snippet (keyboard + URL bar)
Use this in a real page (Vite/Parcel/Next). On mobile: scroll a bit (URL bar), then focus the input (keyboard).

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

## API (short)

Core snapshot fields you’ll typically use:

- `width`, `height` — visible viewport size (CSS px)
- `layoutWidth`, `layoutHeight` — layout viewport (basis for keyboard detection)
- `isKeyboardOpen` — geometry-based keyboard inference
- `isStable` — “animations settled” signal for UI decisions

Vanilla store:

- `createViewportTruth()` from `viewport-truth/vanilla` → creates a store with `subscribe()` and `destroy()`

Framework adapters:

- **React:** `useViewportTruth` from `viewport-truth/react`
- **Vue:** `useViewportTruth` from `viewport-truth/vue`
- **Svelte:** `viewportTruth` from `viewport-truth/svelte`
- **Solid:** `createViewportTruth` from `viewport-truth/solid`
- **Angular:** `ViewportTruthDirective` from `viewport-truth/angular`

Full types and signatures: see `dist/*.d.ts` (or TypeScript IntelliSense).  

Adapter Docs: [React](https://antonvoronezh.github.io/viewport-truth/react) •
[Vue](https://antonvoronezh.github.io/viewport-truth/vue) •
[Svelte](https://antonvoronezh.github.io/viewport-truth/svelte) •
[Solid](https://antonvoronezh.github.io/viewport-truth/solid) •
[Angular](https://antonvoronezh.github.io/viewport-truth/angular)
> **Tip:** Open links in a new tab with **Ctrl+Click** (Windows/Linux) or **Cmd+Click** (macOS).

### Links
[FAQ](https://antonvoronezh.github.io/viewport-truth/faq) •
[Common pitfalls](https://antonvoronezh.github.io/viewport-truth/common-pitfalls) •
[Smoke test (clean environment)](https://antonvoronezh.github.io/viewport-truth/smoke-test) •
[Versioning policy](https://github.com/AntonVoronezh/viewport-truth/blob/main/SEMVER_POLICY.md)

## Support the project 

> “We ate the Geometry Hell for you: jumping `100vh`, jittery `resize`, modals under the keyboard.  
> You saved hours (and sanity). A donation is a fair trade for a rock-solid UI and weekends free from debugging.”

If this library saved you time, please consider supporting the development:

1. **Fiat (Cards/PayPal):** via **[Boosty](https://boosty.to/antonvoronezh/donate)** (one-time or monthly).
2. **Crypto (USDT/BTC/ETH):** view wallet addresses on **[Telegram](https://t.me/AntonVoronezhh/4)**.

[![Support on Boosty](https://img.shields.io/badge/Support_on-Boosty-orange?style=for-the-badge&logo=boosty)](https://boosty.to/antonvoronezh/donate)
[![Crypto via Telegram](https://img.shields.io/badge/Crypto_via-Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/AntonVoronezhh/4)

## License
MIT
