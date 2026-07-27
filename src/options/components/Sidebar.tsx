import React, { useState, useEffect, useRef } from "react";
import {
  UserIcon,
  SettingsIcon,
  BookIcon,
  DashboardIcon,
  UsersIcon,
  MailIcon,
  SparklesIcon,
} from "../icons";
import { getUserProfile, type UserProfile } from "../../shared/storage";

interface SidebarProps {
  isConfigured: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", Icon: DashboardIcon },
  { id: "leads", label: "Leads", Icon: UsersIcon },
  { id: "send-mail", label: "Send Mail", Icon: MailIcon },
] as const;

export function Sidebar({
  isConfigured,
  activeTab,
  onSelectTab,
}: SidebarProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserProfile().then(setProfile);
  }, []);

  // Close popup menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      className="hidden md:flex w-64 shrink-0 flex-col p-4 sticky top-0 h-screen justify-between relative"
      style={{
        backgroundColor: "var(--card)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-5">
        {/* Brand Header */}
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <button
            onClick={() => onSelectTab("dashboard")}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div
              className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center shadow-md transition-all"
              style={{
                backgroundColor: "var(--accent)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <SparklesIcon size={18} />
            </div>
            <div>
              <h1
                className="text-sm font-bold transition-colors leading-tight tracking-tight"
                style={{ color: "var(--foreground)" }}
              >
                WebToSpread
              </h1>
              <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>
                v1.2.5 • Pro
              </span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab("settings")}
            className={`w-2.5 h-2.5 rounded-full shrink-0 cursor-pointer ${
              isConfigured ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-amber-500"
            }`}
            title={isConfigured ? "Sheet API Connected — Click for Settings" : "Configuration required — Click for Settings"}
          />
        </div>

        {/* Main Workspace Navigation */}
        <nav className="flex flex-col gap-1" aria-label="Main Navigation">
          <span
            className="px-2 text-[10px] font-bold uppercase tracking-wider mb-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Workspace
          </span>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onSelectTab(id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all w-full text-left cursor-pointer"
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--accent)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                      }
                    : {
                        color: "var(--muted-foreground)",
                        border: "1px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "";
                    (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
                  }
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Account Menu */}
      <div
        className="relative pt-3"
        style={{ borderTop: "1px solid var(--border)" }}
        ref={menuRef}
      >
        {/* Upward Popover Menu */}
        {isMenuOpen && (
          <div
            className="absolute bottom-full left-0 mb-2 w-[240px] rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5 z-50 animate-in slide-in-from-bottom-2 duration-150 text-xs"
            style={{
              backgroundColor: "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            {/* User Info */}
            <div
              className="px-3 py-2 mb-1"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="font-semibold truncate" style={{ color: "var(--foreground)" }}>
                {profile?.name || "Sabbir Hossain Shuvo"}
              </div>
              <div className="text-[11px] truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {profile?.email || "sabbir@example.com"}
              </div>
            </div>

            {/* Upgrade Plan */}
            <button
              onClick={() => {
                onSelectTab("usage");
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 rounded-xl transition-colors w-full text-left cursor-pointer group"
              style={{ color: "var(--foreground)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "";
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]"
                  style={{ backgroundColor: "var(--accent)", color: "var(--foreground)" }}
                >
                  ✦
                </div>
                <div>
                  <div className="font-medium text-xs" style={{ color: "var(--foreground)" }}>Upgrade Plan</div>
                  <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>154.6k / 1M tokens used</div>
                </div>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                Pro
              </span>
            </button>

            <div className="my-1" style={{ borderTop: "1px solid var(--border)" }} />

            {[
              { label: "My Personal Profile", tab: "profile", Icon: UserIcon },
              { label: "Settings & API Keys", tab: "settings", Icon: SettingsIcon },
              { label: "Setup Guide", tab: "guide", Icon: BookIcon },
            ].map(({ label, tab, Icon }) => (
              <button
                key={tab}
                onClick={() => {
                  onSelectTab(tab);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors w-full text-left cursor-pointer font-medium"
                style={{ color: "var(--foreground)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* User Account Pill */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex items-center justify-between w-full p-2 rounded-xl transition-all text-left cursor-pointer"
          style={
            isMenuOpen
              ? { backgroundColor: "var(--accent)" }
              : {}
          }
          onMouseEnter={(e) => {
            if (!isMenuOpen) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            if (!isMenuOpen) (e.currentTarget as HTMLElement).style.backgroundColor = "";
          }}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm"
              style={{
                backgroundColor: "var(--accent)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              {profile?.name ? profile.name.charAt(0) : "S"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold truncate leading-snug" style={{ color: "var(--foreground)" }}>
                {profile?.name || "Sabbir Hossain"}
              </div>
              <div className="text-[11px] truncate leading-tight" style={{ color: "var(--muted-foreground)" }}>
                {profile?.email || "Pro Account"}
              </div>
            </div>
          </div>

          <span className="text-xs font-bold px-1" style={{ color: "var(--muted-foreground)" }}>
            •••
          </span>
        </button>
      </div>
    </aside>
  );
}
