"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, Clock3, LayoutDashboard, PlusCircle, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useLogPanel } from "@/components/layout/log-panel-provider";
import clsx from "clsx";

const items = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: PlusCircle },
  { href: "/trends", label: "Trends", icon: BarChart3 },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logPanel = useLogPanel();

  const handleLogClick = (e: React.MouseEvent) => {
    e.preventDefault();
    logPanel.open();
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="hidden border-r border-[rgb(var(--border))] bg-[rgb(var(--panel))] lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-5">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-[rgb(var(--accent))]" />
            <div>
              <div className="font-semibold">Vitaliq</div>
              <div className="text-xs text-[rgb(var(--muted))]">Health Analytics</div>
            </div>
          </div>
          <nav className="mt-8 grid gap-1">
            {items.map((item) => (
              <NavItem 
                key={item.href} 
                active={pathname === item.href} 
                {...item} 
                onClick={item.href === "/log" ? handleLogClick : undefined}
              />
            ))}
          </nav>
          <div className="mt-auto flex items-center justify-between border-t border-[rgb(var(--border))] pt-4">
            <UserButton showName appearance={{
              elements: {
                userButtonBox: "flex-row-reverse w-full justify-between gap-3 text-sm font-medium text-[rgb(var(--text))]",
                userButtonOuterIdentifier: "text-[rgb(var(--text))] text-sm font-medium",
                avatarBox: "h-7 w-7",
              }
            }} />
          </div>
        </div>
      </aside>
      <main className="pb-20 lg:pb-0">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-[rgb(var(--border))] bg-[rgb(var(--panel))] lg:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const isLog = item.href === "/log";
          return (
            <Link 
              className={clsx("focus-ring grid min-h-14 place-items-center text-xs", active ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--muted))]")} 
              href={item.href} 
              key={item.href}
              onClick={isLog ? handleLogClick : undefined}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavItem({ 
  href, 
  label, 
  icon: Icon, 
  active,
  onClick 
}: { 
  href: string; 
  label: string; 
  icon: typeof Activity; 
  active: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <Link 
      onClick={onClick}
      className={clsx(
        "focus-ring flex min-h-10 items-center gap-3 px-3 text-sm", 
        active 
          ? "bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))]" 
          : "text-[rgb(var(--muted))] hover:bg-[rgb(var(--panel-soft))] hover:text-[rgb(var(--text))]"
      )} 
      href={href}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
