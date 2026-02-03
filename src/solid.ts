import { createSignal, onCleanup, type Accessor } from "solid-js";
import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types";
import { createViewportTruthStore } from "./core/engine";

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
