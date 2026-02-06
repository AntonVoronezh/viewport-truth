import { useMemo, useSyncExternalStore } from "react";
import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types.js";
import { createViewportTruthStore } from "./core/engine.js";

/**
 * The return type of {@link useViewportTruth}.
 *
 * `null` is returned on the server (SSR) and until the first client snapshot is available.
 */
export type UseViewportTruthResult = ViewportTruthSnapshot | null;

/**
 * React hook that subscribes to viewport-truth updates via `useSyncExternalStore`.
 *
 * Internally creates a viewport-truth store and returns the latest snapshot.
 * On SSR, the hook returns `null` (via `getServerSnapshot`).
 *
 * @param options - Optional configuration passed to the underlying viewport-truth store.
 * **Important:** if you pass a new object literal each render, the store will be re-created.
 * Prefer memoizing `options` (e.g. with `useMemo`) for stable subscriptions.
 *
 * @returns The latest {@link ViewportTruthSnapshot}, or `null` on SSR / before first update.
 *
 * @example
 * import { useViewportTruth } from "viewport-truth/react";
 *
 * export function DebugPanel() {
 *   const vt = useViewportTruth();
 *   if (!vt) return null;
 *
 *   return (
 *     <pre style={{ whiteSpace: "pre-wrap" }}>
 *       {JSON.stringify(vt, null, 2)}
 *     </pre>
 *   );
 * }
 *
 * @example
 * // Memoize options to avoid re-creating the store every render
 * import { useMemo } from "react";
 *
 * export function App() {
 *   const options = useMemo(
 *     () => ({ stableDelayMs: 200, keyboardMinDeltaPx: 140 }),
 *     []
 *   );
 *
 *   const vt = useViewportTruth(options);
 *   return <div>{vt?.stable ? "stable" : "moving"}</div>;
 * }
 */
export const useViewportTruth = (options?: ViewportTruthOptions): UseViewportTruthResult => {
    const store = useMemo(() => createViewportTruthStore(options), [options]);

    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
};
