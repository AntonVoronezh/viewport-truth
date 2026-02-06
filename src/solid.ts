import { createSignal, onCleanup, type Accessor } from "solid-js";
import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types.js";
import { createViewportTruthStore } from "./core/engine.js";

/**
 * Creates a Solid accessor that returns the latest viewport-truth snapshot.
 *
 * Internally creates a viewport-truth store, subscribes to updates, and disposes it
 * automatically via `onCleanup`.
 *
 * On SSR, the initial value is `null` (from `getServerSnapshot()`), and the accessor
 * will update once on the client after subscription fires.
 *
 * @param options - Optional configuration passed to the underlying viewport-truth store.
 * @returns A Solid {@link Accessor} that yields {@link ViewportTruthSnapshot | null}.
 *
 * @example
 * import { createViewportTruth } from "viewport-truth/solid";
 *
 * function Debug() {
 *   const vt = createViewportTruth();
 *   return <pre>{JSON.stringify(vt(), null, 2)}</pre>;
 * }
 *
 * @example
 * // With options
 * const vt = createViewportTruth({ stableDelayMs: 200, keyboardMinDeltaPx: 140 });
 * console.log(vt());
 */
export const createViewportTruth = (
    options?: ViewportTruthOptions
): Accessor<ViewportTruthSnapshot | null> => {
    const store = createViewportTruthStore(options);
    const [snap, setSnap] = createSignal<ViewportTruthSnapshot | null>(store.getServerSnapshot());

    const unsub = store.subscribe(() => setSnap(store.getSnapshot()));

    onCleanup(() => {
        unsub();
        store.destroy();
    });

    return snap;
};

/**
 * Directive-like helper (Solid "use:" works with functions)
 * Usage: <div use:viewportTruthDirective={{ onChange, options }} />
 */
/**
 * Solid "directive-like" helper for use with `use:`.
 *
 * Creates a viewport-truth store and calls `onChange` whenever the snapshot changes.
 * Disposes subscriptions automatically via `onCleanup`.
 *
 * Note: the current implementation reads `accessor()` once and does not react to
 * later changes of `onChange`/`options`. (That is often fine for directives, but it's good to know.)
 *
 * @param _el - The element the directive is attached to (unused, but required by Solid's `use:` signature).
 * @param accessor - Accessor returning the directive configuration.
 * @returns Nothing.
 *
 * @example
 * import { viewportTruthDirective } from "viewport-truth/solid";
 *
 * const onChange = (s) => console.log("snapshot:", s);
 *
 * // In JSX:
 * // <div use:viewportTruthDirective={{ onChange, options: { stableDelayMs: 200 } }} />
 */
export const viewportTruthDirective = (
    _el: HTMLElement,
    accessor: () => { onChange: (s: ViewportTruthSnapshot) => void; options?: ViewportTruthOptions }
) => {
    const cfg = accessor();
    const store = createViewportTruthStore(cfg.options);
    const unsub = store.subscribe(() => cfg.onChange(store.getSnapshot()));

    onCleanup(() => {
        unsub();
        store.destroy();
    });
};
