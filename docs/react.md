### React

Use the `useViewportTruth` hook.

```tsx
import { useViewportTruth } from "viewport-truth/react";

export function DebugViewport() {
    const v = useViewportTruth();

    if (!v) return null; 

    return (
        <div style={{ padding: 12, border: "1px solid #ddd" }}>
            <div>Visible: {v.width} × {v.height} (CSS px)</div>
            <div>Keyboard: {String(v.isKeyboardOpen)} · Stable: {String(v.isStable)}</div>
        </div>
    );
}

```

If this library helps, you can [support development](https://boosty.to/antonvoronezh/donate).

