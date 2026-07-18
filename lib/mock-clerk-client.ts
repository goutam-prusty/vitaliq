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
  return React.createElement(
    "div",
    { className: "flex items-center gap-2" },
    React.createElement("div", { className: "w-8 h-8 rounded-full bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))] flex items-center justify-center font-bold text-xs border border-[rgb(var(--border))]" }, "R")
  );
}
