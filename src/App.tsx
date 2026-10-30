import React, { useState, useEffect, useRef } from 'react';
import { 
  ClinicalVisit, 
  ConfidenceToken, 
  DiagnosisEntry, 
  MedicationItem, 
  Patient, 
  SafetyAlert, 
  UserRole, 
  Vitals 
} from './types/clinical.ts';
import { StorageService } from './services/storageService.ts';
import { runClinicalSafetyChecks } from './services/safetyEngine.ts';
import { structureClinicalNote } from './services/clinicalParser.ts';
import { CLINICAL_CASE_PRESETS } from './data/clinicalCasePresets.ts';

// UI Components
import { NavigationRail, TabKey } from './components/NavigationRail.tsx';
import { FacilityShowcaseSlides } from './components/FacilityShowcaseSlides.tsx';
import { PatientBanner } from './components/PatientBanner.tsx';
import { VoiceScribeSection } from './components/VoiceScribeSection.tsx';
import { SafetyAlertsPanel } from './components/SafetyAlertsPanel.tsx';
import { StructuredNoteEditor } from './components/StructuredNoteEditor.tsx';
import { PrescriptionPrintModal } from './components/PrescriptionPrintModal.tsx';
import { PatientCommunicationDrawer } from './components/PatientCommunicationDrawer.tsx';
import { PatientLookupModal } from './components/PatientLookupModal.tsx';
import { NurseVitalsView } from './components/NurseVitalsView.tsx';
import { PharmacyDispenseView } from './components/PharmacyDispenseView.tsx';
import { HmisReportDashboard } from './components/HmisReportDashboard.tsx';
import { AuditTrailModal } from './components/AuditTrailModal.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { createSlideVariants, SPRING_PHYSICS } from './utils/motion.ts';

