"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Plus, Search } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { Channel } from "@/lib/types";

import { openCommandPalette } from "./command-palette";
import { NAV_ITEMS } from "./nav";
import { UserMenu } from "./user-menu";
import { ChannelDialog } from "./channel-dialog";

export function Sidebar({
  channels,
  email,
  name,
  savedCount = 0,
  onNavigate,
}: {
  channels: Channel[];
  email: string;
  name?: string | null;
  savedCount?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="px-4 py-4">
        <Link href="/today" onClick={onNavigate} className="inline-flex">
          <Logo />
        </Link>
      </div>

      <div className="px-2.5 pb-3">
        <button
          type="button"
          onClick={openCommandPalette}
          className="flex w-full items-center gap-2 rounded-lg border bg-muted/40 px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Search className="size-3.5 shrink-0" />
          <span>Search</span>
          <kbd className="ml-auto rounded border bg-background px-1.5 py-0.5 text-[0.65rem] font-medium">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2.5">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-muted"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="relative size-4 shrink-0" />
              <span className="relative">{item.label}</span>
              {"badge" in item && item.badge === "saved" && savedCount > 0 && (
                <span className="relative ml-auto rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {savedCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 flex items-center justify-between px-5 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Channels
        </span>
        <ChannelDialog>
          <button
            aria-label="New channel"
            className="flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="size-3.5" />
          </button>
        </ChannelDialog>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-2.5">
        <ul className="flex flex-col gap-0.5 pb-2">
          {channels.map((channel) => (
            <li key={channel.id}>
              <Link
                href={`/backlog?channel=${channel.id}`}
                onClick={onNavigate}
                className="group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: channel.color }}
                />
                <span className="truncate">
                  {channel.emoji ? `${channel.emoji} ` : ""}
                  {channel.name}
                </span>
              </Link>
            </li>
          ))}
          {channels.length === 0 && (
            <li className="px-3 py-1.5 text-xs text-muted-foreground">
              No channels yet
            </li>
          )}
        </ul>
      </div>

      <div className="border-t p-2">
        <div className="flex items-center gap-1">
          <UserMenu email={email} name={name} />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
