# Practical 8 — Performance Optimization and Lazy Loading in React

**Student:** D25CS118 · **Subject:** Advanced Web Development Frameworks (ITUE301)

Continues from **Practical 7** (Task Manager with JWT auth). The backend is unchanged;
this practical optimizes the React frontend.

📄 **Before/after comparison:** [docs/performance.md](docs/performance.md)

## Run locally

```bash
npm install
cp .env.example .env        # set JWT_SECRET
npm run server              # Express :5000 (MongoDB must be running)
npm run dev                 # React :5173
```

To test the optimized production bundle:

```bash
npm run build               # see the separate chunk files in the output
npm run preview             # serves dist/ on :4173
```

## What changed

| File | Change |
|---|---|
| `src/App.jsx` | `Tasks`, `Contact`, `Login`, `Register` loaded with `React.lazy()`; one `<Suspense>` around `<Routes>` only. `Home` stays a static import (landing page). |
| `src/components/PageLoader.jsx` | Suspense fallback (spinner + skeleton). Hidden for the first 300 ms so it never flickers on fast connections. |
| `src/components/ChunkErrorBoundary.jsx` | Catches a failed chunk download and shows a Retry button instead of a blank screen. |
| `src/components/TaskStats.jsx` | New charts (recharts). Lazy-loaded from Tasks only when **Show statistics** is clicked — the heavy-component assignment. |
| `src/components/Tasks.jsx` | `React.memo(TaskList)` + `useCallback` handlers — fixes the re-render found with the Profiler. |

## Results

| | Before | After |
|---|---|---|
| Initial JS (minified) | 632.81 kB | **238.17 kB** (−62 %) |
| Initial JS (gzip) | 188.39 kB | **77.01 kB** (−59 %) |
| Chunks | 1 | 7 (main, shared runtime, 4 routes, charts) |

## Demo for evaluation

1. `npm run build && npm run preview`
2. DevTools → Network → filter **JS** → throttle **Slow 3G**.
3. Load `/` — only `index-*.js` and `jsx-runtime-*.js`.
4. Click **Contact** — the skeleton fallback appears, then `Contact-*.js` arrives.
5. Log in, open **Tasks**, click **Show statistics** — `TaskStats-*.js` (recharts) loads only now.
