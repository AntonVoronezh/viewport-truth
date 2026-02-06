## FAQ

This FAQ covers the most common project-level questions: Node.js versions, TypeScript support, tree-shaking, and dependencies.

## What Node.js versions are supported?

- **Supported:** Node.js **18+** (LTS and newer).
- **Why:** the build output and tooling assume modern Node features and an ESM-friendly ecosystem.

If you need Node 16 support, you’ll typically have to pin older tooling and/or rebuild the package from source in your environment.

## Does it support TypeScript?

Yes.

- **TypeScript-first:** ships with **type definitions** (so you get autocomplete and type-checking out of the box).
- Works with both **TypeScript** and **JavaScript** consumers.
- If you’re using TS, prefer the typed imports exposed by the package entrypoints (your editor/TS server will pick them up automatically).

## Is it tree-shakeable?

Yes—under normal modern bundler settings.

- The package is published in a way that allows **ESM tree-shaking** (e.g., Vite, Rollup, esbuild, webpack 5).
- To maximize tree-shaking:
    - Import **only what you use** (avoid namespace imports like `import * as ...`).
    - Ensure your bundler runs in **production mode** with minification / dead-code elimination enabled.

If you see unexpectedly large bundles, it’s usually caused by importing a “barrel” entry that pulls in multiple adapters at once.

## What are the dependencies? Are there peer dependencies?

- **Core** aims to be **light on dependencies** and not force a framework on you.
- Framework adapters (React/Vue/Svelte/Solid, if present) are typically modeled as **peer dependencies** (so your app controls the framework version).

Practical guidance:
- If your package manager warns about missing peers, install the required framework package(s) in your app.
- If you only use the vanilla/core API, you shouldn’t need to install framework peers.

If this library helps, you can [support development](https://boosty.to/antonvoronezh/donate).

