import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types.js";
import { createViewportTruthStore } from "./core/engine.js";

/**
 * Creates a Svelte-compatible readable store for viewport-truth snapshots.
 *
 * The returned object implements Svelte's store contract (`{ subscribe }`).
 * It pushes an initial value immediately (SSR-safe via `getServerSnapshot()`),
 * then emits updates from the underlying viewport-truth store.
 *
 * @param options - Optional configuration passed to the underlying viewport-truth store.
 * @returns A Svelte readable-store-like object with a `subscribe` method.
 *
 * @example
 * <!-- +page.svelte -->
 * <script lang="ts">
 *   import { viewportTruth } from "viewport-truth/svelte";
 *
 *   const vt = viewportTruth({ stableDelayMs: 200 });
 * </script>
 *
 * {#if $vt}
 *   <pre>{JSON.stringify($vt, null, 2)}</pre>
 * {/if}
 *
 * @example
 * // Subscribe imperatively (outside Svelte components)
 * const store = viewportTruth();
 * const unsubscribe = store.subscribe((snap) => {
 *   console.log("snapshot:", snap);
 * });
 * // later:
 * unsubscribe();
 */
export const viewportTruth = (options?: ViewportTruthOptions) => {
    const store = createViewportTruthStore(options);

    return {
        subscribe(run: (v: ViewportTruthSnapshot | null) => void) {
            run(store.getServerSnapshot());
            const unsub = store.subscribe(() => run(store.getSnapshot()));
            return () => {
                unsub();
                store.destroy();
            };
        },
    };
};

/**
 * Action: use:viewportTruthAction={{ onChange, options }}
 */
/**
 * Svelte action that wires viewport-truth updates to a callback.
 *
 * It creates a viewport-truth store on mount and calls `onChange` on every snapshot update.
 * The `update()` handler only replaces the `params` object; it does not re-create the store
 * if `options` changes after initialization.
 *
 * @param _node - The element the action is applied to (unused, but required by Svelte's action signature).
 * @param params - Action parameters: an `onChange` callback and optional `options`.
 * @returns An action object with `update` and `destroy` handlers.
 *
 * @example
 * <script lang="ts">
 *   import { viewportTruthAction } from "viewport-truth/svelte";
 *
 *   function onChange(snap) {
 *     console.log("viewport snapshot:", snap);
 *   }
 * </script>
 *
 * <div use:viewportTruthAction={{ onChange, options: { stableDelayMs: 200 } }} />
 *
 * @example
 * <!-- Update only the callback (store stays the same) -->
 * <div
 *   use:viewportTruthAction={{
 *     onChange: (s) => console.log("A", s),
 *     options: { stableDelayMs: 200 }
 *   }}
 * />
 */
export const viewportTruthAction = (
    _node: HTMLElement,
    params: { onChange: (s: ViewportTruthSnapshot) => void; options?: ViewportTruthOptions }
) => {
    const store = createViewportTruthStore(params?.options);
    const unsub = store.subscribe(() => params.onChange(store.getSnapshot()));

    return {
        /**
         * Updates action parameters.
         *
         * @param next - The next parameters object.
         * @returns Nothing.
         */
        update(next: typeof params) {
            params = next;
        },
        /**
         * Cleans up subscriptions and destroys the underlying store.
         *
         * @returns Nothing.
         */
        destroy() {
            unsub();
            store.destroy();
        },
    };
};
