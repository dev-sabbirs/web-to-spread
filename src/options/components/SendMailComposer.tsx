import React, { useState } from 'react';
import { SparklesIcon } from '../icons';

interface SendMailComposerProps {
  recipientEmail?: string;
  leadName?: string;
}

export function SendMailComposer({ recipientEmail = '', leadName = '' }: SendMailComposerProps) {
  const [toEmail, setToEmail] = useState(recipientEmail);
  const [subject, setSubject] = useState(leadName ? `Opportunity for ${leadName}` : '');
  const [htmlContent, setHtmlContent] = useState(
    `<p>Hi ${leadName || 'there'},</p>\n<p>I noticed your impressive work and wanted to reach out regarding a potential collaboration.</p>\n<p>Best regards,<br/><strong>Team</strong></p>`
  );
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [showAiNotice, setShowAiNotice] = useState(false);

  return (
    <div className="flex flex-col gap-4 bg-[#0d1117] p-4 rounded-xl border border-[#21262d]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#21262d]">
        <h4 className="text-xs font-bold text-[#e6edf3] uppercase tracking-wider flex items-center gap-2">
          Email Composer
        </h4>
        <div className="flex items-center gap-1 p-1 bg-[#161b22] border border-[#30363d] rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            HTML Source
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === 'split' ? 'bg-indigo-600 text-white' : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Recipient & Subject Input */}
      <div className="grid grid-cols-1 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-[#8b949e] mb-1">To Email</label>
          <input
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="recipient@example.com"
            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#8b949e] mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email Subject"
            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>
      </div>

      {/* HTML Editor & Side Live Preview */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-semibold text-[#8b949e]">Message Body (HTML Source & Preview)</label>
        </div>

        {showAiNotice && (
          <div className="mb-2 p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 flex items-center justify-between">
            <span>✨ AI Agent Assistant UI is ready for future integration!</span>
            <button
              onClick={() => setShowAiNotice(false)}
              className="text-[#8b949e] hover:text-[#e6edf3] font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <div className="relative border border-[#30363d] rounded-xl overflow-hidden bg-[#161b22]">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#30363d]">
            {/* HTML Source Input */}
            {(activeTab === 'editor' || activeTab === 'split') && (
              <div className={`p-3 relative ${activeTab === 'editor' ? 'col-span-2' : ''}`}>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={8}
                  placeholder="Enter HTML body content..."
                  className="w-full h-48 bg-transparent text-[#e6edf3] font-mono text-xs focus:outline-none resize-none pr-10"
                />
                {/* Floating AI Agent Button */}
                <button
                  type="button"
                  onClick={() => setShowAiNotice(true)}
                  title="AI Assistant (Generate/Improve Email)"
                  className="absolute bottom-5 right-5 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <SparklesIcon size={14} className="animate-pulse" />
                  <span className="text-[10px] pr-0.5">AI Agent</span>
                </button>
              </div>
            )}

            {/* Live HTML Preview */}
            {(activeTab === 'preview' || activeTab === 'split') && (
              <div className={`p-3 bg-white text-black rounded-b-xl md:rounded-r-xl overflow-y-auto max-h-56 ${activeTab === 'preview' ? 'col-span-2' : ''}`}>
                <div className="text-[10px] font-bold text-gray-400 border-b pb-1 mb-2 uppercase tracking-wide">
                  Live Preview Output
                </div>
                <div
                  className="prose prose-sm max-w-none text-xs text-gray-800"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Action Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => {
            const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(htmlContent)}`;
            window.open(mailtoUrl, '_blank');
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
        >
          Send Mail
        </button>
      </div>
    </div>
  );
}
