### Svelte

Use the `viewportTruth` store-like helper.

```svelte
<script lang="ts">
  import { viewportTruth } from "viewport-truth/svelte";
  const v = viewportTruth();
</script>

<div style="padding:12px;border:1px solid #ddd">
  {#if $v}
    <div>Visible: {$v.width}×{$v.height}</div>
    <div>Keyboard: {$v.isKeyboardOpen} · Stable: {$v.isStable}</div>
  {/if}
</div>

```

If this library helps, you can [support development](https://boosty.to/antonvoronezh/donate).



