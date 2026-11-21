import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FolderPlus, CheckCircle2, ShieldAlert, Sparkles, Building2, User, FileText } from 'lucide-react';

export const CaseRegistrationModal = ({ isOpen, onClose }) => {
  const { systemConfig, users, createCase } = useApp();

  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [courtCode, setCourtCode] = useState(systemConfig.courts[0]?.code || 'CAL_HC_AS');
  const [bench, setBench] = useState('');
  const [caseType, setCaseType] = useState(systemConfig.caseTypes[0] || 'WPA');
  const [cnrNumber, setCnrNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [oppositeParty, setOppositeParty] = useState('');
  const [seniorAdvocate, setSeniorAdvocate] = useState('');
  const [leadCounsel, setLeadCounsel] = useState('');
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [urgency, setUrgency] = useState('MEDIUM');
  const [briefSummary, setBriefSummary] = useState('');
  const [isProvisioningDrive, setIsProvisioningDrive] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProvisioningDrive(true);

    // Simulate Google Drive folder creation based on admin templates
    setTimeout(() => {
      createCase({
        caseNumber,
        title,
        courtCode,
        bench,
        caseType,
        cnrNumber,
        clientName,
        clientEmail,
        clientPhone,
        oppositeParty,
        seniorAdvocate,
        leadCounsel,
        assignedStaff,
        urgency,
        briefSummary
      });

      setIsProvisioningDrive(false);
      setProvisionSuccess(true);

      setTimeout(() => {
        setProvisionSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  const toggleStaff = (userId) => {
    setAssignedStaff(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-m3-2xl shadow-m3-3 border border-neutral-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/40 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-m3-lg bg-material-primary text-white shadow-sm">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Register Case & Provision Google Drive</h2>
              <p className="text-xs text-neutral-500">
                Software Admin Console • Automatically provisions cloud directories according to firm taxonomy
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {provisionSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Case Registered Successfully!</h3>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">
                Google Drive folder hierarchy provisioned with all 6 categorized subdirectories. Case indexed in Master Litigation Board.
              </p>
            </div>
          ) : (
            <>
              {/* Primary Case Identification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Case Number / Filing Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="e.g. WPA/18920/2026 or CS/240/2026"
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Forum / Adjudicating Body *
                  </label>
                  <select
                    value={courtCode}
                    onChange={(e) => setCourtCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                  >
                    {systemConfig.courts.map(c => (
                      <option key={c.id} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Case Title */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Case Title (Petitioner vs Respondent) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. M/s Bengal Tea Estates Ltd vs. Commissioner of Commercial Taxes"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                />
              </div>

              {/* Court Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Case Type / Classification
                  </label>
                  <select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                  >
                    {systemConfig.caseTypes.map((ct, idx) => (
                      <option key={idx} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Bench / Court Room
                  </label>
                  <input
                    type="text"
                    value={bench}
                    onChange={(e) => setBench(e.target.value)}
                    placeholder="e.g. Division Bench (Court 11)"
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    eCourts CNR / Diary Number
                  </label>
                  <input
                    type="text"
                    value={cnrNumber}
                    onChange={(e) => setCnrNumber(e.target.value)}
                    placeholder="e.g. WBHC01-018920-2026"
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                  />
                </div>
              </div>

              {/* Client & Opposite Party Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-neutral-50 rounded-m3-lg border border-neutral-200">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Client Information
                  </p>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client Name / Corporation *"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
                  />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Client Contact Email"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
                  />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Client Phone / WhatsApp"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" /> Opposite Party & Counsel
                  </p>
                  <input
                    type="text"
                    required
                    value={oppositeParty}
                    onChange={(e) => setOppositeParty(e.target.value)}
                    placeholder="Opposite Party / State Department *"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
                  />
                  <input
                    type="text"
                    value={seniorAdvocate}
                    onChange={(e) => setSeniorAdvocate(e.target.value)}
                    placeholder="Designated Senior Advocate (if briefed)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
                  />
                  <input
                    type="text"
                    value={leadCounsel}
                    onChange={(e) => setLeadCounsel(e.target.value)}
                    placeholder="Lead Associate / Arguing Counsel"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
                  />
                </div>
              </div>

              {/* Staff Assignment */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Assign Litigation Staff (Advocates & Clerks)
                </label>
                <div className="flex flex-wrap gap-2">
                  {users.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleStaff(u.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        assignedStaff.includes(u.id)
                          ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-xs'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {u.name} ({u.role.replace('_', ' ')})
                    </button>
                  ))}
                </div>
              </div>

              {/* Brief Summary */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Brief Synopsis & Core Legal Issues
                </label>
                <textarea
                  rows="2"
                  value={briefSummary}
                  onChange={(e) => setBriefSummary(e.target.value)}
                  placeholder="Outline the core statutory violations, interim prayers sought, and status of notices..."
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                ></textarea>
              </div>

              {/* Automated Google Drive Directory Preview */}
              <div className="p-3 bg-blue-50/60 rounded-m3-lg border border-blue-200 text-xs">
                <p className="font-semibold text-blue-900 flex items-center gap-1.5 mb-1.5">
                  <FolderPlus className="w-4 h-4 text-blue-600" /> Automated Google Drive Hierarchy Provisioning
                </p>
                <div className="text-[11px] text-blue-800 font-mono space-y-0.5 pl-2 border-l-2 border-blue-300">
                  <p>📁 /LexChambers Litigations/{courtCode}_{caseNumber ? caseNumber.replace(/[\/\s]/g, '_') : 'CASE'}/</p>
                  {systemConfig.driveFolderTemplate.map(f => (
                    <p key={f.id} className="pl-4 text-neutral-600">├── 📁 {f.name}</p>
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
                  disabled={isProvisioningDrive}
                  className="px-5 py-2.5 bg-material-primary hover:bg-blue-700 text-white text-xs font-medium rounded-m3-full shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProvisioningDrive ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Provisioning Google Drive...
                    </>
                  ) : (
                    <>
                      Register Case & Create Folders
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>

      </div>
    </div>
  );
};
