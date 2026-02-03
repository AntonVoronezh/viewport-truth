import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types";
import { createViewportTruthStore } from "./core/engine";

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
export const viewportTruthAction = (
    _node: HTMLElement,
    params: { onChange: (s: ViewportTruthSnapshot) => void; options?: ViewportTruthOptions }
) => {
    const store = createViewportTruthStore(params?.options);
    const unsub = store.subscribe(() => params.onChange(store.getSnapshot()));

    return {
        update(next: typeof params) {
            params = next;
        },
        destroy() {
            unsub();
            store.destroy();
        },
    };
};
