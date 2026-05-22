# Phase 2 — Frontend children hook + Parent Panel child management

**Status:** Phase 1 complete and committed. Ready to start Phase 2.

Goal: Children come from the DB. `CONFIG.children` array removed. Parent panel gets a Children tab.

## 2.1 — New API endpoint

`GET /children` — returns `[{ id, name, color, emoji, sort_order }]` for the family (requires `requireFamily`).

`POST /children`, `PUT /children/:id`, `DELETE /children/:id` — CRUD, requires `requireParent`.

## 2.2 — New `useChildren()` hook

`apps/dashboard/src/hooks/useChildren.js` — fetches `/children`, returns `{ children, loading }`. Provides the same shape as `CONFIG.children` today (`{ name, color, emoji }`).

## 2.3 — Replace `CONFIG.children` throughout frontend

9 components + all parent tabs switch from `CONFIG.children.map(...)` to `useChildren()`:
- `Routines.jsx`
- `ParentChoresTab.jsx`, `ParentApprovalsTab.jsx`, `ParentBucksTab.jsx`, `ParentMomStoreTab.jsx`, `ParentRoutinesTab.jsx`
- Loading states added where children list may not be ready

## 2.4 — Parent Panel: Children tab

New `ParentChildrenTab.jsx` — add/edit/remove children (name, color, emoji). Wired into `ParentPanel.jsx` tabs.

## 2.5 — config.js cleanup

Remove `children` array from `config.js`. Keep other config (weather, schedules, screenTime, etc.).

**Files to change (Phase 2):**
- `api/src/routes/children.js` (new)
- `api/src/index.js` (mount new route)
- `apps/dashboard/src/hooks/useChildren.js` (new)
- `apps/dashboard/src/components/ParentChildrenTab.jsx` (new)
- `apps/dashboard/src/components/ParentPanel.jsx`
- `apps/dashboard/src/components/Routines.jsx`
- `ParentChoresTab.jsx`, `ParentApprovalsTab.jsx`, `ParentBucksTab.jsx`, `ParentMomStoreTab.jsx`, `ParentRoutinesTab.jsx`
- `apps/dashboard/src/config/config.js`

## Verification

- `GET /children` returns Paige, Nolan, Jonah from DB
- Dashboard renders correctly with children from API (not config)
- Add/edit/remove child in Parent Panel → reflects in dashboard immediately

Also of note—30 minutes of screentime should be given by default at the start of each weekday, but it can be accumulated. 
