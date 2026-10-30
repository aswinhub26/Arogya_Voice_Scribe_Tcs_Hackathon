import React, { useState } from 'react';
import { DiagnosisEntry, MedicationItem, Patient, SafetyAlert, Vitals } from '../types/clinical.ts';
import { PHC_ESSENTIAL_DRUGS } from '../data/phcMedicines.ts';
import { PHC_ICD10_LIST } from '../data/icd10Reference.ts';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  AlertCircle, 
  HeartPulse, 
  MessageSquare, 
  Search, 
  Sun, 
  Moon, 
  CloudSun, 
  Utensils, 
  Pill, 
  Activity, 
  Droplet, 
  Thermometer, 
  Scale,
  Lock,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING_PHYSICS, TRANSITION_BASE, TRANSITION_FAST } from '../utils/motion.ts';

interface StructuredNoteEditorProps {
  patient: Patient;
  chiefComplaints: string[];
  setChiefComplaints: (complaints: string[]) => void;
  vitals: Vitals;
  setVitals: (vitals: Vitals) => void;
  diagnosis: DiagnosisEntry[];
  setDiagnosis: (diagnosis: DiagnosisEntry[]) => void;
  medications: MedicationItem[];
  setMedications: (medications: MedicationItem[]) => void;
  advice: string;
  setAdvice: (advice: string) => void;
  adviceTamil: string;
  setAdviceTamil: (adviceTamil: string) => void;
  referralNeeded: boolean;
  setReferralNeeded: (needed: boolean) => void;
  referralFacility: string;
  setReferralFacility: (facility: string) => void;
  referralReason: string;
  setReferralReason: (reason: string) => void;
  safetyAlerts: SafetyAlert[];
  onApproveAndPrint: () => void;
  onOpenCommunication: () => void;
  isApproved: boolean;
  docTimeSeconds?: number;
}

