import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Video, Calendar, Clock, Users, Copy, Check, ExternalLink } from 'lucide-react';

export const GMeetModal = ({ isOpen, onClose, targetCase }) => {
  const { scheduleConference, showToast } = useApp();

  const [title, setTitle] = useState(
    targetCase ? `Briefing Conference: ${targetCase.caseNumber}` : 'Litigation Strategy Conference'
  );
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [time, setTime] = useState('19:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [attendeeEmail, setAttendeeEmail] = useState(targetCase?.clientEmail || '');
  const [agenda, setAgenda] = useState(
    `Pre-hearing conference with Senior Advocate and briefing counsel to discuss pleadings and list of dates.`
  );
  const [createdMeet, setCreatedMeet] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSchedule = (e) => {
    e.preventDefault();

    const conf = scheduleConference({
      caseId: targetCase?.id,
      caseNumber: targetCase?.caseNumber || 'CASE-GENERAL',
      title,
      date,
      time,
      durationMinutes,
      attendees: attendeeEmail ? [attendeeEmail] : [],
      agenda
    });

    setCreatedMeet(conf);
  };

  const copyMeetLink = () => {
    if (createdMeet?.meetUrl) {
      navigator.clipboard.writeText(createdMeet.meetUrl);
      setCopied(true);
      showToast('GMeet link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-m3-2xl shadow-m3-3 border border-neutral-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/80 to-blue-50/40 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-m3-lg bg-emerald-600 text-white shadow-xs">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">Schedule Google Meet Conference</h2>
              <p className="text-xs text-neutral-500">
                Staff Console • Integrated with Google Calendar & Google Workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200/60 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {createdMeet ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Video className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-neutral-900">Google Meet Link Generated</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Synced with Google Calendar for {createdMeet.date} at {createdMeet.time}
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-m3-lg border border-neutral-200 flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-neutral-800 truncate">
                  {createdMeet.meetUrl}
                </span>
                <button
                  onClick={copyMeetLink}
                  className="px-3 py-1.5 rounded-m3-md bg-white border border-neutral-300 hover:bg-neutral-100 text-xs font-medium text-neutral-700 flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <a
                  href={createdMeet.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-m3-full shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Join Conference Now
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-medium rounded-m3-full transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Conference Title / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Invite Client / Senior Advocate Email
                </label>
                <input
                  type="email"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  placeholder="senioradvocate@bar.in, client@corp.com"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Agenda & Conference Focus
                </label>
                <textarea
                  rows="2"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-m3-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-m3-full shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Video className="w-4 h-4" /> Generate GMeet Link & Sync
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
