export const defaultSystemConfig = {
  firmBranding: {
    firmName: "JurisFlow Practice",
    tagline: "Advocates & Legal Consultants • High Court at Calcutta & Supreme Court",
    logoUrl: "https://api.iconify.design/material-symbols:balance.svg?color=%23FF6F1F",
    faviconUrl: "https://api.iconify.design/material-symbols:balance.svg?color=%23FF6F1F",
    primaryColor: "#FF6F1F",
    primaryContainer: "#FFE8D9",
    headerSubtitle: "Warm Minimalist Legal Practice Suite",
    masterDriveUrl: "https://drive.google.com/drive/my-drive"
  },
  courts: [
    { 
      id: 'c1', 
      code: 'CAL_HC_AS', 
      name: 'Calcutta High Court (Appellate Side)', 
      forumType: 'High Court', 
      state: 'West Bengal', 
      portalUrl: 'https://calcuttahighcourt.gov.in',
      queryEngine: 'HIGH_COURT_DIRECT',
      benches: ['Single Bench', 'Division Bench', 'Special Bench'] 
    },
    { 
      id: 'c2', 
      code: 'CAL_HC_OS', 
      name: 'Calcutta High Court (Original Side)', 
      forumType: 'High Court', 
      state: 'West Bengal', 
      portalUrl: 'https://calcuttahighcourt.gov.in',
      queryEngine: 'HIGH_COURT_DIRECT',
      benches: ['Commercial Division', 'Ordinary Original Civil', 'Admiralty'] 
    },
    { 
      id: 'c3', 
      code: 'SCI', 
      name: 'Supreme Court of India (New Delhi)', 
      forumType: 'Apex Court', 
      state: 'National', 
      portalUrl: 'https://main.sci.gov.in',
      queryEngine: 'SUPREME_COURT_DIRECT',
      benches: ['Court 1 (CJI)', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Vacation Bench'] 
    },
    { 
      id: 'c4', 
      code: 'NCLT_KOL', 
      name: 'National Company Law Tribunal (NCLT Kolkata)', 
      forumType: 'Tribunal', 
      state: 'West Bengal', 
      portalUrl: 'https://nclt.gov.in',
      queryEngine: 'TRIBUNAL_PORTAL',
      benches: ['Court 1', 'Court 2'] 
    },
    { 
      id: 'c5', 
      code: 'CAT_KOL', 
      name: 'Central Administrative Tribunal (CAT Kolkata)', 
      forumType: 'Tribunal', 
      state: 'West Bengal', 
      portalUrl: 'https://cgat.gov.in',
      queryEngine: 'TRIBUNAL_PORTAL',
      benches: ['Division Bench', 'Single Bench'] 
    },
    { 
      id: 'c6', 
      code: 'DC_ALIPORE', 
      name: 'District & Sessions Court, Alipore (South 24 Parganas)', 
      forumType: 'District Court', 
      state: 'West Bengal', 
      portalUrl: 'https://services.ecourts.gov.in',
      queryEngine: 'ECOURTS_CIS',
      benches: ['District Judge', '1st ADJ', '2nd ADJ', 'Civil Judge Sr. Div'] 
    },
    { 
      id: 'c7', 
      code: 'CCC_CAL', 
      name: 'City Civil Court, Calcutta', 
      forumType: 'City Civil Court', 
      state: 'West Bengal', 
      portalUrl: 'https://services.ecourts.gov.in',
      queryEngine: 'ECOURTS_CIS',
      benches: ['Chief Judge', 'Bench 3', 'Bench 5'] 
    }
  ],
  caseTypes: [
    'WPA (Writ Petition Article 226)',
    'CRA (Criminal Appeal)',
    'FMAT (First Misc Appeal Tender)',
    'CS (Civil Suit - Original Side)',
    'SLP(C) (Special Leave Petition Civil)',
    'SLP(Crl) (Special Leave Petition Criminal)',
    'CP(IB) (Insolvency Petition)',
    'OA (Original Application - Service Matters)',
    'Title Suit (Civil)',
    'Money Suit',
    'Arbitration Petition (Section 9/11/34)',
    'Consumer Dispute Complaint'
  ],
  caseStages: [
    'Initial Pleadings / Registration',
    'Notice Returnable / Service Verification',
    'Ad-Interim Stay / Injunction Hearing',
    'Affidavit-in-Opposition Filing',
    'Affidavit-in-Reply / Rejoinder',
    'Cross-Examination of Witnesses',
    'Final Hearing & Oral Arguments',
    'Written Notes of Arguments',
    'Reserved for Judgment / Order',
    'Certified Copy & Decree Execution',
    'Disposed'
  ],
  caseUrgencies: [
    { key: 'CRITICAL', label: 'Critical (Stay / Injunction / Ad-Interim)', color: 'rose' },
    { key: 'HIGH', label: 'High Priority (Listing Scheduled)', color: 'amber' },
    { key: 'MEDIUM', label: 'Standard Litigation Cadence', color: 'blue' },
    { key: 'LOW', label: 'Routine / Periodic Review', color: 'neutral' }
  ],
  taskCategories: [
    'Drafting - Writ / Plaint / Petition',
    'Drafting - Affidavit in Opposition / Rejoinder',
    'Case Law & Precedent Research',
    'Briefing Senior Advocate',
    'Client Conference & Proof Verification',
    'E-Filing & Court Fee Stamping',
    'Certified Copy & Caveat Search',
    'Cause List Tracking & Board Call',
    'Service Affidavit & Dasti Dispatch'
  ],
  taskPriorities: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
  taskStatuses: [
    { key: 'TODO', label: 'To Do' },
    { key: 'IN_PROGRESS', label: 'In Drafting & Research' },
    { key: 'REVIEW', label: 'Senior Counsel Review' },
    { key: 'COMPLETED', label: 'Completed & Filed' }
  ],
  driveFolderTemplate: [
    { id: 'f1', name: '01_Client_Documents', description: 'Vakalatnama, KYC, client notes, initial instructions, evidentiary records' },
    { id: 'f2', name: '02_Opposite_Party_Pleadings', description: 'Opposite side petitions, affidavits-in-opposition, rejoinders, summons' },
    { id: 'f3', name: '03_Drafts_In_Progress', description: 'Collaborative Google Docs for real-time internal co-drafting and senior review' },
    { id: 'f4', name: '04_Final_Court_Filings', description: 'Signed, verified, stamped e-filed petitions with court filing receipts' },
    { id: 'f5', name: '05_Orders_and_Judgments', description: 'Daily bench interim orders, certified copy scans, final decrees' },
    { id: 'f7', name: '05_AutoFetched_Court_Orders', description: 'Dedicated archive for automated eCourts CIS and High Court signed order sheets' },
    { id: 'f6', name: '06_Conference_Briefs', description: 'Compiled and indexed PDF briefs prepared for Senior Advocates & Clients' }
  ],
  microserviceUrl: 'http://localhost:5001',
  dedicatedOrderFolder: '05_AutoFetched_Court_Orders',
  autoSyncEnabled: true,
  autoSyncSchedule: '0 20 * * *', // Daily 8:00 PM
  reminderPresets: [
    { id: 'r0', daysBefore: 30, label: '30 Days Prior: Pleadings audit & rejoinder check', channel: 'In-App + Email', active: true },
    { id: 'r1', daysBefore: 14, label: '14 Days Prior: Initial draft & client compilation audit', channel: 'In-App + Email', active: true },
    { id: 'r2', daysBefore: 7, label: '7 Days Prior: Senior Advocate briefing conference confirmation', channel: 'In-App + Email', active: true },
    { id: 'r3', daysBefore: 3, label: '3 Days Prior: Final filings & document annexure audit', channel: 'In-App + Email', active: true },
    { id: 'r4', daysBefore: 1, label: '1 Day Prior: Preparation of List of Dates & Court Briefs', channel: 'In-App + Email + SMS', active: true },
    { id: 'r5', daysBefore: 0, label: 'Hearing Day 07:00 AM: Cause List Item Number & Bench Alert', channel: 'In-App + WhatsApp/SMS', active: true }
  ],
  emailTemplates: {
    subjectTemplate: "Litigation Brief for Consultation: {case_number} ({case_title}) before {court_name}",
    bodyTemplate: `Respected Senior Counsel / Client,\n\nPlease find enclosed the litigation brief and indexed pleadings in the matter scheduled for hearing on {next_date} before {bench_name}.\n\nGoogle Drive Case Dossier Access Link:\n{drive_link}\n\nPlease let us know your availability for a pre-hearing briefing conference on Google Meet.\n\nWarm regards,\n{lead_counsel}\n{firm_name}`
  }
};