export const StructuredNoteEditor: React.FC<StructuredNoteEditorProps> = ({
  patient,
  chiefComplaints,
  setChiefComplaints,
  vitals,
  setVitals,
  diagnosis,
  setDiagnosis,
  medications,
  setMedications,
  advice,
  setAdvice,
  adviceTamil,
  setAdviceTamil,
  referralNeeded,
  setReferralNeeded,
  referralFacility,
  setReferralFacility,
  referralReason,
  setReferralReason,
  safetyAlerts,
  onApproveAndPrint,
  onOpenCommunication,
  isApproved,
  docTimeSeconds = 42,
}) => {
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [searchDrugTerm, setSearchDrugTerm] = useState('');
  const [newComplaintText, setNewComplaintText] = useState('');
  const [showIcdModal, setShowIcdModal] = useState(false);
  const [searchIcdTerm, setSearchIcdTerm] = useState('');
  const [isApprovingAnimation, setIsApprovingAnimation] = useState(false);

  // Check if any critical allergy or contraindication alert remains un-overridden
  const unhandledCriticalAlerts = safetyAlerts.filter(
    (a) => a.severity === 'critical' && !a.isOverridden
  );

  const canApprove = unhandledCriticalAlerts.length === 0;

  const triggerApprovalSequence = () => {
    if (!canApprove) return;
    setIsApprovingAnimation(true);
    // Lock snaps shut, checkmark draws over 400ms, then trigger approval & print sheet
    setTimeout(() => {
      setIsApprovingAnimation(false);
      onApproveAndPrint();
    }, 550);
  };

  const handleAddMedication = (drug: (typeof PHC_ESSENTIAL_DRUGS)[0]) => {
    const newMed: MedicationItem = {
      id: `med-added-${Date.now()}`,
      drugName: drug.nameEn,
      tamilName: drug.nameTa,
      form: drug.form,
      dosage: drug.commonStrengths[0],
      frequency: drug.standardFrequency,
      frequencyTamil: drug.standardFrequencyTamil,
      durationDays: drug.category === 'Antidiabetic' || drug.category === 'Cardiovascular' ? 30 : 3,
      duration: drug.category === 'Antidiabetic' || drug.category === 'Cardiovascular' ? '30 days' : '3 days',
      instructions: drug.category === 'Gastrointestinal' && drug.nameEn.includes('Panto') ? 'Before food' : 'After food',
      instructionsTamil: drug.category === 'Gastrointestinal' && drug.nameEn.includes('Panto') ? 'உணவுக்கு முன்' : 'உணவுக்குப் பின்',
      inEssentialList: drug.inPhcList,
      dispensed: false,
    };
    setMedications([...medications, newMed]);
    setShowAddMedModal(false);
    setSearchDrugTerm('');
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const handleAddDiagnosis = (icd: (typeof PHC_ICD10_LIST)[0]) => {
    if (!diagnosis.some((d) => d.icd10 === icd.code)) {
      setDiagnosis([...diagnosis, { icd10: icd.code, nameEn: icd.nameEn, nameTa: icd.nameTa, isPrimary: diagnosis.length === 0 }]);
    }
    setShowIcdModal(false);
    setSearchIcdTerm('');
  };

  const handleRemoveDiagnosis = (code: string) => {
    setDiagnosis(diagnosis.filter((d) => d.icd10 !== code));
  };

  const handleAddComplaint = (text = newComplaintText) => {
    if (!text.trim()) return;
    if (!chiefComplaints.includes(text.trim())) {
      setChiefComplaints([...chiefComplaints, text.trim()]);
    }
    setNewComplaintText('');
  };

  const handleRemoveComplaint = (index: number) => {
    setChiefComplaints(chiefComplaints.filter((_, i) => i !== index));
  };

  const parseDoseSchedule = (freq: string) => {
    if (freq === '1-1-1') return { m: '1', n: '1', e: '1' };
    if (freq === '1-0-1') return { m: '1', n: '0', e: '1' };
    if (freq === '1-0-0') return { m: '1', n: '0', e: '0' };
    if (freq === '0-0-1') return { m: '0', n: '0', e: '1' };
    if (freq === '0-1-0') return { m: '0', n: '1', e: '0' };
    return { m: '1', n: '0', e: '1' };
  };

  return (
    <div className="theme-card p-6 space-y-6">
      {/* Header bar with approval status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme">
        <div>
          <h3 className="text-xl font-bold text-theme-ink tracking-tight flex items-center gap-2.5">
            <span>Structured EMR Clinical Note</span>
            <span className="text-sm font-tamil text-theme-muted font-medium">
              (பரிசோதனை அறிக்கை & மருந்துச்சீட்டு)
            </span>
          </h3>
          <p className="text-sm text-theme-muted mt-1">
            Auto-populated from Tamil speech. Review complaints, vitals, ICD-10 diagnosis, and prescription dosages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {isApproved ? (
            <span className="flex items-center gap-2 px-4 py-2 status-chip-success text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
              Prescription Approved by Doctor
            </span>
          ) : (
            <span className="text-xs font-medium text-theme-muted bg-theme-bg px-3.5 py-2 rounded-full border border-theme">
              Doc Time: <strong className="text-[#0F766E] dark:text-[#2DD4BF] font-mono-numbers text-sm font-bold">{docTimeSeconds}s</strong> (Target &lt; 60s)
            </span>
          )}
        </div>
      </div>

      {/* Row 1: Vitals Cards Strip with Clinical Ranges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-theme-ink flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
            <span>Clinical Vitals & Measurements (உடல் அளவீடுகள்):</span>
          </span>
          <span className="text-xs text-theme-muted font-mono-numbers">Normal: BP &lt; 130/80 · Pulse 60-100 · Sugar &lt; 140</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* BP */}
          <div className="p-3.5 bg-theme-bg rounded-[14px] border border-theme space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-theme-muted uppercase">
              <span>Blood Pressure</span>
              <Activity className="w-3.5 h-3.5 text-[#0F766E]" strokeWidth={1.75} />
            </div>
            <input
              type="text"
              value={vitals.bp || ''}
              onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
              placeholder="120/80"
              className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">Normal: 120/80</span>
          </div>

          {/* Pulse */}
          <div className="p-3.5 bg-theme-bg rounded-[14px] border border-theme space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-theme-muted uppercase">
              <span>Pulse Rate</span>
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" strokeWidth={1.75} />
            </div>
            <input
              type="number"
              value={vitals.pulse || ''}
              onChange={(e) => setVitals({ ...vitals, pulse: parseInt(e.target.value, 10) || undefined })}
              placeholder="74"
              className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
            <span className="text-[11px] text-theme-muted block font-mono-numbers">bpm</span>
          </div>

          {/* Temperature */}
          <div className="p-3.5 bg-theme-bg rounded-[14px] border border-theme space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-theme-muted uppercase">
              <span>Temperature</span>
              <Thermometer className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} />
            </div>
            <input
              type="text"
              value={vitals.temperature || ''}
              onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
              placeholder="98.6 F"
              className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
            <span className="text-[11px] text-theme-muted block">Oral / Axillary</span>
          </div>

          {/* Weight */}
          <div className="p-3.5 bg-theme-bg rounded-[14px] border border-theme space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-theme-muted uppercase">
              <span>Weight</span>
              <Scale className="w-3.5 h-3.5 text-indigo-500" strokeWidth={1.75} />
            </div>
            <input
              type="text"
              value={vitals.weight || ''}
              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
              placeholder="65 kg"
              className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
            <span className="text-[11px] text-theme-muted block">kg</span>
          </div>

          {/* Blood Sugar */}
          <div className="p-3.5 bg-theme-bg rounded-[14px] border border-theme space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-theme-muted uppercase">
              <span>Blood Glucose</span>
              <Droplet className="w-3.5 h-3.5 text-[#0F766E]" strokeWidth={1.75} />
            </div>
            <input
              type="text"
              value={vitals.bloodGlucose || ''}
              onChange={(e) => setVitals({ ...vitals, bloodGlucose: e.target.value })}
              placeholder="110 mg/dL"
              className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
            <span className="text-[11px] text-theme-muted block">Random (RBS)</span>
          </div>

          {/* SpO2 */}
          <div className="p-3.5 bg-theme-bg rounded-[14px] border border-theme space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-theme-muted uppercase">
              <span>SpO2 Saturation</span>
              <Activity className="w-3.5 h-3.5 text-[#0F766E]" strokeWidth={1.75} />
            </div>
            <input
              type="text"
              value={vitals.spo2 || ''}
              onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
              placeholder="98%"
              className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">&gt; 95% Normal</span>
          </div>
        </div>
      </div>

      {/* Row 2: Chief Complaints */}
      <div className="p-5 rounded-[16px] border border-theme bg-theme-bg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-theme-ink">
            Chief Complaints & Patient Symptoms (முக்கிய தொந்தரவுகள்):
          </span>
          <span className="text-xs text-theme-muted tabular-nums">{chiefComplaints.length} active symptoms</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {chiefComplaints.map((comp, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-surface border border-theme text-xs font-semibold text-theme-ink shadow-2xs"
            >
              <span>{comp}</span>
              <button
                onClick={() => handleRemoveComplaint(idx)}
                className="text-theme-muted hover:text-red-500 font-bold transition-colors ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="pt-2 border-t border-theme flex flex-wrap items-center gap-2 text-xs">
          <span className="text-xs text-theme-muted font-semibold">Quick Add:</span>
          {['ஜலதோஷம் (Cold)', 'வைரல் காய்ச்சல் (Fever)', 'இருமல் (Cough)', 'வயிற்றுப்போக்கு (Loose stools)', 'தலைவலி (Headache)', 'நெஞ்செரிச்சல் (Acidity)'].map((symp, i) => (
            <button
              key={i}
              onClick={() => handleAddComplaint(symp)}
              className="px-3 py-1.5 rounded-full bg-theme-surface hover:bg-[#0F766E]/10 text-theme-content hover:text-[#0F766E] border border-theme text-xs font-tamil transition-colors"
            >
              + {symp}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Diagnoses with ICD-10 */}
      <div className="p-5 rounded-[16px] border border-theme bg-theme-bg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-theme-ink">
            Clinical Diagnosis & ICD-10 Coding (கண்டறியப்பட்ட நோய்):
          </span>
          <button
            onClick={() => setShowIcdModal(true)}
            className="flex items-center gap-1.5 text-xs text-[#0F766E] dark:text-[#2DD4BF] font-bold"
          >
            <Plus className="w-4 h-4" strokeWidth={1.75} />
            <span>Add ICD-10 Diagnosis</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {diagnosis.map((d) => (
            <div
              key={d.icd10}
              className="flex items-center justify-between p-3.5 bg-theme-surface border border-theme rounded-[14px] shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono-numbers text-xs font-bold px-2.5 py-1 rounded-[8px] bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412]">
                  {d.icd10}
                </span>
                <div>
                  <div className="font-bold text-sm text-theme-ink">{d.nameEn}</div>
                  <div className="text-xs font-tamil text-theme-muted">{d.nameTa}</div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveDiagnosis(d.icd10)}
                className="text-theme-muted hover:text-red-500 transition-colors p-1 rounded-lg"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Prescribed Medications */}
      <div className="p-5 rounded-[16px] border border-theme bg-theme-bg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-theme-ink flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
              <span>Prescription Medications & Visual Timing Matrix (மருந்துகள் அட்டவணை):</span>
            </span>
            <span className="text-xs text-theme-muted">
              ☀️ Morning (காலை) · ⛅ Noon (மதியம்) · 🌙 Night (இரவு)
            </span>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddMedModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412] rounded-[14px] text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" strokeWidth={1.75} />
            <span>Add Drug from PHC List</span>
          </motion.button>
        </div>

        {medications.length === 0 ? (
          <div className="p-8 text-center text-sm text-theme-muted bg-theme-surface rounded-[14px] border border-dashed border-theme">
            No medications currently prescribed. Dictate visit summary or click "Add Drug".
          </div>
        ) : (
          <div className="overflow-x-auto bg-theme-surface border border-theme rounded-[14px] shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-theme-bg border-b border-theme text-theme-muted text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-3">Form</th>
                  <th className="py-3 px-3">Strength</th>
                  <th className="py-3 px-3">Dose Schedule (☀️ · ⛅ · 🌙)</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Dietary Timing</th>
                  <th className="py-3 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {medications.map((med) => {
                  const schedule = parseDoseSchedule(med.frequency);

                  return (
                    <tr key={med.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-theme-ink text-sm">{med.drugName}</div>
                        <div className="text-xs font-tamil text-theme-muted font-medium">{med.tamilName}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-[6px] bg-theme-bg text-theme-content font-mono-numbers text-xs font-semibold">
                          {med.form}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono-numbers">
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => {
                            const updated = medications.map((m) =>
                              m.id === med.id ? { ...m, dosage: e.target.value } : m
                            );
                            setMedications(updated);
                          }}
                          className="w-20 px-2.5 py-1 bg-theme-bg border border-theme rounded-[8px] text-xs font-mono-numbers font-medium text-theme-content"
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 font-mono-numbers">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                            schedule.m === '1' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30' : 'text-theme-muted opacity-40'
                          }`}>
                            <Sun className="w-3 h-3 text-amber-500" strokeWidth={1.75} />
                            {schedule.m}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                            schedule.n === '1' ? 'bg-orange-500/15 text-orange-800 dark:text-orange-200 border border-orange-500/30' : 'text-theme-muted opacity-40'
                          }`}>
                            <CloudSun className="w-3 h-3 text-orange-500" strokeWidth={1.75} />
                            {schedule.n}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                            schedule.e === '1' ? 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border border-indigo-500/30' : 'text-theme-muted opacity-40'
                          }`}>
                            <Moon className="w-3 h-3 text-indigo-500" strokeWidth={1.75} />
                            {schedule.e}
                          </span>
                        </div>
                        <div className="text-[11px] font-tamil text-theme-muted mt-1">{med.frequencyTamil}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono-numbers">
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => {
                            const updated = medications.map((m) =>
                              m.id === med.id ? { ...m, duration: e.target.value } : m
                            );
                            setMedications(updated);
                          }}
                          className="w-24 px-2.5 py-1 bg-theme-bg border border-theme rounded-[8px] text-xs font-mono-numbers font-medium text-theme-content"
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 font-semibold text-theme-content">
                          <Utensils className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
                          <span>{med.instructions}</span>
                        </div>
                        <div className="text-xs font-tamil text-theme-muted">{med.instructionsTamil}</div>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <button
                          onClick={() => handleRemoveMedication(med.id)}
                          className="text-theme-muted hover:text-red-500 p-1.5 transition-colors rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Row 5: Advice & Referral */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-[16px] border border-theme bg-theme-bg space-y-2.5">
          <label className="block text-sm font-bold text-theme-ink">
            Doctor Clinical Advice & Instructions (மருத்துவ ஆலோசனை):
          </label>
          <textarea
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            rows={2}
            className="w-full p-3 bg-theme-surface border border-theme rounded-[12px] text-xs outline-none focus:ring-1 focus:ring-[#0F766E] text-theme-content mb-1"
            placeholder="Clinical advice in English..."
          />
          <textarea
            value={adviceTamil}
            onChange={(e) => setAdviceTamil(e.target.value)}
            rows={2}
            className="w-full p-3 bg-theme-surface border border-theme rounded-[12px] text-xs font-tamil outline-none focus:ring-1 focus:ring-[#0F766E] text-theme-content"
            placeholder="மருத்துவரின் அறிவுரை (தமிழில்)..."
          />
        </div>

        <div className="p-5 rounded-[16px] border border-theme bg-theme-bg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-theme-ink">
                Hospital Referral (மாவட்ட மருத்துவமனை பரிந்துரை)
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-theme-content">
                <input
                  type="checkbox"
                  checked={referralNeeded}
                  onChange={(e) => setReferralNeeded(e.target.checked)}
                  className="rounded text-[#0F766E] focus:ring-[#0F766E]"
                />
                <span>Referral Needed</span>
              </label>
            </div>

            {referralNeeded ? (
              <div className="space-y-3 mt-2">
                <div>
                  <label className="text-[11px] font-bold text-theme-muted uppercase">Referring Facility</label>
                  <input
                    type="text"
                    value={referralFacility}
                    onChange={(e) => setReferralFacility(e.target.value)}
                    placeholder="e.g., District Headquarter Hospital, Pollachi"
                    className="w-full px-3.5 py-2.5 bg-theme-surface border border-theme rounded-[10px] text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium text-theme-content"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-theme-muted uppercase">Referral Reason</label>
                  <input
                    type="text"
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    placeholder="e.g., Specialist cardiology consult / advanced diagnostics"
                    className="w-full px-3.5 py-2.5 bg-theme-surface border border-theme rounded-[10px] text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium text-theme-content"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-theme-muted mt-2 leading-relaxed">
                Case can be managed conservatively at Primary Health Centre level.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-5 border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-theme-muted">
          {!canApprove && (
            <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              Resolve or override critical allergy/safety alert above before approving!
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Patient SMS / Voice Reminder Drawer Trigger */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenCommunication}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 min-h-[48px] rounded-[14px] border border-theme bg-theme-surface hover:bg-theme-bg text-theme-ink text-xs font-bold transition-all shadow-2xs"
          >
            <MessageSquare className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
            <span>Tamil Voice Call & SMS</span>
          </motion.button>

          {/* Primary Doctor Approve & Print CTA with Snap Lock & Checkmark Motion */}
          <motion.button
            whileHover={{ y: canApprove ? -1 : 0 }}
            whileTap={{ scale: canApprove ? 0.97 : 1 }}
            onClick={triggerApprovalSequence}
            disabled={!canApprove || isApprovingAnimation}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 min-h-[52px] h-[52px] rounded-[14px] bg-[#0F766E] dark:bg-[#2DD4BF] hover:opacity-95 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white dark:text-[#071412] text-sm font-bold transition-all shadow-md shadow-[#0F766E]/20"
          >
            {isApprovingAnimation ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.15, 1] }}
                className="flex items-center gap-2.5"
              >
                {/* Checkmark drawing over 400ms */}
                <svg className="w-5 h-5 text-white dark:text-[#071412]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d="M20 6L9 17L4 12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
                <span>Approved! Opening Prescription...</span>
              </motion.div>
            ) : (
              <>
                <Printer className="w-5 h-5" strokeWidth={1.75} />
                <span>Approve & Print Prescription (அங்கீகரித்து அச்சிடு)</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-theme-surface rounded-[16px] max-w-lg w-full p-6 shadow-theme-soft border border-theme max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <h3 className="text-base font-bold text-theme-ink">
                PHC Essential Drug Formulary (TNMSCL)
              </h3>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="text-theme-muted hover:text-theme-ink p-1 rounded-lg"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="my-3">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-theme-bg rounded-[12px] border border-theme">
                <Search className="w-4 h-4 text-theme-muted" strokeWidth={1.75} />
                <input
                  type="text"
                  value={searchDrugTerm}
                  onChange={(e) => setSearchDrugTerm(e.target.value)}
                  placeholder="Search medicine by English or Tamil name..."
                  className="bg-transparent text-xs w-full outline-none text-theme-content font-medium"
                />
              </div>
            </div>

            <div className="overflow-y-auto divide-y divide-theme flex-1">
              {PHC_ESSENTIAL_DRUGS.filter(
                (d) =>
                  d.nameEn.toLowerCase().includes(searchDrugTerm.toLowerCase()) ||
                  d.nameTa.includes(searchDrugTerm) ||
                  d.category.toLowerCase().includes(searchDrugTerm.toLowerCase())
              ).map((drug) => (
                <div
                  key={drug.id}
                  className="py-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 px-3 rounded-[12px] cursor-pointer transition-colors"
                  onClick={() => handleAddMedication(drug)}
                >
                  <div>
                    <div className="font-bold text-xs text-theme-ink">{drug.nameEn}</div>
                    <div className="text-[11px] font-tamil text-theme-muted font-medium">
                      {drug.nameTa} · {drug.form}
                    </div>
                    <div className="text-[10px] text-[#0F766E] dark:text-[#2DD4BF] font-medium mt-0.5">
                      Standard: {drug.standardFrequency} ({drug.standardFrequencyTamil})
                    </div>
                  </div>
                  <button className="px-3.5 py-1.5 bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0F766E]/20 rounded-[8px] text-xs font-bold hover:bg-[#0F766E]/20 transition-colors">
                    + Prescribe
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-theme text-right">
              <button
                onClick={() => setShowAddMedModal(false)}
                className="px-4 py-2 rounded-[10px] bg-theme-bg text-theme-content text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add ICD-10 Modal */}
      {showIcdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-theme-surface rounded-[16px] max-w-md w-full p-6 shadow-theme-soft border border-theme max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <h3 className="text-base font-bold text-theme-ink">Select ICD-10 Diagnosis</h3>
              <button
                onClick={() => setShowIcdModal(false)}
                className="text-theme-muted hover:text-theme-ink p-1 rounded-lg"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="my-3">
              <input
                type="text"
                value={searchIcdTerm}
                onChange={(e) => setSearchIcdTerm(e.target.value)}
                placeholder="Search diagnosis..."
                className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme rounded-[12px] text-xs outline-none font-medium text-theme-content"
              />
            </div>

            <div className="overflow-y-auto divide-y divide-theme flex-1">
              {PHC_ICD10_LIST.filter(
                (i) =>
                  i.nameEn.toLowerCase().includes(searchIcdTerm.toLowerCase()) ||
                  i.nameTa.includes(searchIcdTerm) ||
                  i.code.toLowerCase().includes(searchIcdTerm.toLowerCase())
              ).map((icd) => (
                <div
                  key={icd.code}
                  onClick={() => handleAddDiagnosis(icd)}
                  className="py-3 px-3 hover:bg-[#0F766E]/10 dark:hover:bg-[#2DD4BF]/15 rounded-[10px] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-mono-numbers text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] mr-2">{icd.code}</span>
                    <span className="text-xs font-bold text-theme-ink">{icd.nameEn}</span>
                    <div className="text-[11px] font-tamil text-theme-muted">{icd.nameTa}</div>
                  </div>
                  <span className="text-xs text-[#0F766E] dark:text-[#2DD4BF] font-bold">+</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
