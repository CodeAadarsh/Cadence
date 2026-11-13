# Cadence

A calm, Sunsama-inspired daily planner. Plan your day with intention, protect
your focus with a built-in timer, and close each day with a shutdown ritual that
carries unfinished work forward.

Built with **Next.js 16** (App Router + Turbopack), **Supabase** (Postgres, Auth,
RLS), **Kokonut UI** components, **BKlit** charts, and **Motion** for animation.

---

## Features

| Area | What it does |
| --- | --- |
| **Today** | A single focused list for one day. Inline add, drag-to-reorder, estimates, priorities, channel colors, live progress bar. |
| **Week** | Seven-column board with cross-day drag & drop. Per-day task counts and planned time. |
| **Backlog** | Everything unscheduled, filterable by channel. Pull work into today or tomorrow in one click. |
| **Task detail** | Slide-over with notes, subtasks, channel/priority/estimate/date controls, and a live focus timer that rolls up into actual time. |
| **Analytics** | BKlit charts: focus-over-time area chart, planned-vs-actual bars, time-by-channel donut, and KPI sparklines over a 14-day window. |
| **Shutdown ritual** | A guided end-of-day flow: review what you finished, decide where each unfinished task goes (tomorrow / backlog / keep), and leave a note for tomorrow. |
| **Onboarding** | New accounts are auto-seeded with starter channels and a guided first day. |
| **Save for later** | Slack-style bookmarking. Flag any task and it collects in `/saved`, grouped into *In progress / Later / Completed*, with a live count in the sidebar. |
| **Command palette** | `⌘K` / `Ctrl+K` anywhere: quick-capture a task to today or the backlog, search tasks by title, or jump to any view or channel. |
| **Channel bookmarks** | Pin links and notes to a channel (or the global backlog) as chips — specs, dashboards, reminders, one click away. |
| **In-app guide** | `/guide` — a full walkthrough covering every feature, with worked scenarios for office work, personal goals and home chores. |

Dark mode, scroll-reveal landing page, and optimistic UI throughout.

---

## Getting started

### Prerequisites

- Node.js 20+ (22+ recommended — `@supabase/supabase-js` warns on 20)
- [pnpm](https://pnpm.io/) 10+
- Docker (for the local Supabase stack)

### 1. Install

```bash
pnpm install
```

### 2. Start Supabase locally

```bash
pnpm db:start
```

This boots Postgres, Auth, Storage and Studio, and applies the migration in
`supabase/migrations/`.

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in the values printed by `pnpm db:start`:

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | e.g. `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the anon / publishable key |
| `SUPABASE_SECRET_KEY` | service-role key — **server only**, never prefix with `NEXT_PUBLIC` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in dev, your domain in production |

### 4. Run

```bash
pnpm dev
```

Open <http://localhost:3000>, create an account, and Cadence will seed your first
day automatically.

### 5. (Optional) Seed demo data

To fill an existing account with channels, a backlog and ~2 weeks of history so
the analytics view has something to show:

```bash
SEED_EMAIL=you@example.com pnpm db:seed
```

---

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:start` / `db:stop` | Start/stop the local Supabase stack |
| `pnpm db:reset` | Drop and re-apply migrations |
| `pnpm db:seed` | Seed demo data into an existing account |

---

## Deploying to Vercel

1. **Create a Supabase project** at [supabase.com](https://supabase.com) and push
   the schema:

   ```bash
   pnpm supabase link --project-ref <your-project-ref>
   pnpm supabase db push
   ```

2. **Import the repo into Vercel.** The framework preset (Next.js) and build
   command (`next build`) are detected automatically.

3. **Set environment variables** in Vercel → Settings → Environment Variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key>
   SUPABASE_SECRET_KEY=<service role key>
   NEXT_PUBLIC_SITE_URL=https://<your-domain>
   ```

4. **Lock it down to a single user (optional).** Cadence has no admin role —
   every account is equal and row-level security isolates each user's data. But
   signup is open by default. After creating your own account, go to Supabase →
   Authentication → Providers → Email and switch off **"Allow new users to sign
   up"**. Nobody else can then register.

5. **Point Supabase Auth at your domain.** In the Supabase dashboard →
   Authentication → URL Configuration, set the Site URL to your Vercel domain and
   add `https://<your-domain>/auth/callback` to the redirect allow-list.

6. **Deploy.** Every route is server-rendered on demand (auth lives in cookies),
   so no extra caching configuration is required.

---

## Architecture notes

- **Dates are local, not UTC.** Days are keyed by `toDateKey()` in
  `src/lib/format.ts`, which formats the *local* `YYYY-MM-DD`. Any seed or query
  that builds date keys must use the same helper, or "Today" will look empty
  across timezone boundaries.
- **Optimistic lists.** `useTaskList` (Today, Backlog) and `WeekBoard` keep local
  state and re-sync from the server by comparing a derived `signature` string
  during render, so a server refresh never clobbers an in-flight edit.
- **dnd-kit needs stable ids.** Every `DndContext` is given an explicit `id`
  (`today-board`, `backlog-board`, `week-board`). Without it, dnd-kit's
  auto-incrementing `aria-describedby` differs between server and client and
  triggers a hydration mismatch.
- **Row Level Security everywhere.** Each table is scoped to `auth.uid()`; server
  actions call `requireUser()` and additionally filter on `user_id`.
- **Timer rollup.** `stopTimer` only adds to `actual_minutes` for entries of 30s
  or longer, so accidental starts don't pollute analytics.
- **Shutdown is idempotent.** `completeShutdown` upserts `daily_plans` on
  `(user_id, date)`; `onboardIfNeeded` flips `profiles.onboarded` *before*
  inserting seed rows so concurrent loads can't double-seed.
- **Vendored charts.** `src/components/charts/**` comes from the BKlit shadcn
  registry and is excluded from linting — regenerate rather than hand-edit.

---

## Project layout

```
src/
├── app/
│   ├── (app)/            # Authenticated shell: today, week, backlog, saved, analytics, guide, settings
│   ├── (auth)/           # Login / signup
│   ├── auth/callback/    # Supabase OAuth + email confirmation handler
│   └── page.tsx          # Marketing landing page
├── components/
│   ├── analytics/        # BKlit chart wrappers
│   ├── app/              # Sidebar, shell, user menu, channel dialog, command palette
│   ├── bookmarks/        # Channel bookmark bar + editor dialog
│   ├── charts/           # Vendored BKlit registry (do not hand-edit)
│   ├── guide/            # In-app walkthrough
│   ├── saved/            # Saved-for-later view
│   ├── settings/         # Profile + channel management
│   ├── tasks/            # Task item, detail sheet, add form, shared list hook
│   ├── today/            # Today view + shutdown ritual
│   ├── week/             # Week board, day columns, cards
│   └── ui/               # Kokonut UI / shadcn primitives
├── lib/
│   ├── actions/          # Server actions (tasks, subtasks, time, shutdown, …)
│   ├── data/             # Server-only read helpers
│   └── supabase/         # Browser, server and proxy clients
└── proxy.ts              # Next 16 Proxy (formerly Middleware) — session refresh + route guard
```
