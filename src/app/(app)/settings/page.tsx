import type { Metadata } from "next";

import { ChannelsSettings } from "@/components/settings/channels-settings";
import { ProfileForm } from "@/components/settings/profile-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { getChannels } from "@/lib/data/channels";
import { getProfile, requireUser } from "@/lib/data/user";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const [profile, channels] = await Promise.all([getProfile(), getChannels()]);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update how you show up in Cadence.
        </p>
        <div className="mt-4 rounded-xl border bg-card p-5">
          <ProfileForm name={profile?.full_name ?? ""} email={user.email ?? ""} />
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Appearance</h2>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark.
            </p>
          </div>
          <div className="rounded-lg border">
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Channels</h2>
        <p className="text-sm text-muted-foreground">
          Organize your work into colorful channels.
        </p>
        <div className="mt-4">
          <ChannelsSettings channels={channels} />
        </div>
      </section>
    </div>
  );
}
