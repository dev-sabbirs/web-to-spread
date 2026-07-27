import React, { useState, useEffect } from "react";
import {
  getUserProfile,
  saveUserProfile,
  type UserProfile,
} from "../../shared/storage";
import { UsersIcon, CheckCircleIcon, SpinnerIcon } from "../icons";

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
      setMsg(
        "Profile saved successfully! Gemini AI will now use your context.",
      );
    } catch {
      setMsg("Failed to save profile settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col gap-6 max-w-3xl"
    >
      <div className="flex items-center justify-between border-b border-[#21262d] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
            <UsersIcon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e6edf3]">
              Your Personal AI Outreach Context
            </h3>
            <p className="text-xs text-[#8b949e]">
              Provide your details so Gemini AI generates authentic outreach on
              your behalf.
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2 font-medium">
          <CheckCircleIcon size={16} /> {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-[#8b949e] uppercase mb-1">
            Your Full Name
          </label>
          <input
            type="text"
            required
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. Sabbir"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#8b949e] uppercase mb-1">
            Professional Title / Role
          </label>
          <input
            type="text"
            required
            value={profile.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g. Full-Stack Software Engineer"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#8b949e] uppercase mb-1">
            Primary Email
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="sabbir@example.com"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#8b949e] uppercase mb-1">
            Personal Portfolio / Website
          </label>
          <input
            type="url"
            value={profile.website}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://mysite.com"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-indigo-500"
          />
        </div>


      </div>

      <div className="flex flex-col gap-4 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-[#8b949e] uppercase mb-1">
            About / Tech Stack Bio
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={3}
            placeholder="Briefly describe your expertise, key skills, or tech stack..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#8b949e] uppercase mb-1">
            Primary Value Offer / Pitch Goal
          </label>
          <textarea
            value={profile.pitchGoal}
            onChange={(e) => handleChange("pitchGoal", e.target.value)}
            rows={2}
            placeholder="What primary service or value proposition do you offer?"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
        >
          {saving ? (
            <>
              <SpinnerIcon size={14} /> Saving Profile...
            </>
          ) : (
            <>Save Personal AI Profile</>
          )}
        </button>
      </div>
    </form>
  );
}
