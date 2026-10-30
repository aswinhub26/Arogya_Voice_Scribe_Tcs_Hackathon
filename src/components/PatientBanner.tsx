import React, { useState } from 'react';
import { Patient, PastVisitRecord } from '../types/clinical.ts';
import { 
  Heart, 
  QrCode, 
  Phone, 
  MapPin, 
  ChevronRight,
  ShieldAlert,
  History,
  FileText,
  X,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { SPRING_PHYSICS, TRANSITION_BASE } from '../utils/motion.ts';

interface PatientBannerProps {
  patient: Patient;
  onOpenLookup: () => void;
  onSelectCasePreset?: (presetId: string) => void;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  onOpenLookup,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const lastVisit = patient.pastVisits && patient.pastVisits.length > 0 ? patient.pastVisits[0] : null;

  const handleOpenQr = async () => {
    try {
      const qrPayload = JSON.stringify({
        abha: patient.abhaId,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        phc: 'Valparai PHC - Tamil Nadu',
        lastVisit: patient.lastVisitDate,
      });
      const url = await QRCode.toDataURL(qrPayload, { width: 260, margin: 1 });
      setQrDataUrl(url);
      setShowQrModal(true);
    } catch (e) {
      console.error('Failed to generate QR code:', e);
    }
  };

  const hasAllergies = patient.allergies && patient.allergies.length > 0 && !patient.allergies[0].toLowerCase().includes('none');

  return (
    <motion.div 
      layoutId="patient-header"
      transition={SPRING_PHYSICS}
      className="theme-card p-6 space-y-5"
    >
      {/* Top Identity & Action Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Patient Identity */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-[16px] bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 flex items-center justify-center text-[#0F766E] dark:text-[#2DD4BF] shrink-0 font-extrabold text-2xl shadow-xs">
            {patient.name.charAt(0)}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-theme-ink tracking-tight">
                {patient.name}
              </h2>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-theme-bg border border-theme text-theme-content">
                {patient.age}y · {patient.gender}
              </span>
              {patient.isPregnant && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20">
                  Pregnant ({patient.gestationalWeeks}w ANC)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-theme-muted font-medium">
              <span className="flex items-center gap-1.5 tabular-nums">
                <Phone className="w-4 h-4 text-theme-muted" strokeWidth={1.75} />
                {patient.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-theme-muted" strokeWidth={1.75} />
                {patient.village}
              </span>
              <span className="flex items-center gap-1 font-mono-numbers">
                ABHA: <strong className="text-theme-ink font-semibold">{patient.abhaId}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Allergies Highlight with 10% tinted background */}
          {hasAllergies ? (
            <div className="flex items-center gap-2 px-3.5 py-2 status-chip-danger text-xs font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span><strong>ALLERGIES:</strong> {patient.allergies.join(', ')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 status-chip-success text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>No Known Drug Allergies</span>
            </div>
          )}

          {/* Chronic Conditions */}
          {patient.chronicConditions && patient.chronicConditions.length > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 status-chip-warning text-xs font-semibold">
              <Heart className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>{patient.chronicConditions.join(' · ')}</span>
            </div>
          )}

          {/* QR Card Button */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleOpenQr}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-[14px] border border-theme bg-theme-surface hover:bg-theme-bg text-sm font-semibold text-theme-content transition-colors shadow-2xs"
            title="View & Print ABHA Health QR Card"
          >
            <QrCode className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
            <span>QR Card</span>
          </motion.button>

          {/* Switch Patient Button */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenLookup}
            className="flex items-center gap-1.5 px-4 py-2.5 min-h-[48px] rounded-[14px] bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 hover:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#2DD4BF] text-sm font-bold border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 transition-colors"
          >
            <span>Switch Patient</span>
            <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
          </motion.button>
        </div>
      </div>

      {/* Prominent Past Last Visit Card Banner */}
      {lastVisit && (
        <div className="p-4 rounded-[14px] bg-theme-bg border border-theme flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 flex items-center justify-center text-[#0F766E] dark:text-[#2DD4BF] shrink-0">
              <History className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 font-bold text-theme-ink">
                <span>Last Consultation on {lastVisit.date}</span>
                <span className="text-theme-muted font-normal">·</span>
                <span className="text-theme-content font-medium">{lastVisit.doctorName}</span>
              </div>
              <div className="text-theme-muted mt-0.5">
                <strong className="text-theme-content">Diagnosis:</strong> {lastVisit.diagnosis.join(', ')} ({lastVisit.icd10.join(', ')})
                {lastVisit.vitals.bp && <span className="ml-3 font-mono-numbers">| BP: {lastVisit.vitals.bp}</span>}
                {lastVisit.vitals.bloodGlucose && <span className="ml-3 font-mono-numbers">| Sugar: {lastVisit.vitals.bloodGlucose}</span>}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] px-4 py-2.5 rounded-[12px] bg-theme-surface border border-theme hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0 shadow-2xs"
          >
            <FileText className="w-4 h-4" strokeWidth={1.75} />
            <span>Full Past History ({patient.pastVisits?.length || 1})</span>
          </motion.button>
        </div>
      )}

      {/* ABHA QR Code Modal (Slide-up with spring) */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={SPRING_PHYSICS}
              className="bg-theme-surface rounded-[16px] max-w-sm w-full p-6 text-center shadow-theme-soft border border-theme"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-theme-ink">ABHA Health Card QR</h3>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="text-theme-muted hover:text-theme-content text-base font-bold p-1 rounded-lg"
                >
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>

              <div className="border border-[#0F766E]/20 bg-[#0F766E]/5 dark:bg-[#2DD4BF]/5 p-4 rounded-[14px] flex flex-col items-center">
                <div className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] tracking-wider uppercase">
                  GOVERNMENT OF TAMIL NADU
                </div>
                <div className="text-xs text-theme-muted mb-3">
                  Health & Family Welfare · PHC Health ID
                </div>
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Patient ABHA QR"
                    className="w-48 h-48 rounded-[12px] bg-white p-2 border border-slate-200 shadow-xs"
                  />
                )}
                <div className="mt-3 text-base font-bold text-theme-ink">{patient.name}</div>
                <div className="text-xs font-mono text-theme-muted">{patient.abhaId}</div>
                <div className="text-xs text-theme-muted mt-0.5">
                  {patient.gender} · {patient.age} yrs · {patient.phone}
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-[14px] bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412] text-xs font-bold hover:opacity-95 transition-opacity shadow-xs"
                >
                  Print Health Sticker
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="py-3 px-4 rounded-[14px] bg-theme-bg text-theme-content text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Past Visits History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={SPRING_PHYSICS}
              className="bg-theme-surface rounded-[16px] max-w-2xl w-full p-6 shadow-theme-soft border border-theme max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center pb-4 border-b border-theme">
                <div>
                  <h3 className="text-lg font-bold text-theme-ink">
                    Past Visits History: {patient.name}
                  </h3>
                  <p className="text-xs text-theme-muted font-mono mt-0.5">
                    ABHA ID: {patient.abhaId}
                  </p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-theme-muted hover:text-theme-content p-1 rounded-lg"
                >
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {patient.pastVisits && patient.pastVisits.length > 0 ? (
                  patient.pastVisits.map((v, i) => (
                    <div key={v.id} className="p-4 rounded-[14px] border border-theme bg-theme-bg space-y-2.5 text-sm">
                      <div className="flex justify-between font-bold text-theme-ink border-b border-theme pb-2">
                        <span>Visit #{patient.pastVisits!.length - i} on {v.date}</span>
                        <span className="text-[#0F766E] dark:text-[#2DD4BF]">{v.doctorName}</span>
                      </div>
                      <div>
                        <strong className="text-theme-ink">Complaints:</strong> {v.chiefComplaints.join(', ')}
                      </div>
                      <div>
                        <strong className="text-theme-ink">Diagnosis:</strong> {v.diagnosis.join(', ')} ({v.icd10.join(', ')})
                      </div>
                      <div className="flex gap-4 font-mono-numbers text-xs text-theme-muted">
                        {v.vitals.bp && <span>BP: <strong className="text-theme-ink">{v.vitals.bp}</strong></span>}
                        {v.vitals.pulse && <span>Pulse: <strong className="text-theme-ink">{v.vitals.pulse} bpm</strong></span>}
                        {v.vitals.bloodGlucose && <span>Sugar: <strong className="text-theme-ink">{v.vitals.bloodGlucose}</strong></span>}
                      </div>
                      <div>
                        <strong className="text-theme-ink">Prescribed:</strong> {v.medications.map((m) => `${m.name} ${m.dose} (${m.days}d)`).join(', ')}
                      </div>
                      <div className="text-xs text-theme-content bg-theme-surface p-3 rounded-lg border border-theme font-tamil">
                        {v.clinicalNotesTamil || v.clinicalNotes}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-theme-muted">
                    No previous consultation records for this patient.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-theme text-right">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-5 py-2.5 bg-theme-bg hover:bg-black/5 dark:hover:bg-white/5 text-theme-content rounded-[12px] text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
