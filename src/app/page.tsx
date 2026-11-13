import Link from "next/link";
import { ArrowRight, BarChart3, CalendarRange, Timer } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/landing/reveal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/data/user";

const FEATURES = [
  {
    icon: CalendarRange,
    title: "Plan your day",
    body: "Pull work into today, estimate it honestly, and drag it into the order you'll actually do it.",
  },
  {
    icon: Timer,
    title: "Focus & track",
    body: "Single-task with a built-in timer. See planned vs. actual time without any busywork.",
  },
  {
    icon: BarChart3,
    title: "Reflect weekly",
    body: "A calm analytics view shows your focus, completion rate, and where your time really goes.",
  },
];

export default async function Landing() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm">
                <Link href="/today">Open Cadence</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-70"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 0%, color-mix(in oklab, var(--primary) 22%, transparent) 0%, transparent 70%)",
          }}
        />

        {/* Hero */}
        <section className="mx-auto w-full max-w-3xl px-5 pb-10 pt-20 text-center sm:pt-28">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              A calm daily planner, inspired by deliberate work
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Design your day, one deliberate task at a time.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Cadence helps you plan with intention, protect your focus, and end
              each day knowing exactly what you accomplished.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild size="lg" className="h-11 gap-2">
                <Link href={user ? "/today" : "/signup"}>
                  {user ? "Open Cadence" : "Start for free"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              {!user && (
                <Button asChild variant="outline" size="lg" className="h-11">
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </Reveal>
        </section>

        {/* Product preview */}
        <section className="mx-auto w-full max-w-4xl px-5">
          <Reveal delay={0.2}>
            <div className="rounded-2xl border bg-gradient-to-b from-muted/60 to-background p-2 shadow-xl">
              <PreviewCard />
            </div>
          </Reveal>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-5xl px-5 py-20">
          <div className="grid gap-5 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="h-full rounded-xl border bg-card p-5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-4.5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>Built with Next.js, Supabase, Kokonut UI &amp; BKlit.</p>
        </div>
      </footer>
    </div>
  );
}

function PreviewCard() {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const rows = [
    { title: "Draft Q3 planning doc", color: "#6366f1", est: "1h", done: false },
    { title: "Design the analytics schema", color: "#8b5cf6", est: "1h30", done: false },
    { title: "Review open pull requests", color: "#6366f1", est: "30m", done: true },
    { title: "Midday walk", color: "#f97316", est: "30m", done: false },
  ];
  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">{weekday}</p>
          <p className="text-xs text-muted-foreground">
            {greeting} · {monthDay}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Today
        </span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 rounded-full bg-primary" />
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {rows.map((r) => (
          <li
            key={r.title}
            className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5"
          >
            <span
              className={`flex size-5 items-center justify-center rounded-full border ${r.done ? "bg-primary" : ""}`}
            >
              {r.done && (
                <svg viewBox="0 0 24 24" className="size-3 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>
            <span
              className={`flex-1 text-sm ${r.done ? "text-muted-foreground line-through" : "font-medium"}`}
            >
              {r.title}
            </span>
            <span className="size-2.5 rounded-full" style={{ backgroundColor: r.color }} />
            <span className="text-xs text-muted-foreground">{r.est}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
