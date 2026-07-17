"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { LogPanel } from "@/components/features/log-panel";
import { AppSettings } from "@/lib/types";

interface LogPanelContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const LogPanelContext = createContext<LogPanelContextType | undefined>(undefined);

export function useLogPanel() {
  const context = useContext(LogPanelContext);
  if (!context) {
    throw new Error("useLogPanel must be used within a LogPanelProvider");
  }
  return context;
}

export function LogPanelProvider({ 
  children,
  settings 
}: { 
  children: React.ReactNode;
  settings: AppSettings;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  // Global keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept if active element is a text input, textarea, or dropdown select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        activeTag === "select" ||
        document.activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        toggle();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <LogPanelContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      <LogPanel isOpen={isOpen} close={close} settings={settings} />
    </LogPanelContext.Provider>
  );
}
