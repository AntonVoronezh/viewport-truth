# viewport-truth 🏆

[![npm version](https://img.shields.io/npm/v/viewport-truth.svg?style=flat-square)](https://www.npmjs.com/package/viewport-truth)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/viewport-truth?style=flat-square)](https://bundlephobia.com/package/viewport-truth)
[![license](https://img.shields.io/npm/l/viewport-truth?style=flat-square)](https://github.com/your-org/viewport-truth/blob/main/LICENSE)
[![Boosty](https://img.shields.io/badge/Support-Boosty-orange?style=flat-square&logo=boosty)](https://boosty.to/antonvoronezh/donate)
[![Crypto](https://img.shields.io/badge/Donate-Crypto-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/AntonVoronezhh/4)

> **Zero-config, tiny “real viewport” store.**  
> Always returns the *visible* viewport size in **CSS px** (VisualViewport-first) and tells you when the **virtual keyboard** actually ate your UI.

---

## Why? 🤔

Mobile viewport is Geometry Hell. You write `100vh` and expect “screen height”. The browser replies: “adorable.”

You don’t want to:

- ❌ Build “fullscreen” layouts that jump on iOS Safari when the URL bar expands/collapses.
- ❌ Ship modals / sticky footers that slide under the virtual keyboard.
- ❌ Depend on `resize` events that jitter on scroll and lie across mobile browsers.
- ❌ Maintain hacks with `focusin/focusout`, timeouts, and fragile heuristics.

**viewport-truth** solves it by using the **Visual Viewport API** as the primary source of truth, stabilizing updates, and providing `isKeyboardOpen` based on geometry—without DOM polling.

- **Universal:** React, Vue, Svelte, Solid, Angular, Vanilla.
- **Tiny:** tree-shakeable, zero runtime deps.
- **Performant:** rAF throttling, microtask coalescing, idle stability work.

---

## Installation 📦

```bash
npm install viewport-truth
# or
yarn add viewport-truth
# or
pnpm add viewport-truth
```

## Usage 🚀

### React

Use the `useViewportTruth` hook.

```tsx
import { useViewportTruth } from "viewport-truth/react";

export function DebugViewport() {
    const v = useViewportTruth();

    if (!v) return null; // SSR-safe

    return (
        <div style={{ padding: 12, border: "1px solid #ddd" }}>
            <div>Visible: {v.width} × {v.height} (CSS px)</div>
            <div>Keyboard: {String(v.isKeyboardOpen)} · Stable: {String(v.isStable)}</div>
        </div>
    );
}

```

### Vue 3

Use the `useViewportTruth` composable.

```html
<script setup lang="ts">
    import { computed } from "vue";
    import { useViewportTruth } from "viewport-truth/vue";

    const v = useViewportTruth();
    const label = computed(() =>
            v.value
                    ? `Visible: ${v.value.width}×${v.value.height} · Keyboard: ${v.value.isKeyboardOpen}`
                    : "SSR…"
    );
</script>

<template>
    <div style="padding: 12px; border: 1px solid #ddd;">
        {{ label }}
    </div>
</template>


```

### Svelte

Use the `viewportTruth` store-like helper.

```svelte
<script lang="ts">
  import { viewportTruth } from "viewport-truth/svelte";
  const v = viewportTruth();
</script>

<div style="padding:12px;border:1px solid #ddd">
  {#if $v}
    <div>Visible: {$v.width}×{$v.height}</div>
    <div>Keyboard: {$v.isKeyboardOpen} · Stable: {$v.isStable}</div>
  {/if}
</div>

```

### SolidJS

Use the `createViewportTruth` primitive.

```tsx
iimport { createViewportTruth } from "viewport-truth/solid";

export function DebugViewport() {
    const v = createViewportTruth();

    return (
        <div style={{ padding: "12px", border: "1px solid #ddd" }}>
            {v() ? (
                <>
                    <div>Visible: {v()!.width}×{v()!.height}</div>
                    <div>Keyboard: {String(v()!.isKeyboardOpen)} · Stable: {String(v()!.isStable)}</div>
                </>
            ) : null}
        </div>
    );
}
```

### Angular (17+)

Use the standalone `ViewportTruthDirective`.

```typescript
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ViewportTruthDirective } from "viewport-truth/angular";

@Component({
    selector: "app-viewport-debug",
    standalone: true,
    imports: [CommonModule, ViewportTruthDirective],
    template: `
    <div viewportTruth #vt="viewportTruth" style="padding:12px;border:1px solid #ddd;">
      <ng-container *ngIf="vt.vt()() as v">
        <div>Visible: {{ v.width }}×{{ v.height }}</div>
        <div>Keyboard: {{ v.isKeyboardOpen }} · Stable: {{ v.isStable }}</div>
      </ng-container>
    </div>
  `,
})
export class ViewportDebugComponent {}

```

### Vanilla JS

```js
import { createViewportTruth } from "viewport-truth/vanilla";

const el = document.getElementById("debug");

const vt = createViewportTruth();
const unsub = vt.subscribe((v) => {
    el.textContent = `Visible: ${v.width}×${v.height} | Keyboard: ${v.isKeyboardOpen} | Stable: ${v.isStable}`;
});

// Later:
// unsub();
// vt.destroy();

```

---

## Configuration ⚙️

You can tune stability and keyboard detection without changing your app code.

```ts
// React
useViewportTruth({
  stableDelayMs: 150,
  keyboardRatio: 0.75,
  keyboardMinDeltaPx: 120,
});

// Vanilla
createViewportTruth({
  trustVisualViewportUnderZoom: true,
  minViewportPx: 1,
});

```

| Option | Type | Default | Description |
|---|---|---:|---|
| `stableDelayMs` | `number` | `150` | `isStable` becomes `true` after this many ms without changes (end of URL bar/keyboard animation). |
| `keyboardRatio` | `number` | `0.75` | If `visibleHeight < layoutHeight * keyboardRatio`, keyboard is likely open. |
| `keyboardMinDeltaPx` | `number` | `120` | Minimum height loss (px) required to mark keyboard as open (prevents false positives). |
| `minViewportPx` | `number` | `1` | Clamps transient `0` / broken values during rotations and browser quirks. |
| `trustVisualViewportUnderZoom` | `boolean` | `true` | Keep using `visualViewport` even when pinch-zoom is active (`scale !== 1`). |
| `safeAreaInsets` | `{ top?: number; right?: number; bottom?: number; left?: number }` | `{}` | Optional safe-area compensation (core does not read CSS `env()` automatically). |


## How it works 🛠️

The API looks simple, but it’s doing a few careful things to stay *correct* on mobile.

- **VisualViewport-first:** If `window.visualViewport` exists, we treat it as the source of truth for the **visible** viewport.
    - We listen to `visualViewport.resize` **and** `visualViewport.scroll` (mobile browsers change viewport without a classic `window.resize`).
- **Fallback path:** If Visual Viewport API is unavailable, we fall back to `window.innerWidth/innerHeight`.
- **Coalesced updates:** Multiple events in a burst are merged into a single update (no “event spam”).
- **Frame throttling:** Updates are emitted **at most once per animation frame** (via `requestAnimationFrame`) to reduce layout thrash.
- **Stability flag:** `isStable` turns `true` only after `stableDelayMs` with no changes (useful during URL bar / keyboard animations).
- **Keyboard detection (geometry-based):** We infer `isKeyboardOpen` by comparing **visible** vs **layout** viewport:
    - `visibleHeight < layoutHeight * keyboardRatio` and
    - `(layoutHeight - visibleHeight) >= keyboardMinDeltaPx`
- **SSR-safe:** On the server, it returns `null` and attaches listeners only in the browser.
- **No DOM polling:** Core doesn’t query your layout or mutate styles; it only reads viewport metrics and emits snapshots.

## Support the project ❤️

> “We ate the Geometry Hell for you: jumping `100vh`, jittery `resize`, modals under the keyboard.  
> You saved hours (and sanity). A donation is a fair trade for a rock-solid UI and weekends free from debugging.”

If this library saved you time, please consider supporting the development:

1.  **Fiat (Cards/PayPal):** via **[Boosty](https://boosty.to/antonvoronezh/donate)** (one-time or monthly).
2.  **Crypto (USDT/TON/BTC/ETH):** view wallet addresses on **[Telegram](https://t.me/AntonVoronezhh/4)**.

<div style="display: flex; gap: 10px;">
  <a href="https://boosty.to/antonvoronezh/donate">
    <img src="https://img.shields.io/badge/Support_on-Boosty-orange?style=for-the-badge&logo=boosty" alt="Support on Boosty">
  </a>
  <a href="https://t.me/AntonVoronezhh/4">
    <img src="https://img.shields.io/badge/Crypto_via-Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Crypto via Telegram">
  </a>
</div>

## License

MIT

## Keywords
`viewport`, `visualViewport`, `mobile viewport`, `iOS Safari`, `Android Chrome`, `100vh`, `dvh`, `svh`, `lvh`, `safe-area-inset`, `on-screen keyboard`, `virtual keyboard`, `resize`, `scroll`, `URL bar`, `address bar`, `layout viewport`, `visual viewport`, `responsive UI`, `modals`, `bottom sheet`, `fullscreen`, `PWA`, `SSR`, `requestAnimationFrame`, `debounce`, `throttling`, `webview`, `Capacitor`, `Cordova`, `React`, `Vue`, `Svelte`, `SolidJS`, `Angular`, `vanilla JS`
