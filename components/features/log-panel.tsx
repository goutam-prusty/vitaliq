"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { LogForm } from "@/components/features/log-form";
import { AppSettings } from "@/lib/types";

interface LogPanelProps {
  isOpen: boolean;
  close: () => void;
  settings: AppSettings;
}

export function LogPanel({ isOpen, close, settings }: LogPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Esc key listener and focus trapping
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      
      // Auto-focus the panel close button or the first input field inside the drawer
      setTimeout(() => {
        const firstInput = panelRef.current?.querySelector("input");
        if (firstInput) {
          firstInput.focus();
        } else {
          panelRef.current?.focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          close();
        }

        // Simple focus trapping
        if (e.key === "Tab" && panelRef.current) {
          const focusableElements = panelRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex="0"]'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      // Prevent body scrolling when drawer is open
      document.body.style.overflow = "hidden";

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        
        // Restore focus
        if (previouslyFocusedRef.current) {
          previouslyFocusedRef.current.focus();
        }
      };
    }
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-panel-title"
    >
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={close}
      />

      {/* Drawer layout */}
      <div 
        ref={panelRef}
        tabIndex={-1}
        className="relative z-50 w-full sm:w-[460px] h-full bg-[rgb(var(--panel))] border-l border-[rgb(var(--border))] flex flex-col p-6 shadow-xl focus:outline-none transition-transform duration-300 transform translate-x-0"
      >
        <header className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-4 mb-4">
          <div>
            <h2 id="log-panel-title" className="text-lg font-semibold text-[rgb(var(--text))]">
              Log Health Entry
            </h2>
            <p className="text-xs text-[rgb(var(--muted))]">Record a new health measurement</p>
          </div>
          <button
            onClick={close}
            className="p-2 rounded-md hover:bg-[rgb(var(--panel-soft))] text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] focus-ring"
            aria-label="Close logging panel"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto pr-1">
          <LogForm settings={settings} onSaveSuccess={close} />
        </div>
      </div>
    </div>
  );
}
