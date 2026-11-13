import type { Metadata } from "next";

import { GuideView } from "@/components/guide/guide-view";
import { getProfile } from "@/lib/data/user";

export const metadata: Metadata = {
  title: "Guide",
  description: "A complete walkthrough of Cadence for work, personal life and home.",
};

export default async function GuidePage() {
  const profile = await getProfile();
  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? "";

  return <GuideView firstName={firstName} />;
}