const TAB_ORDER: TabKey[] = ['consultation', 'nurse', 'pharmacy', 'reports', 'audit'];

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<TabKey>('consultation');
  const [prevTab, setPrevTab] = useState<TabKey>('consultation');
  const [userRole, setUserRole] = useState<UserRole>('doctor');
  const [isOffline, setIsOffline] = useState<boolean>(StorageService.isOffline());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showFacilitySlides, setShowFacilitySlides] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [shakeSafetyAlerts, setShakeSafetyAlerts] = useState<boolean>(false);

  // Clinical Records State
  const [patients, setPatients] = useState<Patient[]>(StorageService.getPatients());
  const [activePatient, setActivePatient] = useState<Patient>(StorageService.getPatients()[0]);
  const [visits, setVisits] = useState<ClinicalVisit[]>(StorageService.getVisits());
  const [auditLogs, setAuditLogs] = useState(StorageService.getAuditLogs());

  // Active Consultation Form State
  const [transcript, setTranscript] = useState<string>('');
  const [tokens, setTokens] = useState<ConfidenceToken[]>([]);
  const [chiefComplaints, setChiefComplaints] = useState<string[]>(['Acute Nasopharyngitis (ஜலதோஷம்)', 'Mild headache']);
  const [vitals, setVitals] = useState<Vitals>({ bp: '124/82', pulse: 74, temperature: '98.6 F', weight: '68 kg' });
  const [diagnosis, setDiagnosis] = useState<DiagnosisEntry[]>([
    { icd10: 'J00', nameEn: 'Acute Nasopharyngitis (Common Cold)', nameTa: 'சிம்பிள் ஜலதோஷம்', isPrimary: true },
  ]);
  const [medications, setMedications] = useState<MedicationItem[]>([
    {
      id: 'med-init-1',
      drugName: 'Paracetamol',
      tamilName: 'பராசிட்டமால்',
      form: 'Tablet',
      dosage: '500 mg',
      frequency: '1-1-1',
      frequencyTamil: 'காலை 1, மதியம் 1, இரவு 1',
      durationDays: 3,
      duration: '3 days',
      instructions: 'After food',
      instructionsTamil: 'உணவுக்குப் பின்',
      inEssentialList: true,
      dispensed: false,
    },
    {
      id: 'med-init-2',
      drugName: 'Cetirizine',
      tamilName: 'செட்டிரிசின்',
      form: 'Tablet',
      dosage: '10 mg',
      frequency: '0-0-1',
      frequencyTamil: 'இரவு படுக்கும் முன் 1 மாத்திரை',
      durationDays: 3,
      duration: '3 days',
      instructions: 'After food',
      instructionsTamil: 'உணவுக்குப் பின்',
      inEssentialList: true,
      dispensed: false,
    },
  ]);
  const [advice, setAdvice] = useState<string>('Drink warm fluids, rest well. Return if fever exceeds 101 F.');
  const [adviceTamil, setAdviceTamil] = useState<string>('வெதுவெதுப்பான நீர் அருந்தவும், நல்ல ஓய்வு எடுக்கவும். அதிக காய்ச்சல் நீடித்தால் உடனே வரவும்.');
  const [referralNeeded, setReferralNeeded] = useState<boolean>(false);
  const [referralFacility, setReferralFacility] = useState<string>('District Headquarter Hospital, Pollachi');
  const [referralReason, setReferralReason] = useState<string>('');
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [docTimeSeconds, setDocTimeSeconds] = useState<number>(42);

  // Modals
  const [lookupMode, setLookupMode] = useState<'search' | 'scan' | 'register'>('search');
  const [showLookupModal, setShowLookupModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showCommunicationDrawer, setShowCommunicationDrawer] = useState<boolean>(false);
  const [activeApprovedVisit, setActiveApprovedVisit] = useState<ClinicalVisit | null>(null);

  const docTimerRef = useRef<any>(null);

  // Sync dark mode class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Tab Switch with Direction Tracking
  const handleSelectTab = (newTab: TabKey) => {
    setPrevTab(activeTab);
    setActiveTab(newTab);
  };

  const navDirection = TAB_ORDER.indexOf(activeTab) >= TAB_ORDER.indexOf(prevTab) ? 'forward' : 'backward';

  // Initialize and run safety checks whenever patient, medications, or vitals change
  useEffect(() => {
    const alerts = runClinicalSafetyChecks(activePatient, medications, vitals);
    setSafetyAlerts(alerts);
  }, [activePatient, medications, vitals]);

  // Documentation timer
  useEffect(() => {
    if (!isApproved) {
      docTimerRef.current = setInterval(() => {
        setDocTimeSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(docTimerRef.current);
    }
    return () => clearInterval(docTimerRef.current);
  }, [isApproved]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleOffline = (offline: boolean) => {
    setIsOffline(offline);
    StorageService.setOfflineMode(offline);
    showToast(
      offline
        ? 'Offline Mode Activated: Records stored on local encrypted storage.'
        : 'Online Mode Restored: Real-time central sync enabled.'
    );
  };

  // Perform Voice / Preset Structuring
  const handleStructureNote = async (customTranscript?: string) => {
    const textToProcess = customTranscript || transcript;
    if (!textToProcess.trim()) return;

    setIsProcessing(true);
    setIsApproved(false);
    setDocTimeSeconds(0);

    try {
      const parsed = await structureClinicalNote(textToProcess, activePatient);
      setTranscript(parsed.rawTranscript);
      setTokens(parsed.tokens);
      if (parsed.chiefComplaints.length > 0) setChiefComplaints(parsed.chiefComplaints);
      if (parsed.vitals && (parsed.vitals.bp || parsed.vitals.pulse)) {
        setVitals((prev) => ({ ...prev, ...parsed.vitals }));
      }
      if (parsed.diagnosis.length > 0) setDiagnosis(parsed.diagnosis);
      if (parsed.medications.length > 0) setMedications(parsed.medications);
      if (parsed.advice) setAdvice(parsed.advice);
      if (parsed.adviceTamil) setAdviceTamil(parsed.adviceTamil);
      setReferralNeeded(parsed.referralNeeded);
      if (parsed.referralFacility) setReferralFacility(parsed.referralFacility);
      if (parsed.referralReason) setReferralReason(parsed.referralReason);

      StorageService.logAudit({
        userId: 'DOC-1029',
        userName: 'Dr. S. Kabilan, MBBS',
        role: userRole,
        action: 'DICTATION_CAPTURED',
        details: `Captured Tamil voice dictation for ${activePatient.name}. Structured ${parsed.medications.length} medicines and ICD-10 diagnosis.`,
      });

      setAuditLogs(StorageService.getAuditLogs());
      showToast('EMR note structured successfully from Tamil speech!');
    } catch (err: any) {
      console.error('Note structuring failed:', err);
      showToast('Offline parser processed note successfully.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Override Alert with Clinical Rationale
  const handleOverrideAlert = (alertId: string, reason: string) => {
    const updatedAlerts = safetyAlerts.map((a) =>
      a.id === alertId
        ? {
            ...a,
            isOverridden: true,
            overrideReason: reason,
            overriddenBy: 'Dr. S. Kabilan, MBBS (MO)',
            overriddenAt: new Date().toISOString(),
          }
        : a
    );
    setSafetyAlerts(updatedAlerts);

    const targetAlert = safetyAlerts.find((a) => a.id === alertId);
    StorageService.logAudit({
      userId: 'DOC-1029',
      userName: 'Dr. S. Kabilan, MBBS',
      role: 'doctor',
      action: 'ALERT_OVERRIDDEN',
      details: `Doctor overridden clinical alert: "${targetAlert?.title || alertId}". Justification: "${reason}".`,
    });

    setAuditLogs(StorageService.getAuditLogs());
    showToast('Alert overridden with clinical justification recorded in audit ledger.');
  };

  // Doctor Approve & Print Prescription
  const handleApproveAndPrint = () => {
    const criticalAlerts = safetyAlerts.filter((a) => a.severity === 'critical' && !a.isOverridden);
    if (criticalAlerts.length > 0) {
      // Trigger 180ms shake on blocking alert
      setShakeSafetyAlerts(true);
      setTimeout(() => setShakeSafetyAlerts(false), 300);
      showToast(`Cannot approve with critical allergy conflict: ${criticalAlerts[0].title}`);
      return;
    }

    const newVisit: ClinicalVisit = {
      id: `visit-${Date.now()}`,
      patientId: activePatient.id,
      patientName: activePatient.name,
      patientAge: activePatient.age,
      patientGender: activePatient.gender,
      patientPhone: activePatient.phone,
      abhaId: activePatient.abhaId,
      date: new Date().toISOString().split('T')[0],
      doctorName: 'Dr. S. Kabilan, MBBS (Medical Officer)',
      rawTranscript: transcript,
      tokens,
      chiefComplaints,
      chiefComplaintsTamil: chiefComplaints,
      vitals,
      diagnosis,
      medications,
      advice,
      adviceTamil,
      referralNeeded,
      referralFacility: referralNeeded ? referralFacility : undefined,
      referralReason: referralNeeded ? referralReason : undefined,
      safetyAlerts,
      status: 'approved',
      approvalTime: Date.now(),
      documentationSeconds: docTimeSeconds,
      isSynced: !isOffline,
      syncedAt: !isOffline ? new Date().toISOString() : undefined,
    };

    StorageService.saveVisit(newVisit);
    setVisits(StorageService.getVisits());
    setIsApproved(true);
    setActiveApprovedVisit(newVisit);

    StorageService.logAudit({
      userId: 'DOC-1029',
      userName: 'Dr. S. Kabilan, MBBS',
      role: 'doctor',
      action: 'PRESCRIPTION_APPROVED',
      details: `Prescription #${newVisit.id.slice(-6)} approved for ${activePatient.name}. Documentation time: ${docTimeSeconds}s.`,
    });

    setAuditLogs(StorageService.getAuditLogs());
    setShowPrintModal(true);
    showToast(`Prescription approved in ${docTimeSeconds}s! Ready for printing & dispensing.`);
  };

  // Central Server Sync Trigger
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await StorageService.syncWithCentralServer(userRole, 'Dr. S. Kabilan');
      setVisits(StorageService.getVisits());
      setAuditLogs(StorageService.getAuditLogs());
      showToast(res.message);
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectPatient = (p: Patient) => {
    setActivePatient(p);
    setIsApproved(false);
    setDocTimeSeconds(0);
    if (p.id === 'pat-001') {
      setTranscript(CLINICAL_CASE_PRESETS[0].speechTamil);
    } else if (p.id === 'pat-002') {
      setTranscript(CLINICAL_CASE_PRESETS[4].speechTamil);
    } else if (p.id === 'pat-003') {
      setTranscript(CLINICAL_CASE_PRESETS[2].speechTamil);
    }
  };

  const openSearch = (mode: 'search' | 'scan' | 'register') => {
    setLookupMode(mode);
    setShowLookupModal(true);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-content flex flex-col font-sans transition-colors pb-16 md:pb-0">
      {/* Tablet-First Slim Navigation Rail & Top Utility Header */}
      <NavigationRail
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        userRole={userRole}
        setUserRole={setUserRole}
        isOffline={isOffline}
        setIsOffline={handleToggleOffline}
        onSync={handleSync}
        isSyncing={isSyncing}
        onOpenPatientSearch={() => openSearch('search')}
        onOpenScan={() => openSearch('scan')}
        onNewPatient={() => openSearch('register')}
        unsyncedCount={visits.filter((v) => !v.isSynced).length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Viewport Container (Offset by Left Rail Width on Tablet/Desktop) */}
      <main className="flex-1 md:ml-[84px] lg:ml-64 max-w-7xl w-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Toast Alert Sliding in from Top */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={SPRING_PHYSICS}
              className="p-4 rounded-[14px] bg-[#0B1F1D] dark:bg-[#0E1F1D] text-white text-xs font-semibold shadow-theme-soft flex items-center justify-between border border-[#2DD4BF]/30 fixed top-20 right-6 z-50 max-w-md"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping shrink-0"></span>
                <span>{toastMessage}</span>
              </div>
              <button 
                onClick={() => setToastMessage(null)} 
                className="text-slate-400 hover:text-white ml-3 p-1 rounded-md"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHC Facility Slides Showcase */}
        {showFacilitySlides && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-theme-muted px-1">
              <span className="font-semibold text-theme-ink">
                Primary Health Centre Infrastructure & Clinical Stations:
              </span>
              <button
                onClick={() => setShowFacilitySlides(false)}
                className="text-xs text-[#0F766E] dark:text-[#2DD4BF] hover:underline font-bold"
              >
                Hide Photo Slides
              </button>
            </div>
            <FacilityShowcaseSlides />
          </div>
        )}

        {/* Dynamic Direction-Aware Sliding Tab Views (AnimatePresence with popLayout) */}
        <AnimatePresence mode="popLayout" custom={navDirection}>
          {/* VIEW 1: Doctor Consultation (Core Scribe Flow) */}
          {activeTab === 'consultation' && (
            <motion.div
              key="consultation"
              custom={navDirection}
              variants={createSlideVariants(navDirection)}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              {/* 1-Page Patient Summary Banner with Past Last Visit */}
              <PatientBanner
                patient={activePatient}
                onOpenLookup={() => openSearch('search')}
              />

              {/* Tamil Voice Capture & Speech-to-Text */}
              <VoiceScribeSection
                patient={activePatient}
                transcript={transcript}
                setTranscript={setTranscript}
                tokens={tokens}
                setTokens={setTokens}
                onStructureNote={handleStructureNote}
                isProcessing={isProcessing}
                onSelectPresetPatient={(pId) => {
                  const target = patients.find((p) => p.id === pId);
                  if (target) setActivePatient(target);
                }}
              />

              {/* Clinical Safety Layer */}
              <SafetyAlertsPanel
                alerts={safetyAlerts}
                onOverrideAlert={handleOverrideAlert}
                shouldShakeBlockingAlerts={shakeSafetyAlerts}
              />

              {/* Structured Note Review & Approval */}
              <StructuredNoteEditor
                patient={activePatient}
                chiefComplaints={chiefComplaints}
                setChiefComplaints={setChiefComplaints}
                vitals={vitals}
                setVitals={setVitals}
                diagnosis={diagnosis}
                setDiagnosis={setDiagnosis}
                medications={medications}
                setMedications={setMedications}
                advice={advice}
                setAdvice={setAdvice}
                adviceTamil={adviceTamil}
                setAdviceTamil={setAdviceTamil}
                referralNeeded={referralNeeded}
                setReferralNeeded={setReferralNeeded}
                referralFacility={referralFacility}
                setReferralFacility={setReferralFacility}
                referralReason={referralReason}
                setReferralReason={setReferralReason}
                safetyAlerts={safetyAlerts}
                onApproveAndPrint={handleApproveAndPrint}
                onOpenCommunication={() => setShowCommunicationDrawer(true)}
                isApproved={isApproved}
                docTimeSeconds={docTimeSeconds}
              />
            </motion.div>
          )}

          {/* VIEW 2: Nurse / ANM Triage */}
          {activeTab === 'nurse' && (
            <motion.div
              key="nurse"
              custom={navDirection}
              variants={createSlideVariants(navDirection)}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <NurseVitalsView
                patients={patients}
                activePatient={activePatient}
                onSelectPatient={handleSelectPatient}
                onSaveVitals={(patientId, newVitals) => {
                  setVitals(newVitals);
                  showToast(`Vitals recorded for ${activePatient.name}. Transmitted to Doctor.`);
                  handleSelectTab('consultation');
                }}
              />
            </motion.div>
          )}

          {/* VIEW 3: Pharmacy Queue */}
          {activeTab === 'pharmacy' && (
            <motion.div
              key="pharmacy"
              custom={navDirection}
              variants={createSlideVariants(navDirection)}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PharmacyDispenseView
                visits={visits}
                onUpdateVisit={(updated) => {
                  setVisits(StorageService.getVisits());
                  showToast(`Prescription #${updated.id.slice(-6)} marked as dispensed!`);
                }}
              />
            </motion.div>
          )}

          {/* VIEW 4: HMIS & Government Reporting */}
          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              custom={navDirection}
              variants={createSlideVariants(navDirection)}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <HmisReportDashboard visits={visits} />
            </motion.div>
          )}

          {/* VIEW 5: Medico-Legal Audit Trail */}
          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              custom={navDirection}
              variants={createSlideVariants(navDirection)}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AuditTrailModal logs={auditLogs} isFullView={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Patient Lookup Modal */}
      {showLookupModal && (
        <PatientLookupModal
          initialMode={lookupMode}
          onSelectPatient={handleSelectPatient}
          onClose={() => setShowLookupModal(false)}
        />
      )}

      {/* Prescription Print Modal */}
      {showPrintModal && activeApprovedVisit && (
        <PrescriptionPrintModal
          visit={activeApprovedVisit}
          patient={activePatient}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Patient SMS & Tamil Voice Reminder Drawer */}
      {showCommunicationDrawer && (
        <PatientCommunicationDrawer
          visit={{
            id: `visit-active`,
            patientId: activePatient.id,
            patientName: activePatient.name,
            patientAge: activePatient.age,
            patientGender: activePatient.gender,
            patientPhone: activePatient.phone,
            abhaId: activePatient.abhaId,
            date: new Date().toISOString().split('T')[0],
            doctorName: 'Dr. S. Kabilan, MBBS',
            rawTranscript: transcript,
            tokens,
            chiefComplaints,
            chiefComplaintsTamil: chiefComplaints,
            vitals,
            diagnosis,
            medications,
            advice,
            adviceTamil,
            referralNeeded,
            safetyAlerts,
            status: isApproved ? 'approved' : 'draft',
            isSynced: !isOffline,
          }}
          patient={activePatient}
          onClose={() => setShowCommunicationDrawer(false)}
        />
      )}
    </div>
  );
}
