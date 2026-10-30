import React, { useState, useEffect, useRef } from 'react';
import { ConfidenceToken, Patient } from '../types/clinical.ts';
import { CLINICAL_CASE_PRESETS, ClinicalCasePreset } from '../data/clinicalCasePresets.ts';
import { 
  Mic, 
  Square, 
  Sparkles, 
  Check, 
  FileText, 
  RotateCcw,
  Zap,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING_PHYSICS, TRANSITION_BASE, TRANSITION_FAST } from '../utils/motion.ts';

interface VoiceScribeSectionProps {
  patient: Patient;
  transcript: string;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  tokens: ConfidenceToken[];
  setTokens: (tokens: ConfidenceToken[]) => void;
  onStructureNote: (customTranscript?: string) => Promise<void>;
  isProcessing: boolean;
  onSelectPresetPatient?: (patientId: string) => void;
}

export const VoiceScribeSection: React.FC<VoiceScribeSectionProps> = ({
  patient,
  transcript,
  setTranscript,
  tokens,
  setTokens,
  onStructureNote,
  isProcessing,
  onSelectPresetPatient,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechLanguage, setSpeechLanguage] = useState<'ta-IN' | 'en-IN'>('ta-IN');
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [customWordInput, setCustomWordInput] = useState('');
  const [activePresetId, setActivePresetId] = useState<string>('case-common-cold');

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Initialize Web Speech API if supported in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLanguage;

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setTranscript((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        clearInterval(timerRef.current);
      };

      recognition.onend = () => {
        setIsRecording(false);
        clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
    }
  }, [speechLanguage, setTranscript]);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsRecording(false);
      clearInterval(timerRef.current);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = speechLanguage;
          recognitionRef.current.start();
          setIsRecording(true);
          setRecordingSeconds(0);
          timerRef.current = setInterval(() => {
            setRecordingSeconds((s) => s + 1);
          }, 1000);
        } catch (e) {
          console.warn('Could not start real mic, simulating live speech dictation:', e);
          setIsRecording(true);
          setRecordingSeconds(0);
          timerRef.current = setInterval(() => {
            setRecordingSeconds((s) => s + 1);
          }, 1000);
        }
      } else {
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((s) => s + 1);
        }, 1000);
      }
    }
  };

  const applyPreset = (preset: ClinicalCasePreset) => {
    setActivePresetId(preset.id);
    setTranscript(preset.speechTamil);

    if (onSelectPresetPatient && preset.patientId !== patient.id) {
      onSelectPresetPatient(preset.patientId);
    }

    onStructureNote(preset.speechTamil);
  };

  const handleSelectSuggestion = (tokenIndex: number, newWord: string) => {
    const updatedTokens = [...tokens];
    updatedTokens[tokenIndex] = {
      ...updatedTokens[tokenIndex],
      word: newWord,
      isEdited: true,
      isLowConfidence: false,
    };
    setTokens(updatedTokens);

    const newTranscript = updatedTokens.map((t) => t.word).join(' ');
    setTranscript(newTranscript);
    setSelectedTokenIndex(null);
  };

  const handleCustomWordSave = (tokenIndex: number) => {
    if (!customWordInput.trim()) return;
    handleSelectSuggestion(tokenIndex, customWordInput.trim());
    setCustomWordInput('');
  };

  return (
    <div className="theme-card p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF]"></div>
            <h3 className="text-lg font-bold text-theme-ink tracking-tight">
              Voice Dictation & Clinical Speech Capture
            </h3>
            <span className="text-sm font-tamil text-theme-muted font-medium">
              (குரல் வழி பதிவு - தமிழ்)
            </span>
          </div>
          <p className="text-sm text-theme-muted mt-1">
            Doctor speaks a 30-sec visit summary in Tamil after examination. On-device engine structures notes.
          </p>
        </div>

        {/* Language selector & reset with sliding indicator pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center bg-theme-bg p-1 rounded-[14px] border border-theme text-xs font-semibold">
            <button
              onClick={() => setSpeechLanguage('ta-IN')}
              className={`relative z-10 px-3.5 py-1.5 rounded-[10px] transition-colors ${
                speechLanguage === 'ta-IN' ? 'text-[#0F766E] dark:text-[#2DD4BF] font-bold' : 'text-theme-muted hover:text-theme-ink'
              }`}
            >
              {speechLanguage === 'ta-IN' && (
                <motion.div
                  layoutId="activeLangPill"
                  transition={SPRING_PHYSICS}
                  className="absolute inset-0 bg-theme-surface rounded-[10px] shadow-2xs border border-theme"
                />
              )}
              <span className="relative z-10 font-tamil">தமிழ் (Tamil)</span>
            </button>
            <button
              onClick={() => setSpeechLanguage('en-IN')}
              className={`relative z-10 px-3.5 py-1.5 rounded-[10px] transition-colors ${
                speechLanguage === 'en-IN' ? 'text-[#0F766E] dark:text-[#2DD4BF] font-bold' : 'text-theme-muted hover:text-theme-ink'
              }`}
            >
              {speechLanguage === 'en-IN' && (
                <motion.div
                  layoutId="activeLangPill"
                  transition={SPRING_PHYSICS}
                  className="absolute inset-0 bg-theme-surface rounded-[10px] shadow-2xs border border-theme"
                />
              )}
              <span className="relative z-10">English</span>
            </button>
          </div>

          {transcript && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setTranscript('');
                setTokens([]);
              }}
              title="Clear transcript"
              className="p-2 text-theme-muted hover:text-theme-ink rounded-[12px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
            </motion.button>
          )}
        </div>
      </div>

      {/* 1-Tap Clinical Presets Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-theme-muted">
          <span className="font-bold text-theme-ink flex items-center gap-1.5 text-sm">
            <Zap className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
            1-Tap Clinical Scenarios (Simulate Doctor Dictation):
          </span>
          <span className="text-xs text-theme-muted">Click to instantly populate and parse</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CLINICAL_CASE_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <motion.button
                key={preset.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => applyPreset(preset)}
                className={`text-left p-3.5 rounded-[14px] border text-xs transition-all relative ${
                  isActive
                    ? 'border-[#0F766E] dark:border-[#2DD4BF] bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 text-theme-ink font-medium shadow-xs'
                    : 'border-theme bg-theme-bg hover:bg-black/5 dark:hover:bg-white/5 text-theme-content'
                }`}
              >
                <div className="font-bold flex items-center justify-between text-sm text-theme-ink">
                  <span className="truncate">{preset.title}</span>
                  {isActive && <Check className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] shrink-0 ml-1" strokeWidth={1.75} />}
                </div>
                <div className="text-xs font-tamil text-theme-muted mt-1.5 truncate">
                  {preset.titleTamil}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Push-to-Talk Mic Interaction Area with Breathing Pulse Loop */}
      <div className="flex flex-col sm:flex-row items-center gap-5 bg-theme-bg border border-theme rounded-[16px] p-6 shadow-2xs">
        {/* Breathing Pulse Ring Container around Mic */}
        <div className="relative shrink-0">
          {isRecording && (
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="absolute -inset-3 rounded-full bg-red-500 pointer-events-none"
            />
          )}

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`relative z-10 flex items-center justify-center gap-3 px-6 h-[52px] rounded-[14px] text-sm font-bold transition-all shadow-md ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                : 'bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412] shadow-[#0F766E]/20'
            }`}
          >
            {/* Morphs between Mic and Stop (Square) */}
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div
                  key="stop"
                  initial={{ rotate: -90, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 90, scale: 0.5 }}
                  transition={TRANSITION_FAST}
                  className="flex items-center gap-2.5"
                >
                  <Square className="w-4 h-4 fill-current" strokeWidth={1.75} />
                  <span>Stop Dictating ({recordingSeconds}s)</span>
                </motion.div>
              ) : (
                <motion.div
                  key="mic"
                  initial={{ rotate: 90, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: -90, scale: 0.5 }}
                  transition={TRANSITION_FAST}
                  className="flex items-center gap-2.5"
                >
                  <Mic className="w-5 h-5" strokeWidth={1.75} />
                  <span>Push-to-Talk (பேச தொடங்கவும்)</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="flex-1 text-sm text-theme-content">
          {isRecording ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>Recording Tamil Clinical Dictation... Speak summary</span>
              </div>
              {/* Waveform Bars */}
              <div className="flex items-center gap-1.5 h-7">
                {[12, 24, 18, 30, 16, 28, 22, 14, 26, 32, 18, 24, 15, 20, 28].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isRecording ? [6, h, 8, h * 0.85, 6] : 4 }}
                    transition={{ repeat: Infinity, duration: 0.75 + (i % 5) * 0.12, ease: 'easeInOut' }}
                    className="w-1.5 bg-[#0F766E] dark:bg-[#2DD4BF] rounded-full"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-theme-ink">
                Tap the mic to dictate, or select one of the clinical presets above.
              </p>
              <p className="text-theme-muted text-xs mt-1">
                Works 100% offline via Web Speech & On-device Tamil NLP. Medical terms like "Paracetamol 500mg 1-1-1" are recognized.
              </p>
            </div>
          )}
        </div>

        {transcript && (
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onStructureNote()}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2.5 px-6 h-[52px] rounded-[14px] bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412] text-sm font-bold shadow-md transition-all shrink-0 disabled:opacity-50 min-w-[180px]"
          >
            {isProcessing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                <span>Structuring Note...</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                <span>Generate EMR Note</span>
              </motion.div>
            )}
          </motion.button>
        )}
      </div>

      {/* Transcript with Confidence Chips */}
      {transcript && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-theme-muted">
            <span className="font-bold text-theme-ink flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
              Spoken Transcript (பேசிய விவரம்):
            </span>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block"></span>
                <span className="text-theme-ink font-semibold">Low-confidence token (Tap to review)</span>
              </span>
              <span className="text-theme-muted tabular-nums">Word count: {transcript.split(/\s+/).length}</span>
            </div>
          </div>

          <div className="p-5 rounded-[14px] border border-theme bg-theme-surface font-tamil text-base leading-relaxed text-theme-content relative shadow-2xs">
            {tokens && tokens.length > 0 ? (
              <div className="flex flex-wrap gap-x-2 gap-y-2.5">
                {tokens.map((token, idx) => {
                  const isSelected = selectedTokenIndex === idx;
                  return (
                    <span key={idx} className="relative inline-block">
                      <motion.button
                        layout
                        transition={SPRING_PHYSICS}
                        onClick={() => {
                          setSelectedTokenIndex(isSelected ? null : idx);
                          setCustomWordInput(token.word);
                        }}
                        className={`px-2 py-1 rounded-[8px] transition-colors text-left ${
                          token.isLowConfidence
                            ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/30 cursor-pointer font-bold'
                            : token.isEdited
                            ? 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-500/30 font-bold'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-theme-content'
                        }`}
                        title={token.isLowConfidence ? 'Low confidence recognition: Tap to verify/edit' : undefined}
                      >
                        {token.word}
                      </motion.button>

                      {/* Interactive Token Correction Popover */}
                      {isSelected && (
                        <motion.div 
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={TRANSITION_FAST}
                          className="absolute left-0 top-full mt-2 z-40 bg-theme-surface rounded-[16px] shadow-theme-soft border border-theme p-4 w-76 text-xs font-sans"
                        >
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-theme">
                            <span className="font-bold text-theme-ink">Verify Medical Word:</span>
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                              Confidence: {Math.round((token.confidence || 0.7) * 100)}%
                            </span>
                          </div>

                          {token.suggestions && token.suggestions.length > 0 && (
                            <div className="mb-3 space-y-1.5">
                              <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block">
                                Clinical Suggestions:
                              </span>
                              <div className="flex flex-col gap-1.5">
                                {token.suggestions.map((sug, sIdx) => (
                                  <button
                                    key={sIdx}
                                    onClick={() => handleSelectSuggestion(idx, sug)}
                                    className="text-left px-3 py-2 rounded-[10px] bg-theme-bg hover:bg-[#0F766E]/10 dark:hover:bg-[#2DD4BF]/15 text-theme-content text-xs transition-colors flex items-center justify-between border border-transparent font-medium"
                                  >
                                    <span className="truncate">{sug}</span>
                                    <Check className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-theme space-y-2">
                            <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block">
                              Manual Correction:
                            </span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customWordInput}
                                onChange={(e) => setCustomWordInput(e.target.value)}
                                className="flex-1 px-3 py-2 border border-theme rounded-[10px] bg-theme-bg text-theme-content text-xs outline-none focus:ring-1 focus:ring-[#0F766E]"
                                placeholder="Type correct word..."
                              />
                              <button
                                onClick={() => handleCustomWordSave(idx)}
                                className="px-3.5 py-2 bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412] rounded-[10px] text-xs font-bold transition-opacity"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-none outline-none resize-none font-tamil text-theme-content text-base leading-relaxed"
                placeholder="Doctor's spoken Tamil summary appears here..."
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
