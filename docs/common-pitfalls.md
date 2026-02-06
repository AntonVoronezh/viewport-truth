## Common pitfalls

Most issues come down to lifecycle + subscriptions: accidentally creating multiple stores, keeping a stale callback, or forgetting to clean up. Here are the most common problems and how to fix them.

---

## 1) Recreating the store on every render due to unstable `options`

### Symptoms
- UI “flickers” or state appears to reset.
- Multiple subscriptions are created.
- Performance degrades during rerenders.

### Cause
Passing a new object literal each render:

```ts
useViewportTruth({ stableDelayMs: 200 }); // new object every render
```
### Fix
Make options referentially stable.

###  React

```ts
const options = useMemo(() => ({ stableDelayMs: 200 }), []);
const snap = useViewportTruth(options);
```

(For other frameworks, keep options static during the component/action/directive lifetime unless you intentionally want to recreate the store.)


## 2) Resource leaks: forgetting destroy() / unsubscribe()
**Symptoms**
*    Events keep firing after navigation/unmount.
*    CPU/memory usage grows over time.
*    Duplicate callbacks (“why does onChange fire twice?”).

 **Cause**
 In “vanilla” usage (or outside framework lifecycle), cleanup is manual.

### Fix
Always call the unsubscribe function and destroy():

```ts
const vt = createViewportTruth();
const stop = vt.subscribe(console.log);

// later
stop();
vt.destroy();
```

## 3) SSR: snapshot is null on the server (code doesn’t expect it)
   **Symptoms**
*    SSR/hydration errors like “cannot read property … of null”.
*    Tests (jsdom-less) get null snapshots.

**Cause**

Server environments don’t have real viewport APIs, so the SSR snapshot is typically null.

### Fix
Guard null in UI and logic:

```ts
if (!snap) return null;
```
or:
```ts
snap?.keyboardOpen
```

## 4) Directives/actions: updating onChange / options doesn’t change behavior
   **Applies to:**

Solid `viewportTruthDirective`
Svelte `viewportTruthAction`
Vue `vViewportTruth`

**Symptoms**

* You update onChange or options, but the old callback/options are still used.
* It looks like options “didn’t apply”.

**Cause**

These integrations typically read configuration at mount/init time and do not recreate the store when params change (Svelte action has update(), but the store stays the same).

### Fix
* Treat options as static for the lifetime of the directive/action.
* Keep your callback stable, and read “current” values from your state inside it.
* If you truly need options to be reactive, the adapter must be changed to recreate the underlying store when options change.


## 5)  React Strict Mode (dev): double mount = double setup (in development)
**Symptoms**
*    In dev, initialization/subscriptions happen twice.
*    Looks like duplicated events.

**Cause**

   React Strict Mode intentionally double-invokes certain lifecycle paths in development to catch unsafe side effects.

### Fix
* Ensure cleanup is correct (unsubscribe + destroy).
* Verify behavior in production builds.
* Make options stable (see pitfall #1).


## 6)  Stale reads: taking a snapshot once and assuming it stays current
**Symptoms**
*    Logic works “sometimes”, then becomes inconsistent.
*    You keep using an old snapshot long after it changed.

**Cause**

   A snapshot is a point-in-time value; it won’t update unless you subscribe/use the framework adapter.

### Fix
* Use a subscription/hook/composable for live updates.
* Only use get() for one-off reads when you truly want a single measurement.


## 7)  “Nothing happens until I resize”: expecting an immediate non-null value
**Symptoms**

*    UI stays empty until the first viewport event.
*    Feels like it’s “not working” until something changes.
   
**Cause**

   Initial value may be null (SSR) and the first real snapshot arrives after mount + first update tick/event.

### Fix
* Render a safe null state (placeholder / nothing).
* If your integration allows it, read the current snapshot after mount; otherwise, wait for the first update.

**Quick checklist ✅**

1. Keep options stable (especially in React).
2. Always unsubscribe + destroy when cleanup isn’t automatic.
3. Handle SSR null safely.
4. Don’t assume directives/actions will react to updated options/onChange unless explicitly implemented.


If this library helps, you can [support development](https://boosty.to/antonvoronezh/donate).

