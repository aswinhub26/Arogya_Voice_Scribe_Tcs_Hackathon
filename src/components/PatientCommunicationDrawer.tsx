import React, { useState, useEffect, useRef } from 'react';
import { ClinicalVisit, Patient } from '../types/clinical.ts';
import { 
  X, 
  MessageSquare, 
  PhoneCall, 
  Volume2, 
  Send, 
  CheckCheck, 
  Play, 
  Pause, 
  Sparkles, 
  PhoneOff, 
  Radio 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING_PHYSICS, TRANSITION_FAST } from '../utils/motion.ts';

interface PatientCommunicationDrawerProps {
  visit: ClinicalVisit;
  patient: Patient;
  onClose: () => void;
}

export const PatientCommunicationDrawer: React.FC<PatientCommunicationDrawerProps> = ({
  visit,
  patient,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'sms'>('voice');
  const [smsSent, setSmsSent] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('connected');
  const [callTimer, setCallTimer] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const callIntervalRef = useRef<any>(null);

  // Tamil spoken script sentences for karaoke tracking
  const spokenSentences = [
    {
      ta: `வணக்கம் ${patient.name}. இது வால்பாறை அரசு ஆரம்ப சுகாதார நிலையம்.`,
      en: `Hello ${patient.name}. This is Valparai Government Primary Health Centre.`,
    },
    ...visit.medications.map((m) => ({
      ta: `உங்கள் மருந்து: ${m.tamilName || m.drugName} ${m.dosage}. ${m.frequencyTamil}, ${m.instructionsTamil} சாப்பிடவும்.`,
      en: `Your medicine: ${m.drugName} ${m.dosage}. Take ${m.frequency}, ${m.instructions}.`,
    })),
    {
      ta: `மருத்துவரின் அறிவுரை: ${visit.adviceTamil || 'மருந்துகளை தவறாமல் உட்கொள்ளவும்.'}`,
      en: `Doctor's advice: ${visit.advice || 'Take medicines on time.'}`,
    },
    {
      ta: `நன்றி, நலம் பெற வாழ்த்துகிறோம். அவசர உதவிக்கு 104 அல்லது 108 அழைக்கவும்.`,
      en: `Thank you, wishing you speedy recovery. For emergency dial 104 or 108.`,
    },
  ];

  const fullTamilSpeechText = spokenSentences.map((s) => s.ta).join(' ');

  useEffect(() => {
    if (callStatus === 'connected' && isPlayingAudio) {
      callIntervalRef.current = setInterval(() => {
        setCallTimer((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(callIntervalRef.current);
    }
    return () => clearInterval(callIntervalRef.current);
  }, [callStatus, isPlayingAudio]);

  const playGoogleTranslateVoice = (sentenceIdx = currentSentenceIndex) => {
    setCurrentSentenceIndex(sentenceIdx);
    const targetText = spokenSentences[sentenceIdx]?.ta || spokenSentences[0].ta;
    const url = `/api/tts/tamil?text=${encodeURIComponent(targetText)}`;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;

    audio.onplay = () => {
      setIsPlayingAudio(true);
      setCallStatus('connected');
    };

    audio.onended = () => {
      if (sentenceIdx + 1 < spokenSentences.length) {
        playGoogleTranslateVoice(sentenceIdx + 1);
      } else {
        setIsPlayingAudio(false);
      }
    };

    audio.onerror = () => {
      playBrowserWebSpeech(sentenceIdx);
    };

    audio.play().catch(() => {
      playBrowserWebSpeech(sentenceIdx);
    });
  };

  const playBrowserWebSpeech = (sentenceIdx = currentSentenceIndex) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const targetText = spokenSentences[sentenceIdx]?.ta || fullTamilSpeechText;
      const utterance = new SpeechSynthesisUtterance(targetText);
      utterance.lang = 'ta-IN';
      utterance.rate = playbackSpeed * 0.9;

      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find((v) => v.lang.includes('ta') || v.name.includes('Tamil') || v.name.includes('Google தமிழ்'));
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }

      utterance.onstart = () => {
        setIsPlayingAudio(true);
        setCallStatus('connected');
      };

      utterance.onend = () => {
        if (sentenceIdx + 1 < spokenSentences.length) {
          setCurrentSentenceIndex(sentenceIdx + 1);
          playBrowserWebSpeech(sentenceIdx + 1);
        } else {
          setIsPlayingAudio(false);
        }
      };

      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const togglePlayback = () => {
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    } else {
      playGoogleTranslateVoice(currentSentenceIndex);
    }
  };

  const handleStopCall = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);
    setCallStatus('ended');
    setCallTimer(0);
    setCurrentSentenceIndex(0);
  };

  const buildTamilSms = () => {
    const medsText = visit.medications
      .map((m, i) => `${i + 1}) ${m.tamilName || m.drugName} ${m.dosage}: ${m.frequencyTamil} (${m.durationDays} நாட்கள், ${m.instructionsTamil})`)
      .join('\n');

    return `ஆரோக்ய PHC வால்பாறை:\n${patient.name} அவர்களுக்கு மருந்து விவரம்:\n${medsText}\nஅறிவுரை: ${visit.adviceTamil}\nமருத்துவர்: ${visit.doctorName}\nஅவசர உதவிக்கு: 104 / 108.`;
  };

  const smsContent = buildTamilSms();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={SPRING_PHYSICS}
        className="bg-theme-surface w-full max-w-lg h-full shadow-theme-soft flex flex-col justify-between border-l border-theme"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-theme bg-[#0B1F1D] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#2DD4BF]/20 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF]">
              <PhoneCall className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Google Tamil Voice Call Reminder</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#2DD4BF] text-[#071412] font-bold uppercase tracking-wider">
                  Live Tamil TTS
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-tamil mt-0.5">
                நோயாளிக்கான நேரடி தமிழ் குரல் நினைவூட்டல் அழைப்பு
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopCall();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-[10px] hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Navigation Tabs with Sliding Pill */}
        <div className="px-6 pt-3 flex gap-4 border-b border-theme bg-theme-bg">
          <button
            onClick={() => setActiveTab('voice')}
            className={`pb-3 px-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'voice'
                ? 'border-[#0F766E] dark:border-[#2DD4BF] text-[#0F766E] dark:text-[#2DD4BF]'
                : 'border-transparent text-theme-muted hover:text-theme-ink'
            }`}
          >
            <Volume2 className="w-4 h-4" strokeWidth={1.75} />
            <span>Google Tamil Voice Call</span>
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`pb-3 px-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sms'
                ? 'border-[#0F766E] dark:border-[#2DD4BF] text-[#0F766E] dark:text-[#2DD4BF]'
                : 'border-transparent text-theme-muted hover:text-theme-ink'
            }`}
          >
            <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
            <span>Button Phone SMS</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Active Target Patient Info Card */}
          <div className="p-4 rounded-[14px] bg-theme-bg border border-theme flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-theme-ink text-sm">{patient.name}</span>
              <span className="text-theme-muted ml-2">({patient.age}y / {patient.gender})</span>
              <div className="font-mono-numbers text-xs text-[#0F766E] dark:text-[#2DD4BF] mt-0.5 font-bold">
                Target Phone: {patient.phone} ({patient.village})
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 text-[#0F766E] dark:text-[#2DD4BF] font-mono-numbers font-bold text-xs">
              ABHA: {patient.abhaId.slice(-9)}
            </span>
          </div>

          {activeTab === 'voice' ? (
            <div className="space-y-4">
              {/* SMARTPHONE INCOMING / CONNECTED CALL HUD */}
              <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-[20px] p-6 text-white shadow-xl border border-slate-800 text-center relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-teal-500/20 border-2 border-teal-400 mx-auto flex items-center justify-center text-teal-300 shadow-lg shadow-teal-500/20">
                    <PhoneCall className={`w-8 h-8 ${isPlayingAudio ? 'animate-bounce' : ''}`} strokeWidth={1.75} />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">
                      வால்பாறை அரசு ஆரம்ப சுகாதார நிலையம்
                    </h4>
                    <p className="text-xs text-teal-300 font-mono mt-0.5">
                      Govt PHC Valparai · Tamil Automated Healthcare IVR
                    </p>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      Calling: {patient.name} ({patient.phone})
                    </div>
                  </div>

                  {/* Active Call Status & Equalizer */}
                  <div className="pt-2 pb-1">
                    {isPlayingAudio ? (
                      <div className="space-y-2">
                        <span className="text-xs font-mono text-emerald-400 font-bold flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          <span>Connected · 00:{callTimer < 10 ? `0${callTimer}` : callTimer} (Playing in Tamil)</span>
                        </span>

                        <div className="flex items-center justify-center gap-1.5 h-8">
                          {[14, 28, 20, 32, 16, 26, 34, 18, 30, 22, 16, 28].map((h, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: isPlayingAudio ? [6, h, 10, h * 0.9, 6] : 4 }}
                              transition={{ repeat: Infinity, duration: 0.65 + (i % 4) * 0.12, ease: 'easeInOut' }}
                              className="w-1.5 bg-[#2DD4BF] rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">
                        Ready to trigger Tamil voice call reminder
                      </span>
                    )}
                  </div>

                  {/* Call Action Controls */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={togglePlayback}
                      className={`px-6 py-3 min-h-[48px] rounded-[14px] font-bold text-xs flex items-center gap-2.5 transition-all shadow-lg ${
                        isPlayingAudio
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/20'
                      }`}
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" strokeWidth={1.75} />
                          <span>Pause Tamil Voice</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" strokeWidth={1.75} />
                          <span>Listen to Tamil Voice Call</span>
                        </>
                      )}
                    </motion.button>

                    {isPlayingAudio && (
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={handleStopCall}
                        className="p-3 min-h-[48px] min-w-[48px] rounded-[14px] bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all flex items-center justify-center"
                        title="End call"
                      >
                        <PhoneOff className="w-4 h-4" strokeWidth={1.75} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cadence Speed Selector */}
              <div className="p-4 rounded-[14px] border border-theme bg-theme-bg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
                  <span className="font-bold text-theme-ink">Engine:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 text-[#0F766E] dark:text-[#2DD4BF] font-bold text-[11px]">
                    Google Translate Tamil Voice (HD)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-theme-muted text-[11px] font-semibold">Speed:</span>
                  {[0.8, 1.0, 1.2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-bold font-mono-numbers transition-colors ${
                        playbackSpeed === spd
                          ? 'bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412]'
                          : 'bg-theme-surface text-theme-muted border border-theme hover:bg-black/5'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Karaoke Spoken Tamil Script */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-theme-muted">
                  <span className="font-bold text-theme-ink flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
                    <span>Live Spoken Tamil Script (பேசப்படும் வரிகள்):</span>
                  </span>
                  <span className="text-xs text-theme-muted">Tap to jump to sentence</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {spokenSentences.map((sent, sIdx) => {
                    const isCurrent = currentSentenceIndex === sIdx && isPlayingAudio;

                    return (
                      <div
                        key={sIdx}
                        onClick={() => {
                          setCurrentSentenceIndex(sIdx);
                          playGoogleTranslateVoice(sIdx);
                        }}
                        className={`p-3.5 rounded-[12px] border text-xs cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 border-[#0F766E] dark:border-[#2DD4BF] shadow-xs ring-1 ring-[#0F766E]/30'
                            : 'bg-theme-surface border-theme hover:bg-theme-bg'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-tamil text-sm leading-relaxed ${isCurrent ? 'font-bold text-theme-ink' : 'text-theme-content'}`}>
                            {sent.ta}
                          </p>
                          {isCurrent && (
                            <Volume2 className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] shrink-0 mt-0.5 animate-pulse" strokeWidth={1.75} />
                          )}
                        </div>
                        <p className="text-xs text-theme-muted mt-1 font-sans">
                          {sent.en}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* BUTTON PHONE SMS VIEW */
            <div className="space-y-4">
              <div className="text-xs font-bold text-theme-muted flex items-center justify-between">
                <span>Feature Phone Screen Preview:</span>
                <span className="text-[10px] font-mono">160 Char Standard</span>
              </div>

              <div className="bg-slate-900 rounded-[20px] p-5 shadow-2xl border-4 border-slate-800 max-w-xs mx-auto">
                <div className="bg-[#a8ba9a] text-slate-900 p-3.5 rounded-[12px] font-tamil text-xs leading-relaxed shadow-inner border border-slate-700 h-64 overflow-y-auto font-mono">
                  <div className="text-[10px] uppercase tracking-wider border-b border-slate-700/40 pb-1 mb-2 flex justify-between font-sans font-bold">
                    <span>Arogya-PHC</span>
                    <span>10:45 AM</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-tamil font-medium text-xs">
                    {smsContent}
                  </pre>
                </div>
              </div>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSmsSent(true)}
                disabled={smsSent}
                className="w-full h-[52px] rounded-[14px] bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412] text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:bg-emerald-600 shadow-sm"
              >
                {smsSent ? (
                  <>
                    <CheckCheck className="w-5 h-5 text-white" strokeWidth={1.75} />
                    <span>Tamil SMS Dispatched via Health Gateway!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" strokeWidth={1.75} />
                    <span>Send Tamil SMS to {patient.phone}</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-theme bg-theme-bg flex justify-end">
          <button
            onClick={() => {
              handleStopCall();
              onClose();
            }}
            className="px-5 py-2.5 rounded-[12px] bg-theme-surface hover:bg-black/5 dark:hover:bg-white/5 border border-theme text-theme-ink text-xs font-bold transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
