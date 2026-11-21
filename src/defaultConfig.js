export const defaultSystemConfig = {
  firmBranding: {
    firmName: "JurisFlow Practice",
    tagline: "Advocates & Legal Consultants • High Court at Calcutta & Supreme Court",
    logoUrl: "https://api.iconify.design/material-symbols:balance.svg?color=%23FF6F1F",
    faviconUrl: "https://api.iconify.design/material-symbols:balance.svg?color=%23FF6F1F",
    primaryColor: "#FF6F1F",
    primaryContainer: "#FFE8D9",
    headerSubtitle: "Warm Minimalist Legal Practice Suite",
  },
  courts: [
    { id: 'c1', code: 'CAL_HC_AS', name: 'Calcutta High Court (Appellate Side)', forumType: 'High Court', state: 'West Bengal', benches: ['Single Bench', 'Division Bench', 'Special Bench'] },
    { id: 'c2', code: 'CAL_HC_OS', name: 'Calcutta High Court (Original Side)', forumType: 'High Court', state: 'West Bengal', benches: ['Commercial Division', 'Ordinary Original Civil', 'Admiralty'] },
    { id: 'c3', code: 'SCI', name: 'Supreme Court of India (New Delhi)', forumType: 'Apex Court', state: 'National', benches: ['Court 1 (CJI)', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Vacation Bench'] },
    { id: 'c4', code: 'NCLT_KOL', name: 'National Company Law Tribunal (NCLT Kolkata)', forumType: 'Tribunal', state: 'West Bengal', benches: ['Court 1', 'Court 2'] },
    { id: 'c5', code: 'CAT_KOL', name: 'Central Administrative Tribunal (CAT Kolkata)', forumType: 'Tribunal', state: 'West Bengal', benches: ['Division Bench', 'Single Bench'] },
    { id: 'c6', code: 'DC_ALIPORE', name: 'District & Sessions Court, Alipore (South 24 Parganas)', forumType: 'District Court', state: 'West Bengal', benches: ['District Judge', '1st ADJ', '2nd ADJ', 'Civil Judge Sr. Div'] },
    { id: 'c7', code: 'CCC_CAL', name: 'City Civil Court, Calcutta', forumType: 'City Civil Court', state: 'West Bengal', benches: ['Chief Judge', 'Bench 3', 'Bench 5'] }
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
    'Money Suit'
  ],
  taskCategories: [
    'Drafting - Writ / Plaint / Petition',
    'Drafting - Affidavit in Opposition / Rejoinder',
    'Case Law & Precedent Research',
    'Briefing Senior Advocate',
    'Client Conference & Proof Verification',
    'E-Filing & Court Fee Stamping',
    'Certified Copy & Caveat Search',
    'Cause List Tracking & Board Call'
  ],
  driveFolderTemplate: [
    { id: 'f1', name: '01_Client_Documents', description: 'Vakalatnama, KYC, client notes, initial instructions, evidentiary records' },
    { id: 'f2', name: '02_Opposite_Party_Pleadings', description: 'Opposite side petitions, affidavits-in-opposition, rejoinders, summons' },
    { id: 'f3', name: '03_Drafts_In_Progress', description: 'Collaborative Google Docs for real-time internal co-drafting and senior review' },
    { id: 'f4', name: '04_Final_Court_Filings', description: 'Signed, verified, stamped e-filed petitions with court filing receipts' },
    { id: 'f5', name: '05_Orders_and_Judgments', description: 'Daily bench interim orders, certified copy scans, final decrees' },
    { id: 'f6', name: '06_Conference_Briefs', description: 'Compiled and indexed PDF briefs prepared for Senior Advocates & Clients' }
  ],
  reminderPresets: [
    { id: 'r1', daysBefore: 14, label: '14 Days Prior: Initial draft & client compilation audit', channel: 'In-App + Email', active: true },
    { id: 'r2', daysBefore: 7, label: '7 Days Prior: Senior Advocate briefing conference confirmation', channel: 'In-App + Email', active: true },
    { id: 'r3', daysBefore: 3, label: '3 Days Prior: Final filings & document annexure audit', channel: 'In-App + Email', active: true },
    { id: 'r4', daysBefore: 1, label: '1 Day Prior: Preparation of List of Dates & Court Briefs', channel: 'In-App + Email + SMS', active: true },
    { id: 'r5', daysBefore: 0, label: 'Hearing Day 07:00 AM: Cause List Item Number & Bench Alert', channel: 'In-App + WhatsApp/SMS', active: true }
  ]
};
