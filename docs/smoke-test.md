# Smoke test (clean environment)

This verifies the Quick Start code runs end-to-end in a fresh project.

## 1) Create a fresh project

```bash
mkdir vt-smoke && cd vt-smoke
npm init -y
npm i viewport-truth vite
npm pkg set type=module
```

## 2) Create index.html
```html
<!doctype html>
<html>
  <body>
    <pre id="out">loading…</pre>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

## 3) Create main.js
```js
import { createViewportTruth } from "viewport-truth/vanilla";

const out = document.getElementById("out");
const vt = createViewportTruth();

vt.subscribe((v) => {
    out.textContent = JSON.stringify(v, null, 2);
});
```

## 4) Run
```bash
npx vite
# if you want to open from your phone on the same Wi‑Fi:
# npx vite --host
```

Open the URL on mobile (or device emulator) and focus an input to see `isKeyboardOpen` change.

If this library helps, you can [support development](https://boosty.to/antonvoronezh/donate).
