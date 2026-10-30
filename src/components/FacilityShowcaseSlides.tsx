import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Stethoscope, 
  HeartPulse, 
  Pill, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface SlideItem {
  id: string;
  title: string;
  titleTamil: string;
  tagline: string;
  imageSrc: string;
  badge: string;
  icon: any;
  stats: { label: string; value: string }[];
}

const SLIDES: SlideItem[] = [
  {
    id: 'phc-facility',
    title: 'Valparai Government Primary Health Centre',
    titleTamil: 'வால்பாறை அரசு ஆரம்ப சுகாதார நிலையம்',
    tagline: 'Delivering modern, voice-first clinical care to rural & tea estate communities in Coimbatore District.',
    imageSrc: '/src/assets/images/phc_clinic_exterior_1793339509995.jpg',
    badge: 'National Health Mission · Tamil Nadu',
    icon: Building2,
    stats: [
      { label: 'Daily OPD', value: '140+ Patients' },
      { label: 'Doc Time', value: '< 60s per visit' },
      { label: 'Formulary', value: '100% Essential List' },
    ],
  },
  {
    id: 'consult-desk',
    title: 'Voice-First Doctor Consultation Room',
    titleTamil: 'குரல் வழி மருத்துவ பரிசோதனை அறை',
    tagline: 'On-device Tamil speech-to-text converts 30-sec spoken visit summaries directly into structured EMR notes.',
    imageSrc: '/src/assets/images/clinical_consult_desk_1793339510422.jpg',
    badge: 'Tamil-First Clinical NLP & Safety Layer',
    icon: Stethoscope,
    stats: [
      { label: 'Languages', value: 'தமிழ் / English' },
      { label: 'Safety Checks', value: 'Allergy & LASA' },
      { label: 'Prescription', value: 'Bilingual Print' },
    ],
  },
  {
    id: 'nurse-triage',
    title: 'Nurse & ANM Rapid Triage Station',
    titleTamil: 'செவிலியர் உடல் அளவீட்டு மையம்',
    tagline: 'Real-time pre-consultation vitals recording (BP, Pulse, Blood Sugar, BMI) auto-transmitted to doctor desk.',
    imageSrc: '/src/assets/images/nurse_vitals_station_1793339511812.jpg',
    badge: 'Maternal ANC & NCD Screening',
    icon: HeartPulse,
    stats: [
      { label: 'Triage Speed', value: '45s per patient' },
      { label: 'ANC Register', value: 'Auto Form 6-A' },
      { label: 'Integration', value: 'ABHA Linked' },
    ],
  },
  {
    id: 'pharmacy-counter',
    title: 'TNMSCL Essential Pharmacy Dispensary',
    titleTamil: 'அரசு மருந்தகம் & மருந்து விநியோகம்',
    tagline: 'Instant pharmacy queue verification with printed Tamil dosage schedules for bottle and pouch labels.',
    imageSrc: '/src/assets/images/phc_pharmacy_dispensary_1793339511353.jpg',
    badge: 'Zero-Paper Dispensing Queue',
    icon: Pill,
    stats: [
      { label: 'Stock Verification', value: 'TNMSCL Realtime' },
      { label: 'Patient Support', value: 'SMS & Voice Calls' },
      { label: 'Dispense Log', value: 'Tamper Evident' },
    ],
  },
];

export const FacilityShowcaseSlides: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SLIDES[currentSlideIndex];
  const IconComponent = slide.icon;

  const nextSlide = () => setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-800"
    >
      <div className="relative aspect-21/9 min-h-[220px] max-h-[300px] w-full overflow-hidden">
        {/* Background Image with Cinematic Contrast Scrim */}
        <AnimatePresence mode="wait">
          <motion.img
            key={slide.id}
            src={slide.imageSrc}
            alt={slide.title}
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Measured Scrim for WCAG 4.5:1 Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 backdrop-blur-md border border-teal-400/30 text-teal-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                <IconComponent className="w-3.5 h-3.5 text-teal-400" />
                <span>{slide.badge}</span>
              </span>
            </div>

            {/* Slide Navigation Dots */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentSlideIndex ? 'w-6 bg-teal-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="max-w-2xl">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                {slide.title}
              </h2>
              <div className="text-sm font-tamil text-teal-200 mt-1 font-medium">
                {slide.titleTamil}
              </div>
              <p className="text-xs text-slate-300 mt-1.5 hidden sm:block leading-relaxed">
                {slide.tagline}
              </p>
            </div>

            {/* Bottom Mini Metrics Strip */}
            <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs">
              {slide.stats.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">{s.label}:</span>
                  <strong className="text-white font-mono">{s.value}</strong>
                  {idx < slide.stats.length - 1 && <span className="text-white/20">·</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Arrow Triggers */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-sm transition-all border border-white/10 z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-sm transition-all border border-white/10 z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
