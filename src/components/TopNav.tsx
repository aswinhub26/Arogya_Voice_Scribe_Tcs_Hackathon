import React from 'react';
import { UserRole } from '../types/clinical.ts';
import { 
  Activity, 
  Stethoscope, 
  Users, 
  Pill, 
  BarChart3, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Search,
  UserPlus,
  QrCode
} from 'lucide-react';
import { motion } from 'motion/react';

interface TopNavProps {
  activeTab: 'consultation' | 'nurse' | 'pharmacy' | 'reports' | 'audit';
  setActiveTab: (tab: 'consultation' | 'nurse' | 'pharmacy' | 'reports' | 'audit') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  onSync: () => void;
  isSyncing: boolean;
  onOpenPatientSearch: () => void;
  onOpenScan: () => void;
  onNewPatient: () => void;
  unsyncedCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  isOffline,
  setIsOffline,
  onSync,
  isSyncing,
  onOpenPatientSearch,
  onOpenScan,
  onNewPatient,
  unsyncedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-teal-800 flex items-center justify-center text-white shadow-sm shadow-teal-900/10">
              <Activity className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Arogya Voice Scribe</span>
                <span className="text-xs font-tamil font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80">
                  ஆரோக்ய PHC
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('consultation')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'consultation'
                  ? 'bg-teal-50 text-teal-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-700" />
              <span>Doctor Consultation</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('nurse')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'nurse'
                  ? 'bg-teal-50 text-teal-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Nurse Triage</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('pharmacy')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'pharmacy'
                  ? 'bg-teal-50 text-teal-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Pill className="w-4 h-4 text-indigo-700" />
              <span>Pharmacy Queue</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-teal-50 text-teal-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-700" />
              <span>HMIS & Reports</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-teal-50 text-teal-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <span>Audit Trail</span>
            </motion.button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick QR Scan Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenScan}
              title="Scan ABHA / QR Health Card"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100/80 rounded-xl transition-colors border border-teal-200/80 shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">Scan QR</span>
            </motion.button>

            {/* Quick Patient Search Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenPatientSearch}
              title="Search Patient by Phone or ABHA"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline">Find Patient</span>
            </motion.button>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setUserRole('doctor')}
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                  userRole === 'doctor' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Dr.
              </button>
              <button
                onClick={() => setUserRole('nurse')}
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                  userRole === 'nurse' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Nurse
              </button>
              <button
                onClick={() => setUserRole('pharmacist')}
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                  userRole === 'pharmacist' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pharma
              </button>
            </div>

            {/* Offline / Online Sync Toggle */}
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOffline(!isOffline)}
                title={isOffline ? 'Offline Mode (Local Storage Active)' : 'Online Mode (Connected)'}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                  isOffline
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                }`}
              >
                {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-600" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="hidden xl:inline">{isOffline ? 'Offline' : 'Online'}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onSync}
                disabled={isSyncing || isOffline}
                title="Sync Local Records to State Health Server"
                className={`p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 ${
                  isSyncing ? 'animate-spin' : ''
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              </motion.button>
            </div>

            {/* New Patient Register */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onNewPatient}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Patient</span>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};
