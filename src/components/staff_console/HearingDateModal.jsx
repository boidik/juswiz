import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export const HearingDateModal = ({ isOpen, onClose, targetCase }) => {
  const { systemConfig, setHearingSchedule } = useApp();

  const [nextDate, setNextDate] = useState(
    targetCase?.nextHearingDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [itemNumber, setItemNumber] = useState(targetCase?.itemNumber || 'Item No. 12 (Court 13)');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nextDate) return;

    setHearingSchedule(targetCase.id, nextDate, itemNumber, remarks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-m3-2xl shadow-m3-3 border border-neutral-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50/80 to-yellow-50/40 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-m3-lg bg-amber-600 text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">Log Hearing Date & Arm Reminders</h2>
              <p className="text-xs text-neutral-500">
                Staff Console • Triggers automated reminder intervals according to firm rules
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
              {targetCase?.caseNumber}
            </span>
            <h4 className="text-sm font-bold text-neutral-900 mt-1">{targetCase?.title}</h4>
            <p className="text-xs text-neutral-500">{targetCase?.courtName} • {targetCase?.bench}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Next Hearing Date *
              </label>
              <input
                type="date"
                required
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Cause List Item Number
              </label>
              <input
                type="text"
                value={itemNumber}
                onChange={(e) => setItemNumber(e.target.value)}
                placeholder="e.g. Item No. 24 (Motion List)"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Bench Listing Remarks / Interim Directives
            </label>
            <textarea
              rows="2"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Fixed for final hearing. Both parties directed to submit written notes of arguments."
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
            ></textarea>
          </div>

          {/* Active Reminder Schedule Preview */}
          <div className="p-3 bg-amber-50/60 rounded-m3-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              Automated Reminders Scheduled (Configured in Software Admin)
            </p>
            <div className="space-y-1.5">
              {systemConfig.reminderPresets.map(r => (
                <div key={r.id} className="flex items-center justify-between text-[11px] text-amber-800 bg-white/80 px-2 py-1 rounded border border-amber-200">
                  <span className="font-medium">{r.label}</span>
                  <span className="font-mono text-[10px] text-neutral-500">{r.channel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-m3-full shadow-xs flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Schedule & Arm Alerts
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
