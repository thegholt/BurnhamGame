# AGENTS.md

## Cursor Cloud specific instructions

This repository is **Prime Minister Burnham: Find the Money**, a single-page, client-only
web game built with Vite + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion. There is
no backend, database, or external service — everything runs in the browser.

### Services

There is exactly one service: the Vite dev server for the React app.

| Task  | Command         | Notes |
|-------|-----------------|-------|
| Run   | `npm run dev`   | Vite dev server on `http://localhost:5173`. Use `npm run dev -- --host` to expose on the network. |
| Build | `npm run build` | Runs `tsc -b` (type-check) then `vite build`. This is also the de-facto type/lint gate. |
| Preview | `npm run preview` | Serves the production build from `dist/`. |

### Non-obvious notes

- There is **no separate lint or test script** in `package.json`. `npm run build` is the
  type-check/quality gate (it runs `tsc -b` before bundling). Don't look for `npm run lint`
  or `npm test` — they don't exist unless added.
- Tailwind v4 is wired through the Vite plugin (`@tailwindcss/vite`) and `@import "tailwindcss"`
  in `src/index.css`. There is **no** `tailwind.config.js` / `postcss.config.js`; theme tokens
  live in the `@theme { ... }` block of `src/index.css`.
- The game flow lives entirely in `src/App.tsx`: opening briefing → budget screen (random spending
  commitment + department cut cards + tax measure cards) → "Deliver Budget" Treasury Report. The
  "Deliver Budget" button is only enabled once selected tax revenue + selected cuts reach the active
  commitment cost.
