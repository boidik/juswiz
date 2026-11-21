import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Video, 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  Mail,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { buildGmailWebUrl } from '../../services/googleWorkspace';

export const GMeetModal = ({ isOpen, onClose, targetCase }) => {
  const { scheduleConference, showToast, isGoogleConnected, connectGoogleWorkspace } = useApp();

  const [title, setTitle] = useState(
    targetCase ? `Briefing Conference: ${targetCase.caseNumber}` : 'Litigation Strategy Conference'
  );
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [time, setTime] = useState('17:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [attendeeEmail, setAttendeeEmail] = useState(targetCase?.clientEmail || '');
  const [agenda, setAgenda] = useState(
    `Pre-hearing briefing on Google Meet with Senior Advocate and arguing counsel regarding ${targetCase?.caseNumber || 'active matter'}.`
  );
  const [createdMeet, setCreatedMeet] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSchedule = async (e) => {
    e.preventDefault();
    setIsScheduling(true);

    try {
      const conf = await scheduleConference({
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
    } catch (err) {
      console.error(err);
      showToast('Could not schedule conference: ' + err.message, 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const copyMeetLink = () => {
    if (createdMeet?.meetUrl) {
      navigator.clipboard.writeText(createdMeet.meetUrl);
      setCopied(true);
      showToast('Google Meet link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyFullInvite = () => {
    if (!createdMeet) return;
    const inviteText = `Litigation Conference Invitation:\n${createdMeet.title}\nDate: ${createdMeet.date} at ${createdMeet.time} (${createdMeet.durationMinutes} mins)\n\nGoogle Meet Link: ${createdMeet.meetUrl}\n\nAdd to Google Calendar:\n${createdMeet.calendarUrl}\n\nAgenda:\n${createdMeet.agenda}`;
    navigator.clipboard.writeText(inviteText);
    showToast('Full conference invite copied to clipboard!');
  };

  const gmailInviteUrl = createdMeet ? buildGmailWebUrl({
    to: attendeeEmail || '',
    subject: `Google Meet Invitation: ${createdMeet.title}`,
    body: `Respected Counsel / Client,\n\nYou are invited to a litigation briefing conference on Google Meet.\n\nDate: ${createdMeet.date}\nTime: ${createdMeet.time} (${createdMeet.durationMinutes} minutes)\n\nJoin Google Meet:\n${createdMeet.meetUrl}\n\nAdd to Google Calendar:\n${createdMeet.calendarUrl}\n\nAgenda:\n${createdMeet.agenda}\n\nWarm regards,\nLitigation Counsel`
  }) : '#';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.35)] overflow-hidden my-4 sm:my-8">
        
        {/* Header */}
        <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-warm-borderSubtle/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-warm-obsidian font-display tracking-tight">
                  Schedule Google Meet
                </h2>
                {isGoogleConnected ? (
                  <span className="px-2 py-0.5 rounded-pill text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    G-Calendar Synced
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-pill text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-warm-muted mt-0.5">
                Generates verified meet.google.com link & syncs with Google Calendar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-warm-sand/50 hover:bg-warm-sand flex items-center justify-center text-warm-graphite transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7">
          {createdMeet ? (
            <div className="space-y-4 text-center py-2 animate-fade-in">
              <div className="w-14 h-14 sun-gradient-circle text-white rounded-full flex items-center justify-center mx-auto shadow-amber-glow animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>

              <div>
                <h3 className="text-base font-bold text-warm-obsidian font-display">{createdMeet.title}</h3>
                <p className="text-xs text-warm-muted mt-0.5">
                  Scheduled for <strong className="text-warm-obsidian">{createdMeet.date}</strong> at <strong className="text-warm-obsidian">{createdMeet.time}</strong> ({createdMeet.durationMinutes} mins)
                </p>
              </div>

              {/* Verified GMeet Box */}
              <div className="p-4 bg-white/90 rounded-3xl border border-warm-borderSubtle space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-left truncate">
                    <Video className="w-4 h-4 text-terracotta shrink-0" />
                    <span className="font-mono text-xs font-bold text-warm-obsidian truncate">
                      {createdMeet.meetUrl}
                    </span>
                  </div>
                  <button
                    onClick={copyMeetLink}
                    className="px-3 py-1.5 rounded-pill bg-white border border-warm-borderSubtle hover:bg-warm-sand text-xs font-semibold text-warm-graphite flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={createdMeet.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="capsule-btn-dark text-xs justify-center"
                >
                  <span>Join Google Meet</span>
                  <div className="knob"><Video className="w-3.5 h-3.5 text-white" /></div>
                </a>

                <a
                  href={createdMeet.calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sync Google Calendar</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 border-t border-warm-borderSubtle/60 text-xs">
                <a
                  href={gmailInviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-warm-graphite hover:text-warm-obsidian hover:bg-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-terracotta" /> Send Invite via Gmail
                </a>

                <button
                  type="button"
                  onClick={copyFullInvite}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-warm-graphite hover:text-warm-obsidian hover:bg-white transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-warm-muted" /> Copy Invitation Text
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="text-xs text-warm-muted hover:text-warm-obsidian font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSchedule} className="space-y-3.5">
              
              {/* Google Workspace Connection Pill */}
              <div className="flex items-center justify-between p-3 bg-white/70 rounded-2xl border border-warm-borderSubtle text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isGoogleConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="font-semibold text-warm-obsidian">
                    {isGoogleConnected ? 'Google Workspace Connected' : 'Google Calendar 1-Click Sync Ready'}
                  </span>
                </div>
                {!isGoogleConnected && (
                  <button
                    type="button"
                    onClick={connectGoogleWorkspace}
                    className="text-[11px] font-bold text-terracotta hover:underline"
                  >
                    Authorize Google
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Conference Heading *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full capsule-input text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full capsule-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full capsule-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
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
                  Attendee Email (Senior Counsel / Client)
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
                  className="w-full rounded-2xl p-3 text-xs bg-white/80 border border-warm-borderSubtle focus:outline-none focus:ring-2 focus:ring-terracotta/20 leading-relaxed"
                />
              </div>

              {/* Instant Meeting Quick Shortcut */}
              <div className="flex items-center justify-between text-[11px] text-warm-muted pt-1">
                <span>Need a meeting right now?</span>
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-terracotta hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Start Instant GMeet (meet.google.com/new)
                </a>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-warm-borderSubtle/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-warm-muted hover:text-warm-obsidian font-semibold px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="capsule-btn-dark text-xs"
                >
                  <span>{isScheduling ? 'Scheduling...' : 'Generate Google Meet'}</span>
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
