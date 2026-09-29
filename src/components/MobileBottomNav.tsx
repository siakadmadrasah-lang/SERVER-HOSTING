import React from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  Users, 
  Database, 
  Menu,
  Globe,
  Terminal,
  FolderTree,
  Archive,
  ShieldCheck,
  FileText,
  Settings2
} from 'lucide-react';
import { ActiveTab, Language, CurrentSessionUser } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
  currentLang: Language;
  tunnelRoutesCount?: number;
  currentUser: CurrentSessionUser;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenMobileMenu,
  currentUser
}) => {
  // Define primary 4 tabs per role
  const getPrimaryTabs = (): { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; color: string }[] => {
    if (currentUser.role === 'client') {
      return [
        { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard, color: 'text-indigo-400' },
        { id: 'websites', label: 'Situs', icon: Globe, color: 'text-emerald-400' },
        { id: 'files', label: 'Berkas', icon: FolderTree, color: 'text-amber-400' },
        { id: 'databases', label: 'Database', icon: Database, color: 'text-cyan-400' }
      ];
    }
    if (currentUser.role === 'reseller') {
      return [
        { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard, color: 'text-indigo-400' },
        { id: 'whm_accounts', label: 'Klien', icon: Users, color: 'text-amber-400' },
        { id: 'websites', label: 'Situs', icon: Globe, color: 'text-emerald-400' },
        { id: 'databases', label: 'Database', icon: Database, color: 'text-cyan-400' }
      ];
    }
    // Root role default
    return [
      { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard, color: 'text-indigo-400' },
      { id: 'tunnel', label: 'Tunnel', icon: Radio, color: 'text-amber-400' },
      { id: 'whm_accounts', label: 'Cloud PRO', icon: Users, color: 'text-indigo-400' },
      { id: 'databases', label: 'Database', icon: Database, color: 'text-cyan-400' }
    ];
  };

  const primaryTabs = getPrimaryTabs();
  const primaryTabIds = primaryTabs.map(t => t.id);
  const isPrimaryActive = primaryTabIds.includes(activeTab);

  const getSecondaryIcon = () => {
    switch (activeTab) {
      case 'websites': return Globe;
      case 'vhosts': return Settings2;
      case 'files': return FolderTree;
      case 'terminal': return Terminal;
      case 'backups': return Archive;
      case 'security': return ShieldCheck;
      case 'logs': return FileText;
      default: return Menu;
    }
  };

  const SecondaryIcon = getSecondaryIcon();

  const getSecondaryLabel = () => {
    switch (activeTab) {
      case 'websites': return 'Web';
      case 'vhosts': return 'Nginx';
      case 'files': return 'Files';
      case 'terminal': return 'CLI';
      case 'backups': return 'Backup';
      case 'security': return 'Security';
      case 'logs': return 'Logs';
      default: return 'Menu';
    }
  };

  return (
    <nav 
      aria-label="Navigasi Bawah Mobile" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 px-1 py-1 safe-area-pb shadow-2xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 min-h-[46px] ${
                isActive ? `${tab.color} font-semibold` : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">{tab.label}</span>
            </button>
          );
        })}

        {/* Tab 5: Menu / Active Other Module */}
        <button
          onClick={onOpenMobileMenu}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 min-h-[46px] ${
            !isPrimaryActive
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <SecondaryIcon className="w-5 h-5" />
            {!isPrimaryActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">{getSecondaryLabel()}</span>
        </button>
      </div>
    </nav>
  );
};
