/**
 * Checks whether the current runtime likely has access to browser DOM globals.
 *
 * @returns `true` if `window`, `document`, and `navigator` are available; otherwise `false`.
 *
 * @example
 * if (canUseDOM()) {
 *   // Safe to touch window/document here
 * }
 */
export const canUseDOM = (): boolean =>
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof navigator !== "undefined";

/**
 * Returns a monotonic-ish timestamp in milliseconds.
 *
 * Prefers `performance.now()` when available (better for measuring intervals),
 * otherwise falls back to `Date.now()`.
 *
 * @returns A timestamp in milliseconds.
 *
 * @example
 * const t0 = now();
 * doWork();
 * const dt = now() - t0;
 * console.log(`work took ${dt}ms`);
 */
export const now = (): number => {
    const p = (typeof performance !== "undefined" ? performance : undefined) as
        | { now?: () => number }
        | undefined;
    return typeof p?.now === "function" ? p.now() : Date.now();
};

/**
 * Schedules a callback on the next animation frame, with a timeout fallback.
 *
 * If `requestAnimationFrame` is not available, uses `setTimeout` (~16ms) and
 * invokes the callback with a best-effort timestamp.
 *
 * @param cb - The frame callback to run.
 * @returns An id that can be passed to {@link caf} to cancel.
 *
 * @example
 * const id = raf((t) => {
 *   console.log("frame timestamp:", t);
 * });
 * // caf(id);
 */
export const raf = (cb: FrameRequestCallback): number => {
    if (typeof requestAnimationFrame === "function") return requestAnimationFrame(cb);
    return setTimeout(() => cb(now() as unknown as number), 16) as unknown as number;
};

/**
 * Cancels a callback scheduled with {@link raf}.
 *
 * Uses `cancelAnimationFrame` when available, otherwise falls back to `clearTimeout`.
 *
 * @param id - The id returned by {@link raf}.
 * @returns Nothing.
 *
 * @example
 * const id = raf(() => console.log("won't run"));
 * caf(id);
 */
export const caf = (id: number): void => {
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
    else clearTimeout(id as unknown as number);
};

/**
 * Queues a microtask with safe fallbacks.
 *
 * Uses `queueMicrotask` when available; otherwise schedules via a resolved Promise.
 * The Promise fallback swallows errors to avoid unhandled rejection noise in some environments.
 *
 * @param cb - The callback to execute in a microtask.
 * @returns Nothing.
 *
 * @example
 * queueMicrotaskSafe(() => {
 *   // Runs after current call stack, before next macrotask
 *   console.log("microtask");
 * });
 */
export const queueMicrotaskSafe = (cb: () => void): void => {
    if (typeof queueMicrotask === "function") queueMicrotask(cb);
    else Promise.resolve().then(cb).catch(() => void 0);
};

type GlobalWithIdleCallback = typeof globalThis & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (id: number) => void;
};

/**
 * Requests an idle callback with a timeout, with a fallback for environments
 * that do not support `requestIdleCallback`.
 *
 * When `requestIdleCallback` is unavailable, falls back to `setTimeout` and calls
 * the callback with `{ didTimeout: true }`.
 *
 * @param cb - The idle callback to run.
 * @param timeoutMs - Timeout (ms) to pass to `requestIdleCallback`. Defaults to `200`.
 * @returns An id that can be passed to {@link cancelIdle} to cancel.
 *
 * @example
 * const id = requestIdle((deadline) => {
 *   if (deadline.didTimeout) {
 *     // Ran due to timeout
 *   }
 *   console.log("time remaining:", deadline.timeRemaining());
 * }, 300);
 *
 * // cancelIdle(id);
 */
export const requestIdle = (cb: IdleRequestCallback, timeoutMs = 200): number => {
    const g = globalThis as unknown as GlobalWithIdleCallback;
    const ric = g.requestIdleCallback;

    if (typeof ric === "function") return ric(cb, { timeout: timeoutMs });

    return setTimeout(
        () => cb({ didTimeout: true, timeRemaining: () => 0 } as IdleDeadline),
        0
    ) as unknown as number;
};

/**
 * Cancels an idle callback scheduled with {@link requestIdle}.
 *
 * Uses `cancelIdleCallback` when available; otherwise falls back to `clearTimeout`.
 *
 * @param id - The id returned by {@link requestIdle}.
 * @returns Nothing.
 *
 * @example
 * const id = requestIdle(() => console.log("won't run"));
 * cancelIdle(id);
 */
export const cancelIdle = (id: number): void => {
    const g = globalThis as unknown as GlobalWithIdleCallback;
    const cic = g.cancelIdleCallback;

    if (typeof cic === "function") cic(id);
    else clearTimeout(id as unknown as number);
};
