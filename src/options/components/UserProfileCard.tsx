import React, { useState, useEffect } from "react";
import {
  getUserProfile,
  saveUserProfile,
  type UserProfile,
} from "../../shared/storage";
import { UserIcon, CheckCircleIcon, SpinnerIcon } from "../icons";

export function UserProfileCard() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    title: "",
    email: "",
    website: "",
    bio: "",
    pitchGoal: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    getUserProfile().then(setProfile);
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await saveUserProfile(profile);
      setMsg("Personal AI Profile saved! Gemini will now personalize all generated emails with this exact persona.");
    } catch {
      setMsg("Failed to save profile settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 flex flex-col gap-6 max-w-5xl shadow-xl transition-all"
    >
      <div className="flex items-center justify-between border-b border-[#21262d] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            <UserIcon size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#e6edf3]">
              Personal AI Outreach Profile
            </h3>
            <p className="text-xs text-[#8b949e] mt-0.5">
              These details train Gemini AI to speak in your voice, highlight your experience, and offer your services.
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2.5 font-medium animate-in fade-in">
          <CheckCircleIcon size={18} /> {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-1.5">
            Your Full Name
          </label>
          <input
            type="text"
            required
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. Sabbir Hossain Shuvo"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-[#e6edf3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-1.5">
            Professional Title / Role
          </label>
          <input
            type="text"
            required
            value={profile.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g. Backend Software Engineer • DevOps Engineer"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-[#e6edf3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-1.5">
            Primary Email Address
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="sabbir@example.com"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-[#e6edf3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-1.5">
            Personal Portfolio / Website URL
          </label>
          <input
            type="url"
            value={profile.website}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://mysite.com"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-[#e6edf3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 text-xs pt-1">
        <div>
          <label className="block text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-1.5">
            About / Detailed Experience & Tech Stack Bio
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={5}
            placeholder="Detailed summary of your engineering background, microservices, cloud infrastructure, key tech stack..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-1.5">
            Primary Value Offer / Pitch Goal
          </label>
          <textarea
            value={profile.pitchGoal}
            onChange={(e) => handleChange("pitchGoal", e.target.value)}
            rows={4}
            placeholder="Describe your primary service offering or pitch strategy for prospective clients and hiring managers..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed"
          />
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-[#21262d]">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
        >
          {saving ? (
            <>
              <SpinnerIcon size={16} /> Saving Profile Context...
            </>
          ) : (
            <>Save Personal AI Profile</>
          )}
        </button>
      </div>
    </form>
  );
}
