"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { clsx } from "clsx";
import { useState, useEffect } from "react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "p-2.5 rounded-xl transition-all duration-300",
        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
        className
      )}
      aria-label="Toggle dark mode"
    >
      {!mounted ? (
        <div className="w-4 h-4" /> // Placeholder empty div
      ) : theme === "dark" ? (
        <Sun className="w-4 h-4 animate-in zoom-in duration-300" />
      ) : (
        <Moon className="w-4 h-4 animate-in zoom-in duration-300" />
      )}
    </button>
  );
}
