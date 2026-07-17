import { auth } from "@clerk/nextjs/server";
import { ProfileDomain } from "@/core/domains/ProfileDomain";
import { SettingsForm } from "@/components/features/settings-form";
import { Panel } from "@/components/ui";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto max-w-5xl p-4 md:p-8">
        <p className="text-[rgb(var(--danger))]">Unauthorized access. Please log in.</p>
      </div>
    );
  }

  const profileDomain = new ProfileDomain();
  const settings = await profileDomain.getSettings(userId);

  return (
    <div className="mx-auto grid max-w-5xl gap-5 p-4 md:p-8">
      <header>
        <p className="text-sm text-[rgb(var(--muted))]">Profile, goals, units, theme preferences</p>
        <h1 className="mt-1 text-2xl font-semibold">Settings</h1>
      </header>

      <SettingsForm initialSettings={settings} />

      <Panel className="p-5 text-sm leading-6 text-[rgb(var(--muted))]">
        Your health tracking data is securely isolated in your private database. This is a personal tracking and visualization tool, not a medical diagnostic system.
      </Panel>
    </div>
  );
}
