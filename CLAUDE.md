# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Bug Diary

Full-stack bug tracking app with:
- `frontend/`: React + Vite + Tailwind UI
- `backend/`: Express API with file-based storage in `backend/bugs.json`

## Prerequisites

- Node.js (version 16 or higher)
- npm

## Quick Start

### Install deps

**Option 1: Individual installation**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**Option 2: Convenient root-level script**
```bash
npm run install-all
```

### Run development servers

**Option 1: Individual servers**

Backend (port 3001):
```bash
cd backend
npm run dev
```

Frontend (Vite dev server):
```bash
cd frontend
npm run dev
```

**Option 2: Both servers concurrently (from root)**
```bash
npm run dev
```

Open the frontend URL shown by Vite (commonly `http://localhost:3000`).

## Build / Lint

Frontend:
```bash
cd frontend
npm run lint    # ESLint with React rules, max 0 warnings
npm run build   # Vite production build
npm run preview # Preview production build
```

Backend:
```bash
cd backend
npm start   # Production server
```

**Root-level production start** (builds frontend, starts both):
```bash
npm start
```

## Architecture Notes

### Backend (`backend/server.js`)

- Express app with CORS and JSON middleware.
- Data file path: `backend/bugs.json`.
- On startup, creates `bugs.json` if missing.
- CRUD endpoints:
  - `GET /api/bugs`
  - `GET /api/bugs/:id`
  - `POST /api/bugs`
  - `PUT /api/bugs/:id`
  - `DELETE /api/bugs/:id`
  - `GET /api/health`
- Bug object fields used by API:
  - `id`, `title`, `description`, `errorMessage`, `solution`, `reason`, `tags`, `status`, `date`, `createdAt`, `updatedAt`
- Validation: `title` and `description` are required for create/update.

### Frontend (`frontend/src/App.jsx`)

- Uses axios with `API_BASE_URL = '/api'`.
- Main state:
  - `bugs`, `filteredBugs`, `selectedBug`, `editingBug`, `showForm`, search/filter state, `loading`.
- Filtering includes:
  - status
  - search by title, tags, and `reason`
- Component structure:
  - `BugCard` (list item)
  - `BugDetails` (sidebar)
  - `BugForm` (create/edit modal)
  - `SearchFilter` (search + status UI)

## Dev Conventions For Changes

- Keep data model consistent between frontend and backend; include `reason` where applicable.
- Preserve existing API routes unless explicitly changing contract.
- Prefer small, focused edits.
- If adding fields to bugs, update:
  - backend create/update handlers
  - frontend form
  - frontend filtering/search (if relevant)
  - detail/card display (if relevant)
- Use Tailwind classes already established in `frontend/src/index.css` and component files.

## Common Tasks

### Add a new bug field

1. Update backend `POST` and `PUT` payload handling.
2. Update frontend `BugForm` state + submit payload.
3. Show field in `BugDetails`/`BugCard` as needed.
4. Update filters/search in `App.jsx` if required.

### Change API base URL behavior

- App currently assumes frontend proxy handles `/api` (configured in `vite.config.js` to proxy to `localhost:3001`).
- Frontend runs on port 3000, backend on port 3001.
- If proxy config changes, update:
  - `frontend/vite.config.js` proxy rules
  - `frontend/src/App.jsx` API base constant

## Testing / Verification Checklist

After changes:

1. Backend runs without startup errors.
2. Frontend loads and can fetch bugs.
3. Create, edit, delete flows work.
4. Search + status filtering behave correctly.
5. Lint/build pass in frontend.

## Known Caveats

- Data is file-based (`bugs.json`), so no concurrency guarantees for high write volume.
- No formal automated tests currently; rely on manual CRUD and UI verification.
- App comes with sample bug entries for demonstration (React, CSS, Python examples).
- Root-level scripts use `concurrently` package to run multiple commands in parallel.

## Repo Root Structure

- `README.md`
- `backend/`
- `frontend/`
- `CLAUDE.md` (this file)
