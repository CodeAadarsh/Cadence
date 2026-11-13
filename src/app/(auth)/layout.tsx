import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const highlights = [
  {
    title: "Plan with intention",
    body: "Pull work into today and give every task a realistic time estimate.",
  },
  {
    title: "Stay in flow",
    body: "A calm, single-tasking workspace with a built-in timer for deep work.",
  },
  {
    title: "Reflect & improve",
    body: "End the day with a shutdown ritual and see where your time really went.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh w-full lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-neutral-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 10%, rgba(99,102,241,0.45) 0%, transparent 60%), radial-gradient(50% 50% at 90% 20%, rgba(236,72,153,0.35) 0%, transparent 55%), radial-gradient(60% 60% at 60% 100%, rgba(139,92,246,0.4) 0%, transparent 60%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative">
          <Link href="/">
            <Logo textClassName="text-white" />
          </Link>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight">
            Design your day, one deliberate task at a time.
          </h1>
          <ul className="mt-8 space-y-5">
            {highlights.map((h) => (
              <li key={h.title} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-white/80" />
                <div>
                  <p className="font-medium">{h.title}</p>
                  <p className="text-sm text-white/70">{h.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/50">
          A calm daily planner, inspired by the best of focused work.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
