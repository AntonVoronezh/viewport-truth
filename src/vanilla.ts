import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types.js";
import { createViewportTruthStore } from "./core/engine.js";

/**
 * A small framework-agnostic controller for reading and subscribing to viewport-truth snapshots.
 *
 * @example
 * const vt = createViewportTruth();
 *
 * const stop = vt.subscribe((s) => {
 *   console.log("snapshot changed:", s);
 * });
 *
 * console.log("current:", vt.get());
 *
 * // later:
 * stop();
 * vt.destroy();
 */
export type ViewportTruthController = Readonly<{
    /**
     * Returns the current viewport snapshot.
     *
     * @returns The latest {@link ViewportTruthSnapshot}.
     */
    get: () => ViewportTruthSnapshot;

    /**
     * Subscribes to snapshot changes.
     *
     * @param fn - Callback invoked after each change with the latest snapshot.
     * @returns Unsubscribe function.
     */
    subscribe: (fn: (s: ViewportTruthSnapshot) => void) => () => void;

    /**
     * Destroys the underlying store and removes any listeners/resources.
     *
     * @returns Nothing.
     */
    destroy: () => void;
}>;

/**
 * Creates a {@link ViewportTruthController}.
 *
 * @param options - Optional configuration passed to the underlying viewport-truth store.
 * @returns A {@link ViewportTruthController} for imperative usage.
 *
 * @example
 * const vt = createViewportTruth({ stableDelayMs: 200 });
 *
 * const unsubscribe = vt.subscribe((s) => {
 *   if (s.keyboardOpen) console.log("keyboard open");
 * });
 *
 * // later:
 * unsubscribe();
 * vt.destroy();
 */
export const createViewportTruth = (options?: ViewportTruthOptions): ViewportTruthController => {
    const store = createViewportTruthStore(options);

    return {
        get() {
            return store.getSnapshot();
        },
        subscribe(fn) {
            return store.subscribe(() => fn(store.getSnapshot()));
        },
        destroy() {
            store.destroy();
        },
    };
};
