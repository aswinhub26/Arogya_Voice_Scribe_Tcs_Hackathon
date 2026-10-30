import React, { useState } from 'react';
import { Patient, Vitals } from '../types/clinical.ts';
import { StorageService } from '../services/storageService.ts';
import { 
  HeartPulse, 
  Check, 
  Save, 
  Activity,
  Thermometer,
  Scale,
  Droplet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SPRING_PHYSICS, 
  STAGGER_CONTAINER_VARIANTS, 
  STAGGER_ITEM_VARIANTS 
} from '../utils/motion.ts';

interface NurseVitalsViewProps {
  patients: Patient[];
  activePatient: Patient;
  onSelectPatient: (patient: Patient) => void;
  onSaveVitals: (patientId: string, vitals: Vitals) => void;
}

export const NurseVitalsView: React.FC<NurseVitalsViewProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  onSaveVitals,
}) => {
  const [systolic, setSystolic] = useState<number | ''>(124);
  const [diastolic, setDiastolic] = useState<number | ''>(82);
  const [pulse, setPulse] = useState<number | ''>(74);
  const [temp, setTemp] = useState<string>('98.4 F');
  const [weight, setWeight] = useState<number | ''>(activePatient.weightKg || 65);
  const [heightCm, setHeightCm] = useState<number | ''>(168);
  const [sugar, setSugar] = useState<string>('118 mg/dL');
  const [spo2, setSpo2] = useState<string>('98%');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute BMI
  const bmi = weight && heightCm
    ? (Number(weight) / ((Number(heightCm) / 100) * (Number(heightCm) / 100))).toFixed(1)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vitals: Vitals = {
      bp: systolic && diastolic ? `${systolic}/${diastolic}` : undefined,
      bpSystolic: systolic ? Number(systolic) : undefined,
      bpDiastolic: diastolic ? Number(diastolic) : undefined,
      pulse: pulse ? Number(pulse) : undefined,
      temperature: temp,
      weight: weight ? `${weight} kg` : undefined,
      bloodGlucose: sugar,
      spo2,
    };

    onSaveVitals(activePatient.id, vitals);
    StorageService.logAudit({
      userId: 'NURSE-002',
      userName: 'Nurse Anitha, ANM',
      role: 'nurse',
      action: 'FIELD_EDITED',
      details: `Vitals recorded for ${activePatient.name}: BP ${vitals.bp}, Pulse ${vitals.pulse}, Weight ${vitals.weight}.`,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="theme-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <h2 className="text-xl font-bold text-theme-ink tracking-tight">
              Nurse & ANM OPD Vitals Station
            </h2>
            <span className="text-sm font-tamil text-theme-muted">
              (செவிலியர் உடல் அளவீட்டு பதிவு மையம்)
            </span>
          </div>
          <p className="text-sm text-theme-muted mt-1">
            Record patient baseline vitals prior to doctor consultation. Automatically populates doctor's voice EMR.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="text-theme-muted">Active Patient:</span>
          <span className="font-bold text-theme-ink bg-theme-bg px-3 py-1.5 rounded-[10px] border border-theme">
            {activePatient.name} ({activePatient.age}y / {activePatient.gender})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Triage Queue with Staggered Entrance */}
        <div className="theme-card p-6 space-y-4">
          <div className="text-xs font-bold text-theme-muted uppercase tracking-wider flex items-center justify-between">
            <span>OPD Triage Queue ({patients.length})</span>
            <span className="text-xs text-[#0F766E] dark:text-[#2DD4BF] font-semibold">Today's List</span>
          </div>

          <motion.div 
            variants={STAGGER_CONTAINER_VARIANTS}
            initial="initial"
            animate="animate"
            className="space-y-2 max-h-[500px] overflow-y-auto pr-1"
          >
            {patients.slice(0, 8).map((p) => {
              const isSelected = p.id === activePatient.id;
              return (
                <motion.div
                  key={p.id}
                  layout
                  transition={SPRING_PHYSICS}
                  variants={STAGGER_ITEM_VARIANTS}
                  onClick={() => onSelectPatient(p)}
                  className={`p-3.5 rounded-[14px] cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 border-[#0F766E]/30 dark:border-[#2DD4BF]/40 shadow-xs'
                      : 'border-theme bg-theme-bg hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-theme-ink">{p.name}</span>
                    <span className="text-xs text-theme-muted tabular-nums">{p.age}y · {p.gender}</span>
                  </div>
                  <div className="text-xs text-theme-muted font-mono-numbers mt-1">
                    {p.phone} · {p.village}
                  </div>
                  {p.allergies && p.allergies.length > 0 && !p.allergies[0].toLowerCase().includes('none') && (
                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400 block mt-1">
                      ⚠️ Allergy: {p.allergies[0]}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Column: High-Speed Vitals Form */}
        <div className="lg:col-span-2 theme-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-theme pb-4">
              <h3 className="text-lg font-bold text-theme-ink">
                Enter Vitals for {activePatient.name}
              </h3>
              <p className="text-xs text-theme-muted font-mono-numbers mt-0.5">
                ABHA ID: {activePatient.abhaId}
              </p>
            </div>

            {/* Vitals Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BP Systolic & Diastolic */}
              <div className="p-4 bg-theme-bg rounded-[14px] border border-theme space-y-2">
                <label className="block text-xs font-bold text-theme-muted flex items-center justify-between uppercase">
                  <span>Blood Pressure (ரத்த அழுத்தம்)</span>
                  <span className="text-[10px] font-mono-numbers">mmHg</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(parseInt(e.target.value, 10) || '')}
                    placeholder="120"
                    className="w-full px-3 py-2.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink focus:ring-1 focus:ring-[#0F766E] outline-none"
                  />
                  <span className="text-theme-muted font-bold text-lg">/</span>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(parseInt(e.target.value, 10) || '')}
                    placeholder="80"
                    className="w-full px-3 py-2.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink focus:ring-1 focus:ring-[#0F766E] outline-none"
                  />
                </div>
              </div>

              {/* Pulse & SpO2 */}
              <div className="p-4 bg-theme-bg rounded-[14px] border border-theme space-y-2">
                <label className="block text-xs font-bold text-theme-muted flex items-center justify-between uppercase">
                  <span>Pulse & Oxygen Saturation</span>
                  <span className="text-[10px] font-mono-numbers">bpm / %</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(parseInt(e.target.value, 10) || '')}
                    placeholder="72"
                    className="w-full px-3 py-2.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink focus:ring-1 focus:ring-[#0F766E] outline-none"
                  />
                  <input
                    type="text"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    placeholder="98%"
                    className="w-full px-3 py-2.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink focus:ring-1 focus:ring-[#0F766E] outline-none"
                  />
                </div>
              </div>

              {/* Weight & Height */}
              <div className="p-4 bg-theme-bg rounded-[14px] border border-theme space-y-2">
                <label className="block text-xs font-bold text-theme-muted flex items-center justify-between uppercase">
                  <span>Weight & Height</span>
                  <span className="text-[10px] font-mono-numbers">kg / cm</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value, 10) || '')}
                    placeholder="65"
                    className="w-full px-3 py-2.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink focus:ring-1 focus:ring-[#0F766E] outline-none"
                  />
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || '')}
                    placeholder="165"
                    className="w-full px-3 py-2.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink focus:ring-1 focus:ring-[#0F766E] outline-none"
                  />
                </div>
                {bmi && (
                  <div className="mt-1 text-xs text-[#0F766E] dark:text-[#2DD4BF] font-semibold">
                    Calculated BMI: {bmi} kg/m²
                  </div>
                )}
              </div>

              {/* Temperature & Random Blood Sugar */}
              <div className="p-4 bg-theme-bg rounded-[14px] border border-theme space-y-2">
                <label className="block text-xs font-bold text-theme-muted flex items-center justify-between uppercase">
                  <span>Temperature & Blood Glucose (RBS)</span>
                  <span className="text-[10px] font-mono-numbers">°F / mg/dL</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    placeholder="98.6 F"
                    className="w-full px-3 py-2.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink focus:ring-1 focus:ring-[#0F766E] outline-none"
                  />
                  <input
                    type="text"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    placeholder="120 mg/dL"
                    className="w-full px-3 py-2.5 bg-theme-surface border border-theme rounded-[10px] text-sm font-mono-numbers font-bold text-theme-ink focus:ring-1 focus:ring-[#0F766E] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-theme">
              <span className="text-xs text-theme-muted">
                Nurse Station ID: ANM-VALPARAI-02
              </span>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="flex items-center gap-2 px-6 h-[52px] min-h-[52px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-[14px] text-sm font-bold transition-all shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-5 h-5 text-white" strokeWidth={1.75} />
                    <span>Vitals Dispatched to Doctor's Room!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" strokeWidth={1.75} />
                    <span>Save & Transmit Vitals to Doctor</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
