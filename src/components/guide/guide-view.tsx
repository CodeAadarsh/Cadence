"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  BarChart3,
  Bookmark,
  Briefcase,
  CalendarRange,
  Check,
  Clock,
  Command,
  Compass,
  Hash,
  Heart,
  Home,
  Inbox,
  Keyboard,
  Moon,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Sun,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  Callout,
  Demo,
  DemoTask,
  Kbd,
  Reveal,
  Step,
} from "./guide-primitives";

const SECTIONS = [
  { id: "start", label: "Day one", icon: Rocket },
  { id: "channels", label: "Channels", icon: Hash },
  { id: "loop", label: "The daily loop", icon: Compass },
  { id: "today", label: "Today", icon: Sun },
  { id: "detail", label: "Task detail & timer", icon: Timer },
  { id: "week", label: "Week board", icon: CalendarRange },
  { id: "backlog", label: "Backlog", icon: Inbox },
  { id: "saved", label: "Saved & bookmarks", icon: Bookmark },
  { id: "palette", label: "Command palette", icon: Command },
  { id: "shutdown", label: "Shutdown ritual", icon: Moon },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "scenarios", label: "Real scenarios", icon: Sparkles },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "privacy", label: "Your data", icon: Settings },
];

const CHANNELS = [
  { emoji: "💼", name: "Work", color: "#6366f1", use: "Meetings, email, reviews, admin — anything your employer owns." },
  { emoji: "🧠", name: "Deep Work", color: "#8b5cf6", use: "The one or two hard things a day that actually move your career." },
  { emoji: "🌱", name: "Personal", color: "#10b981", use: "Gym, reading, side projects, learning, appointments." },
  { emoji: "🏠", name: "Home", color: "#f97316", use: "Chores, errands, bills, repairs, groceries." },
  { emoji: "👥", name: "People", color: "#ec4899", use: "Calls, birthdays, replies you owe someone." },
];

