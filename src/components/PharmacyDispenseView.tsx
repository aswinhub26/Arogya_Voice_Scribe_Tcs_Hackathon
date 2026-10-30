import React, { useState } from 'react';
import { ClinicalVisit } from '../types/clinical.ts';
import { StorageService } from '../services/storageService.ts';
import { 
  Pill, 
  PackageCheck, 
  Tag,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING_PHYSICS } from '../utils/motion.ts';

interface PharmacyDispenseViewProps {
  visits: ClinicalVisit[];
  onUpdateVisit: (visit: ClinicalVisit) => void;
}

export const PharmacyDispenseView: React.FC<PharmacyDispenseViewProps> = ({
  visits,
  onUpdateVisit,
}) => {
  const [selectedVisitId, setSelectedVisitId] = useState<string>(
    visits.find((v) => v.status === 'approved')?.id || visits[0]?.id || ''
  );
  const [checkedMeds, setCheckedMeds] = useState<Record<string, boolean>>({});
  const [showStickerModal, setShowStickerModal] = useState(false);

  const selectedVisit = visits.find((v) => v.id === selectedVisitId) || visits[0];

  const handleToggleMed = (medId: string) => {
    setCheckedMeds((prev) => ({ ...prev, [medId]: !prev[medId] }));
  };

  const handleMarkAllDispensed = () => {
    if (!selectedVisit) return;
    const updatedMeds = selectedVisit.medications.map((m) => ({ ...m, dispensed: true }));
    const updatedVisit: ClinicalVisit = {
      ...selectedVisit,
      medications: updatedMeds,
      status: 'dispensed',
    };

    onUpdateVisit(updatedVisit);
    StorageService.saveVisit(updatedVisit);
    StorageService.logAudit({
      userId: 'PHARM-8821',
      userName: 'Pharmacist Ramesh, D.Pharm',
      role: 'pharmacist',
      action: 'DISPENSED',
      details: `Prescription #${selectedVisit.id.slice(-6)} dispensed for ${selectedVisit.patientName}. Patient counselled in Tamil.`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="theme-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
            <h2 className="text-xl font-bold text-theme-ink tracking-tight">
              PHC Pharmacy & Drug Dispensing Counter
            </h2>
            <span className="text-sm font-tamil text-theme-muted">
              (மருந்தகம் & விநியோக பிரிவு)
            </span>
          </div>
          <p className="text-sm text-theme-muted mt-1">
            Verify doctor-approved prescriptions, dispense TNMSCL essential drugs, and print Tamil dosage pouch stickers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-500/20">
            Pharmacist: Ramesh (D.Pharm) · Counter #1
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Queue of Approved Prescriptions with Layout Transition Gliding */}
        <div className="theme-card p-6 space-y-4">
          <div className="text-xs font-bold text-theme-muted uppercase tracking-wider flex items-center justify-between">
            <span>Prescription Queue ({visits.length})</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Ready for Dispensing</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {visits.map((v) => {
              const isSelected = v.id === selectedVisitId;
              const isDispensed = v.status === 'dispensed';

              return (
                <motion.div
                  key={v.id}
                  layout
                  transition={SPRING_PHYSICS}
                  onClick={() => setSelectedVisitId(v.id)}
                  className={`p-3.5 rounded-[14px] cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/30 dark:border-indigo-500/40 shadow-xs'
                      : 'border-theme bg-theme-bg hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-theme-ink">{v.patientName}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isDispensed
                          ? 'status-chip-success'
                          : 'status-chip-warning'
                      }`}
                    >
                      {isDispensed ? 'Dispensed' : 'Ready'}
                    </span>
                  </div>

                  <div className="text-xs text-theme-muted mt-1 flex items-center justify-between font-mono-numbers">
                    <span>{v.medications.length} Medicines</span>
                    <span className="text-[11px]">#{v.id.slice(-6)}</span>
                  </div>

                  <div className="text-xs text-theme-muted mt-0.5">
                    Dr: {v.doctorName}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Prescription Dispensing Checklist */}
        <div className="lg:col-span-2 theme-card p-6 flex flex-col justify-between space-y-6">
          {selectedVisit ? (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme pb-4">
                <div>
                  <h3 className="text-lg font-bold text-theme-ink">
                    Dispensing for: {selectedVisit.patientName} ({selectedVisit.patientAge}y)
                  </h3>
                  <div className="text-xs text-theme-muted font-mono-numbers mt-1">
                    ABHA: {selectedVisit.abhaId} · Phone: {selectedVisit.patientPhone}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowStickerModal(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-[12px] border border-theme hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-theme-content transition-colors"
                  >
                    <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
                    <span>Print Tamil Dosage Sticker</span>
                  </motion.button>
                </div>
              </div>

              {/* Medication Checklist */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-theme-muted uppercase tracking-wider block">
                  Verify & Pack Medicines (மருந்துகள் சரிபார்ப்பு):
                </span>

                <div className="divide-y divide-theme border border-theme rounded-[14px] overflow-hidden bg-theme-bg">
                  {selectedVisit.medications.map((med) => {
                    const isChecked = checkedMeds[med.id] || med.dispensed;

                    return (
                      <div
                        key={med.id}
                        onClick={() => handleToggleMed(med.id)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? 'bg-emerald-500/10 dark:bg-emerald-500/15' : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleMed(med.id)}
                            className="mt-1 rounded text-[#0F766E] focus:ring-[#0F766E]"
                          />
                          <div>
                            <div className="font-bold text-sm text-theme-ink flex items-center gap-2">
                              <span>{med.drugName}</span>
                              <span className="font-tamil text-theme-muted font-normal text-xs">
                                ({med.tamilName})
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-theme-surface text-theme-content font-mono-numbers">
                                {med.form} · {med.dosage}
                              </span>
                            </div>

                            <div className="text-xs text-[#0F766E] dark:text-[#2DD4BF] font-semibold mt-1">
                              {med.frequency} · <span className="font-tamil">{med.frequencyTamil}</span>
                            </div>

                            <div className="text-xs text-theme-muted mt-0.5">
                              Duration: {med.duration} | Timing: <strong className="font-tamil text-theme-ink">{med.instructionsTamil}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                            TNMSCL Stock: Available
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advice review */}
              <div className="p-4 bg-theme-bg rounded-[14px] border border-theme text-xs space-y-1">
                <strong className="text-theme-ink block">
                  Doctor's Instructions to Counsel Patient:
                </strong>
                <p className="font-tamil text-theme-content leading-relaxed text-sm">
                  {selectedVisit.adviceTamil}
                </p>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-theme flex items-center justify-between">
                <span className="text-xs text-theme-muted">
                  {selectedVisit.status === 'dispensed'
                    ? '✓ Prescription already fully dispensed.'
                    : 'Check off each drug and confirm dispensing.'}
                </span>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleMarkAllDispensed}
                  disabled={selectedVisit.status === 'dispensed'}
                  className="flex items-center gap-2 px-6 h-[52px] min-h-[52px] bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-[14px] text-sm font-bold transition-all shadow-sm"
                >
                  <PackageCheck className="w-5 h-5" strokeWidth={1.75} />
                  <span>Mark as Dispensed (வழங்கப்பட்டது)</span>
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-theme-muted">
              Select a prescription from the queue on the left.
            </div>
          )}
        </div>
      </div>

      {/* Tamil Dosage Sticker Modal */}
      {showStickerModal && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-theme-surface rounded-[16px] max-w-sm w-full p-6 shadow-theme-soft border border-theme"
          >
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <h3 className="text-base font-bold text-theme-ink">Tamil Dosage Packet Sticker</h3>
              <button
                onClick={() => setShowStickerModal(false)}
                className="text-theme-muted hover:text-theme-ink p-1 rounded-lg"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="my-4 border-2 border-dashed border-theme p-4 rounded-[12px] bg-amber-500/10 text-xs space-y-2">
              <div className="text-center font-bold text-theme-ink border-b border-theme pb-1">
                வால்பாறை அரசு ஆரம்ப சுகாதார நிலையம்
              </div>
              <div className="font-semibold text-theme-content">
                நோயாளி: {selectedVisit.patientName}
              </div>
              <div className="divide-y divide-theme">
                {selectedVisit.medications.map((m) => (
                  <div key={m.id} className="py-2">
                    <div className="font-bold text-theme-ink">{m.tamilName} ({m.drugName})</div>
                    <div className="text-[#0F766E] dark:text-[#2DD4BF] font-semibold font-tamil">
                      {m.frequencyTamil} - {m.instructionsTamil} ({m.duration})
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-center text-theme-muted pt-1">
                மருத்துவர்: {selectedVisit.doctorName} · தேதி: {selectedVisit.date}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[12px] text-xs font-bold transition-colors"
              >
                Print Thermal Sticker
              </button>
              <button
                onClick={() => setShowStickerModal(false)}
                className="py-3 px-4 bg-theme-bg text-theme-content rounded-[12px] text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
