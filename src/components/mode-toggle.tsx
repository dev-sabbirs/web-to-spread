import React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type AppTheme } from "@/components/theme-provider";

const modes: { value: AppTheme; label: string; icon: React.ElementType }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Laptop },
];

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-xl border border-(--border) bg-(--muted)",
        className
      )}
    >
      {modes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            theme === value
              ? "bg-(--card) text-(--foreground) shadow-sm border border-(--border)"
              : "text-(--muted-foreground) hover:text-(--foreground)"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
