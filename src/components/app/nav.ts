import {
  BarChart3,
  Bookmark,
  BookOpen,
  CalendarRange,
  Inbox,
  Sun,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/week", label: "Week", icon: CalendarRange },
  { href: "/backlog", label: "Backlog", icon: Inbox },
  { href: "/saved", label: "Saved", icon: Bookmark, badge: "saved" },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/guide", label: "Guide", icon: BookOpen },
] as const;
