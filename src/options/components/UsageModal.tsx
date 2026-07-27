import React, { useState } from "react";
import { UserIcon, SparklesIcon, CheckCircleIcon, ExternalLinkIcon } from "../icons";
import type { UserProfile } from "../../shared/storage";

interface UsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onOpenProfile: () => void;
}

export function UsageModal({
  isOpen,
  onClose,
  profile,
  onOpenProfile,
}: UsageModalProps) {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  if (!isOpen) return null;

  // 7-day usage bar chart mock data
  const chartBars = [
    { day: "Mon", tokens: 18500, height: "45%" },
    { day: "Tue", tokens: 32000, height: "75%" },
    { day: "Wed", tokens: 12400, height: "30%" },
    { day: "Thu", tokens: 41000, height: "90%" },
    { day: "Fri", tokens: 28000, height: "65%" },
    { day: "Sat", tokens: 8500,  height: "20%" },
    { day: "Sun", tokens: 14200, height: "35%" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col gap-6 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {profile?.name ? profile.name.charAt(0) : "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#e6edf3]">
                  {profile?.name || "Sabbir Hossain Shuvo"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                  Pro Plan
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e]">
                {profile?.title || "Backend Software Engineer • DevOps Engineer"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#e6edf3] p-1.5 rounded-lg hover:bg-[#21262d] transition-colors text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#8b949e] uppercase">Total Tokens</span>
            <span className="text-lg font-black text-indigo-400 font-mono">154,600</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircleIcon size={10} /> 15.4% of 1M limit
            </span>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#8b949e] uppercase">Generated Emails</span>
            <span className="text-lg font-black text-purple-400 font-mono">184</span>
            <span className="text-[10px] text-[#8b949e]">Avg 840 tokens/email</span>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#8b949e] uppercase">Rate Limit (RPM)</span>
            <span className="text-lg font-black text-emerald-400 font-mono">15 / 15</span>
            <span className="text-[10px] text-emerald-400 font-medium">Optimal speed</span>
          </div>
        </div>

        {/* Usage Analytics Bar Chart */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon size={14} className="text-indigo-400" />
              <span className="text-xs font-bold text-[#e6edf3]">Token Consumption Analytics</span>
            </div>
            <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-lg border border-[#30363d] text-[10px] font-bold">
              {(["7d", "30d", "90d"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    timeframe === t ? "bg-indigo-600 text-white" : "text-[#8b949e] hover:text-[#e6edf3]"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="flex items-end justify-between gap-2 h-28 pt-4 px-2 border-b border-[#21262d]">
            {chartBars.map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="text-[9px] font-mono text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(bar.tokens / 1000).toFixed(1)}k
                </div>
                <div
                  style={{ height: bar.height }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-md group-hover:from-indigo-500 group-hover:to-pink-500 transition-all shadow-md shadow-indigo-500/20"
                />
                <span className="text-[10px] font-mono text-[#8b949e]">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Model Details & Credit Breakdown */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[#21262d]">
            <span className="text-[#8b949e]">Active Model Tier</span>
            <span className="font-bold text-[#e6edf3]">Gemini 3.6 Flash (Generative SSE Engine)</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-[#21262d]">
            <span className="text-[#8b949e]">API Key Source</span>
            <span className="font-mono text-indigo-300">Google AI Studio (.env)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8b949e]">Persona Context</span>
            <span className="font-semibold text-emerald-400">Personal Profile Active</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-[#21262d]">
          <button
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer hover:underline"
          >
            <UserIcon size={14} /> Configure Persona Context →
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
