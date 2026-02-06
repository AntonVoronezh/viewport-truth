import { caf, raf, queueMicrotaskSafe, requestIdle, cancelIdle } from "./env.js";

/**
 * A tiny scheduler that coalesces multiple "do work soon" requests into:
 * - at most one `requestAnimationFrame` callback per frame
 * - at most one `requestIdleCallback` (or fallback) callback per idle period
 *
 * Useful to avoid flooding recalculation work on bursty events (resize/scroll/etc).
 *
 * @example
 * const s = createScheduler();
 *
 * // Will run once on the next animation frame, even if called many times synchronously:
 * s.scheduleFrame(() => console.log("frame work"));
 * s.scheduleFrame(() => console.log("still one frame work"));
 *
 * // Will run once when the browser is idle (or via fallback):
 * s.scheduleIdle(() => console.log("idle work"));
 *
 * // Cancel any pending scheduled work:
 * s.cancelAll();
 */
export type Scheduler = Readonly<{
    /**
     * Schedules `fn` to run on the next animation frame.
     * Multiple calls before the frame fires are coalesced into a single execution.
     *
     * @param fn - Work to run on the next animation frame.
     * @returns Nothing.
     */
    scheduleFrame: (fn: () => void) => void;

    /**
     * Schedules `fn` to run when the browser is idle (via `requestIdleCallback`),
     * or as soon as possible via a fallback.
     * Multiple calls while one is already queued are coalesced into a single execution.
     *
     * @param fn - Work to run when idle (or via fallback).
     * @returns Nothing.
     */
    scheduleIdle: (fn: () => void) => void;

    /**
     * Cancels any queued frame/idle work and resets internal state.
     *
     * @returns Nothing.
     */
    cancelAll: () => void;
}>;

/**
 * Creates a {@link Scheduler} instance.
 *
 * The returned scheduler guarantees that:
 * - `scheduleFrame()` runs at most once per animation frame (burst calls are merged)
 * - `scheduleIdle()` runs at most once per idle period (burst calls are merged)
 *
 * @returns A {@link Scheduler} instance.
 *
 * @example
 * const scheduler = createScheduler();
 *
 * window.addEventListener("resize", () => {
 *   scheduler.scheduleFrame(() => {
 *     // recompute layout once per frame, even if resize fires many times
 *     console.log("recompute");
 *   });
 * });
 *
 * // later (e.g., on teardown)
 * scheduler.cancelAll();
 */
export const createScheduler = (): Scheduler => {
    let rafId: number | null = null;
    let idleId: number | null = null;
    let frameQueued = false;
    let idleQueued = false;

    return {
        scheduleFrame(fn) {
            if (frameQueued) return;
            frameQueued = true;

            queueMicrotaskSafe(() => {
                if (!frameQueued) return;

                rafId = raf(() => {
                    rafId = null;
                    frameQueued = false;
                    fn();
                });
            });
        },

        scheduleIdle(fn) {
            if (idleQueued) return;
            idleQueued = true;

            idleId = requestIdle(() => {
                idleId = null;
                idleQueued = false;
                fn();
            });
        },

        cancelAll() {
            if (rafId != null) caf(rafId);
            if (idleId != null) cancelIdle(idleId);
            rafId = null;
            idleId = null;
            frameQueued = false;
            idleQueued = false;
        },
    };
};
