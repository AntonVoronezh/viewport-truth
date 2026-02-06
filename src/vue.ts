import { onBeforeUnmount, onMounted, shallowRef, type ShallowRef, type Directive } from "vue";
import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types.js";
import { createViewportTruthStore } from "./core/engine.js";

/**
 * Vue composable that returns a shallow ref containing the latest viewport-truth snapshot.
 *
 * The ref is initialized with the SSR-safe value from `getServerSnapshot()` (typically `null`),
 * then starts updating after `onMounted()` when DOM APIs are available.
 *
 * @param options - Optional configuration passed to the underlying viewport-truth store.
 * @returns A {@link ShallowRef} whose `.value` is {@link ViewportTruthSnapshot | null}.
 *
 * @example
 * <script setup lang="ts">
 * import { useViewportTruth } from "viewport-truth/vue";
 *
 * const vt = useViewportTruth({ stableDelayMs: 200 });
 * </script>
 *
 * <template>
 *   <pre v-if="vt">{{ JSON.stringify(vt, null, 2) }}</pre>
 * </template>
 */
export const useViewportTruth = (
    options?: ViewportTruthOptions
): ShallowRef<ViewportTruthSnapshot | null> => {
    const store = createViewportTruthStore(options);
    const state = shallowRef<ViewportTruthSnapshot | null>(store.getServerSnapshot());

    let unsub: null | (() => void) = null;

    onMounted(() => {
        unsub = store.subscribe(() => {
            state.value = store.getSnapshot();
        });
    });

    onBeforeUnmount(() => {
        unsub?.();
        store.destroy();
    });

    return state;
};

/**
 * Vue directive that invokes a callback on viewport-truth snapshot changes.
 *
 * The directive creates a viewport-truth store when mounted and tears it down on unmount.
 * Current implementation reads `binding.value` only at mount time; if `onChange` or `options`
 * change later, the store/callback will not be updated.
 *
 * @typeParam El - The element type (`HTMLElement`).
 * @param _el - The bound element (unused directly; used to stash teardown data).
 * @param binding - Vue directive binding; expects `{ onChange, options? }`.
 *
 * @example
 * <script setup lang="ts">
 * import { vViewportTruth } from "viewport-truth/vue";
 *
 * function onChange(snap) {
 *   console.log("snapshot:", snap);
 * }
 * </script>
 *
 * <template>
 *   <div v-viewport-truth="{ onChange, options: { stableDelayMs: 200 } }" />
 * </template>
 */
export const vViewportTruth: Directive<HTMLElement, { onChange: (s: ViewportTruthSnapshot) => void; options?: ViewportTruthOptions }> =
    {
        mounted(_el, binding) {
            const store = createViewportTruthStore(binding.value?.options);
            const onChange = binding.value?.onChange;

            const unsub = store.subscribe(() => onChange(store.getSnapshot()));

            ( _el as any).__vt = { store, unsub };
        },
        unmounted(el) {
            const bag = (el as any).__vt as undefined | { store: ReturnType<typeof createViewportTruthStore>; unsub: () => void };
            bag?.unsub?.();
            bag?.store?.destroy?.();
            delete (el as any).__vt;
        },
    };