export function GuideView({ firstName }: { firstName: string }) {
  const [activeId, setActiveId] = React.useState("start");

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="lg:flex lg:gap-10">
        {/* ---------------- sticky section nav ---------------- */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="sticky top-10 flex flex-col gap-0.5">
            <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Walkthrough
            </p>
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = activeId === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="guide-active"
                      className="absolute inset-0 rounded-lg bg-muted"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className="relative size-3.5 shrink-0" />
                  <span className="relative truncate">{s.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* ---------------- content ---------------- */}
        <div className="min-w-0 flex-1">
          <Hero firstName={firstName} />

          <Section id="start" icon={Rocket} eyebrow="Day one" title="Your first 10 minutes">
            <p>
              Cadence isn&apos;t a list you add to forever — it&apos;s a day you
              design. The whole system rests on one honest question each
              morning: <em>what can I actually finish today?</em>
            </p>
            <div className="mt-5">
              <Step n={1} title="Set up five channels">
                <p>
                  Channels are buckets of life. Don&apos;t make twenty — five is
                  plenty, and it keeps your analytics readable. Scroll to the
                  next section for the exact set I recommend.
                </p>
              </Step>
              <Step n={2} title="Brain-dump everything into the Backlog">
                <p>
                  Open <GuideLink href="/backlog">Backlog</GuideLink> and type
                  out every loose thread — office, home, personal. Don&apos;t
                  estimate, don&apos;t sort. Just empty your head. Fifteen to
                  forty items is normal.
                </p>
              </Step>
              <Step n={3} title="Pull 3–6 things into today">
                <p>
                  From the backlog, hit <Kbd>☀</Kbd> on the handful you&apos;ll
                  genuinely do. Everything else stays parked — that&apos;s the
                  point.
                </p>
              </Step>
              <Step n={4} title="Estimate each one">
                <p>
                  Give every task a time estimate. If today&apos;s total is
                  nine hours, you haven&apos;t planned a day — you&apos;ve
                  written a wish. Cut until it fits.
                </p>
              </Step>
              <Step n={5} title="Close the day properly">
                <p>
                  At night, hit <strong>Shut down</strong>. Review, carry the
                  leftovers forward, write one line to tomorrow-you. This is
                  the habit that makes the rest work.
                </p>
              </Step>
            </div>
            <Callout tone="warn" title="The one rule">
              <p>
                If a task has no estimate, it doesn&apos;t belong in today.
                Estimating is what turns a to-do list into a plan.
              </p>
            </Callout>
          </Section>

          <Section id="channels" icon={Hash} eyebrow="Structure" title="Channels: one bucket per life area">
            <p>
              Every task belongs to a channel. Channels drive the colour dots,
              the backlog filters, and the time-by-channel donut in Analytics —
              so the split you choose here is the split you&apos;ll see in your
              data.
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {CHANNELS.map((c, i) => (
                <Reveal key={c.name} delay={i * 0.05}>
                  <div className="flex h-full gap-3 rounded-xl border bg-card p-3.5">
                    <span className="text-xl leading-none">{c.emoji}</span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {c.use}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Callout tone="try" title="Try it now">
              <p>
                In the sidebar, hover <strong>CHANNELS</strong> and click the{" "}
                <Kbd>+</Kbd>. Create all five with the emoji and colours above.
                Takes two minutes and you only do it once.
              </p>
            </Callout>
            <Callout tone="tip" title="Why Work and Deep Work are separate">
              <p>
                Lumping them together hides the most important number you have:
                how much of your week was reactive (email, meetings) versus
                creative. Splitting them makes that visible in Analytics.
              </p>
            </Callout>
          </Section>

          <Section id="loop" icon={Compass} eyebrow="The method" title="Plan → Focus → Shut down">
            <p>
              Ten minutes of ritual a day. That&apos;s the entire system.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Sun, time: "Morning · 5 min", title: "Plan", body: "Pull from backlog into Today. Estimate honestly. Order the list so the hardest thing is first." },
                { icon: Timer, time: "All day", title: "Focus", body: "Start the timer on one task. Don't touch the others. Check things off as you go." },
                { icon: Moon, time: "Evening · 5 min", title: "Shut down", body: "Review what you finished, decide where leftovers go, leave a note. Then actually stop." },
              ].map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <div className="flex h-full flex-col rounded-xl border bg-card p-4">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <p.icon className="size-4" />
                    </div>
                    <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                      {p.time}
                    </p>
                    <p className="mt-0.5 font-semibold">{p.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>

          <Section id="today" icon={Sun} eyebrow="Core view" title="Today — the only screen that matters">
            <p>
              One day at a time. The progress bar at the top shows completed vs
              planned, plus total time committed — that number is your reality
              check.
            </p>
            <div className="mt-4">
              <Demo label="Today · Friday">
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="font-medium">2 of 5 done</span>
                  <span className="text-muted-foreground">4h 45m planned</span>
                </div>
                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-2/5 rounded-full bg-primary" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <DemoTask title="Draft the Q3 roadmap" color="#8b5cf6" channel="Deep Work" est="1h 30m" priority="high" />
                  <DemoTask title="Reply to the vendor thread" color="#6366f1" channel="Work" est="20m" />
                  <DemoTask title="Gym — push day" color="#10b981" channel="Personal" est="1h" saved />
                  <DemoTask title="Standup" color="#6366f1" channel="Work" est="15m" done />
                  <DemoTask title="Book the car service" color="#f97316" channel="Home" est="10m" done />
                </div>
              </Demo>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <Bullet><strong>Add fast</strong> — type in the box, pick a channel and estimate inline, hit Enter.</Bullet>
              <Bullet><strong>Reorder by dragging</strong> the handle on the left. Put the hard thing first.</Bullet>
              <Bullet><strong>Flags</strong> mark priority — red is high, amber medium.</Bullet>
              <Bullet><strong>Arrows in the header</strong> move between days, so you can plan tomorrow tonight.</Bullet>
              <Bullet><strong>The <Kbd>···</Kbd> menu</strong> holds move-to-backlog, schedule tomorrow, save for later and delete.</Bullet>
            </ul>
            <Callout tone="tip" title="Cap your day at ~6 hours of tasks">
              <p>
                A workday is never eight hours of focused work. Meetings,
                context switches and lunch eat the rest. Plan for six and
                you&apos;ll actually hit it.
              </p>
            </Callout>
          </Section>

          <Section id="detail" icon={Timer} eyebrow="Deep dive" title="Task detail, subtasks & the focus timer">
            <p>
              Click any task title to slide open its detail panel. This is where
              a vague task becomes a doable one.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FeatureCard icon={Check} title="Subtasks">
                Break &quot;Quarterly report&quot; into five concrete steps. The
                panel shows a live <em>2/5</em> counter so progress is visible
                before the task is done.
              </FeatureCard>
              <FeatureCard icon={Clock} title="Focus timer">
                Hit <strong>Start</strong> and it ticks live. Stop it and the
                minutes roll into <em>actual time</em> — which Analytics then
                compares against your estimate.
              </FeatureCard>
              <FeatureCard icon={Hash} title="Properties">
                Channel, priority, estimate and scheduled date — all editable
                from dropdowns without leaving the panel.
              </FeatureCard>
              <FeatureCard icon={Bookmark} title="Notes">
                A free-text field that autosaves on blur. Links, context,
                half-formed thoughts.
              </FeatureCard>
            </div>
            <Callout tone="try" title="Try it now">
              <p>
                Open any task → add two subtasks → hit <strong>Start</strong> →
                watch the clock run → <strong>Stop</strong>. You&apos;ve just
                logged your first real time entry.
              </p>
            </Callout>
            <Callout tone="tip" title="Timers under 30 seconds are ignored">
              <p>
                Accidental taps won&apos;t pollute your stats — only runs of 30
                seconds or longer count toward actual time.
              </p>
            </Callout>
          </Section>

          <Section id="week" icon={CalendarRange} eyebrow="Zoom out" title="Week board — spread the load">
            <p>
              Seven columns, Monday to Sunday, today highlighted. Each column
              shows its task count and total planned time, so an overloaded
              Wednesday is obvious at a glance.
            </p>
            <div className="mt-4">
              <Demo label="Week">
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                  {[
                    { d: "Mon", n: 4, t: "3h", today: false },
                    { d: "Tue", n: 3, t: "2h", today: false },
                    { d: "Wed", n: 7, t: "7h", today: false },
                    { d: "Thu", n: 2, t: "1h", today: false },
                    { d: "Fri", n: 5, t: "4h", today: true },
                    { d: "Sat", n: 2, t: "1h", today: false },
                    { d: "Sun", n: 1, t: "30m", today: false },
                  ].map((c) => (
                    <div
                      key={c.d}
                      className={cn(
                        "rounded-lg border p-2",
                        c.today ? "border-primary/40 bg-primary/5" : "bg-card",
                      )}
                    >
                      <p className={cn("text-[0.7rem] font-semibold", c.today && "text-primary")}>
                        {c.d}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                        {c.n} · {c.t}
                      </p>
                      <div className="mt-1.5 space-y-1">
                        {Array.from({ length: Math.min(c.n, 3) }).map((_, i) => (
                          <div key={i} className="h-3 rounded bg-muted" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Demo>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <Bullet><strong>Drag tasks between days</strong> — it saves instantly, no confirm step.</Bullet>
              <Bullet><strong>Add inline</strong> to any day with the small <Kbd>+</Kbd> at the bottom of a column.</Bullet>
              <Bullet><strong>Use it on Sunday evening</strong> to rough out the week, then refine each morning in Today.</Bullet>
            </ul>
            <Callout tone="tip" title="Spot the overload">
              <p>
                If one column reads <em>7h</em> while its neighbours read 1–2h,
                drag three tasks sideways. Thirty seconds of work saves a
                miserable Wednesday.
              </p>
            </Callout>
          </Section>

          <Section id="backlog" icon={Inbox} eyebrow="Capture" title="Backlog — the parking lot">
            <p>
              Anything with no date lives here. It&apos;s not a graveyard —
              it&apos;s the pool you plan from every morning.
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <Bullet><strong>Filter by channel</strong> by clicking a channel in the sidebar — perfect for &quot;show me only Home chores&quot;.</Bullet>
              <Bullet><strong>Two shortcut buttons</strong> on hover: <Kbd>☀</Kbd> schedule today, <Kbd>📅</Kbd> schedule tomorrow.</Bullet>
              <Bullet><strong>Review it weekly.</strong> Anything you&apos;ve skipped four weeks running isn&apos;t a task — delete it.</Bullet>
            </ul>
          </Section>

          <Section id="saved" icon={Bookmark} eyebrow="Slack-style" title="Save for later & channel bookmarks">
            <p>
              Two different kinds of saving, borrowed straight from Slack.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FeatureCard icon={Bookmark} title="Save for later (tasks)">
                Hit the bookmark icon on any task and it collects in{" "}
                <GuideLink href="/saved">Saved</GuideLink>, grouped into{" "}
                <em>In progress / Later / Completed</em>. The sidebar shows a
                live count. Use it as a shortlist that survives your daily plan.
              </FeatureCard>
              <FeatureCard icon={Hash} title="Channel bookmarks (links & notes)">
                On the Backlog, pin links and notes as chips — a Figma file, the
                shared grocery list, the Wi-Fi password. Scoped per channel, so
                Work bookmarks never clutter Home.
              </FeatureCard>
            </div>
            <div className="mt-4">
              <Demo label="Backlog · Home">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { e: "🛒", t: "Shared grocery list" },
                    { e: "🔧", t: "Plumber — 9876543210" },
                    { e: "📄", t: "Rent agreement PDF" },
                  ].map((b) => (
                    <span key={b.t} className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1 text-xs font-medium shadow-sm">
                      <span>{b.e}</span>
                      {b.t}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded-lg border border-dashed px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    + Add
                  </span>
                </div>
              </Demo>
            </div>
            <Callout tone="try" title="Try it now">
              <p>
                Go to <GuideLink href="/backlog">Backlog</GuideLink>, click{" "}
                <strong>Add a bookmark</strong>, and save one link you open
                every single week. Bare domains work — type{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">figma.com</code>{" "}
                and it becomes a proper link.
              </p>
            </Callout>
          </Section>

          <Section id="palette" icon={Command} eyebrow="Speed" title="The command palette">
            <p>
              Press <Kbd>⌘</Kbd><Kbd>K</Kbd> (or <Kbd>Ctrl</Kbd><Kbd>K</Kbd>)
              anywhere in the app. This is the single biggest speed-up
              available, and most people never use it.
            </p>
            <div className="mt-4">
              <Demo label="⌘K">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Search className="size-3.5 text-muted-foreground" />
                  <span className="text-sm">call the dentist</span>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Capture
                  </p>
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-2 py-1.5 text-sm">
                    <span className="text-primary">＋</span>
                    Add &quot;call the dentist&quot; to today
                    <span className="ml-auto text-xs text-muted-foreground">Enter</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground">
                    <Inbox className="size-3.5" />
                    Save &quot;call the dentist&quot; to backlog
                  </div>
                </div>
              </Demo>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <Bullet><strong>Quick capture</strong> — type a thought, press Enter, it&apos;s in today. Never lose an idea mid-meeting again.</Bullet>
              <Bullet><strong>Search</strong> — type two or more letters to find any task by title, across every day.</Bullet>
              <Bullet><strong>Jump</strong> — type &quot;week&quot;, &quot;analytics&quot;, or a channel name to navigate instantly.</Bullet>
              <Bullet><strong>Arrows + Enter</strong> to pick, <Kbd>Esc</Kbd> to dismiss.</Bullet>
            </ul>
            <Callout tone="tip" title="The capture habit">
              <p>
                When something lands in your head mid-task — &quot;I must renew
                the insurance&quot; — don&apos;t context-switch. Hit{" "}
                <Kbd>⌘</Kbd><Kbd>K</Kbd>, type it, send it to the backlog, carry
                on. Two seconds, zero disruption.
              </p>
            </Callout>
          </Section>

          <Section id="shutdown" icon={Moon} eyebrow="The keystone habit" title="The shutdown ritual">
            <p>
              At the end of the day, hit <strong>Shut down</strong> in the Today
              header. Four steps, about ninety seconds.
            </p>
            <div className="mt-4">
              <Step n={1} title="Review">
                <p>
                  What you finished, your completion rate, and time focused.
                  Seeing the list is the point — most days you did more than you
                  remember.
                </p>
              </Step>
              <Step n={2} title="Carry over">
                <p>
                  Every unfinished task gets one of three fates:{" "}
                  <strong>Tomorrow</strong>, <strong>Backlog</strong>, or{" "}
                  <strong>Keep</strong> (leave it on today). Nothing silently
                  rots.
                </p>
              </Step>
              <Step n={3} title="Reflect">
                <p>
                  One line to tomorrow-you. &quot;Morning deep work paid off.
                  Start with the schema before email.&quot; It appears as a
                  banner on that day forever.
                </p>
              </Step>
              <Step n={4} title="Stop">
                <p>
                  The day is closed. That&apos;s permission to actually put the
                  laptop down.
                </p>
              </Step>
            </div>
            <Callout tone="warn" title="If you only build one habit, build this one">
              <p>
                A task you keep rolling forward for five days isn&apos;t
                blocked — it&apos;s badly defined or secretly unimportant.
                The carry-over step is where you notice.
              </p>
            </Callout>
          </Section>

          <Section id="analytics" icon={BarChart3} eyebrow="Reflect" title="Analytics — where your time actually went">
            <p>
              A rolling 14-day window. Open it every Friday; it takes two
              minutes and changes what you plan next week.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FeatureCard icon={BarChart3} title="Focus over time">
                An area chart of minutes focused per day. Find your real
                rhythm — and your real dips.
              </FeatureCard>
              <FeatureCard icon={Clock} title="Planned vs actual">
                Grouped bars exposing your estimation bias. Most people
                underestimate by 40%. Now you&apos;ll know your number.
              </FeatureCard>
              <FeatureCard icon={Hash} title="Time by channel">
                A donut of where your hours went. If <em>Work</em> is 80% and{" "}
                <em>Deep Work</em> is 5%, that&apos;s your career, quantified.
              </FeatureCard>
              <FeatureCard icon={Sparkles} title="KPIs & streak">
                Completed this week, focus time, completion rate, and a
                consecutive-day streak with sparklines.
              </FeatureCard>
            </div>
            <Callout tone="tip" title="The Friday question">
              <p>
                Look at the donut and ask: <em>is this the split I&apos;d
                choose?</em> If not, next Monday&apos;s plan is where you fix
                it — not next year.
              </p>
            </Callout>
          </Section>

          <Section id="scenarios" icon={Sparkles} eyebrow="Worked examples" title="Three real scenarios">
            <div className="mt-2 flex flex-col gap-4">
              <Scenario
                icon={Briefcase}
                tint="text-indigo-500"
                title="Office — a quarterly report that keeps slipping"
                steps={[
                  "⌘K → \"Q3 report\" → save to backlog the moment your manager mentions it.",
                  "Open it, set channel Deep Work, priority High, estimate 4h.",
                  "Add subtasks: pull numbers · draft narrative · build the deck · review with Priya · send.",
                  "On the Week board, drag it to a Tuesday morning — your freshest slot.",
                  "On the day, start the timer and do only that. Stop when you switch.",
                  "Unfinished at shutdown? Carry to tomorrow. Three carries in a row means the estimate was wrong — split it.",
                  "Friday: check planned vs actual. 4h estimated, 6h actual → next quarter you estimate 6h.",
                ]}
              />
              <Scenario
                icon={Heart}
                tint="text-rose-500"
                title="Personal — getting to the gym three times a week"
                steps={[
                  "Create the task in channel Personal, estimate 1h.",
                  "On the Week board, place it on Mon / Wed / Fri at the start of the day.",
                  "Bookmark it with the 🔖 icon so it sits in Saved as a standing commitment.",
                  "Start the timer when you walk in — it's oddly motivating to see the clock run.",
                  "Friday, open the donut. If Personal is 4% of your week, that's the honest answer about your priorities.",
                ]}
              />
              <Scenario
                icon={Home}
                tint="text-orange-500"
                title="Home — chores that never get a slot"
                steps={[
                  "Filter the Backlog to the Home channel so you see only chores.",
                  "Bookmark the shared grocery list and the plumber's number as chips on that channel.",
                  "Each morning pull exactly one chore into today — 10–20 min, no more.",
                  "Batch the tiny ones: 'Admin block — bills, parcel, car service', estimate 30m, one task.",
                  "Sunday: drag the week's chores across days so no single evening is swamped.",
                ]}
              />
            </div>
          </Section>

          <Section id="shortcuts" icon={Keyboard} eyebrow="Reference" title="Shortcuts & gestures">
            <div className="mt-2 overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    [<><Kbd>⌘</Kbd><Kbd>K</Kbd> / <Kbd>Ctrl</Kbd><Kbd>K</Kbd></>, "Open the command palette from anywhere"],
                    [<><Kbd>Enter</Kbd></>, "Confirm the highlighted palette action / submit a task"],
                    [<><Kbd>↑</Kbd><Kbd>↓</Kbd></>, "Move through palette results"],
                    [<><Kbd>Esc</Kbd></>, "Close the palette, detail sheet or dialog"],
                    ["Drag the ⠿ handle", "Reorder tasks within a day"],
                    ["Drag a card sideways", "Move a task to another day on the Week board"],
                    ["Click a task title", "Open the detail panel"],
                    ["Click the 🔖 icon", "Save for later / remove from saved"],
                    ["Hover a task", "Reveal timer, schedule and ··· actions"],
                  ].map(([k, v], i) => (
                    <tr key={i} className={cn("border-b last:border-0", i % 2 === 1 && "bg-muted/30")}>
                      <td className="w-56 whitespace-nowrap px-4 py-2.5 font-medium">{k}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="privacy" icon={Settings} eyebrow="Your data" title="Privacy, accounts & settings">
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <Bullet>
                <strong>Your data is yours alone.</strong> Every table is
                protected by row-level security scoped to your user id — no
                other account can read a single row of your tasks, even if they
                sign up on the same instance.
              </Bullet>
              <Bullet>
                <strong>Settings</strong> lets you rename yourself, and rename,
                recolour or delete channels.
              </Bullet>
              <Bullet>
                <strong>Theme</strong> — the sun/moon toggle sits at the bottom
                of the sidebar next to your avatar.
              </Bullet>
              <Bullet>
                <strong>Want it private to just you?</strong> In Supabase →
                Authentication → Providers → Email, switch off{" "}
                <em>Allow new users to sign up</em> after creating your account.
                Nobody else can register.
              </Bullet>
            </ul>
            <Callout tone="tip" title="There is no admin role">
              <p>
                Cadence treats every account identically — there&apos;s no
                super-user that can see other people&apos;s data, including
                you. Isolation is enforced by the database, not by UI checks.
              </p>
            </Callout>
          </Section>

          <Outro />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- building blocks ---------------------------- */

function Hero({ firstName }: { firstName: string }) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8 sm:px-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Compass className="size-3" />
          Complete walkthrough
        </span>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome{firstName ? `, ${firstName}` : ""}. Here&apos;s how to run
          your life in Cadence.
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          One system for office work, personal goals and home chores — without
          three different apps. Read it end to end once (about eight minutes),
          then come back to any section when you need it.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Button asChild size="lg" className="h-10">
            <Link href="/today">
              <Sun className="size-4" />
              Start with today
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-10">
            <a href="#start">Read the walkthrough</a>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  id: string;
  icon: typeof Sun;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-b py-9 last:border-0">
      <Reveal>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <Icon className="size-3.5" />
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <div className="mt-3 space-y-4 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground">
          {children}
        </div>
      </Reveal>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-primary/50" />
      <span>{children}</span>
    </li>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Sun;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full rounded-xl border bg-card p-4">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function Scenario({
  icon: Icon,
  tint,
  title,
  steps,
}: {
  icon: typeof Sun;
  tint: string;
  title: string;
  steps: string[];
}) {
  return (
    <Reveal>
      <div className="rounded-xl border bg-card p-5">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          <Icon className={cn("size-4", tint)} />
          {title}
        </p>
        <ol className="mt-3 space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-[0.65rem] font-semibold text-foreground">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}

function Outro() {
  return (
    <Reveal>
      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-7 text-center">
        <h3 className="text-lg font-semibold">That&apos;s the whole system</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Plan in the morning, focus during the day, shut down at night. Review
          on Friday. Everything else is detail.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <Button asChild size="lg" className="h-10">
            <Link href="/today">
              <Sun className="size-4" />
              Plan today
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-10">
            <Link href="/backlog">
              <Inbox className="size-4" />
              Brain-dump to backlog
            </Link>
          </Button>
        </div>
      </div>
    </Reveal>
  );
}

function GuideLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
