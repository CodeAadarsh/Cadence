import { AppShell } from "@/components/app/app-shell";
import { getChannels } from "@/lib/data/channels";
import { getSavedCount } from "@/lib/data/saved";
import { getProfile, requireUser } from "@/lib/data/user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [channels, profile, savedCount] = await Promise.all([
    getChannels(),
    getProfile(),
    getSavedCount(),
  ]);

  return (
    <AppShell
      channels={channels}
      email={user.email ?? ""}
      name={profile?.full_name}
      savedCount={savedCount}
      needsOnboarding={!profile?.onboarded}
    >
      {children}
    </AppShell>
  );
}
