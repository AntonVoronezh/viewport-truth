import type { ViewportTruthOptions, ViewportTruthSnapshot, ViewportTruthStore } from "./types.js";
import { canUseDOM, now } from "./env.js";
import { createScheduler } from "./scheduler.js";

const clampMin = (n: number, min: number) => (Number.isFinite(n) ? Math.max(min, n) : min);

const round2 = (n: number) => Math.round(n * 100) / 100;

const getSafeArea = (opt?: ViewportTruthOptions) => {
    const s = opt?.safeAreaInsets;
    return {
        top: s?.top ?? 0,
        right: s?.right ?? 0,
        bottom: s?.bottom ?? 0,
        left: s?.left ?? 0,
    } as const;
};

const computeSnapshot = (opt: Required<ViewportTruthOptions>): ViewportTruthSnapshot => {
    const w = window;
    const vv = w.visualViewport ?? null;

    const layoutWidth = clampMin(w.innerWidth, opt.minViewportPx);
    const layoutHeight = clampMin(w.innerHeight, opt.minViewportPx);

    const hasVisualViewport = !!vv;
    const scale = hasVisualViewport && typeof vv!.scale === "number" ? clampMin(vv!.scale, 0.01) : 1;

    let visualWidth = hasVisualViewport && typeof vv!.width === "number" ? vv!.width : layoutWidth;
    let visualHeight = hasVisualViewport && typeof vv!.height === "number" ? vv!.height : layoutHeight;

    visualWidth = clampMin(visualWidth, opt.minViewportPx);
    visualHeight = clampMin(visualHeight, opt.minViewportPx);

    const offsetLeft = hasVisualViewport && typeof vv!.offsetLeft === "number" ? vv!.offsetLeft : 0;
    const offsetTop = hasVisualViewport && typeof vv!.offsetTop === "number" ? vv!.offsetTop : 0;

    const safe = getSafeArea(opt);
    let height = visualHeight;
    if (safe.bottom > 0) {
        const delta = layoutHeight - visualHeight;
        if (delta > safe.bottom * 0.8 && delta < safe.bottom * 2.5) {
            height = visualHeight + safe.bottom;
        }
    }

    let width = visualWidth;
    if (safe.left > 0 || safe.right > 0) {
        const delta = layoutWidth - visualWidth;
        const sum = safe.left + safe.right;
        if (sum > 0 && delta > sum * 0.8 && delta < sum * 2.5) {
            width = visualWidth + sum;
        }
    }

    const trustVV = opt.trustVisualViewportUnderZoom;
    const effectiveWidth = hasVisualViewport && (trustVV || scale === 1) ? width : layoutWidth;
    const effectiveHeight = hasVisualViewport && (trustVV || scale === 1) ? height : layoutHeight;

    const deltaH = layoutHeight - effectiveHeight;
    const ratioOk = effectiveHeight < layoutHeight * opt.keyboardRatio;
    const deltaOk = deltaH > opt.keyboardMinDeltaPx;
    const isKeyboardOpen = hasVisualViewport ? (ratioOk && deltaOk) : false;

    return {
        width: round2(effectiveWidth),
        height: round2(effectiveHeight),

        layoutWidth: round2(layoutWidth),
        layoutHeight: round2(layoutHeight),

        offsetLeft: round2(offsetLeft),
        offsetTop: round2(offsetTop),

        scale: round2(scale),

        isKeyboardOpen,
        isStable: true,
        hasVisualViewport,
        ts: now(),
    };
};

const sameSnapshot = (a: ViewportTruthSnapshot, b: ViewportTruthSnapshot): boolean => {
    return (
        a.width === b.width &&
        a.height === b.height &&
        a.layoutWidth === b.layoutWidth &&
        a.layoutHeight === b.layoutHeight &&
        a.offsetLeft === b.offsetLeft &&
        a.offsetTop === b.offsetTop &&
        a.scale === b.scale &&
        a.isKeyboardOpen === b.isKeyboardOpen &&
        a.isStable === b.isStable &&
        a.hasVisualViewport === b.hasVisualViewport
    );
};

const withDefaults = (options?: ViewportTruthOptions): Required<ViewportTruthOptions> => ({
    stableDelayMs: options?.stableDelayMs ?? 150,
    keyboardRatio: options?.keyboardRatio ?? 0.75,
    keyboardMinDeltaPx: options?.keyboardMinDeltaPx ?? 120,
    minViewportPx: options?.minViewportPx ?? 1,
    trustVisualViewportUnderZoom: options?.trustVisualViewportUnderZoom ?? true,
    safeAreaInsets: options?.safeAreaInsets ?? {},
});

