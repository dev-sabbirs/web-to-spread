import React, { useState, useEffect, useRef } from 'react';
import { MESSAGE_TYPES } from '../../shared/constants';
import type { MessageResponse } from '../../shared/types';
import { RichTextEditor } from './RichTextEditor';
import { ResizableSplitter } from './ResizableSplitter';
import { AiSidebarWidget } from '../../ai';
import { SpinnerIcon, MailIcon } from '../icons';

interface LeadItem {
  name: string;
  email: string;
  headline?: string;
  source: 'github' | 'linkedin';
}

interface SendMailPageProps {
  githubSheetName: string;
  linkedinSheetName: string;
  isConfigured: boolean;
  initialLeadEmail?: string;
  initialLeadName?: string;
}

export function SendMailPage({
  githubSheetName,
  linkedinSheetName,
  isConfigured,
  initialLeadEmail,
  initialLeadName,
}: SendMailPageProps) {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>(initialLeadEmail ? [initialLeadEmail] : []);
  const [subject, setSubject] = useState(initialLeadName ? `Opportunity for ${initialLeadName}` : '');
  const [htmlBody, setHtmlBody] = useState(
    `<p>Hi ${initialLeadName || 'there'},</p>\n<p>I noticed your profile and wanted to reach out regarding an exciting project.</p>\n<p>Best regards,<br/><strong>Team</strong></p>`
  );

  // Resizable Box Width States
  const [leftWidth, setLeftWidth] = useState(270);
  const [rightWidth, setRightWidth] = useState(300);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizeLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(180, Math.min(450, startWidth + deltaX));
      setLeftWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResizeRight = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.max(220, Math.min(750, startWidth + deltaX));
      setRightWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    if (!isConfigured) return;
    const fetchAllLeads = async () => {
      setLoading(true);
      const combined: LeadItem[] = [];
      try {
        for (const sheet of [githubSheetName, linkedinSheetName]) {
          const res: MessageResponse = await chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.FETCH_LEADS,
            sheetName: sheet,
          });
          if (res.success && res.data?.rows) {
            const headers = res.data.headers || [];
            const emailIdx = headers.findIndex((h) => h.toLowerCase().includes('email'));
            const nameIdx = headers.findIndex((h) => h.toLowerCase().includes('name') || h.toLowerCase().includes('username'));
            const headIdx = headers.findIndex((h) => h.toLowerCase().includes('headline') || h.toLowerCase().includes('bio') || h.toLowerCase().includes('about'));

            res.data.rows.forEach((row) => {
              const email = emailIdx !== -1 ? row[emailIdx] : '';
              const name = nameIdx !== -1 ? row[nameIdx] : 'Unknown';
              const headline = headIdx !== -1 ? row[headIdx] : '';
              if (email) {
                combined.push({
                  name,
                  email,
                  headline,
                  source: sheet === githubSheetName ? 'github' : 'linkedin',
                });
              }
            });
          }
        }
        setLeads(combined);
      } catch {
        // network fallback
      } finally {
        setLoading(false);
      }
    };
    fetchAllLeads();
  }, [githubSheetName, linkedinSheetName, isConfigured]);

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.headline && l.headline.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelectEmail = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSend = () => {
    if (selectedEmails.length === 0) {
      alert('Please select at least one lead email recipient.');
      return;
    }
    const bccList = selectedEmails.join(',');
    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(htmlBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  const activeLead = selectedEmails.length === 1 ? leads.find((l) => l.email === selectedEmails[0]) : undefined;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="mb-2 pb-4 border-b border-[#21262d]">
        <h2 className="text-xl font-bold text-[#e6edf3] flex items-center gap-2">
          <MailIcon size={22} className="text-indigo-400" />
          Send Mail Center
        </h2>
        <p className="text-xs text-[#8b949e] mt-1">
          Drag handles between panels to resize all three boxes.
        </p>
      </div>

      <div ref={containerRef} className="flex flex-col lg:flex-row gap-3 items-stretch w-full">
        {/* Box 1: Left Column (Select Leads Box - Resizable) */}
        <div
          style={{ width: `${leftWidth}px` }}
          className="w-full lg:w-auto shrink-0 bg-[#161b22] border border-[#30363d] rounded-xl p-3 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[#e6edf3] uppercase tracking-wider truncate">
              Leads ({selectedEmails.length})
            </h3>
            {leads.length > 0 && (
              <button
                onClick={() =>
                  setSelectedEmails(
                    selectedEmails.length === leads.length ? [] : leads.map((l) => l.email)
                  )
                }
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold shrink-0"
              >
                {selectedEmails.length === leads.length ? 'Clear' : 'All'}
              </button>
            )}
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-[#e6edf3] focus:outline-none focus:border-indigo-500"
          />

          <div className="border border-[#21262d] rounded-lg overflow-y-auto max-h-[480px] divide-y divide-[#21262d] bg-[#0d1117]">
            {loading ? (
              <div className="p-3 text-center text-xs text-[#8b949e] flex items-center justify-center gap-2">
                <SpinnerIcon size={14} /> Loading...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#8b949e]">No leads found.</div>
            ) : (
              filteredLeads.map((item, idx) => {
                const isSelected = selectedEmails.includes(item.email);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-2 p-2 hover:bg-white/5 cursor-pointer text-xs transition-colors ${
                      isSelected ? 'bg-indigo-500/10' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectEmail(item.email)}
                      className="mt-0.5 rounded border-[#30363d] bg-[#161b22] text-indigo-600 focus:ring-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#e6edf3] truncate text-[11px]">{item.name}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-[#21262d] text-[#8b949e] uppercase shrink-0">
                          {item.source}
                        </span>
                      </div>
                      <div className="text-[#8b949e] text-[10px] truncate">{item.email}</div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Resizable Splitter 1 */}
        <ResizableSplitter onMouseDown={startResizeLeft} />

        {/* Box 2: Middle Column (Mail Composer Box - Auto Flex) */}
        <div className="flex-1 min-w-[300px] bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject line..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#e6edf3] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] mb-1">Message Body (Rich Text)</label>
            <RichTextEditor
              value={htmlBody}
              onChange={setHtmlBody}
              onApplySubject={setSubject}
              leadContext={activeLead}
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSend}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <MailIcon size={16} /> Send Email ({selectedEmails.length} recipients)
            </button>
          </div>
        </div>

        {/* Resizable Splitter 2 */}
        <ResizableSplitter onMouseDown={startResizeRight} />

        {/* Box 3: Right Column (AI Agent Box - Resizable) */}
        <div style={{ width: `${rightWidth}px` }} className="w-full lg:w-auto shrink-0">
          <AiSidebarWidget
            leadContext={activeLead}
            onSubjectGenerated={(subj) => setSubject(subj)}
            onStreamChunk={(chunkHtml) => setHtmlBody(chunkHtml)}
          />
        </div>
      </div>
    </div>
  );
}
