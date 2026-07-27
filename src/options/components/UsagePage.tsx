import React, { useState, useEffect } from "react";
import { SparklesIcon, CheckCircleIcon, ExternalLinkIcon, UserIcon, SettingsIcon } from "../icons";
import {
  getUserProfile,
  getSettings,
  getAiUsageStats,
  type UserProfile,
  type StoredSettings,
  type AiUsageStats,
} from "../../shared/storage";

interface UsagePageProps {
  onNavigate: (tab: string) => void;
}

export function UsagePage({ onNavigate }: UsagePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<StoredSettings | null>(null);
  const [usageStats, setUsageStats] = useState<AiUsageStats | null>(null);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    getUserProfile().then(setProfile);
    getSettings().then(setSettings);
    getAiUsageStats().then(setUsageStats);
  }, []);

  // Compute dynamic totals
  const totalTokens = usageStats?.records.reduce((acc, r) => acc + r.totalTokens, 0) || 0;
  const totalEmails = usageStats?.totalEmailsGenerated || 0;
  const avgTokensPerEmail = totalEmails > 0 ? Math.round(totalTokens / totalEmails) : 0;
  const remainingTokens = Math.max(0, 1000000 - totalTokens);
  const percentageUsed = Math.min(100, (totalTokens / 1000000) * 100).toFixed(1);

  // Compute last 7 days bar chart dynamically from timestamp records
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayLabel = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split("T")[0];

    // Sum tokens for this day
    const dayTokens = usageStats?.records
      .filter((r) => new Date(r.timestamp).toISOString().split("T")[0] === dateStr)
      .reduce((acc, r) => acc + r.totalTokens, 0) || 0;

    return { day: dayLabel, tokens: dayTokens };
  });

  const maxDayTokens = Math.max(...last7Days.map((d) => d.tokens), 1);

  return (
    <div className="max-w-5xl flex flex-col gap-6 animate-in fade-in duration-200 pb-12">
      {/* Page Banner / Plan Header */}
      <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative">
          <div className="w-14 h-14 rounded-2xl bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-[#f5f5f5] font-bold text-xl shadow-md">
            {profile?.name ? profile.name.charAt(0) : "S"}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#f5f5f5]">
                {profile?.name || "Sabbir Hossain Shuvo"}
              </h2>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-md">
                Pro Plan Active
              </span>
            </div>
            <p className="text-xs text-[#a3a3a3] mt-1">
              {profile?.title || "Backend Software Engineer • DevOps Engineer"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => onNavigate("settings")}
            className="px-4 py-2 bg-[#171717] hover:bg-[#262626] text-[#f5f5f5] text-xs font-semibold rounded-xl border border-[#262626] transition-colors cursor-pointer flex items-center gap-2"
          >
            <SettingsIcon size={14} /> Custom API Keys
          </button>
          <button
            onClick={() => onNavigate("profile")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/40 transition-all cursor-pointer flex items-center gap-2"
          >
            <UserIcon size={14} /> AI Persona Settings
          </button>
        </div>
      </div>

      {/* Plan Quotas & Realtime Token Usage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">Monthly Token Quota</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">✦</span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {totalTokens.toLocaleString()}
            </div>
            <div className="text-xs text-[#a3a3a3] mt-0.5">out of 1,000,000 monthly tokens</div>
          </div>
          {/* Dynamic Progress bar */}
          <div className="w-full bg-[#141414] h-2 rounded-full overflow-hidden border border-[#262626]">
            <div
              style={{ width: `${percentageUsed}%` }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
            />
          </div>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircleIcon size={12} /> {(remainingTokens / 1000).toFixed(1)}k tokens remaining
          </span>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">Generated Emails</span>
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">✉</span>
          </div>
          <div>
            <div className="text-2xl font-black text-teal-400 font-mono">{totalEmails}</div>
            <div className="text-xs text-[#a3a3a3] mt-0.5">outreach compositions created</div>
          </div>
          <div className="text-[11px] text-[#a3a3a3] border-t border-[#1c1c1c] pt-2">
            Average cost: <span className="font-mono text-[#f5f5f5]">{avgTokensPerEmail} tokens/email</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">Active Model Tier</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">⚡</span>
          </div>
          <div>
            <div className="text-lg font-bold text-[#f5f5f5]">
              {settings?.geminiModel || "gemini-3.6-flash"}
            </div>
            <div className="text-xs text-cyan-400 font-mono mt-0.5">High Speed SSE Engine</div>
          </div>
          <div className="text-[11px] text-[#a3a3a3] border-t border-[#1c1c1c] pt-2">
            Rate limit: <span className="font-mono text-emerald-400">15 / 15 RPM</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">API Pricing Tier</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">💎</span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">$0.00 / mo</div>
            <div className="text-xs text-[#a3a3a3] mt-0.5">Free Developer Plan Active</div>
          </div>
          <div className="text-[11px] text-[#a3a3a3] border-t border-[#1c1c1c] pt-2">
            Key: <span className="font-mono text-teal-300">{settings?.geminiApiKey ? "Custom Key" : "Built-in System Key"}</span>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Detailed History */}
      <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1c1c1c] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#f5f5f5] flex items-center gap-2">
              <SparklesIcon size={18} className="text-emerald-400" />
              Token Usage Analytics
            </h3>
            <p className="text-xs text-[#a3a3a3] mt-0.5">
              Historical breakdown of prompt processing & response generation tokens.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#262626] text-xs font-bold">
            {(["7d", "30d", "90d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeframe === t ? "bg-emerald-600 text-white shadow-md" : "text-[#737373] hover:text-[#f5f5f5]"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Bar Chart Visualizer */}
        <div className="flex items-end justify-between gap-4 h-48 pt-6 px-4 bg-[#141414] rounded-xl border border-[#262626]">
          {last7Days.map((bar) => {
            const heightPercent = bar.tokens > 0 ? Math.max(15, Math.round((bar.tokens / maxDayTokens) * 100)) : 8;
            return (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-xs font-mono text-[#d4d4d4] opacity-0 group-hover:opacity-100 transition-opacity">
                  {(bar.tokens / 1000).toFixed(1)}k
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-[#262626] via-[#404040] to-[#737373] rounded-t-lg group-hover:brightness-150 transition-all shadow-md"
                />
                <span className="text-xs font-mono text-[#737373]">{bar.day}</span>
              </div>
            );
          })}
        </div>

        {/* Pricing Tiers & Credit Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#e6edf3] uppercase tracking-wider">Current Plan Privileges</h4>
            <ul className="text-xs text-[#8b949e] space-y-2">
              <li className="flex items-center gap-2 text-[#e6edf3]">
                <CheckCircleIcon size={14} className="text-emerald-400" />
                <span>1,000,000 tokens per month included for outreach</span>
              </li>
              <li className="flex items-center gap-2 text-[#e6edf3]">
                <CheckCircleIcon size={14} className="text-emerald-400" />
                <span>Direct Google AI Studio SSE Streaming response engine</span>
              </li>
              <li className="flex items-center gap-2 text-[#e6edf3]">
                <CheckCircleIcon size={14} className="text-emerald-400" />
                <span>Full access to Personal AI Persona profile integration</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#e6edf3] uppercase tracking-wider">API Studio Rate Limits</h4>
            <div className="text-xs space-y-2">
              <div className="flex justify-between border-b border-[#21262d] pb-1.5 text-[#8b949e]">
                <span>Requests Per Minute (RPM)</span>
                <span className="font-mono text-emerald-400">15 RPM</span>
              </div>
              <div className="flex justify-between border-b border-[#21262d] pb-1.5 text-[#8b949e]">
                <span>Tokens Per Minute (TPM)</span>
                <span className="font-mono text-indigo-300">1,000,000 TPM</span>
              </div>
              <div className="flex justify-between text-[#8b949e]">
                <span>Requests Per Day (RPD)</span>
                <span className="font-mono text-purple-400">1,500 RPD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
