# JurisFlow — Legal Practice & Case Management Platform

An enterprise-grade, cloud-native litigation practice management platform built with React 18, Vite, Google Material Design 3, and Firebase Firestore.

## Consoles & Capabilities
1. **Software Admin Console**:
   - Case Registration & Google Drive Folder Provisioning
   - Zero-Code System Customizer (UI branding, court masters, task categories, drive folder templates, reminder cadence)
   - User Registration Governance & Approval System
2. **Manager Admin Console**:
   - Master Cases Planning Board (Next date countdowns, last order summaries, forum & urgency filtering)
   - Task Delegation Hub (Modular Kanban board, multi-assignee allocation, deadlines, priorities)
3. **Staff Console (Advocates & Clerks)**:
   - **Track of Case Board**: Complete tracking of cases assigned strictly to the logged-in staff member's scope.
   - **Document Vault**: Automatic standard file renaming (`[YYYY-MM-DD]_[Category]_[Party]_[Description]_v1.[ext]`) and Google Drive folder routing.
   - **Live Co-Editing**: Integrated real-time collaborative Google Docs links.
   - **Conference Scheduler**: Instant Google Meet (`meet.google.com`) conference links & calendar sync.
   - **Share Case Brief**: Dynamic email brief composer and Google Drive bundle links.
   - **Hearing Date & Reminders**: Configurable reminder intervals (14d, 7d, 3d, 1d, 0d).
   - **Intelligent Order Fetcher**: Automated scraper simulation across Calcutta High Court, eCourts CIS (with Captcha OCR solving), and Supreme Court.

## Technology Stack
- **Database**: Cloud Firestore
- **Authentication**: Firebase Auth (Email/Password & Google Workspace OAuth)
- **Design**: Google Material Design 3 (Tailwind CSS, Material surface levels, Roboto typography)
- **Deployment**: GitHub Pages
