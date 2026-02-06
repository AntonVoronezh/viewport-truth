import { Directive, DestroyRef, effect, inject, input, signal, type Signal } from "@angular/core";
import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types.js";
import { createViewportTruthStore } from "./core/engine.js";

/**
 * Usage:
 * <div viewportTruth [vtOptions]="{...}" (vtChange)="onSnap($event)"></div>
 *
 * This directive exposes a Signal via `vt()` and also can emit changes through `vtChange`.
 */
/**
 * Angular directive that exposes a reactive viewport snapshot as a {@link Signal}.
 *
 * The directive creates an internal viewport-truth store and keeps the signal updated.
 * Access the latest snapshot via {@link ViewportTruthDirective.vt}.
 *
 * @example
 * <!-- Template: read the signal -->
 * <div viewportTruth #vt="viewportTruth">
 *   <pre>{{ vt.vt()() | json }}</pre>
 * </div>
 *
 * @example
 * <!-- Template: pass options -->
 * <div
 *   viewportTruth
 *   [vtOptions]="{
 *     stableDelayMs: 200,
 *     keyboardRatio: 0.7,
 *     keyboardMinDeltaPx: 140,
 *     trustVisualViewportUnderZoom: true
 *   }"
 *   #vt="viewportTruth"
 * >
 *   <pre>{{ vt.vt()() | json }}</pre>
 * </div>
 */
@Directive({
    selector: "[viewportTruth]",
    standalone: true,
    exportAs: "viewportTruth",
})
export class ViewportTruthDirective {
    private destroyRef = inject(DestroyRef);

    /**
     * Configuration options passed to the underlying viewport-truth store.
     *
     * Note: in the current implementation the store is created once in the constructor,
     * so changes to `vtOptions` after initialization will not re-create the store.
     *
     * @param - Bound by Angular `input()`. (No direct call-site parameter.)
     *
     * @example
     * <div viewportTruth [vtOptions]="{ stableDelayMs: 250 }"></div>
     */
    vtOptions = input<ViewportTruthOptions | undefined>(undefined);

    private _vt = signal<ViewportTruthSnapshot | null>(null);

    /**
     * Returns a  readonly {@link Signal} with the latest viewport snapshot.
     *
     * @returns A readonly signal of {@link ViewportTruthSnapshot | null}. `null` until the first update runs.
     *
     * @example
     * <div viewportTruth #vt="viewportTruth">
     *   <pre>{{ vt.vt()() | json }}</pre>
     * </div>
     */
    vt(): Signal<ViewportTruthSnapshot | null> {
        return this._vt.asReadonly();
    }

    constructor() {
        const store = createViewportTruthStore(this.vtOptions());

        const unsub = store.subscribe(() => this._vt.set(store.getSnapshot()));

        this.destroyRef.onDestroy(() => {
            unsub();
            store.destroy();
        });

        effect(() => {
            void this._vt();
        });
    }
}
