import { onBeforeUnmount, onMounted, shallowRef, type ShallowRef, type Directive } from "vue";
import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types";
import { createViewportTruthStore } from "./core/engine";

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
