import React from "react";

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

export function SignIn() {
  return React.createElement("div", { className: "p-4 text-center" }, "Mock SignIn Component");
}

export function SignUp() {
  return React.createElement("div", { className: "p-4 text-center" }, "Mock SignUp Component");
}

export function UserButton() {
  const handleSignOut = () => {
    document.cookie = "mock_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/";
  };

  return React.createElement(
    "div",
    { className: "flex items-center gap-3" },
    React.createElement(
      "button",
      {
        onClick: handleSignOut,
        className: "text-xs font-semibold text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] cursor-pointer px-2 py-1 border border-[rgb(var(--border))] rounded bg-[rgb(var(--panel))] hover:bg-[rgb(var(--panel-soft))] transition-colors focus-ring"
      },
      "Sign Out"
    ),
    React.createElement(
      "div",
      { className: "w-8 h-8 rounded-full bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))] flex items-center justify-center font-bold text-xs border border-[rgb(var(--border))]" },
      "R"
    )
  );
}
