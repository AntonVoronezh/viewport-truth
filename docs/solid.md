### SolidJS

Use the `createViewportTruth` primitive.

```tsx
import { createViewportTruth } from "viewport-truth/solid";

export function DebugViewport() {
    const v = createViewportTruth();

    return (
        <div style={{ padding: "12px", border: "1px solid #ddd" }}>
            {v() ? (
                <>
                    <div>Visible: {v()!.width}×{v()!.height}</div>
                    <div>Keyboard: {String(v()!.isKeyboardOpen)} · Stable: {String(v()!.isStable)}</div>
                </>
            ) : null}
        </div>
    );
}
```

If this library helps, you can [support development](https://boosty.to/antonvoronezh/donate).

