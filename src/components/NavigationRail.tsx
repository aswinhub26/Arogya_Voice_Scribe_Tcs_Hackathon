import React from 'react';
import { UserRole } from '../types/clinical.ts';
import { 
  Stethoscope, 
  Users, 
  Pill, 
  BarChart3, 
  ShieldCheck, 
  QrCode, 
  Search, 
  UserPlus, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Moon, 
  Sun,
  Activity,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { SPRING_PHYSICS } from '../utils/motion.ts';

export type TabKey = 'consultation' | 'nurse' | 'pharmacy' | 'reports' | 'audit';

interface NavigationRailProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
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
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

interface NavItem {
  key: TabKey;
  label: string;
  tamilLabel: string;
  icon: React.FC<{ className?: string; strokeWidth?: number; size?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'consultation',
    label: 'Consultation',
    tamilLabel: 'மருத்துவர்',
    icon: Stethoscope,
  },
  {
    key: 'nurse',
    label: 'Nurse Triage',
    tamilLabel: 'செவிலியர்',
    icon: Users,
  },
  {
    key: 'pharmacy',
    label: 'Pharmacy',
    tamilLabel: 'மருந்தகம்',
    icon: Pill,
  },
  {
    key: 'reports',
    label: 'HMIS Reports',
    tamilLabel: 'அறிக்கை',
    icon: BarChart3,
  },
  {
    key: 'audit',
    label: 'Audit Trail',
    tamilLabel: 'தணிக்கை',
    icon: ShieldCheck,
  },
];

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  onSelectTab,
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
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <>
      {/* 1. TABLET & DESKTOP SLIM LEFT NAVIGATION RAIL */}
      <aside className="hidden md:flex flex-col justify-between w-[84px] lg:w-64 bg-theme-surface border-r border-theme py-5 px-3 z-40 fixed top-0 bottom-0 left-0 transition-colors shadow-xs">
        {/* Top: Brand & Emblem */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-11 h-11 rounded-[14px] bg-[#0F766E] dark:bg-[#2DD4BF] flex items-center justify-center text-white dark:text-[#071412] shadow-sm shrink-0">
              <Activity className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div className="hidden lg:block truncate">
              <div className="text-[17px] font-bold text-theme-ink tracking-tight flex items-center gap-1.5">
                <span>Arogya Scribe</span>
              </div>
              <div className="text-[12px] font-tamil text-[#0F766E] dark:text-[#2DD4BF] font-semibold">
                ஆரோக்ய PHC EMR
              </div>
            </div>
          </div>

          {/* Nav Links with gliding active pill & 1.0 to 1.08 icon scale */}
          <nav className="space-y-1.5 relative">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  className={`w-full relative flex items-center gap-3.5 px-3 py-3 rounded-[14px] min-h-[48px] text-[15px] font-semibold transition-colors group select-none text-left ${
                    isActive
                      ? 'text-[#0F766E] dark:text-[#2DD4BF] font-bold'
                      : 'text-theme-muted hover:text-theme-ink hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title={`${item.label} (${item.tamilLabel})`}
                >
                  {/* Gliding active background pill with spring physics */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      transition={SPRING_PHYSICS}
                      className="absolute inset-0 bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 rounded-[14px] border border-[#0F766E]/20 dark:border-[#2DD4BF]/30"
                    />
                  )}

                  {/* Icon with 1.0 to 1.08 scale animation */}
                  <motion.div
                    animate={{ scale: isActive ? 1.08 : 1.0 }}
                    transition={SPRING_PHYSICS}
                    className="relative z-10 shrink-0 mx-auto lg:mx-0 flex items-center justify-center"
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </motion.div>

                  <div className="hidden lg:block relative z-10 leading-tight truncate">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-[12px] font-tamil opacity-75 font-normal">
                      {item.tamilLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Dark Mode, Quick Scan, Sync */}
        <div className="space-y-3 pt-4 border-t border-theme">
          {/* Quick Scan & Patient Actions */}
          <div className="space-y-1.5">
            <button
              onClick={onOpenScan}
              className="w-full min-h-[48px] px-3 py-2.5 rounded-[14px] bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 text-[#0F766E] dark:text-[#2DD4BF] font-bold text-xs flex items-center justify-center lg:justify-start gap-2.5 hover:bg-[#0F766E]/20 transition-all"
              title="Scan ABHA / QR Card"
            >
              <QrCode className="w-5 h-5" strokeWidth={1.75} />
              <span className="hidden lg:inline text-sm font-semibold">Scan QR Health</span>
            </button>

            <button
              onClick={onNewPatient}
              className="w-full min-h-[48px] px-3 py-2.5 rounded-[14px] bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#071412] font-bold text-xs flex items-center justify-center lg:justify-start gap-2.5 shadow-sm hover:opacity-95 transition-all"
              title="Register New Patient"
            >
              <UserPlus className="w-5 h-5" strokeWidth={1.75} />
              <span className="hidden lg:inline text-sm font-bold">New Patient</span>
            </button>
          </div>

          {/* Theme & Health Center Metadata */}
          <div className="flex items-center justify-between px-1 text-xs text-theme-muted">
            <button
              onClick={onToggleDarkMode}
              className="min-h-[48px] w-full flex items-center justify-center lg:justify-start gap-2.5 px-2 py-2 rounded-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" strokeWidth={1.75} />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" strokeWidth={1.75} />
              )}
              <span className="hidden lg:inline font-medium text-xs">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. TOP UTILITY HEADER BAR (Shifted by rail width on tablet/desktop) */}
      <header className="sticky top-0 z-30 bg-theme-surface/95 backdrop-blur-md border-b border-theme md:ml-[84px] lg:ml-64 header-subtle-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 min-h-[64px]">
          {/* Left: Mobile wordmark + PHC Facility Info */}
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center">
                <Activity className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <span className="font-bold text-base text-theme-ink tracking-tight">Arogya</span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
                <span>Valparai Govt PHC · 24x7 Upgraded</span>
              </span>
              <span className="text-xs text-theme-muted font-tamil hidden lg:inline">
                வால்பாறை அரசு ஆரம்ப சுகாதார நிலையம்
              </span>
            </div>
          </div>

          {/* Right Controls: Role, Offline, Search, Sync */}
          <div className="flex items-center gap-2.5">
            {/* Search Patient */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onOpenPatientSearch}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[48px] rounded-[14px] bg-theme-bg hover:bg-black/5 dark:hover:bg-white/5 border border-theme text-sm font-semibold text-theme-content transition-all"
              title="Search Patient Records"
            >
              <Search className="w-4 h-4 text-theme-muted" strokeWidth={1.75} />
              <span className="hidden sm:inline">Find Patient</span>
            </motion.button>

            {/* Role Switcher */}
            <div className="flex items-center bg-theme-bg p-1 rounded-[14px] border border-theme min-h-[48px]">
              {(['doctor', 'nurse', 'pharmacist'] as UserRole[]).map((role) => {
                const isSelected = userRole === role;
                const roleLabels: Record<UserRole, string> = { 
                  doctor: 'Doctor', 
                  nurse: 'Nurse', 
                  pharmacist: 'Pharma',
                  admin: 'Admin',
                };

                return (
                  <button
                    key={role}
                    onClick={() => setUserRole(role)}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-theme-surface text-[#0F766E] dark:text-[#2DD4BF] shadow-xs'
                        : 'text-theme-muted hover:text-theme-content'
                    }`}
                  >
                    {roleLabels[role]}
                  </button>
                );
              })}
            </div>

            {/* Offline / Online Sync Indicator */}
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center gap-1.5 px-3 py-2 min-h-[48px] rounded-[14px] text-xs font-bold border transition-colors ${
                isOffline
                  ? 'status-chip-warning'
                  : 'status-chip-success'
              }`}
              title={isOffline ? 'Operating on local encrypted PHC database' : 'Connected to Central Health Server'}
            >
              {isOffline ? (
                <WifiOff className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <Wifi className="w-4 h-4" strokeWidth={1.75} />
              )}
              <span className="hidden md:inline">{isOffline ? 'Offline' : 'Online'}</span>
            </button>

            {/* Sync Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onSync}
              disabled={isSyncing || isOffline}
              className={`p-2.5 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-[14px] border border-theme bg-theme-bg hover:bg-black/5 dark:hover:bg-white/5 text-theme-content transition-colors ${
                isSyncing ? 'animate-spin' : ''
              }`}
              title="Sync un-synced clinical visits"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* 3. PHONE BOTTOM NAVIGATION BAR (4 items) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-theme-surface/95 backdrop-blur-md border-t border-theme px-2 py-1 flex items-center justify-around shadow-lg">
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] w-full py-1 text-center transition-colors ${
                isActive
                  ? 'text-[#0F766E] dark:text-[#2DD4BF] font-bold'
                  : 'text-theme-muted'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavPill"
                  transition={SPRING_PHYSICS}
                  className="absolute inset-x-2 inset-y-1 bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 rounded-xl"
                />
              )}
              <Icon className="w-5 h-5 relative z-10" strokeWidth={1.75} />
              <span className="text-[11px] relative z-10 truncate mt-0.5 font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
