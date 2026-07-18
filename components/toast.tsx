"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { clsx } from "clsx";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div 
      className="fixed z-50 flex flex-col gap-2 pointer-events-none w-full max-w-sm max-sm:px-4 max-sm:top-6 max-sm:inset-x-0 max-sm:mx-auto sm:bottom-6 sm:right-6"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-[rgb(var(--ok))]" />,
    error: <AlertTriangle className="h-4 w-4 text-[rgb(var(--danger))]" />,
    info: <Info className="h-4 w-4 text-[rgb(var(--accent))]" />,
  };

  const borders = {
    success: "border-[rgb(var(--ok))]/25",
    error: "border-[rgb(var(--danger))]/25",
    info: "border-[rgb(var(--accent))]/25",
  };

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className={clsx(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-lg bg-[rgb(var(--panel))] border shadow-md transition-all-spring duration-300 animate-slide-in",
        borders[toast.type]
      )}
    >
      <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 text-sm text-[rgb(var(--text))] leading-normal font-medium pr-2">
        {toast.message}
      </div>
      <button
        onClick={() => dismiss(toast.id)}
        className="shrink-0 p-1 rounded-md hover:bg-[rgb(var(--panel-soft))] text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] focus-ring"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
