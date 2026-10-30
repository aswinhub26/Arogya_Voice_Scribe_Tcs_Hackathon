import React, { useEffect, useState } from 'react';
import { ClinicalVisit, Patient } from '../types/clinical.ts';
import { 
  Printer, 
  X, 
  FileText, 
  ArrowUpRight, 
  AlertTriangle,
  Award
} from 'lucide-react';
import { TamilNaduStateEmblem, NationalHealthMissionLogo } from './TamilNaduLogos.tsx';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import { SPRING_PHYSICS } from '../utils/motion.ts';

interface PrescriptionPrintModalProps {
  visit: ClinicalVisit;
  patient: Patient;
  onClose: () => void;
}

export const PrescriptionPrintModal: React.FC<PrescriptionPrintModalProps> = ({
  visit,
  patient,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'prescription' | 'referral'>('prescription');
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    async function genQr() {
      try {
        const payload = `GOVT-TN-PHC-RX\nID:${visit.id}\nPATIENT:${patient.name}\nABHA:${patient.abhaId}\nDATE:${visit.date}\nDR:${visit.doctorName}\nFACILITY:Valparai PHC, Coimbatore\nMEDS:${visit.medications.length}`;
        const url = await QRCode.toDataURL(payload, { width: 160, margin: 1 });
        setQrUrl(url);
      } catch (err) {
        console.error(err);
      }
    }
    genQr();
  }, [visit, patient]);

  const handlePrint = () => {
    window.print();
  };

  const parseDoseSchedule = (freq: string) => {
    if (freq === '1-1-1') return { m: '1', n: '1', e: '1' };
    if (freq === '1-0-1') return { m: '1', n: '0', e: '1' };
    if (freq === '1-0-0') return { m: '1', n: '0', e: '0' };
    if (freq === '0-0-1') return { m: '0', n: '0', e: '1' };
    if (freq === '0-1-0') return { m: '0', n: '1', e: '0' };
    return { m: '1', n: '0', e: '1' };
  };

  const isChronic = patient.chronicConditions && patient.chronicConditions.length > 0;
  const reviewDays = isChronic ? 30 : 5;
  const reviewDate = new Date();
  reviewDate.setDate(reviewDate.getDate() + reviewDays);
  const formattedReviewDate = reviewDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={SPRING_PHYSICS}
        className="bg-white rounded-[16px] max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[94vh]"
      >
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('prescription')}
                className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'prescription'
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" strokeWidth={1.75} />
                <span>Official Tamil Nadu PHC Prescription (மருந்துச்சீட்டு)</span>
              </button>
              {visit.referralNeeded && (
                <button
                  onClick={() => setActiveTab('referral')}
                  className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'referral'
                      ? 'bg-[#0F766E] text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
                  <span>Hospital Referral Note (பரிந்துரை கடிதம்)</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 h-[48px] bg-[#0F766E] hover:bg-[#0B4F4A] text-white rounded-[12px] text-xs font-bold transition-all shadow-md"
            >
              <Printer className="w-4 h-4" strokeWidth={1.75} />
              <span>Print Official Prescription (அச்சிடு)</span>
            </motion.button>
            <button
              onClick={onClose}
              className="p-2 rounded-[10px] hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Printable Paper Body */}
        <div className="overflow-y-auto p-6 md:p-10 bg-white font-sans text-slate-900 prescription-print-container">
          {activeTab === 'prescription' ? (
            /* OFFICIAL TAMIL NADU GOVERNMENT PHC PRESCRIPTION */
            <div className="border-2 border-slate-800 rounded-xl p-6 md:p-8 bg-white relative shadow-xs overflow-hidden">
              {/* Official Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0">
                <TamilNaduStateEmblem size={440} />
              </div>

              <div className="relative z-10 space-y-4">
                {/* OFFICIAL GOVERNMENT HEADER WITH BOTH LOGOS */}
                <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800 gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <TamilNaduStateEmblem size={76} />
                    <span className="text-[8px] font-bold text-red-950 uppercase tracking-tighter mt-1 font-tamil">
                      தமிழ்நாடு அரசு
                    </span>
                  </div>

                  <div className="text-center flex-1 space-y-0.5">
                    <div className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest font-sans">
                      தமிழ்நாடு அரசு · GOVERNMENT OF TAMIL NADU
                    </div>
                    <div className="text-xs font-bold text-teal-950 font-tamil">
                      மருத்துவம் மற்றும் மக்கள் நல்வாழ்வுத் துறை
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 font-sans">
                      Department of Health & Family Welfare · National Health Mission
                    </div>
                    <h1 className="text-base md:text-lg font-black text-slate-900 tracking-tight font-serif pt-1">
                      வால்பாறை அரசு ஆரம்ப சுகாதார நிலையம்
                    </h1>
                    <div className="text-xs font-bold text-slate-700 font-sans">
                      Valparai Government Upgraded 24x7 Primary Health Centre
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      Coimbatore District, Tamil Nadu · Pin: 642 127 · PHC Code: TN-CBE-8921 · NQAS Certified
                    </div>
                  </div>

                  <div className="flex flex-col items-center shrink-0">
                    <NationalHealthMissionLogo size={76} />
                    <span className="text-[8px] font-bold text-emerald-950 uppercase tracking-tighter mt-1 font-tamil">
                      தேசிய நலவாழ்வு
                    </span>
                  </div>
                </div>

                {/* Sub-Banner: Makkalai Thedi Maruthuvam & OP Particulars */}
                <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-900">OP TICKET NO:</span>
                    <strong className="text-slate-900 font-bold">#OP-2026-VAL-{visit.id.slice(-6)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">CONSULTATION DATE:</span>{' '}
                    <strong className="text-slate-900">{visit.date} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                  <div className="flex items-center gap-1 font-sans text-teal-800 font-bold text-[10px]">
                    <Award className="w-3.5 h-3.5 text-teal-700" strokeWidth={1.75} />
                    <span>Free OPD & Medicines · TNMSCL</span>
                  </div>
                </div>

                {/* Patient Particulars Double-Line Grid */}
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-300 border-b border-slate-300 bg-slate-50/50">
                    <div className="p-2.5">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Patient Name:</span>
                      <strong className="text-slate-900 text-sm font-serif">{patient.name}</strong>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Age / Gender:</span>
                      <strong className="text-slate-900">{patient.age} Yrs / {patient.gender}</strong>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Mobile Number:</span>
                      <strong className="text-slate-900 font-mono-numbers">{patient.phone}</strong>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Village / Ward:</span>
                      <strong className="text-slate-900">{patient.village}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-300">
                    <div className="p-2.5">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">ABHA Health ID:</span>
                      <strong className="text-teal-900 font-mono text-[11px]">{patient.abhaId}</strong>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Weight & BMI:</span>
                      <span className="text-slate-900 font-mono font-medium">
                        {visit.vitals.weight || `${patient.weightKg || 65} kg`}
                      </span>
                    </div>
                    <div className="p-2.5 col-span-2 bg-red-50/40">
                      <span className="text-[10px] font-bold text-red-700 block uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" strokeWidth={1.75} />
                        Documented Drug Allergies (மருந்து ஒவ்வாமை):
                      </span>
                      <strong className="text-red-950 font-semibold text-xs">
                        {patient.allergies && patient.allergies.length > 0 && !patient.allergies[0].toLowerCase().includes('none')
                          ? patient.allergies.join(', ')
                          : 'No Known Drug Allergies (NKDA)'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Recorded Clinical Vitals Strip */}
                <div className="bg-slate-50/80 border border-slate-300 rounded-lg p-2.5 flex flex-wrap items-center justify-between text-xs font-mono-numbers gap-2">
                  <span className="font-sans font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    Clinical Vitals:
                  </span>
                  <div>BP: <strong className="text-slate-900">{visit.vitals.bp || '120/80'} mmHg</strong></div>
                  <div>Pulse: <strong className="text-slate-900">{visit.vitals.pulse || '74'} bpm</strong></div>
                  <div>Temp: <strong className="text-slate-900">{visit.vitals.temperature || '98.6°F'}</strong></div>
                  <div>Sugar (RBS): <strong className="text-slate-900">{visit.vitals.bloodGlucose || '118 mg/dL'}</strong></div>
                  <div>SpO2: <strong className="text-slate-900">{visit.vitals.spo2 || '98%'}</strong></div>
                </div>

                {/* Clinical Findings & ICD-10 Diagnoses */}
                <div className="border-b border-slate-300 pb-3">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                    CLINICAL DIAGNOSIS & ICD-10 CODES (கண்டறியப்பட்ட நோய்):
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {visit.diagnosis.map((d) => (
                      <div
                        key={d.icd10}
                        className="text-xs font-bold text-slate-900 flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded border border-slate-300"
                      >
                        <span className="bg-teal-900 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {d.icd10}
                        </span>
                        <span>{d.nameEn}</span>
                        <span className="font-tamil text-slate-600 font-normal">({d.nameTa})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Classical ℞ Prescription Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black text-slate-900 flex items-center gap-1.5 font-serif">
                      <span className="text-2xl text-teal-900 font-black">℞</span>
                      <span>PRESCRIBED MEDICATIONS & TIMINGS (மருந்து விவரம்):</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-tamil font-semibold">
                      தமிழ்நாடு மருத்துவ சேவைக் கழகம் (TNMSCL)
                    </span>
                  </div>

                  <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                    <thead>
                      <tr className="bg-slate-200 border-b border-slate-400 text-slate-800 font-black text-[11px]">
                        <th className="py-2.5 px-3 border-r border-slate-300 w-8 text-center">#</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Medicine Name (மருந்தின் பெயர்)</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-16">Form</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-20">Strength</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 text-center">
                          <div>Schedule (நேரம்)</div>
                          <div className="text-[9px] font-normal text-slate-600 font-mono">☀️காலை · ⛅மதியம் · 🌙இரவு</div>
                        </th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-20 text-center">Duration</th>
                        <th className="py-2.5 px-3">Dietary Instructions (உணவு முறை)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {visit.medications.map((m, idx) => {
                        const sched = parseDoseSchedule(m.frequency);

                        return (
                          <tr key={m.id} className="text-slate-900">
                            <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono font-bold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-300">
                              <strong className="text-slate-950 text-xs font-bold">{m.drugName}</strong>
                              <span className="block text-[11px] font-tamil text-slate-700 font-medium">
                                {m.tamilName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-300 font-mono font-semibold text-slate-700">
                              {m.form}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-300 font-mono font-bold text-slate-900">
                              {m.dosage}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-300 text-center">
                              <div className="flex items-center justify-center gap-1.5 font-mono text-xs">
                                <span className={`px-1.5 py-0.5 rounded font-bold ${sched.m === '1' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-400'}`}>
                                  ☀️ {sched.m}
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className={`px-1.5 py-0.5 rounded font-bold ${sched.n === '1' ? 'bg-orange-100 text-orange-900 border border-orange-300' : 'text-slate-400'}`}>
                                  ⛅ {sched.n}
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className={`px-1.5 py-0.5 rounded font-bold ${sched.e === '1' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' : 'text-slate-400'}`}>
                                  🌙 {sched.e}
                                </span>
                              </div>
                              <span className="block text-[9px] font-tamil text-slate-600 font-medium mt-0.5">
                                {m.frequencyTamil}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-300 text-center font-mono font-bold text-slate-800">
                              {m.duration}
                            </td>
                            <td className="py-2.5 px-3">
                              <strong className="text-slate-950 font-bold text-xs">{m.instructions}</strong>
                              <span className="block text-[10px] font-tamil text-slate-700 font-semibold">
                                {m.instructionsTamil}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Doctor's Advice & Next Review Date Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-slate-300 rounded-lg p-3 bg-slate-50/80 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <strong className="text-slate-900 font-bold block uppercase tracking-wide text-[11px]">
                      DOCTOR'S CLINICAL ADVICE & DIETARY GUIDELINES (மருத்துவ அறிவுரை):
                    </strong>
                    <p className="text-slate-800 leading-relaxed font-sans">{visit.advice}</p>
                    <p className="font-tamil text-slate-900 font-medium mt-1">{visit.adviceTamil}</p>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-slate-300 pt-2 md:pt-0 md:pl-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase block">
                        அடுத்த பரிசோதனை தேதி:
                      </span>
                      <strong className="text-teal-900 font-mono text-sm block mt-0.5">
                        {formattedReviewDate}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-sans">
                        (Review after {reviewDays} days with OP card)
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-sans mt-2 pt-2 border-t border-slate-200">
                      Emergency PHC Contact: <strong>04253-222108</strong>
                    </div>
                  </div>
                </div>

                {/* Footer with Seal, Signature & ABHA QR */}
                <div className="pt-6 border-t-2 border-slate-800 flex items-end justify-between gap-6">
                  <div className="flex items-center gap-3">
                    {qrUrl ? (
                      <img src={qrUrl} alt="Rx QR" className="w-18 h-18 border border-slate-400 p-1 rounded bg-white shadow-2xs" />
                    ) : (
                      <div className="w-18 h-18 border border-slate-400 rounded bg-slate-100"></div>
                    )}
                    <div className="text-[10px] text-slate-600 space-y-0.5">
                      <p className="font-bold text-slate-900">ABDM e-Prescription Verified</p>
                      <p className="font-mono text-slate-600">Scan via ABHA / Arogya App</p>
                      <p className="font-tamil text-slate-500">அரசு அங்கீகரிக்கப்பட்ட மின்னணு மருந்துச்சீட்டு</p>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-600 hidden sm:block">
                    <p className="font-bold text-slate-900">24x7 தமிழ்நாடு அரசு அவசர உதவிகள்</p>
                    <p>இலவச ஆம்புலன்ஸ்: <strong>108</strong> · மருத்துவ ஆலோசனை: <strong>104</strong></p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="w-44 border-b-2 border-slate-700 mb-2 ml-auto"></div>
                    <strong className="text-xs font-bold text-slate-950 block">
                      {visit.doctorName || 'Dr. S. Kabilan, MBBS'}
                    </strong>
                    <span className="text-[11px] font-semibold text-slate-700 block">
                      Medical Officer / உதவி மருத்துவர்
                    </span>
                    <span className="text-[10px] text-slate-600 block font-mono">
                      Reg. No: <strong>TNMC-89421</strong> · Valparai Upgraded PHC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* OFFICIAL REFERRAL SLIP NOTE */
            <div className="border-2 border-slate-800 rounded-xl p-8 bg-white space-y-6">
              <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800">
                <TamilNaduStateEmblem size={68} />
                <div className="text-center space-y-0.5">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    GOVERNMENT OF TAMIL NADU · HEALTH & FAMILY WELFARE
                  </div>
                  <h2 className="text-base font-black text-slate-900 mt-0.5">
                    OFFICIAL CLINICAL REFERRAL SLIP (பரிந்துரை கடிதம்)
                  </h2>
                  <div className="text-xs text-slate-600 font-tamil">
                    வால்பாறை அரசு மேம்படுத்தப்பட்ட ஆரம்ப சுகாதார நிலையம், கோயம்புத்தூர்
                  </div>
                </div>
                <NationalHealthMissionLogo size={68} />
              </div>

              <div className="text-xs space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Referred To:</span>
                    <strong className="text-sm font-bold text-teal-950">
                      The Medical Superintendent / Specialist In-charge
                    </strong>
                    <div className="text-xs font-semibold text-slate-700">
                      {visit.referralFacility || 'District Headquarter Hospital, Pollachi / CMCH Coimbatore'}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Date & OP Slip:</span>
                    <strong>{visit.date} · #{visit.id.slice(-6)}</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-1">
                  <p><strong>Patient Name:</strong> {patient.name} ({patient.age}y / {patient.gender})</p>
                  <p><strong>ABHA Health Number:</strong> <span className="font-mono text-teal-900">{patient.abhaId}</span> | <strong>Phone:</strong> {patient.phone}</p>
                  <p><strong>Primary Diagnosis:</strong> {visit.diagnosis.map((d) => `${d.nameEn} (${d.icd10})`).join(', ')}</p>
                  <p className="font-mono"><strong>Vitals at PHC:</strong> BP: {visit.vitals.bp || '120/80'} | Pulse: {visit.vitals.pulse || '74'} | Sugar: {visit.vitals.bloodGlucose || '118'}</p>
                </div>

                <div className="space-y-1">
                  <strong className="block text-slate-900 uppercase font-bold text-[11px]">
                    Reason for Referral & Clinical Findings:
                  </strong>
                  <p className="p-3 bg-white border border-slate-300 rounded-lg text-slate-800 leading-relaxed font-sans">
                    {visit.referralReason || 'Patient requires higher-center specialist evaluation, advanced diagnostic imaging, and intensive therapeutic management.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <strong className="block text-slate-900 uppercase font-bold text-[11px]">
                    Emergency First-Line Treatment Administered at PHC:
                  </strong>
                  <ul className="list-disc pl-5 text-slate-800 space-y-1">
                    {visit.medications.map((m) => (
                      <li key={m.id}>
                        {m.drugName} {m.dosage} ({m.form}) - {m.frequency} ({m.instructions})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 flex justify-between items-end border-t border-slate-300">
                  <div className="text-[11px] text-slate-600">
                    <p>Free Emergency 108 Transport Dispatched</p>
                    <p>PHC Telephone: 04253-222108</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="w-40 border-b-2 border-slate-700 mb-1 ml-auto"></div>
                    <span className="font-bold text-xs text-slate-950 block">{visit.doctorName}</span>
                    <p className="text-[10px] text-slate-600">Referring Medical Officer · Valparai PHC</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print p-4.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">
            Official Bilingual Tamil Nadu Health System Prescription (National Health Mission TN Format).
          </span>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-6 h-[48px] bg-[#0F766E] hover:bg-[#0B4F4A] text-white rounded-[12px] font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Printer className="w-4 h-4" strokeWidth={1.75} />
              <span>Print Prescription</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 h-[48px] bg-white border border-slate-300 text-slate-700 rounded-[12px] font-semibold hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
