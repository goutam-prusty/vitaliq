import { auth } from "@clerk/nextjs/server";
import { ProfileDomain } from "@/core/domains/ProfileDomain";
import { LogForm } from "@/components/features/log-form";
import { Panel } from "@/components/ui";

export default async function LogPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto max-w-lg p-4 md:p-8">
        <p className="text-[rgb(var(--danger))]">Unauthorized access. Please log in.</p>
      </div>
    );
  }

  const profileDomain = new ProfileDomain();
  const settings = await profileDomain.getSettings(userId);

  return (
    <div className="mx-auto max-w-lg gap-5 p-4 md:p-8">
      <header className="mb-5">
        <p className="text-sm text-[rgb(var(--muted))]">Log new health measurements</p>
        <h1 className="mt-1 text-2xl font-semibold">Log Entry</h1>
      </header>

      <Panel className="p-5">
        <LogForm settings={settings} />
      </Panel>
    </div>
  );
}
