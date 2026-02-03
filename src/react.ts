import { useMemo, useSyncExternalStore } from "react";
import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types";
import { createViewportTruthStore } from "./core/engine";

export type UseViewportTruthResult = ViewportTruthSnapshot | null;

export const useViewportTruth = (options?: ViewportTruthOptions): UseViewportTruthResult => {
    const store = useMemo(() => createViewportTruthStore(options), [options]);

    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
};
