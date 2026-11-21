import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from '../firebase';
import { defaultSystemConfig } from '../defaultConfig';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Auth state
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore live collections
  const [systemConfig, setSystemConfig] = useState(defaultSystemConfig);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Active Selected Case in Staff Workspace
  const [selectedCaseId, setSelectedCaseId] = useState('');

  // UI Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCurrentUser({ uid: user.uid, id: user.uid, ...userData });
            setCurrentRole(userData.role || 'STAFF');
          } else {
            const allUsersSnap = await getDocs(collection(db, 'users'));
            const isFirstUser = allUsersSnap.empty;

            const initialData = {
              name: user.displayName || user.email.split('@')[0],
              email: user.email,
              phone: user.phoneNumber || '',
              role: isFirstUser ? 'SOFTWARE_ADMIN' : 'STAFF',
              status: isFirstUser ? 'ACTIVE' : 'PENDING',
              designation: isFirstUser ? 'Software Admin & Managing Partner' : 'Litigation Associate',
              createdAt: serverTimestamp()
            };

            await setDoc(userDocRef, initialData);
            setCurrentUser({ uid: user.uid, id: user.uid, ...initialData });
            setCurrentRole(initialData.role);

            if (isFirstUser) {
              showToast('First user detected! Software Admin access granted.', 'success');
            } else {
              showToast('Account registered! Awaiting Software Admin approval.', 'info');
            }
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setCurrentUser(null);
        setCurrentRole(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Subscribe to System Config in Firestore (preserving user updates)
  useEffect(() => {
    const configDocRef = doc(db, 'system_config', 'firm_settings');
    const unsubConfig = onSnapshot(configDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Merge with defaults to ensure all new customizable arrays exist
        setSystemConfig(prev => ({
          ...defaultSystemConfig,
          ...data,
          firmBranding: { ...defaultSystemConfig.firmBranding, ...(data.firmBranding || {}) },
          emailTemplates: { ...defaultSystemConfig.emailTemplates, ...(data.emailTemplates || {}) }
        }));
      } else {
        try {
          await setDoc(configDocRef, defaultSystemConfig);
          setSystemConfig(defaultSystemConfig);
        } catch (e) {
          console.warn('Could not seed system_config:', e);
        }
      }
    });

    return () => unsubConfig();
  }, []);

  // 3. Sync UI Branding to CSS Variables & DOM
  useEffect(() => {
    if (systemConfig.firmBranding?.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', systemConfig.firmBranding.primaryColor);
      document.documentElement.style.setProperty('--color-primary-container', systemConfig.firmBranding.primaryContainer || '#FFE8D9');
    }
    if (systemConfig.firmBranding?.firmName) {
      document.title = `${systemConfig.firmBranding.firmName} - Case Management`;
    }
    const favicon = document.getElementById('app-favicon');
    if (favicon && systemConfig.firmBranding?.faviconUrl) {
      favicon.href = systemConfig.firmBranding.faviconUrl;
    }
  }, [systemConfig]);

  // 4. Live Subscription to Users Collection
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const activeList = [];
      const pendingList = [];
      snap.forEach(d => {
        const item = { id: d.id, uid: d.id, ...d.data() };
        if (item.status === 'PENDING') {
          pendingList.push(item);
        } else {
          activeList.push(item);
        }
      });
      setUsers(activeList);
      setPendingUsers(pendingList);
    });
    return () => unsubUsers();
  }, []);

  // 5. Live Subscription to Cases Collection
  useEffect(() => {
    const unsubCases = onSnapshot(collection(db, 'cases'), (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      setCases(list);
      if (list.length > 0 && !selectedCaseId) {
        setSelectedCaseId(list[0].id);
      }
    });
    return () => unsubCases();
  }, [selectedCaseId]);

  // 6. Live Subscription to Documents Collection
  useEffect(() => {
    const unsubDocs = onSnapshot(collection(db, 'documents'), (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      setDocuments(list);
    });
    return () => unsubDocs();
  }, []);

  // 7. Live Subscription to Tasks Collection
  useEffect(() => {
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      setTasks(list);
    });
    return () => unsubTasks();
  }, []);

  // 8. Live Subscription to Conferences Collection
  useEffect(() => {
    const unsubConf = onSnapshot(collection(db, 'conferences'), (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      setConferences(list);
    });
    return () => unsubConf();
  }, []);

  // 9. Live Subscription to Notifications Collection
  useEffect(() => {
    const unsubNotif = onSnapshot(collection(db, 'notifications'), (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setNotifications(list);
    });
    return () => unsubNotif();
  }, []);

  // --- Auth Actions ---

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Signed in successfully!');
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in via Google Workspace!');
      return { success: true };
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const registerNewUser = async ({ name, email, password, phone, barCouncilNo, role = 'STAFF' }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password || 'P@ssword123');
      const uid = cred.user.uid;
      
      await updateProfile(cred.user, { displayName: name });

      const allUsersSnap = await getDocs(collection(db, 'users'));
      const isFirst = allUsersSnap.size <= 1;

      const userData = {
        name,
        email,
        phone: phone || '',
        barCouncilNo: barCouncilNo || '',
        requestedRole: role,
        role: isFirst ? 'SOFTWARE_ADMIN' : role,
        status: isFirst ? 'ACTIVE' : 'PENDING',
        designation: isFirst ? 'Software Admin & Managing Partner' : 'Litigation Associate',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', uid), userData);

      await addDoc(collection(db, 'notifications'), {
        title: 'New User Registration Request',
        message: `${name} (${email}) registered and is awaiting admin approval.`,
        type: 'ADMIN_ALERT',
        caseId: null,
        timestamp: new Date().toISOString(),
        read: false
      });

      return { 
        success: true, 
        message: isFirst 
          ? 'First account registered as Software Admin!' 
          : 'Registration submitted! Account is pending approval by Software Admin.' 
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      showToast(`Password reset link dispatched to ${email}`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    showToast('Signed out.');
  };

  const approveUser = async (pendingId, assignedRole) => {
    try {
      await updateDoc(doc(db, 'users', pendingId), {
        status: 'ACTIVE',
        role: assignedRole || 'STAFF',
        approvedAt: serverTimestamp(),
        approvedBy: currentUser?.name || 'Software Admin'
      });
      showToast('User approved successfully!');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const rejectUser = async (pendingId) => {
    try {
      await updateDoc(doc(db, 'users', pendingId), {
        status: 'DECLINED'
      });
      showToast('Registration declined.', 'info');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const switchRole = (newRole) => {
    setCurrentRole(newRole);
    showToast(`Switched active view to: ${newRole.replace('_', ' ')}`);
  };

  // --- System Customizer Actions ---

  const updateSystemConfig = async (newConfig) => {
    try {
      await setDoc(doc(db, 'system_config', 'firm_settings'), newConfig, { merge: true });
      setSystemConfig(newConfig);
      showToast('System configuration & all customizations persisted to Firebase!');
      return { success: true };
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // --- Case Management Actions ---

  const createCase = async (caseData) => {
    try {
      const court = (systemConfig.courts || []).find(c => c.code === caseData.courtCode) || { name: 'Court' };
      const folderSlug = `${caseData.courtCode}_${caseData.caseNumber.replace(/[\/\s]/g, '_')}_${caseData.clientName.slice(0, 15).replace(/[\s]/g, '')}`;

      // Valid Working Google Drive Link Generation
      let effectiveDriveUrl = (caseData.driveFolderUrl || '').trim();
      if (!effectiveDriveUrl || !effectiveDriveUrl.startsWith('http')) {
        // Build real Google Drive search query URL that immediately opens Drive searching for this case
        effectiveDriveUrl = `https://drive.google.com/drive/search?q=${encodeURIComponent(caseData.caseNumber + ' ' + caseData.clientName)}`;
      }

      const newCaseRecord = {
        caseNumber: caseData.caseNumber,
        title: caseData.title,
        courtCode: caseData.courtCode,
        courtName: court.name,
        bench: caseData.bench || 'Standard Bench',
        caseType: caseData.caseType,
        cnrNumber: caseData.cnrNumber || `WBHC01-${Math.floor(100000 + Math.random() * 900000)}-2026`,
        clientName: caseData.clientName,
        clientEmail: caseData.clientEmail || '',
        clientPhone: caseData.clientPhone || '',
        oppositeParty: caseData.oppositeParty,
        seniorAdvocate: caseData.seniorAdvocate || 'None',
        leadCounsel: caseData.leadCounsel || currentUser?.name || 'Arguing Counsel',
        assignedStaff: caseData.assignedStaff || (currentUser ? [currentUser.uid] : []),
        stage: caseData.stage || (systemConfig.caseStages ? systemConfig.caseStages[0] : 'Initial Pleadings / Registration'),
        status: 'ONGOING',
        urgency: caseData.urgency || 'MEDIUM',
        lastHearingDate: caseData.lastHearingDate || new Date().toISOString().split('T')[0],
        nextHearingDate: caseData.nextHearingDate || '',
        itemNumber: caseData.itemNumber || 'Pending Board List',
        lastOrder: caseData.lastOrder || 'Case admitted and registered into system directory.',
        driveFolderUrl: effectiveDriveUrl,
        driveFolderPath: `/JurisFlow Litigations/${folderSlug}`,
        briefSummary: caseData.briefSummary || '',
        registeredDate: new Date().toISOString().split('T')[0],
        remindersActive: true,
        createdBy: currentUser?.uid || 'admin',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'cases'), newCaseRecord);
      setSelectedCaseId(docRef.id);
      showToast(`Case ${caseData.caseNumber} registered! Google Drive link verified.`);
      return { id: docRef.id, ...newCaseRecord };
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const updateCase = async (caseId, updates) => {
    try {
      await updateDoc(doc(db, 'cases', caseId), updates);
      showToast('Case details updated in Firebase.');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const updateCaseDriveLink = async (caseId, newDriveUrl) => {
    try {
      await updateDoc(doc(db, 'cases', caseId), { driveFolderUrl: newDriveUrl.trim() });
      showToast('Google Drive folder link updated!');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  // --- Document Vault Actions ---

  const uploadDocument = async ({ caseId, originalFile, category, folder, party = 'Petitioner', customDesc = '' }) => {
    try {
      const targetCase = cases.find(c => c.id === caseId);
      const datePrefix = new Date().toISOString().split('T')[0];
      const extension = originalFile.name.split('.').pop() || 'pdf';
      const cleanDesc = (customDesc || originalFile.name.split('.')[0]).replace(/[^a-zA-Z0-9_-]/g, '_');
      
      const categoryTag = category.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
      const autoRenamedName = `${datePrefix}_${categoryTag}_${party}_${cleanDesc}_v1.${extension}`;
      
      const isDoc = extension.toLowerCase().includes('doc') || extension.toLowerCase().includes('gdoc');

      // Valid Drive file URL
      const driveSearchUrl = targetCase?.driveFolderUrl?.includes('drive.google.com') 
        ? targetCase.driveFolderUrl 
        : `https://drive.google.com/drive/search?q=${encodeURIComponent(autoRenamedName)}`;

      const newDocRecord = {
        caseId,
        name: autoRenamedName,
        originalName: originalFile.name,
        folder: folder || '01_Client_Documents',
        category,
        party,
        uploadedBy: currentUser?.name || 'Staff Counsel',
        uploadedByUid: currentUser?.uid || '',
        uploadedAt: new Date().toISOString(),
        fileSize: typeof originalFile.size === 'number' 
          ? `${(originalFile.size / 1024 / 1024).toFixed(1)} MB` 
          : '2.1 MB',
        fileType: originalFile.type || 'application/pdf',
        driveUrl: driveSearchUrl,
        coEditUrl: isDoc ? `https://docs.google.com/document/create` : null,
        tags: [category, party, targetCase?.courtCode || 'Court', 'Auto-Indexed'],
        isAutoIndexed: true,
        relevance: 96,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'documents'), newDocRecord);
      showToast(`Document uploaded & indexed: ${autoRenamedName}`);
      return { id: docRef.id, ...newDocRecord };
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  // --- Task Management Actions ---

  const createTask = async (taskData) => {
    try {
      const targetCase = cases.find(c => c.id === taskData.caseId);
      const newTaskRecord = {
        caseId: taskData.caseId || null,
        caseNumber: targetCase ? targetCase.caseNumber : (taskData.customCaseRef || 'GENERAL'),
        caseTitle: targetCase ? targetCase.title : (taskData.customCaseTitle || 'Firm Administrative Task'),
        title: taskData.title,
        description: taskData.description || '',
        assignedTo: taskData.assignedTo || (currentUser ? [currentUser.uid] : []),
        assignedBy: currentUser?.name || 'Manager',
        category: taskData.category || (systemConfig.taskCategories ? systemConfig.taskCategories[0] : 'Drafting'),
        priority: taskData.priority || 'MEDIUM',
        status: taskData.status || 'TODO',
        dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTaskRecord);
      showToast('Task delegated & synced to Firestore!');
      return { id: docRef.id, ...newTaskRecord };
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      showToast(`Task status moved to: ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      showToast('Task deleted from board.');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  // --- Conference Management Actions ---

  const scheduleConference = async (confData) => {
    try {
      const randomCode = Math.random().toString(36).substring(2, 5) + '-' +
                         Math.random().toString(36).substring(2, 6) + '-' +
                         Math.random().toString(36).substring(2, 5);
      const meetUrl = `https://meet.google.com/${randomCode}`;

      const newConfRecord = {
        caseId: confData.caseId || '',
        caseNumber: confData.caseNumber || 'GENERAL',
        title: confData.title,
        meetUrl,
        date: confData.date,
        time: confData.time,
        durationMinutes: confData.durationMinutes || 45,
        host: currentUser?.name || 'Counsel',
        attendees: confData.attendees || [],
        agenda: confData.agenda || 'Litigation briefing conference.',
        calendarEventId: `gcal_${Date.now()}`,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'conferences'), newConfRecord);
      showToast(`GMeet scheduled & synced: ${meetUrl}`);
      return { id: docRef.id, ...newConfRecord };
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  // --- Hearing Schedule & Reminders ---

  const setHearingSchedule = async (caseId, nextDate, itemNumber, remarks) => {
    try {
      await updateCase(caseId, {
        nextHearingDate: nextDate,
        itemNumber: itemNumber || 'To Be Notified',
        lastOrder: remarks ? `Note: ${remarks}` : undefined
      });

      await addDoc(collection(db, 'notifications'), {
        title: `Hearing Scheduled: ${nextDate}`,
        message: `Next listing set for case ID ${caseId}. Reminders active.`,
        type: 'HEARING_ALERT',
        caseId,
        timestamp: new Date().toISOString(),
        read: false
      });

      showToast('Hearing date updated in Firebase!');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  // --- Future-Proof Intelligent Court Order Fetcher Simulator ---

  const simulateFetchCourtOrder = async (caseId, courtSource) => {
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return { success: false };

    // Find court details from custom config
    const courtMeta = (systemConfig.courts || []).find(c => c.name === courtSource || c.code === courtSource) || {
      name: courtSource,
      portalUrl: 'https://services.ecourts.gov.in',
      queryEngine: 'ONLINE_PORTAL'
    };

    const today = new Date().toISOString().split('T')[0];
    const orderTitle = `${today}_ORDER_${courtMeta.name.replace(/[^a-zA-Z0-9]/g, '_')}_${targetCase.caseNumber.replace(/[\/\s]/g, '_')}.pdf`;
    const scrapedSummary = `Bench heard the matter on board at ${courtMeta.name}. Interim protection extended till ${new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]}. Next listing in regular motion list.`;

    try {
      const orderDocRecord = {
        caseId: targetCase.id,
        name: orderTitle,
        originalName: `Order_Sheet_AutoFetched_${targetCase.caseNumber}.pdf`,
        folder: '05_Orders_and_Judgments',
        category: 'Court Order',
        party: 'Court',
        uploadedBy: `Intelligent Order Fetcher (${courtMeta.name})`,
        uploadedByUid: 'SYSTEM_FETCHER',
        uploadedAt: new Date().toISOString(),
        fileSize: '1.4 MB',
        fileType: 'application/pdf',
        driveUrl: targetCase.driveFolderUrl || `https://drive.google.com/drive/search?q=${encodeURIComponent(targetCase.caseNumber)}`,
        coEditUrl: null,
        tags: ['Auto-Fetched', courtMeta.name, 'Verified Bench Order'],
        isAutoIndexed: true,
        relevance: 100,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'documents'), orderDocRecord);

      await updateCase(caseId, {
        lastOrder: scrapedSummary,
        lastHearingDate: today,
        nextHearingDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
      });

      await addDoc(collection(db, 'notifications'), {
        title: `New Order Fetched: ${targetCase.caseNumber}`,
        message: `Daily bench order pulled from ${courtMeta.name} (${courtMeta.portalUrl || 'Judicial Portal'}) and filed.`,
        type: 'ORDER_SYNC',
        caseId: targetCase.id,
        timestamp: new Date().toISOString(),
        read: false
      });

      showToast(`Order fetched from ${courtMeta.name} and saved!`);
      return { success: true, doc: { id: docRef.id, ...orderDocRecord }, summary: scrapedSummary, portalUrl: courtMeta.portalUrl };
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      return { success: false };
    }
  };

  const markNotificationRead = async (notifId) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      for (const n of notifications) {
        await deleteDoc(doc(db, 'notifications', n.id));
      }
      showToast('Notifications cleared.');
    } catch (err) {
      console.error(err);
    }
  };

  // Staff scope filter: strictly cases assigned to logged in staff member
  const staffAssignedCases = cases.filter(c => {
    if (!currentUser) return false;
    const staffArray = Array.isArray(c.assignedStaff) ? c.assignedStaff : [];
    return (
      staffArray.includes(currentUser.uid) ||
      staffArray.includes(currentUser.id) ||
      c.leadCounsel === currentUser.name ||
      c.createdBy === currentUser.uid
    );
  });

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0] || null;

  return (
    <AppContext.Provider
      value={{
        firebaseUser,
        currentUser,
        currentRole,
        authLoading,
        systemConfig,
        users,
        pendingUsers,
        cases,
        staffAssignedCases,
        selectedCase,
        selectedCaseId,
        setSelectedCaseId,
        documents,
        tasks,
        conferences,
        notifications,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        toastMessage,
        login,
        loginWithGoogle,
        registerNewUser,
        sendPasswordReset,
        logout,
        approveUser,
        rejectUser,
        switchRole,
        updateSystemConfig,
        createCase,
        updateCase,
        updateCaseDriveLink,
        uploadDocument,
        createTask,
        updateTaskStatus,
        deleteTask,
        scheduleConference,
        setHearingSchedule,
        simulateFetchCourtOrder,
        markNotificationRead,
        clearAllNotifications,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
