### Angular (17+)

Use the standalone `ViewportTruthDirective`.

```typescript
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ViewportTruthDirective } from "viewport-truth/angular";

@Component({
    selector: "app-viewport-debug",
    standalone: true,
    imports: [CommonModule, ViewportTruthDirective],
    template: `
    <div viewportTruth #vt="viewportTruth" style="padding:12px;border:1px solid #ddd;">
      <ng-container *ngIf="vt.vt()() as v">
        <div>Visible: {{ v.width }}×{{ v.height }}</div>
        <div>Keyboard: {{ v.isKeyboardOpen }} · Stable: {{ v.isStable }}</div>
      </ng-container>
    </div>
  `,
})
export class ViewportDebugComponent {}

```

If this library helps, you can [support development](https://boosty.to/antonvoronezh/donate).




