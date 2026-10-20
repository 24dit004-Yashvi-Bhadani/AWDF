# Practical 8: Performance Optimization and Lazy Loading in React

This practical applies route-based code splitting to the Practical 6 Task Manager frontend. The Home route is available from the initial bundle; Projects, Contact, Tasks, and Not Found are loaded only when their routes are visited. The Tasks page separately lazy-loads its Chart.js visualization only after tasks are present.

## Run the application

Prerequisites: Node.js/npm, MongoDB, and a valid `backend/.env` containing `MONGO_URL`.

1. Start MongoDB.
2. In a terminal, start the API:

   ```powershell
   cd Practical8/backend
   npm install
   npm run dev
   ```

   The API listens on `http://localhost:5000`.

3. In another terminal, start the React app:

   ```powershell
   cd Practical8/frontend
   npm install
   npm run dev
   ```

4. Open the Vite URL printed in the frontend terminal. Use the navigation to visit `/`, `/projects`, `/contact`, and `/tasks`. The Tasks route needs the API and MongoDB; Projects fetches public repository data from GitHub.

## Verify route chunks and measure

Run a production build from `frontend`:

```powershell
npm run build
```

Vite prints each emitted JS/CSS file and its minified size. The production entry file is the initial application bundle. Files generated for the Project and Contact route imports are separate chunks; the Chart.js chunk is fetched only when the Tasks route renders the chart. Keep the browser Network tab open and:

1. Select **Disable cache** and **Slow 3G**, then load `/`.
2. Filter requests by **JS**. Record the entry bundle's transferred size and load duration; Project, Contact, and chart chunks should not have been requested.
3. Visit `/projects`, then `/contact`, then `/tasks` with at least one task. Confirm each route chunk is requested on first visit and cached on subsequent visits. The task chart chunk should only be requested when the chart appears.
4. Record total JS transferred and load duration for the first page load and for each route visit. Use the same browser, cache setting, and throttle when comparing runs.
5. The fallback waits 300 ms before appearing. To see it reliably, keep Slow 3G enabled or throttle the route chunk in DevTools. Fast loads skip the fallback instead of flashing it.

### Bundle comparison

The original Practical 8 source did not build: Vite could not resolve the imported `./pages/Projects` file (the actual source was `Project.jsx`). The pre-existing `dist` output was stale, so it was excluded. To get a valid comparison, I built a temporary baseline entry using the same repaired routes and dependencies, but with every route imported eagerly, then compared it with the lazy-route build. These are local production-build measurements; byte values may vary slightly with dependency versions.

| Measurement | Before route splitting | After route splitting |
| --- | --- | --- |
| Initial JS bundle (minified) | 239.51 kB (76.60 kB gzip) | 235.87 kB (75.65 kB gzip) |
| Browser JS transfer on `/` | 76,083 bytes; 60 ms | 75,135 bytes; 46 ms |
| Route JS chunks | Included in initial JS | Project 1.49 kB (1,060 bytes transferred), Contact 0.44 kB (746 bytes), Tasks 3.52 kB (1,681 bytes), minified |
| Chart JS chunk | Deferred from route baseline | 158.42 kB (55.04 kB gzip; 54,822 bytes transferred), requested only when a task chart renders |

The browser measurements are one unthrottled localhost preview run (resource transfer size and request duration), not a Slow 3G result; request durations are especially environment-dependent. The Projects, Contact, and Tasks/Chart transfer figures were captured on their first visit; the chart test used one mock task so the API/database were not needed. Repeat the Network-tab procedure with Slow 3G for report-quality timing. In this app the route modules are small, so route splitting reduces initial gzip by about 0.95 kB; the much larger Chart.js payload is the substantial deferred transfer. Total code may increase slightly due to chunk/runtime overhead.

An initial bundle is downloaded as part of the first page load and contains the code needed to start the app. A lazy chunk is downloaded only when its dynamic import is rendered, such as when the matching route is first visited. Splitting defers work the user does not immediately need, improving initial loading and responsiveness even if the user later visits every page and downloads approximately the same overall application code.

Lazy loading can be counterproductive for a very small app, for components used on nearly every visit, or where extra requests and loading states outweigh the bytes saved. Consider route frequency, chunk size, and measured network conditions rather than splitting every component.

## React DevTools Profiler check

To inspect the app, open **React DevTools → Profiler**, start recording, and click **Dark Mode**. In the original component layout, changing theme state in `App` also re-rendered the static intro subtree even though it did not use the theme. The intro state now lives inside a memoized `IntroSection`, so the dark-mode update no longer needs to re-render that subtree. Stop recording and compare the flamegraph; the IntroSection should not have a render caused solely by the theme toggle. The memoized navigation and route container likewise avoid parent-only renders while still responding to router context changes.

## Implementation details

- `/projects`, `/contact`, and `/tasks` use `React.lazy()` and share a `Suspense` boundary with an accessible spinner fallback. Not Found is also lazy-loaded.
- The fallback appears only after 300 ms, preventing a brief flash on fast connections.
- The Tasks page imports its Chart.js visualization with a second `React.lazy()` boundary. Chart.js is not downloaded on Home, Projects, or Contact.
- Legacy `/Project` and `/Contect` URLs redirect to their lowercase routes.

## Practical 9: Task management and caching

Run the backend and frontend from their existing project folders:

```powershell
cd Practical9\backend
npm start
```

```powershell
cd Practical9\frontend
npm run dev
```

The backend requires MongoDB and `backend\.env` with `MONGO_URL`. The task board is at `/tasks`; create and edit tasks at `/tasks/add` and `/tasks/:id`.

### Task API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/tasks` | Read tasks from `all_tasks` cache or MongoDB |
| POST | `/tasks` | Create a task |
| GET | `/tasks/:id` | Read one task |
| PUT | `/tasks/:id` | Update task fields; drag-and-drop sends only `priority` |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/cache/stats` | Return cache hit/miss totals and whether `all_tasks` is cached |

### Demonstrate the cache

Use Postman or another HTTP client against `http://localhost:5000`:

1. `DELETE /tasks/<an-existing-id>` (or create/update a task) to invalidate `all_tasks`.
2. `GET /tasks` — this is a cache miss and loads MongoDB; `/cache/stats` shows the miss count and `allTasksCached: true`.
3. Repeat `GET /tasks` — this is a cache hit; the hit count increases.
4. Create a task, edit a task, drag a task to another priority, or delete a task, then request `GET /tasks` again to see a fresh database read after invalidation.

The board supports title/description search, frontend-only filters, completion toggles, drag-and-drop between priority columns, and dragging a card into the delete zone. Normal deletion asks for confirmation.
