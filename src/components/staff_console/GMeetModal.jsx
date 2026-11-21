import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Video, Calendar, Clock, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';

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
    `Pre-hearing briefing on GMeet with Senior Advocate and arguing counsel.`
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.35)] overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-warm-borderSubtle/60 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-warm-obsidian font-display tracking-tight">
              Schedule Google Meet
            </h2>
            <p className="text-xs text-warm-muted mt-0.5">
              Generates active meet.google.com link & syncs with Google Calendar
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-warm-sand/50 hover:bg-warm-sand flex items-center justify-center text-warm-graphite transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-7">
          {createdMeet ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 sun-gradient-circle text-white rounded-full flex items-center justify-center mx-auto shadow-amber-glow">
                <Video className="w-8 h-8 text-white" />
              </div>

              <div>
                <h3 className="text-base font-bold text-warm-obsidian font-display">GMeet Conference Active</h3>
                <p className="text-xs text-warm-muted mt-0.5">
                  Scheduled for {createdMeet.date} at {createdMeet.time}
                </p>
              </div>

              <div className="p-3.5 bg-white/80 rounded-2xl border border-warm-borderSubtle flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-warm-obsidian truncate">
                  {createdMeet.meetUrl}
                </span>
                <button
                  onClick={copyMeetLink}
                  className="px-3 py-1.5 rounded-pill bg-white border border-warm-borderSubtle hover:bg-warm-sand/40 text-xs font-medium text-warm-graphite flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={createdMeet.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Join Conference</span>
                  <div className="knob"><ExternalLink className="w-3.5 h-3.5 text-white" /></div>
                </a>

                <button
                  onClick={onClose}
                  className="text-xs text-warm-muted hover:text-warm-obsidian font-medium px-4 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Conference Heading *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full capsule-input text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full capsule-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full capsule-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full capsule-input text-xs"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Invite Email (Senior Counsel / Client)
                </label>
                <input
                  type="email"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  placeholder="senioradvocate@bar.in"
                  className="w-full capsule-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Agenda & Conference Focus
                </label>
                <textarea
                  rows="2"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full rounded-2xl p-3 text-xs bg-white/80 border border-warm-borderSubtle focus:outline-none focus:border-terracotta"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-warm-borderSubtle/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-warm-muted hover:text-warm-obsidian font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Generate GMeet Link</span>
                  <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
