"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex min-h-10 items-center justify-center gap-2 border border-[rgb(var(--border))] bg-[rgb(var(--text))] px-4 py-2 text-sm font-medium text-[rgb(var(--bg))] rounded-md transition-all-spring active:scale-[0.98] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 elevation-1 hover:elevation-2",
        className
      )}
      {...props}
    />
  );
}

export function SecondaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex min-h-10 items-center justify-center gap-2 border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2 text-sm font-medium rounded-md transition-all-spring active:scale-[0.98] hover:bg-[rgb(var(--panel-soft))] disabled:cursor-not-allowed disabled:opacity-50 elevation-1 hover:elevation-2",
        className
      )}
      {...props}
    />
  );
}

export function Field({ label, unit, children, error }: { label: string; unit?: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">
        <span>{label}</span>
        {unit ? <span className="num text-[10px] font-normal lowercase tracking-normal">{unit}</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-[rgb(var(--danger))] font-medium mt-0.5">{error}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="focus-ring min-h-10 w-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] rounded-md transition-all-spring shadow-xs"
      {...props}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="focus-ring min-h-10 w-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] rounded-md transition-all-spring shadow-xs"
      {...props}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="focus-ring min-h-24 w-full resize-y border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] rounded-md transition-all-spring shadow-xs"
      {...props}
    />
  );
}

export function Panel({
  children,
  className,
  variant = "default",
  elevation = 1,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "none" | "compact" | "default" | "comfortable";
  elevation?: 0 | 1 | 2 | 3;
}) {
  const paddings = {
    none: "",
    compact: "p-4",
    default: "p-6",
    comfortable: "p-8",
  };
  
  const elevations = {
    0: "elevation-0",
    1: "elevation-1",
    2: "elevation-2",
    3: "elevation-3",
  };

  return (
    <section
      className={clsx(
        "border border-[rgb(var(--border))] bg-[rgb(var(--panel))] rounded-lg transition-all-spring",
        paddings[variant],
        elevations[elevation],
        className
      )}
    >
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  body,
  icon: Icon,
  action,
}: {
  title: string;
  body: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-8 text-center rounded-lg flex flex-col items-center justify-center elevation-0">
      {Icon && <Icon className="h-8 w-8 text-[rgb(var(--muted))] mb-3 opacity-80" />}
      <h3 className="font-semibold text-base tracking-tight text-[rgb(var(--text))]">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-xs text-[rgb(var(--muted))] leading-relaxed">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("animate-pulse rounded bg-[rgb(var(--border))]/55", className)}
      {...props}
    />
  );
}

