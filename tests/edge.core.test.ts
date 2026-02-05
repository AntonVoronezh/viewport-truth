/// <reference types="vitest" />

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createViewportTruthStore } from "../src";

async function flushRecompute() {
    await Promise.resolve();
    vi.runOnlyPendingTimers();
    await Promise.resolve();
}

function fireWindow(type: string) {
    window.dispatchEvent(new Event(type));
}

function expectFiniteNonNegative(n: unknown) {
    expect(typeof n).toBe("number");
    expect(Number.isFinite(n as number)).toBe(true);
    expect((n as number) >= 0).toBe(true);
}

describe("viewport-truth edge cases", () => {
    beforeEach(() => {
        vi.useFakeTimers();

        vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
            return setTimeout(() => cb(Date.now()), 0) as unknown as number;
        });
        vi.stubGlobal("cancelAnimationFrame", (id: number) => {
            clearTimeout(id as unknown as any);
        });

        ;(window as any).innerWidth = 360;
        ;(window as any).innerHeight = 740;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("empty input: works with default options + without visualViewport", async () => {
        ;(window as any).visualViewport = undefined;

        const store = createViewportTruthStore(undefined as any);

        expect(() => store.getSnapshot()).not.toThrow();
        const s0 = store.getSnapshot();

        expect(s0.hasVisualViewport).toBe(false);
        expectFiniteNonNegative(s0.width);
        expectFiniteNonNegative(s0.height);

        const onChange = vi.fn();
        const unsubscribe = store.subscribe(onChange);

        fireWindow("resize");
        fireWindow("scroll");
        await flushRecompute();

        expect(() => unsubscribe()).not.toThrow();
    });

    it("invalid types: tolerates non-number viewport values (no NaN/Infinity in snapshot)", () => {
        const vv = {
            get width() {
                return "oops" as any;
            },
            get height() {
                return NaN as any;
            },
            get offsetTop() {
                return Infinity as any;
            },
            get offsetLeft() {
                return -100 as any;
            },
            get pageTop() {
                return null as any;
            },
            get pageLeft() {
                return undefined as any;
            },
            get scale() {
                return "1" as any;
            },
            addEventListener() {},
            removeEventListener() {},
        };

        ;(window as any).visualViewport = vv;

        const store = createViewportTruthStore({
            stableDelayMs: "50" as any,
        } as any);

        expect(() => store.getSnapshot()).not.toThrow();
        const s = store.getSnapshot();

        expectFiniteNonNegative(s.width);
        expectFiniteNonNegative(s.height);

        expect(typeof s.scale).toBe("number");
        expect(Number.isFinite(s.scale)).toBe(true);
    });

    it("environment errors: throws if visualViewport getters throw during store creation (current contract)", () => {
        const vv = {
            get width() {
                throw new Error("vv.width getter exploded");
            },
            get height() {
                throw new Error("vv.height getter exploded");
            },
            get offsetTop() {
                throw new Error("vv.offsetTop getter exploded");
            },
            get offsetLeft() {
                throw new Error("vv.offsetLeft getter exploded");
            },
            get pageTop() {
                throw new Error("vv.pageTop getter exploded");
            },
            get pageLeft() {
                throw new Error("vv.pageLeft getter exploded");
            },
            get scale() {
                throw new Error("vv.scale getter exploded");
            },
            addEventListener() {
                throw new Error("vv.addEventListener exploded");
            },
            removeEventListener() {
                throw new Error("vv.removeEventListener exploded");
            },
        };

        ;(window as any).visualViewport = vv;

        expect(() => createViewportTruthStore({ stableDelayMs: 10 })).toThrow(
            /vv\.scale getter exploded/i
        );
    });
});
