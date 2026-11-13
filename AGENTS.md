<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-rules -->

## UI component registries

This project installs UI from two shadcn registries, configured in `components.json`:

- `@kokonutui` -> https://kokonutui.com — animated/interactive React components (Tailwind + Motion).
- `@bklit` -> https://bklit.com — charts & data-visualization (d3 + Motion).

Rules:
- Before hand-building an animated/interactive component, check Kokonut UI first:
  https://kokonutui.com/llms.txt lists every component with a one-line description.
- Before hand-building a chart, check BKlit: https://bklit.com/llms.txt.
- Install with the shadcn CLI, never by pasting source:
  - `pnpm dlx shadcn@latest add @kokonutui/<name>`
  - `pnpm dlx shadcn@latest add @bklit/<name>`
  Components land under `src/components/` and their dependencies install automatically.
- Installed components are project code — edit them in place rather than wrapping them.
- Any Kokonut docs page is available as Markdown by adding `.md` to its URL.

## Stack notes

- Next.js 16 (App Router, Turbopack). Middleware lives in `src/proxy.ts` (renamed from middleware).
- `cacheComponents` is intentionally OFF (see `next.config.ts`) so Supabase cookie auth stays correct.
- Supabase local dev: `pnpm supabase start` / `pnpm supabase db reset`. Studio: http://127.0.0.1:54323.
- Regenerate DB types: `pnpm supabase gen types typescript --local > src/lib/supabase/database.types.ts`.
- Env in `.env.local` (keys use the new `sb_publishable_` / `sb_secret_` format).

<!-- END:project-rules -->
