# Dashboard Sidebar Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a permanent left sidebar to the dashboard with four nav items (Dashboard, Users, Events, Surveys), each backed by a real route, and rewrite the user list as a proper MUI table with pagination — removing the inline user list from the dashboard home.

**Architecture:** A new `DashboardLayout` component (AppBar + permanent `Drawer` + `Outlet`) becomes the single parent element for a `/dashboard` route with four children (`index`, `users`, `events`, `surveys`), protected once at the layout level instead of per-page. The existing user-list component is rewritten to use MUI `Table`/`TablePagination` wired to the backend's already-working `page`/`limit`/`total_records` contract. Events and Surveys are placeholder-only pages.

**Tech Stack:** React 19, React Router 7 (nested routes, `<Outlet/>`), MUI v7 (`@mui/material`), Redux Toolkit (existing `auth` slice/`authFetch`). No new dependencies.

**Spec:** Short design approved in conversation on 2026-11-20 (not saved as a separate file, per the brainstorming skill's small-change sizing). Recap: permanent `Drawer` + nested routes (chosen over a local-state tab toggle, to keep URLs real and consistent with the app's existing routing-based auth guard); MUI `TablePagination` for Previous/Next (chosen over a hand-rolled two-button pager, since it's standard MUI behavior); Events/Surveys ship as "Coming soon" placeholders only.

## Global Constraints

- MUI v7 (`@mui/material@^7.3.10`) components only; no new dependencies — `@mui/icons-material` is not installed, so nav icons use emoji, consistent with the existing stat-card style (📅 👥 📋).
- Backend contract is fixed and already working: `GET /bkms-api/v2/user-list` takes a 1-indexed `page` and `limit`, returns `{ data: { total_records, records } }`. Do not modify server code.
- Events and Surveys are placeholder-only ("Coming soon") in this plan — no backend, no real functionality.
- Dashboard home's stat values stay hardcoded at `0` — out of scope.
- `ProtectedRoute` wraps the whole `/dashboard` subtree once, at the layout level, not per child route.
- This repo has no test framework (`package.json` has no Jest/Vitest/RTL). Verification steps use `npm run lint` / `npm run build` for static checks, and manual `npm run dev` browser checks in place of automated tests.

## Review Focus

- Direct navigation / refresh on a nested route (e.g. `/dashboard/users`) must render the layout + page correctly, not just when reached by clicking a nav item.
- Pagination at the last page (partial final page, e.g. `total_records=36516` with `limit=50`) must not error or show a broken Next control.
- Changing rows-per-page must reset to page 1 and refetch with the new limit, not request an out-of-range page with the old page index.
- Rapid nav switching while a Users fetch is in-flight must not set state on an unmounted component or show stale results after navigating away and back.
- The Logout button, now shared across all four pages via the layout, must work identically from each of them, not just from the old single dashboard page.

---

### Task 1: DashboardLayout component

**Files:**
- Create: `src/components/layout/DashboardLayout.jsx`

**Interfaces:**
- Produces: default export `DashboardLayout` — no props. Renders the `AppBar` (logo + Logout button, logic moved from the current `DashboardPage.jsx`: `useState` for `logoutLoading`/`logoutError`, `useDispatch`, calls `authFetch(LOGOUT_URL, { method: 'POST' })` then `dispatch(logout())`), a permanent MUI `Drawer` (width `240`) with four nav entries — `{ label: 'Dashboard', path: '/dashboard', icon: '🏠' }`, `{ label: 'Users', path: '/dashboard/users', icon: '👥' }`, `{ label: 'Events', path: '/dashboard/events', icon: '📅' }`, `{ label: 'Surveys', path: '/dashboard/surveys', icon: '📋' }` — and a `<Box component="main">` wrapping `<Outlet />`.
- Consumes: `authFetch` from `../../utils/apiClient`, `logout` from `../../store/slices/authSlice`, `LOGOUT_URL` from `../../utils/constants`, `useLocation`/`Link`/`Outlet` from `react-router-dom`.
- Active nav item highlighted via `useLocation().pathname` matched against each entry's `path` (exact match for `/dashboard`, prefix match for the other three), passed as MUI `ListItemButton`'s `selected` prop.

- [ ] **Step 1: Implement `DashboardLayout.jsx`** per the Interfaces block above. Reuse the exact `AppBar`/logo/Logout markup and logic currently in `src/components/dashboard/DashboardPage.jsx:28-51` (the `onLogout` function and the `AppBar`/`Toolbar` JSX), moved here unchanged in behavior.

- [ ] **Step 2: Run `npm run lint`**
Run: `npm run lint`
Expected: no errors reported for the new file.

- [ ] **Step 3: Commit**
```bash
git add src/components/layout/DashboardLayout.jsx
git commit -m "feat: add dashboard sidebar layout"
```

---

### Task 2: Page content components (DashboardHome, EventsPage, SurveysPage)

**Files:**
- Create: `src/components/dashboard/DashboardHome.jsx`
- Create: `src/components/events/EventsPage.jsx`
- Create: `src/components/surveys/SurveysPage.jsx`

**Interfaces:**
- Produces: three default exports, each a no-props component.
  - `DashboardHome` — the `stats` array and stat-card `Grid` currently in `src/components/dashboard/DashboardPage.jsx:22-26,82-141` ("Welcome back" heading + the three stat `Card`s), with the logout `Alert` and `<UserPageLists />` removed (those move to the layout and to the Users route respectively).
  - `EventsPage` / `SurveysPage` — a centered `Box` with an MUI `Typography` heading ("Events" / "Surveys") and a one-line "Coming soon" description, matching each other's structure.

- [ ] **Step 1: Implement `DashboardHome.jsx`** — move the `stats` array and the `Container`/stat-card `Grid` markup out of `DashboardPage.jsx`, dropping the `AppBar`, the logout `Alert`, and `<UserPageLists />`.

- [ ] **Step 2: Implement `EventsPage.jsx`** with a "Coming soon" placeholder per the Interfaces block.

- [ ] **Step 3: Implement `SurveysPage.jsx`** with the same placeholder pattern for Surveys.

- [ ] **Step 4: Run `npm run lint`**
Run: `npm run lint`
Expected: no errors in the three new files.

- [ ] **Step 5: Commit**
```bash
git add src/components/dashboard/DashboardHome.jsx src/components/events/EventsPage.jsx src/components/surveys/SurveysPage.jsx
git commit -m "feat: add dashboard home and placeholder module pages"
```

---

### Task 3: Router restructure

**Files:**
- Modify: `src/router.jsx`
- Delete: `src/components/dashboard/DashboardPage.jsx` (fully superseded by Tasks 1–2; no remaining references after this task)

**Interfaces:**
- Consumes: `DashboardLayout` (Task 1), `DashboardHome`, `EventsPage`, `SurveysPage` (Task 2), the existing `UserPageLists` default export (used directly as the `/dashboard/users` route element — no wrapper needed), existing `LoginPage`, existing `ProtectedRoute`/`PublicRoute`.
- Produces: route tree —
  ```
  "/"                -> <Navigate to="/login" />
  "/login"           -> <PublicRoute><LoginPage/></PublicRoute>
  "/dashboard"       -> <ProtectedRoute><DashboardLayout/></ProtectedRoute>, children:
      index          -> <DashboardHome/>
      "users"        -> <UserPageLists/>
      "events"       -> <EventsPage/>
      "surveys"      -> <SurveysPage/>
  ```

- [ ] **Step 1: Modify `router.jsx`** — remove the `DashboardPage` import, add imports for `DashboardLayout`, `DashboardHome`, `EventsPage`, `SurveysPage`, `UserPageLists`. Replace the single `/dashboard` route entry with the parent route + `children` array shown in the Interfaces block above.

- [ ] **Step 2: Delete `src/components/dashboard/DashboardPage.jsx`** (no longer imported anywhere).

- [ ] **Step 3: Run `npm run build`**
Run: `npm run build`
Expected: build succeeds, no missing-import or unresolved-module errors.

- [ ] **Step 4: Manual verification via `npm run dev`**
Log in, then confirm:
  - `/dashboard` shows the sidebar + stat cards, with no user table.
  - Clicking "Users" navigates to `/dashboard/users` and renders a page (table content arrives fully in Task 4).
  - Clicking "Events" / "Surveys" shows their "Coming soon" pages.
  - Refreshing the browser while on `/dashboard/users` keeps you there (not redirected to `/login`) — confirms `ProtectedRoute` at the layout level still works with the persisted-auth token.
  - The Logout button in the shared `AppBar` works from all four pages.

- [ ] **Step 5: Commit**
```bash
git add src/router.jsx
git rm src/components/dashboard/DashboardPage.jsx
git commit -m "feat: wire dashboard sidebar routes, remove old single-page dashboard"
```

---

### Task 4: Users table with MUI pagination

**Files:**
- Modify: `src/components/user/userPageLists.jsx`

**Interfaces:**
- Consumes: `authFetch`, `USERLIST_URL` (unchanged), backend response shape `{ data: { total_records, records } }`.
- Produces: same default export `UserPageLists`, no props — used directly as the `/dashboard/users` route element (per Task 3).
- State additions: `page` (MUI convention, 0-indexed), `rowsPerPage` (default `50`), `totalRecords` (default `0`).
- Fetch sends `page: page + 1` (backend is 1-indexed) and `limit: rowsPerPage`; reads `data?.data?.total_records` into `totalRecords` and `data?.data?.records` into `userList` as today.

- [ ] **Step 1: Add pagination state and wire it into the existing fetch effect** in `userPageLists.jsx` — add `page`/`rowsPerPage`/`totalRecords` state; add both to the `useEffect` dependency array (alongside the existing `accessToken`, `userType`, `parentType`); change the `params` object's `page`/`limit` entries to use `page + 1` / `rowsPerPage`; set `totalRecords` from the response. Guard against stale responses from rapid page changes using an `ignore` flag set in the effect's cleanup function (standard React data-fetching-in-effect pattern), so a response for an abandoned page/route never overwrites newer state.

- [ ] **Step 2: Replace the plain `<table>` markup with MUI components** — `TableContainer`/`Table`/`TableHead`/`TableBody`/`TableRow`/`TableCell` for the same seven columns (User ID, MIS ID, BAPS ID, First/Middle/Last Name, Email), and add MUI `TablePagination` below the table with `component="div"`, `count={totalRecords}`, `page`, `onPageChange` (updates `page`), `rowsPerPage`, `onRowsPerPageChange` (updates `rowsPerPage` **and** resets `page` to `0`), `rowsPerPageOptions={[25, 50, 100]}`.

- [ ] **Step 3: Replace the plain-text loading/error placeholders** with MUI `CircularProgress` (loading) and MUI `Alert severity="error"` (error), matching the style already used elsewhere in the app (e.g. the logout button's spinner in `DashboardLayout`).

- [ ] **Step 4: Run `npm run lint`**
Run: `npm run lint`
Expected: pass.

- [ ] **Step 5: Manual verification via `npm run dev`**
On `/dashboard/users`, confirm:
  - The table renders with data on load.
  - Clicking the pagination's Next arrow loads a different set of rows (different `id` values than page 1) — covers the Review Focus item on pagination at a partial/last page by also checking the last page doesn't error.
  - Clicking Previous returns to the original rows.
  - Changing rows-per-page (e.g. to 25) resets to page 1 and shows 25 rows.
  - Switching to "Events" mid-fetch and back to "Users" doesn't throw a console warning or show stale data from the abandoned request.

- [ ] **Step 6: Commit**
```bash
git add src/components/user/userPageLists.jsx
git commit -m "feat: add MUI table and pagination to users list"
```
