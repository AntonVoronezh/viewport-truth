export const canUseDOM = (): boolean =>
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof navigator !== "undefined";

export const now = (): number => {
    const p = (typeof performance !== "undefined" ? performance : undefined) as
        | { now?: () => number }
        | undefined;
    return typeof p?.now === "function" ? p.now() : Date.now();
};

export const raf = (cb: FrameRequestCallback): number => {
    if (typeof requestAnimationFrame === "function") return requestAnimationFrame(cb);
    return setTimeout(() => cb(now() as unknown as number), 16) as unknown as number;
};

export const caf = (id: number): void => {
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
    else clearTimeout(id as unknown as number);
};

export const queueMicrotaskSafe = (cb: () => void): void => {
    if (typeof queueMicrotask === "function") queueMicrotask(cb);
    else Promise.resolve().then(cb).catch(() => void 0);
};

export const requestIdle = (cb: IdleRequestCallback, timeoutMs = 200): number => {
    const ric = (globalThis as any).requestIdleCallback as undefined | ((c: IdleRequestCallback, o?: IdleRequestOptions) => number);
    if (typeof ric === "function") return ric(cb, { timeout: timeoutMs });
    return setTimeout(() => cb({ didTimeout: true, timeRemaining: () => 0 } as IdleDeadline), 0) as unknown as number;
};

export const cancelIdle = (id: number): void => {
    const cic = (globalThis as any).cancelIdleCallback as undefined | ((i: number) => void);
    if (typeof cic === "function") cic(id);
    else clearTimeout(id as unknown as number);
};
