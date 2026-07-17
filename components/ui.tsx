"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx("focus-ring inline-flex min-h-10 items-center justify-center gap-2 border border-[rgb(var(--border))] bg-[rgb(var(--text))] px-4 py-2 text-sm font-medium text-[rgb(var(--bg))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}

export function SecondaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx("focus-ring inline-flex min-h-10 items-center justify-center gap-2 border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2 text-sm font-medium transition hover:bg-[rgb(var(--panel-soft))] disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}

export function Field({ label, unit, children, error }: { label: string; unit?: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="flex items-center justify-between text-[rgb(var(--muted))]"><span>{label}</span>{unit ? <span className="num text-xs">{unit}</span> : null}</span>
      {children}
      {error ? <span className="text-xs text-[rgb(var(--danger))]">{error}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="focus-ring min-h-10 w-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))]" {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="focus-ring min-h-10 w-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))]" {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="focus-ring min-h-24 w-full resize-y border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))]" {...props} />;
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx("border border-[rgb(var(--border))] bg-[rgb(var(--panel))]", className)}>{children}</section>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-8 text-center"><h3 className="font-medium">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-[rgb(var(--muted))]">{body}</p></div>;
}
