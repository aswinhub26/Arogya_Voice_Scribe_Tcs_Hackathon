import React, { useState } from 'react';
import { Patient, PastVisitRecord } from '../types/clinical.ts';
import { StorageService } from '../services/storageService.ts';
import { 
  Search, 
  UserPlus, 
  QrCode, 
  Phone, 
  MapPin, 
  X, 
  UserCheck, 
  Calendar, 
  Pill, 
  ArrowRight, 
  ShieldAlert, 
  ChevronRight, 
  History 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING_PHYSICS, TRANSITION_BASE } from '../utils/motion.ts';

interface PatientLookupModalProps {
  onSelectPatient: (patient: Patient) => void;
  onClose: () => void;
  initialMode?: 'search' | 'scan' | 'register';
}

export const PatientLookupModal: React.FC<PatientLookupModalProps> = ({
  onSelectPatient,
  onClose,
  initialMode = 'search',
}) => {
  const [mode, setMode] = useState<'search' | 'scan' | 'register'>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>(StorageService.getPatients());
  const [scannedPatientPreview, setScannedPatientPreview] = useState<Patient | null>(null);

  // New Patient Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('Valparai PHC Area');
  const [allergiesText, setAllergiesText] = useState('');
  const [chronicText, setChronicText] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);
  const [gestationalWeeks, setGestationalWeeks] = useState(20);

  const filteredPatients = searchQuery.trim()
    ? StorageService.findPatient(searchQuery)
    : patients;

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !phone.trim()) {
      alert('Please enter patient name, age, and phone number.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${randomSuffix}`;
    const newPatient: Patient = {
      id: `pat-new-${Date.now()}`,
      abhaId: newAbha,
      qrId: `QR-PHC-${name.slice(0, 4).toUpperCase()}-${randomSuffix}`,
      name: name.trim(),
      age: Number(age),
      gender,
      phone: phone.trim(),
      village: village.trim(),
      allergies: allergiesText ? allergiesText.split(',').map((s) => s.trim()) : ['None known'],
      chronicConditions: chronicText ? chronicText.split(',').map((s) => s.trim()) : [],
      isPregnant,
      gestationalWeeks: isPregnant ? gestationalWeeks : undefined,
      weightKg: 60,
      activeMedications: [],
      lastVisitDate: new Date().toISOString().split('T')[0],
      pastVisits: [],
    };

    StorageService.savePatient(newPatient);
    onSelectPatient(newPatient);
    onClose();
  };

  const handleSimulateScan = (scannedPatient: Patient) => {
    setScannedPatientPreview(scannedPatient);
  };

  const handleConfirmPatient = (p: Patient) => {
    onSelectPatient(p);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={SPRING_PHYSICS}
        className="bg-theme-surface rounded-[16px] max-w-3xl w-full shadow-theme-soft border border-theme overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-theme bg-theme-bg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E] dark:text-[#2DD4BF]">
              <UserCheck className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-ink tracking-tight">
                Patient Identification & Clinical Lookup
              </h3>
              <p className="text-xs text-theme-muted font-tamil">
                நோயாளி தேடல், QR ஸ்கேன் மற்றும் முந்தைய மருத்துவ வரலாறு
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-theme-muted hover:text-theme-ink rounded-[10px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Mode Navigation Tabs with Sliding Pill */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-theme bg-theme-surface">
          {[
            { id: 'search', label: 'Search Records', icon: Search },
            { id: 'scan', label: 'Scan QR Card', icon: QrCode },
            { id: 'register', label: 'New Patient', icon: UserPlus },
          ].map((tab) => {
            const isActive = mode === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setMode(tab.id as any);
                  setScannedPatientPreview(null);
                }}
                className={`relative px-4 py-3 text-xs font-bold transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'text-[#0F766E] dark:text-[#2DD4BF]'
                    : 'text-theme-muted hover:text-theme-ink'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="lookupTabIndicator"
                    transition={SPRING_PHYSICS}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F766E] dark:bg-[#2DD4BF]"
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" strokeWidth={1.75} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* SEARCH MODE */}
          {mode === 'search' && !scannedPatientPreview && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-theme-bg rounded-[14px] border border-theme focus-within:ring-2 focus-within:ring-[#0F766E]/20 transition-all">
                <Search className="w-4 h-4 text-theme-muted shrink-0" strokeWidth={1.75} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Patient Name, Phone (9842...), ABHA ID, or Village..."
                  className="bg-transparent text-sm w-full outline-none text-theme-ink placeholder:text-theme-muted font-medium"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-theme-muted text-xs hover:text-theme-ink">
                    Clear
                  </button>
                )}
              </div>

              <div className="text-xs font-bold text-theme-muted uppercase tracking-wider flex items-center justify-between">
                <span>Matching Patients ({filteredPatients.length}):</span>
                <span className="text-theme-muted font-normal">Click any patient to inspect past visit details</span>
              </div>

              <div className="divide-y divide-theme max-h-96 overflow-y-auto rounded-[14px] border border-theme bg-theme-surface">
                {filteredPatients.map((p) => {
                  const hasPenicillin = p.allergies?.some((a) => a.toLowerCase().includes('penicillin'));
                  const hasNsaid = p.allergies?.some((a) => a.toLowerCase().includes('nsaid'));

                  return (
                    <div
                      key={p.id}
                      onClick={() => setScannedPatientPreview(p)}
                      className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm text-theme-ink group-hover:text-[#0F766E] dark:group-hover:text-[#2DD4BF] transition-colors">
                            {p.name}
                          </span>
                          <span className="text-xs text-theme-muted tabular-nums">
                            {p.age}y · {p.gender}
                          </span>
                          {p.isPregnant && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-300 font-semibold border border-pink-500/20">
                              Pregnant ({p.gestationalWeeks}w ANC)
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-theme-muted flex items-center gap-3">
                          <span className="font-mono-numbers flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-theme-muted" strokeWidth={1.75} />
                            {p.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-theme-muted" strokeWidth={1.75} />
                            {p.village}
                          </span>
                          <span className="font-mono-numbers text-theme-muted">ABHA: {p.abhaId}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs pt-0.5">
                          {p.lastVisitDate && (
                            <span className="text-[#0F766E] dark:text-[#2DD4BF] font-semibold flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
                              Last Visit: {p.lastVisitDate} ({p.pastVisits?.length || 1} logged)
                            </span>
                          )}

                          {hasPenicillin && (
                            <span className="text-red-600 dark:text-red-400 font-bold">
                              ⚠️ Penicillin Allergy
                            </span>
                          )}
                          {hasNsaid && (
                            <span className="text-red-600 dark:text-red-400 font-bold">
                              ⚠️ NSAID / Ulcer Risk
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] flex items-center gap-1">
                          <span>Inspect History</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCAN QR MODE */}
          {mode === 'scan' && !scannedPatientPreview && (
            <div className="space-y-6">
              <div className="relative w-full max-w-md mx-auto aspect-4/3 bg-slate-950 rounded-[16px] overflow-hidden border-2 border-slate-700 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
                {/* Viewfinder Target Reticle */}
                <div className="absolute inset-8 border border-white/25 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-[#2DD4BF]"></div>
                    <div className="w-6 h-6 border-t-2 border-r-2 border-[#2DD4BF]"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-[#2DD4BF]"></div>
                    <div className="w-6 h-6 border-b-2 border-r-2 border-[#2DD4BF]"></div>
                  </div>
                </div>

                {/* Animated Scanning Laser Line */}
                <motion.div 
                  animate={{ y: [-80, 80, -80] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="w-4/5 h-0.5 bg-gradient-to-r from-transparent via-[#2DD4BF] to-transparent shadow-[0_0_12px_#2dd4bf]"
                />

                <div className="z-10 mt-4">
                  <QrCode className="w-12 h-12 text-[#2DD4BF] mx-auto mb-2 opacity-85" strokeWidth={1.75} />
                  <p className="text-sm font-bold text-white tracking-wide">
                    Align Patient ABHA QR Card in Frame
                  </p>
                  <p className="text-xs text-slate-300 font-tamil mt-1">
                    நோயாளி QR கார்டை கேமராவின் முன் காட்டவும்
                  </p>
                </div>

                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-[11px] text-[#2DD4BF] font-mono tracking-wider uppercase bg-slate-900/80 px-3 py-1 rounded-full border border-[#2DD4BF]/30 font-semibold">
                    ● Camera Stream Active · HD 1080p
                  </span>
                </div>
              </div>

              {/* Instant 1-Click Scan Simulators */}
              <div className="p-4 bg-theme-bg rounded-[14px] border border-theme">
                <div className="text-xs font-bold text-theme-ink mb-3 flex items-center justify-between">
                  <span>Simulate Instant QR Scan from OPD Queue:</span>
                  <span className="text-xs text-theme-muted">Tap to decode card & history</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {patients.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSimulateScan(p)}
                      className="p-3 rounded-[12px] border border-theme bg-theme-surface hover:bg-[#0F766E]/10 dark:hover:bg-[#2DD4BF]/15 text-left text-xs transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-theme-ink text-sm">
                          {p.name}
                        </div>
                        <div className="text-xs text-theme-muted font-mono-numbers mt-0.5">
                          {p.abhaId} · {p.age}y {p.gender}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-[8px] bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 text-[#0F766E] dark:text-[#2DD4BF] font-bold text-xs">
                        Scan Card
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DETAILED PATIENT & PAST VISIT INSPECTION VIEW */}
          {scannedPatientPreview && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={TRANSITION_BASE}
              className="space-y-5"
            >
              <button
                onClick={() => setScannedPatientPreview(null)}
                className="text-xs text-[#0F766E] dark:text-[#2DD4BF] hover:underline font-bold flex items-center gap-1.5"
              >
                ← Back to search results
              </button>

              {/* Patient Core Profile Card */}
              <div className="p-6 rounded-[16px] bg-[#0B4F4A] text-white shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-[14px] bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold text-[#2DD4BF]">
                      {scannedPatientPreview.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-xl font-bold tracking-tight text-white">
                          {scannedPatientPreview.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-teal-200 text-xs font-mono">
                          {scannedPatientPreview.age} yrs · {scannedPatientPreview.gender}
                        </span>
                      </div>
                      <div className="text-xs text-teal-200/90 font-mono-numbers mt-1">
                        ABHA ID: <strong className="text-white font-mono">{scannedPatientPreview.abhaId}</strong>
                      </div>
                      <div className="text-xs text-teal-200/80 mt-0.5">
                        Phone: {scannedPatientPreview.phone} · Village: {scannedPatientPreview.village}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleConfirmPatient(scannedPatientPreview)}
                    className="w-full sm:w-auto px-6 h-[48px] rounded-[14px] bg-white text-[#0B1F1D] font-bold text-xs hover:bg-teal-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Start Consultation with {scannedPatientPreview.name.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </motion.button>
                </div>

                {/* Patient Safety Badges */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs">
                  {scannedPatientPreview.allergies && scannedPatientPreview.allergies.length > 0 && !scannedPatientPreview.allergies[0].toLowerCase().includes('none') ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/25 text-red-200 border border-red-400/40 font-bold">
                      <ShieldAlert className="w-4 h-4 text-red-300" strokeWidth={1.75} />
                      <span><strong>Documented Allergies:</strong> {scannedPatientPreview.allergies.join(', ')}</span>
                    </div>
                  ) : (
                    <span className="text-emerald-300 text-xs font-semibold">✓ No Known Drug Allergies</span>
                  )}

                  {scannedPatientPreview.chronicConditions && scannedPatientPreview.chronicConditions.length > 0 && (
                    <span className="text-amber-200 text-xs font-semibold">
                      <strong>Chronic:</strong> {scannedPatientPreview.chronicConditions.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* PAST LAST VISIT DETAILED SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-theme-ink flex items-center gap-2">
                    <History className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
                    <span>Past Clinical Visits & Last Consultation Record</span>
                  </h4>
                  <span className="text-xs text-theme-muted tabular-nums">
                    Total {scannedPatientPreview.pastVisits?.length || 0} visits on record
                  </span>
                </div>

                {scannedPatientPreview.pastVisits && scannedPatientPreview.pastVisits.length > 0 ? (
                  <div className="space-y-3">
                    {scannedPatientPreview.pastVisits.map((visit, vIdx) => (
                      <div
                        key={visit.id}
                        className="p-4 rounded-[14px] border border-theme bg-theme-bg space-y-3 shadow-2xs text-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-theme text-xs">
                          <div className="flex items-center gap-2 font-bold text-theme-ink">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#0F766E]/15 text-[#0F766E] dark:text-[#2DD4BF] text-[11px] font-mono">
                              {vIdx === 0 ? 'LAST VISIT (கடைசி பரிசோதனை)' : 'PREVIOUS VISIT'}
                            </span>
                            <span className="font-mono-numbers">{visit.date}</span>
                            <span className="text-theme-muted">·</span>
                            <span className="text-theme-content">{visit.doctorName}</span>
                          </div>
                          <span className="text-theme-muted font-mono-numbers text-xs">{visit.facility}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="bg-theme-surface p-3 rounded-[10px] border border-theme space-y-1">
                            <span className="text-[10px] uppercase font-bold text-theme-muted block">
                              Chief Complaints:
                            </span>
                            <div className="text-theme-ink font-semibold">
                              {visit.chiefComplaints.join(', ')}
                            </div>
                            <div className="text-[11px] text-[#0F766E] dark:text-[#2DD4BF] font-bold pt-1">
                              Diagnosis: {visit.diagnosis.join(', ')} ({visit.icd10.join(', ')})
                            </div>
                          </div>

                          <div className="bg-theme-surface p-3 rounded-[10px] border border-theme space-y-1">
                            <span className="text-[10px] uppercase font-bold text-theme-muted block">
                              Recorded Vitals:
                            </span>
                            <div className="flex flex-wrap items-center gap-3 text-theme-content font-mono-numbers">
                              {visit.vitals.bp && <span>BP: <strong className="text-theme-ink">{visit.vitals.bp}</strong></span>}
                              {visit.vitals.pulse && <span>Pulse: <strong className="text-theme-ink">{visit.vitals.pulse} bpm</strong></span>}
                              {visit.vitals.bloodGlucose && <span>Sugar: <strong className="text-theme-ink">{visit.vitals.bloodGlucose}</strong></span>}
                            </div>
                          </div>
                        </div>

                        <div className="bg-theme-surface p-3 rounded-[10px] border border-theme">
                          <span className="text-[10px] uppercase font-bold text-theme-muted block mb-1.5 flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
                            <span>Prescriptions Dispensed:</span>
                          </span>
                          <div className="divide-y divide-theme">
                            {visit.medications.map((m, mIdx) => (
                              <div key={mIdx} className="py-1.5 flex items-center justify-between text-xs">
                                <div>
                                  <strong className="text-theme-ink">{m.name} {m.dose}</strong>
                                  <span className="text-theme-muted text-xs ml-2 font-tamil">
                                    {m.timing}
                                  </span>
                                </div>
                                <span className="font-mono-numbers text-theme-muted text-xs">
                                  {m.days} days
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs p-3 rounded-[10px] bg-theme-surface text-theme-content border border-theme">
                          <strong className="text-theme-ink block mb-0.5">Clinical Note / Doctor Advice:</strong>
                          <p className="italic text-theme-muted">{visit.clinicalNotes}</p>
                          <p className="font-tamil text-theme-ink font-medium mt-1">{visit.clinicalNotesTamil}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-theme-muted bg-theme-bg rounded-[14px] border border-dashed border-theme">
                    No past visit history recorded for this patient.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* REGISTER NEW PATIENT FORM */}
          {mode === 'register' && (
            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">
                  Patient Full Name (பெயர்):
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramasamy M"
                  className="w-full px-3.5 py-2.5 border border-theme bg-theme-bg text-theme-ink rounded-[10px] text-xs outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Age (வயது):</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10) || '')}
                    placeholder="45"
                    className="w-full px-3.5 py-2.5 border border-theme bg-theme-bg text-theme-ink rounded-[10px] text-xs outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Gender:</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-theme bg-theme-bg text-theme-ink rounded-[10px] text-xs outline-none focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="Male">Male (ஆண்)</option>
                    <option value="Female">Female (பெண்)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Phone Number (கைபேசி):</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3.5 py-2.5 border border-theme bg-theme-bg text-theme-ink rounded-[10px] text-xs outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Village / Ward (ஊர்):</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Village name"
                    className="w-full px-3.5 py-2.5 border border-theme bg-theme-bg text-theme-ink rounded-[10px] text-xs outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1.5 uppercase">
                  Known Drug Allergies (மருந்து ஒவ்வாமை - மிக முக்கியம்):
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, NSAIDs, Sulfa (Leave blank if none)"
                  className="w-full px-3.5 py-2.5 border border-red-500/30 bg-red-500/10 text-theme-ink rounded-[10px] text-xs outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">
                  Chronic Illnesses (நீண்டகால நோய்கள்):
                </label>
                <input
                  type="text"
                  value={chronicText}
                  onChange={(e) => setChronicText(e.target.value)}
                  placeholder="e.g. Hypertension, Type 2 Diabetes"
                  className="w-full px-3.5 py-2.5 border border-theme bg-theme-bg text-theme-ink rounded-[10px] text-xs outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              {gender === 'Female' && (
                <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-[12px] text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-pink-700 dark:text-pink-300">
                    <input
                      type="checkbox"
                      checked={isPregnant}
                      onChange={(e) => setIsPregnant(e.target.checked)}
                      className="rounded text-pink-600"
                    />
                    <span>Patient is Currently Pregnant (ANC Registration)</span>
                  </label>
                  {isPregnant && (
                    <div className="mt-2.5 flex items-center gap-2.5">
                      <span className="text-xs text-pink-700 dark:text-pink-300">Gestational Weeks:</span>
                      <input
                        type="number"
                        value={gestationalWeeks}
                        onChange={(e) => setGestationalWeeks(parseInt(e.target.value, 10) || 12)}
                        className="w-20 px-2.5 py-1 bg-theme-surface border border-pink-500/30 rounded-[8px] text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-[52px] bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412] rounded-[14px] text-sm font-bold transition-opacity hover:opacity-95 shadow-sm"
                >
                  Generate ABHA & Create Patient Record
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
