# Practical 8 — Before / After Performance Comparison

Both builds come from the **same source code** (Practical 8, including the
recharts statistics component). The only difference: *before* uses normal static
`import` statements, *after* uses `React.lazy(() => import(...))`.

## 1. Vite build output

### Before — static imports (single bundle)

```
dist/index.html                   0.89 kB │ gzip:   0.48 kB
dist/assets/index-DrQ1nQXI.css   13.76 kB │ gzip:   3.48 kB
dist/assets/index-B9XVZlLk.js   632.81 kB │ gzip: 188.39 kB
(!) Some chunks are larger than 500 kB after minification.
```

### After — React.lazy + Suspense (code-split)

```
dist/assets/Login-CD9bYxnf.js          1.98 kB │ gzip:   0.86 kB   ← /login only
dist/assets/Register-BxJpsFnk.js       2.10 kB │ gzip:   0.88 kB   ← /register only
dist/assets/Contact-D8FLK8Pw.js        3.98 kB │ gzip:   1.39 kB   ← /contact only
dist/assets/Tasks-BHE1L7vs.js          6.06 kB │ gzip:   2.16 kB   ← /tasks only
dist/assets/jsx-runtime-B-hcVAMW.js    8.55 kB │ gzip:   3.26 kB   ← shared, first load
dist/assets/index-D66AYV0K.js        229.62 kB │ gzip:  73.75 kB   ← main, first load
dist/assets/TaskStats-BXyFCY8n.js    381.58 kB │ gzip: 109.03 kB   ← only on "Show statistics"
```

## 2. JavaScript downloaded on first visit (Home page)

| | Before | After | Change |
|---|---|---|---|
| JS files requested | 1 | 2 | — |
| JS size (minified) | 632.81 kB | 238.17 kB | **−62.4 %** |
| JS size (gzip, over the wire) | 188.39 kB | 77.01 kB | **−59.1 %** |
| Build warning > 500 kB | yes | no | fixed |

## 3. Network tab — chunk loading verified

Recorded with `vite preview` on the after-build (Performance API resource list):

| Step | JS files loaded so far |
|---|---|
| Open `/` | `index.js`, `jsx-runtime.js` |
| Click **Contact** | + `Contact.js` |
| Click **Login** | + `Login.js` |
| Open **Tasks** → *Show statistics* | + `Tasks.js`, then `TaskStats.js` (recharts) |

Each chunk is requested exactly once, the first time its route is visited.

## 4. Load time (fill in from Chrome DevTools)

DevTools → Network → *Disable cache* ✔ → throttling **Slow 3G** → hard reload `/`.
Take 3 readings each; paste screenshots into `docs/screenshots/`.

| Reading | Before: DOMContentLoaded | Before: Load | After: DOMContentLoaded | After: Load |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| Avg | | | | |

Expected size of the effect: at Slow 3G (~50 KB/s effective), downloading the
gzipped JS alone takes roughly 188 / 50 ≈ **3.8 s** before vs 77 / 50 ≈ **1.5 s** after.

On un-throttled localhost both load in ~25 ms, which is why throttling is required to
see the difference (and to see the Suspense fallback at all).

## 5. Unnecessary re-render (React DevTools Profiler)

**Found:** typing one character in the *Task Title* input re-rendered `TaskList`
and every task card, although the list data had not changed. Cause: `formData` state
lives in `Tasks`, so every keystroke re-renders `Tasks`, and the `onEdit` / `onDelete` /
`onToggle` handlers were new function objects each time.

**Fix:** `TaskList` wrapped in `React.memo`; handlers (`fetchTasks`, `showSuccess`,
`handleEdit`, `handleDelete`, `handleToggleCompleted`) wrapped in `useCallback`.
In the Profiler, `TaskList` now shows *"Did not render"* during typing.

## 6. Analysis

- **Initial bundle vs lazy chunk:** the initial bundle is downloaded and parsed before
  anything appears on screen; a lazy chunk is fetched only when React first renders that
  route (or, for TaskStats, when the button is clicked).
- **Why it feels faster even though total code is the same:** the user only waits for
  the code of the page they are looking at. Code for other pages arrives later, in small
  pieces, while the user is already interacting — and pages never visited are never
  downloaded.
- **When it is not worth it:** very small apps (a few kB per route) — each extra chunk is
  another HTTP request plus a loading state, which can cost more than it saves. Pages that
  almost every user visits immediately (like Home here) should stay in the main bundle.
