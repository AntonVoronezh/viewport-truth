# npm / Installation

This page is the “package-level” entry point: how to install `viewport-truth`, what it exports, which runtimes are supported, and what to do when installation or bundling goes sideways.

---

## Install

Choose your package manager:

```bash
npm i viewport-truth
or
// pnpm add viewport-truth
or
// yarn add viewport-truth
```

## Requirements

1. Node.js: 18+ (LTS and newer)
2. TypeScript: supported (types are included)
3. Runtime: browser-first (uses visualViewport when available)

> Tip: If you target older browsers, add your usual polyfills. The library still works without visualViewport, but some measurements may be less precise.

## What this package exports

viewport-truth is split into small entry points so bundlers can tree-shake effectively.

Common patterns you’ll see in this repo’s docs:

* React: `useViewportTruth`(...)
* Vue: `useViewportTruth`(...)
* Svelte: `viewportTruth`(...)
* Solid: `createViewportTruth`(...)
* Angular: `ViewportTruthDirective`

> If your project uses SSR (Next.js/Nuxt/etc.), make sure viewport-dependent code runs on the client (e.g. in effects / mounted hooks). The framework adapters in the docs follow that pattern.

## Peer dependencies (framework adapters)

Framework integrations typically rely on your framework being installed in your app.

If you’re using:

* React → you already have react installed
* Vue → you already have vue installed
* Svelte → you already have svelte installed
* Solid → you already have solid-js installed
* Angular → you already have @angular/* installed

If your package manager warns about peer deps, it’s usually safe: it just means the **adapter expects your app to provide the framework**.

## Upgrading
```bash
npm update viewport-truth
```

For bigger upgrades, check:

* GitHub Releases / tags
* Changelog (if present)


## Troubleshooting

### 1) “Cannot find module …” / missing exports

Ensure you’re importing from the correct entry point shown in the docs (React/Vue/Svelte/etc.).
   
Clear lockfile + reinstall if your environment is stale:
```bash
   rm -rf node_modules package-lock.json
   npm i
```

>   (Use the equivalent for pnpm/yarn.)

### 2) SSR errors like “window is not defined”

This is expected if you call viewport APIs during SSR.

Fix: run viewport-dependent code only on the client:

* React: useEffect
* Vue: onMounted
* Svelte: onMount
* Solid: onMount
* Angular: after view init / directive lifecycle hooks

### 3) Layout “jumps” / flicker on rerender

Most of the time this is caused by recreating stores/subscriptions due to unstable options objects.

See: [Common pitfalls](./common-pitfalls)

## Links
- npm: https://www.npmjs.com/package/viewport-truth
- GitHub: https://github.com/AntonVoronezh/viewport-truth
- [FAQ test](./faq)
- [Smoke test](./smoke-test)
- [Funding](./funding)
