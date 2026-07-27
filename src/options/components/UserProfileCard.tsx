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
      className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-8 flex flex-col gap-6 max-w-5xl shadow-2xl transition-all"
    >
      <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-[#f5f5f5] font-bold shadow-md">
            <UserIcon size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#f5f5f5]">
              Personal AI Outreach Profile
            </h3>
            <p className="text-xs text-[#737373] mt-0.5">
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
          <label className="block text-[11px] font-bold text-[#737373] uppercase tracking-wider mb-1.5">
            Your Full Name
          </label>
          <input
            type="text"
            required
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. Sabbir Hossain Shuvo"
            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] focus:outline-none focus:border-[#404040] transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#737373] uppercase tracking-wider mb-1.5">
            Professional Title / Role
          </label>
          <input
            type="text"
            required
            value={profile.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g. Backend Software Engineer • DevOps Engineer"
            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] focus:outline-none focus:border-[#404040] transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#737373] uppercase tracking-wider mb-1.5">
            Primary Email Address
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="sabbir@example.com"
            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] focus:outline-none focus:border-[#404040] transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#737373] uppercase tracking-wider mb-1.5">
            Personal Portfolio / Website URL
          </label>
          <input
            type="url"
            value={profile.website}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://mysite.com"
            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] focus:outline-none focus:border-[#404040] transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 text-xs pt-1">
        <div>
          <label className="block text-[11px] font-bold text-[#737373] uppercase tracking-wider mb-1.5">
            About / Detailed Experience & Tech Stack Bio
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={5}
            placeholder="Detailed summary of your engineering background, microservices, cloud infrastructure, key tech stack..."
            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#404040] transition-all leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#737373] uppercase tracking-wider mb-1.5">
            Primary Value Offer / Pitch Goal
          </label>
          <textarea
            value={profile.pitchGoal}
            onChange={(e) => handleChange("pitchGoal", e.target.value)}
            rows={4}
            placeholder="Describe your primary service offering or pitch strategy for prospective clients and hiring managers..."
            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#404040] transition-all leading-relaxed"
          />
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-[#1c1c1c]">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#171717] hover:bg-[#262626] border border-[#262626] hover:border-[#404040] text-[#f5f5f5] font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
