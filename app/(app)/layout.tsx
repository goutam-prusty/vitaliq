import { auth } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app-shell";
import { syncUser } from "@/lib/actions/auth";
import { ProfileDomain } from "@/core/domains/ProfileDomain";
import { LogPanelProvider } from "@/components/layout/log-panel-provider";
import { settingsDefaults } from "@/lib/settings";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Ensure user is synced
  await syncUser().catch((err) => {
    console.error("User synchronization failed in Layout:", err);
  });

  const { userId } = await auth();
  const profileDomain = new ProfileDomain();
  const settings = userId ? await profileDomain.getSettings(userId) : settingsDefaults;

  return (
    <LogPanelProvider settings={settings}>
      <AppShell>{children}</AppShell>
    </LogPanelProvider>
  );
}
