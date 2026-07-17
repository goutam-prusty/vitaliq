import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg))] p-4">
      <SignIn appearance={{
        elements: {
          card: "bg-[rgb(var(--panel))] border border-[rgb(var(--border))] text-[rgb(var(--text))]",
          headerTitle: "text-[rgb(var(--text))]",
          headerSubtitle: "text-[rgb(var(--muted))]",
          socialButtonsBlockButton: "border-[rgb(var(--border))] text-[rgb(var(--text))] hover:bg-[rgb(var(--panel-soft))]",
          formFieldLabel: "text-[rgb(var(--text))]",
          formFieldInput: "bg-[rgb(var(--bg))] border-[rgb(var(--border))] text-[rgb(var(--text))]",
          formButtonPrimary: "bg-[rgb(var(--accent))] text-white hover:opacity-90",
          footerActionText: "text-[rgb(var(--muted))]",
          footerActionLink: "text-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] hover:underline",
        }
      }} />
    </div>
  );
}
