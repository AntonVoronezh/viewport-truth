import { caf, raf, queueMicrotaskSafe, requestIdle, cancelIdle } from "./env";

export type Scheduler = Readonly<{
    scheduleFrame: (fn: () => void) => void;
    scheduleIdle: (fn: () => void) => void;
    cancelAll: () => void;
}>;

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
