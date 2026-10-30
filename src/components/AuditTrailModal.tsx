import React from 'react';
import { AuditLogEntry } from '../types/clinical.ts';
import { ShieldCheck, X, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { SPRING_PHYSICS } from '../utils/motion.ts';

interface AuditTrailModalProps {
  logs: AuditLogEntry[];
  onClose?: () => void;
  isFullView?: boolean;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  logs,
  onClose,
  isFullView = false,
}) => {
  const content = (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-theme">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0F766E] dark:text-[#2DD4BF]" strokeWidth={1.75} />
            <h3 className="text-xl font-bold text-theme-ink tracking-tight">
              Clinical & Medico-Legal Audit Ledger
            </h3>
          </div>
          <p className="text-xs text-theme-muted font-tamil mt-1">
            மருத்துவ சட்ட ஆவணப் பதிவு (மாற்ற முடியாத தணிக்கை வரலாறு)
          </p>
        </div>

        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1.5 text-theme-muted hover:text-theme-ink rounded-[10px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="p-4 bg-theme-bg rounded-[14px] border border-theme text-xs text-theme-muted leading-relaxed">
        <strong className="text-theme-ink">DPDP & NDHM Compliance:</strong> Every doctor dictation, token correction, safety alert override rationale, and prescription approval is timestamped and cryptographically indexed for patient safety and clinical governance.
      </div>

      <div className="divide-y divide-theme max-h-[60vh] overflow-y-auto pr-1">
        {logs.map((log) => {
          const isOverride = log.action === 'ALERT_OVERRIDDEN';
          const isApproval = log.action === 'PRESCRIPTION_APPROVED';
          const isSync = log.action === 'SYNC_EXECUTED';

          return (
            <div key={log.id} className="py-3.5 px-1 text-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-numbers text-xs text-theme-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-theme-muted" strokeWidth={1.75} />
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · {new Date(log.timestamp).toLocaleDateString()}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                    isOverride
                      ? 'status-chip-warning'
                      : isApproval
                      ? 'status-chip-success'
                      : isSync
                      ? 'bg-teal-500/15 text-teal-800 dark:text-teal-200 border border-teal-500/30'
                      : 'bg-theme-bg text-theme-muted border border-theme'
                  }`}
                >
                  {log.action}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-theme-ink text-sm">{log.userName}</span>
                <span className="text-[11px] uppercase font-mono-numbers px-2 py-0.5 rounded-[6px] bg-theme-bg border border-theme text-theme-muted font-semibold">
                  {log.role}
                </span>
              </div>

              <p className="text-theme-content text-sm leading-relaxed">{log.details}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isFullView) {
    return (
      <div className="max-w-5xl mx-auto theme-card p-6">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={SPRING_PHYSICS}
        className="bg-theme-surface rounded-[16px] max-w-xl w-full p-6 shadow-theme-soft border border-theme"
      >
        {content}
      </motion.div>
    </div>
  );
};
