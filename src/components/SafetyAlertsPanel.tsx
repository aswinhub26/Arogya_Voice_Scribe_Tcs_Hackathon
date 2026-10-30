import React, { useState } from 'react';
import { SafetyAlert } from '../types/clinical.ts';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  ShieldCheck, 
  ArrowRight,
  Unlock,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SHAKE_VARIANTS, SPRING_PHYSICS, TRANSITION_BASE } from '../utils/motion.ts';

interface SafetyAlertsPanelProps {
  alerts: SafetyAlert[];
  onOverrideAlert: (alertId: string, reason: string) => void;
  shouldShakeBlockingAlerts?: boolean;
}

export const SafetyAlertsPanel: React.FC<SafetyAlertsPanelProps> = ({
  alerts,
  onOverrideAlert,
  shouldShakeBlockingAlerts = false,
}) => {
  const [activeOverrideId, setActiveOverrideId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>('');

  if (alerts.length === 0) {
    return (
      <div className="status-chip-success p-5 flex items-center gap-3.5 text-sm font-medium">
        <ShieldCheck className="w-6 h-6 shrink-0" strokeWidth={1.75} />
        <div>
          <span className="font-bold">Clinical Safety Clearance:</span> All prescribed medications match patient allergy records, pediatric age thresholds, and PHC formulary guidelines. Zero contraindications detected.
        </div>
      </div>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.isOverridden).length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && !a.isOverridden).length;

  const handleConfirmOverride = (alertId: string) => {
    if (!overrideReason.trim()) return;
    onOverrideAlert(alertId, overrideReason.trim());
    setActiveOverrideId(null);
    setOverrideReason('');
  };

  return (
    <div className="theme-card p-6 space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-theme">
        <div className="flex items-center gap-3">
          {criticalCount > 0 ? (
            <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" strokeWidth={1.75} />
          ) : warningCount > 0 ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={1.75} />
          ) : (
            <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" strokeWidth={1.75} />
          )}
          <h3 className="text-lg font-bold text-theme-ink tracking-tight">
            Clinical Safety & Formulary Check
          </h3>
          <span className="text-sm font-tamil text-theme-muted">
            (மருத்துவ பாதுகாப்பு சரிபார்ப்பு)
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {criticalCount > 0 && (
            <span className="px-3 py-1 status-chip-danger font-bold flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{criticalCount} Critical Conflict{criticalCount > 1 ? 's' : ''}</span>
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-3 py-1 status-chip-warning font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{warningCount} Warning{warningCount > 1 ? 's' : ''}</span>
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            const isOverridden = alert.isOverridden;

            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={shouldShakeBlockingAlerts && isCritical && !isOverridden ? 'shake' : { opacity: 1, y: 0 }}
                variants={SHAKE_VARIANTS}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={SPRING_PHYSICS}
                className={`p-4 rounded-[14px] border text-sm transition-colors ${
                  isOverridden
                    ? 'bg-theme-bg border-theme opacity-75'
                    : isCritical
                    ? 'bg-red-500/10 border-red-500/30 text-theme-content'
                    : isWarning
                    ? 'bg-amber-500/10 border-amber-500/30 text-theme-content'
                    : 'bg-teal-500/10 border-teal-500/30 text-theme-content'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {isCritical ? (
                      <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                    ) : (
                      <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                    )}

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold tracking-tight text-theme-ink">{alert.title}</span>
                        <span className="font-tamil text-theme-muted text-xs">{alert.titleTamil}</span>
                        {isOverridden && (
                          <span className="px-2.5 py-0.5 bg-theme-bg text-theme-muted border border-theme rounded-full text-[11px] font-semibold">
                            Overridden by Doctor
                          </span>
                        )}
                      </div>

                      <p className="text-theme-content leading-relaxed">{alert.message}</p>
                      <p className="font-tamil text-theme-muted text-xs">{alert.messageTamil}</p>

                      {alert.suggestedAlternative && (
                        <div className="flex items-center gap-2 text-[#0F766E] dark:text-[#2DD4BF] font-semibold bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 px-3 py-1.5 rounded-[10px] border border-[#0F766E]/20 mt-2 w-fit">
                          <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                          <span>Recommended Action: {alert.suggestedAlternative}</span>
                        </div>
                      )}

                      {isOverridden && alert.overrideReason && (
                        <div className="mt-2 text-xs text-theme-content bg-theme-surface p-3 rounded-[10px] border border-theme">
                          <strong>Clinical Justification:</strong> {alert.overrideReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isOverridden && (isCritical || isWarning) && (
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setActiveOverrideId(alert.id);
                        setOverrideReason('');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 min-h-[48px] rounded-[12px] bg-theme-surface border border-theme hover:bg-theme-bg text-theme-ink text-xs font-bold shadow-2xs shrink-0 transition-colors"
                    >
                      <Unlock className="w-4 h-4 text-theme-muted" strokeWidth={1.75} />
                      <span>Override Alert</span>
                    </motion.button>
                  )}
                </div>

                {/* Override Rationale Input Box */}
                {activeOverrideId === alert.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={TRANSITION_BASE}
                    className="mt-3 pt-3 border-t border-theme bg-theme-surface p-4 rounded-[12px] shadow-2xs space-y-2"
                  >
                    <label className="block text-xs font-bold text-theme-ink">
                      Enter Medico-Legal Override Rationale (Logged into tamper-evident audit ledger):
                    </label>
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g., Clinical benefit outweighs risk; monitored closely with ANM follow-up."
                        className="flex-1 px-3.5 py-2.5 border border-theme bg-theme-bg text-theme-content rounded-[10px] text-xs outline-none focus:ring-1 focus:ring-[#0F766E]"
                      />
                      <button
                        onClick={() => handleConfirmOverride(alert.id)}
                        disabled={!overrideReason.trim()}
                        className="px-4 py-2.5 bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412] rounded-[10px] text-xs font-bold hover:opacity-95 disabled:opacity-50 transition-opacity"
                      >
                        Authorize
                      </button>
                      <button
                        onClick={() => setActiveOverrideId(null)}
                        className="px-3.5 py-2.5 bg-theme-bg text-theme-muted rounded-[10px] text-xs hover:text-theme-content transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
