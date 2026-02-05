/// <reference types="vitest" />

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createViewportTruthStore } from "../src";

type VVListener = (ev?: any) => void;

function createMockVisualViewport(init: {
    width: number;
    height: number;
    offsetTop?: number;
    offsetLeft?: number;
    pageTop?: number;
    pageLeft?: number;
    scale?: number;
}) {
    let state = {
        width: init.width,
        height: init.height,
        offsetTop: init.offsetTop ?? 0,
        offsetLeft: init.offsetLeft ?? 0,
        pageTop: init.pageTop ?? 0,
        pageLeft: init.pageLeft ?? 0,
        scale: init.scale ?? 1,
    };

    const listeners = new Map<string, Set<VVListener>>();

    return {
        vv: {
            get width() {
                return state.width;
            },
            get height() {
                return state.height;
            },
            get offsetTop() {
                return state.offsetTop;
            },
            get offsetLeft() {
                return state.offsetLeft;
            },
            get pageTop() {
                return state.pageTop;
            },
            get pageLeft() {
                return state.pageLeft;
            },
            get scale() {
                return state.scale;
            },
            addEventListener(type: string, cb: VVListener) {
                if (!listeners.has(type)) listeners.set(type, new Set());
                listeners.get(type)!.add(cb);
            },
            removeEventListener(type: string, cb: VVListener) {
                listeners.get(type)?.delete(cb);
            },
        },
        set(patch: Partial<typeof state>) {
            state = { ...state, ...patch };
        },
        emit(type: string) {
            for (const cb of listeners.get(type) ?? []) cb({ type });
        },
    };
}

async function flushRecompute() {
    await Promise.resolve();
    vi.runOnlyPendingTimers();
    await Promise.resolve();
}

function fireWindow(type: string) {
    window.dispatchEvent(new Event(type));
}

describe("viewport-truth core happy path", () => {
    beforeEach(() => {
        vi.useFakeTimers();

        vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
            return setTimeout(() => cb(Date.now()), 0) as unknown as number;
        });
        vi.stubGlobal("cancelAnimationFrame", (id: number) => {
            clearTimeout(id as unknown as any);
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("subscribe → resize → snapshot updates → becomes stable → unsubscribe stops updates", async () => {
        (window as any).innerWidth = 400;
        (window as any).innerHeight = 800;

        const { vv, set, emit } = createMockVisualViewport({
            width: 400,
            height: 700,
            scale: 1,
        });
        (window as any).visualViewport = vv;

        const stableDelayMs = 50;

        const store = createViewportTruthStore({ stableDelayMs });
        const onChange = vi.fn();
        const unsubscribe = store.subscribe(onChange);

        await flushRecompute();

        const s0 = store.getSnapshot();
        expect(s0.hasVisualViewport).toBe(true);
        expect([700, 800]).toContain(s0.height);

        onChange.mockClear();

        set({ height: 500 });
        (window as any).innerHeight = 600;

        emit("resize");
        emit("scroll");
        fireWindow("resize");
        fireWindow("scroll");

        await flushRecompute();

        const s1 = store.getSnapshot();

        expect([500, 600]).toContain(s1.height);

        expect(s1.isStable).toBe(false);

        expect(onChange).toHaveBeenCalled();

        onChange.mockClear();
        vi.advanceTimersByTime(stableDelayMs + 1);
        await flushRecompute();

        const s2 = store.getSnapshot();
        expect(s2.isStable).toBe(true);

        onChange.mockClear();
        unsubscribe();

        set({ height: 450 });
        (window as any).innerHeight = 650;

        emit("resize");
        emit("scroll");
        fireWindow("resize");
        fireWindow("scroll");

        await flushRecompute();

        expect(onChange).not.toHaveBeenCalled();
        expect(store.getSnapshot().height).toBe(s2.height);
    });
});
