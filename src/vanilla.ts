import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types.js";
import { createViewportTruthStore } from "./core/engine.js";

export type ViewportTruthController = Readonly<{
    get: () => ViewportTruthSnapshot;
    subscribe: (fn: (s: ViewportTruthSnapshot) => void) => () => void;
    destroy: () => void;
}>;

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
