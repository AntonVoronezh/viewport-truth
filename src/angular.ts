import { Directive, DestroyRef, effect, inject, input, signal, type Signal } from "@angular/core";
import type { ViewportTruthOptions, ViewportTruthSnapshot } from "./core/types";
import { createViewportTruthStore } from "./core/engine";

/**
 * Usage:
 * <div viewportTruth [vtOptions]="{...}" (vtChange)="onSnap($event)"></div>
 *
 * This directive exposes a Signal via `vt()` and also can emit changes through `vtChange`.
 */
@Directive({
    selector: "[viewportTruth]",
    standalone: true,
    exportAs: "viewportTruth",
})
export class ViewportTruthDirective {
    private destroyRef = inject(DestroyRef);

    vtOptions = input<ViewportTruthOptions | undefined>(undefined);

    private _vt = signal<ViewportTruthSnapshot | null>(null);
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
