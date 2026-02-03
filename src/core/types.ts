export type ViewportTruthSnapshot = Readonly<{
    /** CSS px of the *visible* viewport (best-effort, VisualViewport-first) */
    width: number;
    height: number;

    /** Layout viewport (window.inner*) in CSS px */
    layoutWidth: number;
    layoutHeight: number;

    /** Visual viewport offsets (CSS px) */
    offsetLeft: number;
    offsetTop: number;

    /** Zoom scale (1 = no zoom). If unknown => 1 */
    scale: number;

    /** Heuristic flags */
    isKeyboardOpen: boolean;
    isStable: boolean;

    /** Capability flags */
    hasVisualViewport: boolean;

    /** Timestamp (performance.now) when snapshot was computed */
    ts: number;
}>;

export type ViewportTruthSubscribe = (onStoreChange: () => void) => () => void;

export type ViewportTruthStore = Readonly<{
    /** Get current snapshot (client) */
    getSnapshot: () => ViewportTruthSnapshot;
    /** Get server snapshot (SSR) */
    getServerSnapshot: () => ViewportTruthSnapshot | null;
    /** Subscribe to updates */
    subscribe: ViewportTruthSubscribe;
    /** Stop internal listeners (optional manual control) */
    destroy: () => void;
}>;

export type ViewportTruthOptions = Readonly<{
    /**
     * Stability debounce in ms. isStable becomes true after this period without changes.
     * Default: 150
     */
    stableDelayMs?: number;

    /**
     * Keyboard detection threshold: if visualHeight < layoutHeight * ratio => keyboard likely open.
     * Default: 0.75
     */
    keyboardRatio?: number;

    /**
     * Also require absolute delta in px to avoid false positives on tiny fluctuations.
     * Default: 120
     */
    keyboardMinDeltaPx?: number;

    /**
     * Treat this as "measurement floor" in CSS px to clamp weird transient zeros.
     * Default: 1
     */
    minViewportPx?: number;

    /**
     * For PWAs / edge environments: if true, prefer VisualViewport even when scale != 1.
     * Default: true
     */
    trustVisualViewportUnderZoom?: boolean;

    /**
     * Optional hook to supply safe-area insets (CSS px).
     * Core engine does not touch DOM; if you want to compensate iOS quirks with env(safe-area-*),
     * provide these from your app layer.
     */
    safeAreaInsets?: Partial<Readonly<{ top: number; right: number; bottom: number; left: number }>>;
}>;
