import {
  PhoneIcon,
  SettingsIcon,
  BookIcon,
  DashboardIcon,
  UsersIcon,
  MailIcon,
} from "../icons";

interface SidebarProps {
  isConfigured: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", Icon: DashboardIcon },
  { id: "leads", label: "Leads", Icon: UsersIcon },
  { id: "send-mail", label: "Send Mail", Icon: MailIcon },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
  { id: "guide", label: "Setup Guide", Icon: BookIcon },
] as const;

export function Sidebar({
  isConfigured,
  activeTab,
  onSelectTab,
}: SidebarProps) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 bg-[#161b22] border-r border-[#21262d] flex-col p-6 sticky top-0 h-screen overflow-y-auto gap-6">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <PhoneIcon size={20} />
        </div>
        <div>
          <h1 className="text-xs font-bold text-[#e6edf3] leading-tight">
            WebToSpread
          </h1>
        </div>
      </div>

      {/* Connection status */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
          isConfigured
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
          }`}
        />
        <span>{isConfigured ? "Connected" : "Not configured"}</span>
      </div>

      {/* Navigation */}
      <nav
        className="flex flex-col gap-1 flex-1"
        aria-label="Settings navigation"
      >
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onSelectTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full text-left ${
                isActive
                  ? "bg-indigo-500/15 text-indigo-300 font-semibold"
                  : "text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Usage hint */}
      <div className="p-3 bg-[#21262d] rounded-lg text-xs text-[#8b949e] leading-relaxed border border-[#30363d]">
        <p>
          Visit any <strong className="text-[#e6edf3]">GitHub profile</strong>{" "}
          and click the{" "}
          <span className="inline-flex items-center justify-center w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-[10px] text-white align-middle mx-0.5">
            📞
          </span>{" "}
          button to extract leads.
        </p>
      </div>
    </aside>
  );
}