/**
 * Creates a viewport-truth store that tracks viewport metrics (layout/visual viewport),
 * keyboard state, and stability, and notifies subscribers on changes.
 *
 * On the server (or any non-DOM environment) the store is still created, but:
 * - `getSnapshot()` throws (to prevent accidental client-only usage)
 * - `getServerSnapshot()` returns `null`
 * - `subscribe()` is a no-op
 *
 * @param options - Optional configuration for stability timing, keyboard detection thresholds,
 * minimum viewport clamp, zoom behavior, and safe-area insets adjustments.
 *
 * @returns A {@link ViewportTruthStore} with `getSnapshot`, `getServerSnapshot`, `subscribe`, and `destroy`.
 *
 * @example
 * // Vanilla usage
 * import { createViewportTruthStore } from "viewport-truth";
 *
 * const store = createViewportTruthStore();
 * const unsubscribe = store.subscribe(() => {
 *   console.log(store.getSnapshot());
 * });
 *
 * // later
 * unsubscribe();
 * store.destroy();
 *
 * @example
 * // Tuning keyboard detection and stability
 * const store = createViewportTruthStore({
 *   stableDelayMs: 200,
 *   keyboardRatio: 0.7,
 *   keyboardMinDeltaPx: 140,
 *   trustVisualViewportUnderZoom: true,
 *   safeAreaInsets: { bottom: 34 }
 * });
 */

export const createViewportTruthStore = (options?: ViewportTruthOptions): ViewportTruthStore => {
    const opt = withDefaults(options);

    if (!canUseDOM()) {
        return {
            getSnapshot: () => {
                throw new Error("viewport-truth: getSnapshot() called on the server. Use getServerSnapshot().");
            },
            getServerSnapshot: () => null,
            subscribe: () => () => void 0,
            destroy: () => void 0,
        };
    }

    const scheduler = createScheduler();
    let destroyed = false;

    let snapshot = computeSnapshot(opt);
    snapshot = { ...snapshot, isStable: true };

    const listeners = new Set<() => void>();

    let stableTimer: number | null = null;
    let lastChangeAt = snapshot.ts;

    const setStable = (value: boolean) => {
        if (destroyed) return;
        if (snapshot.isStable === value) return;
        snapshot = { ...snapshot, isStable: value, ts: now() };
        listeners.forEach((l) => l());
    };

    const armStabilityTimer = () => {
        if (stableTimer != null) clearTimeout(stableTimer);
        const delay = opt.stableDelayMs;

        scheduler.scheduleIdle(() => {
            if (destroyed) return;

            stableTimer = window.setTimeout(() => {
                if (destroyed) return;
                const age = now() - lastChangeAt;
                if (age >= delay) setStable(true);
            }, delay);
        });
    };

    const recompute = () => {
        if (destroyed) return;

        const nextBase = computeSnapshot(opt);
        const next = { ...nextBase, isStable: false };

        if (!sameSnapshot(snapshot, next)) {
            snapshot = next;
            lastChangeAt = snapshot.ts;
            listeners.forEach((l) => l());
        }

        armStabilityTimer();
    };

    const onAnyViewportEvent = () => scheduler.scheduleFrame(recompute);

    const vv = window.visualViewport ?? null;

    let attached = false;

    const attach = () => {
        if (attached || destroyed) return;
        attached = true;

        scheduler.scheduleFrame(recompute);

        if (vv) {
            vv.addEventListener("resize", onAnyViewportEvent, { passive: true });
            vv.addEventListener("scroll", onAnyViewportEvent, { passive: true });
        }

        window.addEventListener("orientationchange", onAnyViewportEvent, { passive: true });
        window.addEventListener("resize", onAnyViewportEvent, { passive: true });
        window.addEventListener("pageshow", onAnyViewportEvent, { passive: true });
    };

    const detach = () => {
        if (!attached) return;
        attached = false;

        if (vv) {
            vv.removeEventListener("resize", onAnyViewportEvent);
            vv.removeEventListener("scroll", onAnyViewportEvent);
        }
        window.removeEventListener("orientationchange", onAnyViewportEvent);
        window.removeEventListener("resize", onAnyViewportEvent);
        window.removeEventListener("pageshow", onAnyViewportEvent);
    };

    const destroy = () => {
        if (destroyed) return;
        destroyed = true;

        detach();
        scheduler.cancelAll();

        if (stableTimer != null) clearTimeout(stableTimer);
        stableTimer = null;

        listeners.clear();
    };

    return {
        getSnapshot: () => snapshot,
        getServerSnapshot: () => null,
        subscribe: (listener: () => void) => {
            if (destroyed) return () => void 0;

            listeners.add(listener);
            if (listeners.size === 1) attach();

            scheduler.scheduleFrame(() => {
                if (!destroyed && listeners.has(listener)) listener();
            });

            return () => {
                listeners.delete(listener);
                if (listeners.size === 0) detach();
            };
        },
        destroy,
    };
};
