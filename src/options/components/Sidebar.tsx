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
    <aside className="hidden md:flex w-64 shrink-0 bg-[#0a0a0a] border-r border-[#1c1c1c] flex-col p-4 sticky top-0 h-screen justify-between relative">
      {/* Top Section */}
      <div className="flex flex-col gap-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
          <button
            onClick={() => onSelectTab("dashboard")}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-[#f5f5f5] shadow-md group-hover:bg-[#262626] group-hover:border-[#404040] transition-all">
              <SparklesIcon size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#f5f5f5] group-hover:text-white transition-colors leading-tight tracking-tight">
                WebToSpread
              </h1>
              <span className="text-[10px] text-[#737373] font-mono">v1.2.5 • Pro</span>
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
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#525252] mb-1">
            Workspace
          </span>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onSelectTab(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all w-full text-left cursor-pointer ${
                  isActive
                    ? "bg-[#171717] text-[#f5f5f5] border border-[#262626] shadow-sm"
                    : "text-[#8a8a8a] hover:bg-[#171717] hover:text-[#f5f5f5]"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ChatGPT / Gemini Style Footer User Account Menu */}
      <div className="relative pt-3 border-t border-[#1c1c1c]" ref={menuRef}>
        {/* Upward Popover Menu (ChatGPT style) */}
        {isMenuOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-[240px] bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5 z-50 animate-in slide-in-from-bottom-2 duration-150 text-xs">
            {/* User Email & Account Info */}
            <div className="px-3 py-2 border-b border-[#262626] mb-1">
              <div className="font-semibold text-[#f5f5f5] truncate">
                {profile?.name || "Sabbir Hossain Shuvo"}
              </div>
              <div className="text-[11px] text-[#737373] truncate mt-0.5">
                {profile?.email || "sabbir@example.com"}
              </div>
            </div>

            {/* Upgrade Plan Button -> Opens Dedicated Usage Page */}
            <button
              onClick={() => {
                onSelectTab("usage");
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 hover:bg-[#262626] rounded-xl transition-colors w-full text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#262626] text-[#e5e5e5] flex items-center justify-center font-bold text-[10px]">
                  ✦
                </div>
                <div>
                  <div className="font-medium text-[#f5f5f5] text-xs">Upgrade Plan</div>
                  <div className="text-[10px] text-[#737373]">154.6k / 1M tokens used</div>
                </div>
              </div>
              <span className="text-[10px] bg-[#262626] text-[#d4d4d4] border border-[#404040] font-semibold px-2 py-0.5 rounded-full group-hover:bg-[#404040] group-hover:text-white transition-colors">
                Pro
              </span>
            </button>

            <div className="my-1 border-t border-[#262626]" />

            {/* ChatGPT Style Settings & Profile Links */}
            <button
              onClick={() => {
                onSelectTab("profile");
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-[#d4d4d4] hover:bg-[#262626] hover:text-white rounded-xl transition-colors w-full text-left cursor-pointer font-medium"
            >
              <UserIcon size={16} />
              <span>My Personal Profile</span>
            </button>

            <button
              onClick={() => {
                onSelectTab("settings");
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-[#d4d4d4] hover:bg-[#262626] hover:text-white rounded-xl transition-colors w-full text-left cursor-pointer font-medium"
            >
              <SettingsIcon size={16} />
              <span>Settings & API Keys</span>
            </button>

            <button
              onClick={() => {
                onSelectTab("guide");
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-[#737373] hover:bg-[#262626] hover:text-white rounded-xl transition-colors w-full text-left cursor-pointer font-medium"
            >
              <BookIcon size={16} />
              <span>Setup Guide</span>
            </button>
          </div>
        )}

          {/* User Account Button (Exact ChatGPT Sidebar Pill Style) */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`flex items-center justify-between w-full p-2 rounded-xl transition-all text-left cursor-pointer ${
              isMenuOpen
                ? "bg-[#262626]"
                : "hover:bg-[#171717]"
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#262626] border border-[#404040] flex items-center justify-center text-[#f5f5f5] font-bold text-xs shrink-0 shadow-sm">
                {profile?.name ? profile.name.charAt(0) : "S"}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-[#f5f5f5] truncate leading-snug">
                  {profile?.name || "Sabbir Hossain"}
                </div>
                <div className="text-[11px] text-[#a3a3a3] truncate leading-tight">
                  {profile?.email || "Pro Account"}
                </div>
              </div>
            </div>

            <span className="text-[#a3a3a3] text-xs font-bold px-1">
              •••
            </span>
          </button>
        </div>
      </aside>
    );
}
