"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Channel } from "@/lib/types";

import { onboardIfNeeded } from "@/lib/actions/onboarding";

import { CommandPalette } from "./command-palette";
import { Sidebar } from "./sidebar";

export function AppShell({
  channels,
  email,
  name,
  savedCount,
  needsOnboarding,
  children,
}: {
  channels: Channel[];
  email: string;
  name?: string | null;
  savedCount?: number;
  needsOnboarding?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const seededRef = React.useRef(false);

  React.useEffect(() => {
    if (!needsOnboarding || seededRef.current) return;
    seededRef.current = true;
    onboardIfNeeded()
      .then((r) => {
        if (r.seeded) router.refresh();
      })
      .catch(() => {});
  }, [needsOnboarding, router]);

  return (
    <div className="flex h-dvh overflow-hidden bg-muted/30">
      <CommandPalette channels={channels} />
      <aside className="hidden w-64 shrink-0 border-r lg:block">
        <Sidebar
          channels={channels}
          email={email}
          name={name}
          savedCount={savedCount}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b bg-background px-3 py-2.5 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open navigation"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Sidebar
                channels={channels}
                email={email}
                name={name}
                savedCount={savedCount}
                onNavigate={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <Logo />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
