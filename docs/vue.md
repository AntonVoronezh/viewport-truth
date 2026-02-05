### Vue 3

Use the `useViewportTruth` composable.

```html
<script setup lang="ts">
    import { computed } from "vue";
    import { useViewportTruth } from "viewport-truth/vue";

    const v = useViewportTruth();
    const label = computed(() =>
            v.value
                    ? `Visible: ${v.value.width}×${v.value.height} · Keyboard: ${v.value.isKeyboardOpen}`
                    : "SSR…"
    );
</script>

<template>
    <div style="padding: 12px; border: 1px solid #ddd;">
        {{ label }}
    </div>
</template>


```

If this library helps, you can [support development](https://boosty.to/antonvoronezh/donate).


