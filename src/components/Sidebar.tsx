import React, { useState } from 'react';
import { 
  X,
  ArrowDownToLine,
  LogOut,
  ChevronDown,
  ChevronRight,
  Palette
} from 'lucide-react';
import { ActiveTab, Language, CurrentSessionUser } from '../types';
import { translations } from '../translations';
import { ROLE_CONFIG } from '../utils/rbac';
import { 
  HOSTING_CATEGORIES, 
  HostingMenuIcon, 
  HostingCategoryKey 
} from './HostingMenuIcons';
import cloudProFavicon from '../assets/images/cloud_pro_favicon_1790605530299.jpg';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentLang: Language;
  websitesCount: number;
  databasesCount: number;
  accountsCount?: number;
  tunnelRoutesCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenSyncModal?: () => void;
  onLanguageChange?: (lang: Language) => void;
  currentUser: CurrentSessionUser;
  onOpenRoleSwitcher?: () => void;
  onOpenThemeSwitcher?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentLang,
  websitesCount,
  databasesCount,
  accountsCount = 0,
  tunnelRoutesCount = 0,
  isOpenMobile = false,
  onCloseMobile,
  onOpenSyncModal,
  onLanguageChange,
  currentUser,
  onOpenRoleSwitcher,
  onOpenThemeSwitcher,
  onLogout
}) => {
  const t = translations[currentLang];
  const roleCfg = ROLE_CONFIG[currentUser.role];

  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Base list of all sidebar navigation modules with category & illustrated icon
  const allNavItems: {
    id: ActiveTab;
    category: HostingCategoryKey;
    label: string;
    count?: number;
    badge?: string;
  }[] = [
    { 
      id: 'dashboard', 
      category: 'system_automation',
      label: currentUser.role === 'client' ? 'Dasbor cPanel' : (currentUser.role === 'reseller' ? 'Dasbor Reseller' : t.nav.dashboard)
    },
    { 
      id: 'websites', 
      category: 'domains_network',
      label: currentUser.role === 'client' ? 'Situs Web Saya' : (currentUser.role === 'reseller' ? 'Situs Klien' : t.nav.websites), 
      count: websitesCount 
    },
    { 
      id: 'tunnel', 
      category: 'domains_network',
      label: t.nav.tunnel, 
      count: tunnelRoutesCount, 
      badge: 'Zero-IP' 
    },
    { 
      id: 'dns_network', 
      category: 'domains_network',
      label: 'Nameserver & DNS Zone',
      badge: 'NS1/2'
    },
    { 
      id: 'files', 
      category: 'files_storage',
      label: currentUser.role === 'client' ? 'File Manager Saya' : t.nav.filemanager
    },
    { 
      id: 'email_ftp', 
      category: 'files_storage',
      label: 'Email, Webmail & FTP',
      badge: 'cPanel'
    },
    { 
      id: 'backups', 
      category: 'files_storage',
      label: currentUser.role === 'client' ? 'Cadangan Saya' : t.nav.backups
    },
    { 
      id: 'databases', 
      category: 'databases_software',
      label: currentUser.role === 'client' ? 'Basis Data Saya' : (currentUser.role === 'reseller' ? 'Database Klien' : t.nav.databases), 
      count: databasesCount 
    },
    { 
      id: 'php_settings', 
      category: 'databases_software',
      label: 'MultiPHP & ionCube', 
      badge: 'cURL+8.3' 
    },
    { 
      id: 'vhosts', 
      category: 'databases_software',
      label: t.nav.webserver
    },
    { 
      id: 'vps_cluster', 
      category: 'whm_reseller',
      label: 'Multi-VPS & KVM Node', 
      badge: 'KVM/SSH' 
    },
    { 
      id: 'billing_whmcs', 
      category: 'whm_reseller',
      label: 'Billing WHMCS & QRIS', 
      badge: 'Bisnis' 
    },
    { 
      id: 'whm_accounts', 
      category: 'whm_reseller',
      label: currentUser.role === 'reseller' ? 'Klien Reseller' : t.nav.whm_accounts, 
      count: accountsCount 
    },
    { 
      id: 'reseller_branding', 
      category: 'whm_reseller',
      label: 'Branding Reseller', 
      badge: 'Pro' 
    },
    { 
      id: 'security', 
      category: 'security_monitoring',
      label: t.nav.security
    },
    { 
      id: 'logs', 
      category: 'security_monitoring',
      label: t.nav.logs
    },
    { 
      id: 'terminal', 
      category: 'system_automation',
      label: t.nav.terminal
    },
    { 
      id: 'cron_jobs', 
      category: 'system_automation',
      label: 'Cron Jobs & Otomasi'
    }
  ];

  // Filter modules based on role permissions
  const navItems = allNavItems.filter(item => roleCfg.allowedTabs.includes(item.id));

  const handleItemClick = (id: ActiveTab) => {
    onTabChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Order categories so Dashboard / System is accessible or group cleanly
  const orderedCategories: { id: HostingCategoryKey; label: string }[] = [
    { id: 'system_automation', label: 'PUSAT KONTROL & TERMINAL' },
    { id: 'whm_reseller', label: 'BISNIS VPS, WHM & BILLING' },
    { id: 'domains_network', label: 'DOMAIN & CLOUD INGRESS' },
    { id: 'files_storage', label: 'BERKAS & PENYIMPANAN' },
    { id: 'databases_software', label: 'DATABASE & PERANGKAT LUNAK' },
    { id: 'security_monitoring', label: 'KEAMANAN & LOG SISTEM' }
  ];

  const navContent = (
    <div className="flex flex-col justify-between h-full select-none">
      <div className="p-3 space-y-3 overflow-y-auto">
        {/* Top Quick Dashboard Header */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] font-semibold text-slate-300">
          <span>
            {currentUser.role === 'root' ? 'Modul WHM & cPanel' : (currentUser.role === 'reseller' ? 'Menu Reseller WHM' : 'Menu cPanel Klien')}
          </span>
          <span className="text-[10px] font-mono text-sky-400 tabular-nums">{navItems.length} Menu</span>
        </div>

        {/* Categorized WHM / cPanel Navigation */}
        <div className="space-y-3">
          {orderedCategories.map((catGroup) => {
            const itemsInCat = navItems.filter(i => i.category === catGroup.id);
            if (itemsInCat.length === 0) return null;
            const isCollapsed = !!collapsedCats[catGroup.id];

            return (
              <div key={catGroup.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(catGroup.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 hover:text-slate-200 uppercase transition-colors"
                >
                  <span className="truncate">{catGroup.label}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </button>

                {!isCollapsed && (
                  <nav className="space-y-1">
                    {itemsInCat.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.98] group ${
                            isActive
                              ? 'bg-sky-600/20 text-white border border-sky-500/40 shadow-sm'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <HostingMenuIcon 
                              id={item.id} 
                              size="sm" 
                              className="group-hover:scale-105 transition-transform" 
                            />
                            <span className="truncate font-semibold">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {item.badge && (
                              <span className="text-[10px] font-mono text-amber-400">
                                {item.badge}
                              </span>
                            )}
                            {item.count !== undefined && item.count > 0 && (
                              <span className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                                isActive ? 'bg-sky-600/40 text-sky-200' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {item.count}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions: Theme & Git Sync */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          {onOpenThemeSwitcher && (
            <button
              onClick={() => {
                onOpenThemeSwitcher();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all text-xs font-semibold active:scale-[0.98] group"
            >
              <div className="flex items-center gap-2.5">
                <HostingMenuIcon id="theme_studio" size="sm" />
                <span>Pilihan Tema Server</span>
              </div>
              <Palette className="w-3.5 h-3.5 text-sky-400" />
            </button>
          )}

          {currentUser.role === 'root' && onOpenSyncModal && (
            <button
              onClick={() => {
                onOpenSyncModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 transition-all text-xs font-semibold active:scale-[0.98] shadow-sm group"
            >
              <div className="flex items-center gap-2.5">
                <HostingMenuIcon id="git_sync" size="sm" />
                <span>Update &amp; Git Sync</span>
              </div>
              <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      {/* User Session, Role Switcher & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-lg bg-sky-600/30 border border-sky-500/40 flex items-center justify-center font-bold text-xs text-sky-300 shrink-0">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">@{currentUser.username}</div>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold shrink-0 ${roleCfg.badgeColor}`}>
            {roleCfg.badgeLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {onOpenRoleSwitcher && (
            <button
              onClick={() => {
                onOpenRoleSwitcher();
                if (onCloseMobile) onCloseMobile();
              }}
              className="py-1.5 px-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-[11px] font-medium flex items-center justify-center gap-1 active:scale-95 transition-all"
              title="Simulasi Peran"
            >
              <span>Peran</span>
              <span className="text-sky-400 font-bold">⇄</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onLogout();
              }}
              className="py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
              title="Keluar dari Sesi Pemilik Server"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Docked Sidebar (Hidden on mobile < md) */}
      <aside className="hidden md:flex w-68 bg-slate-900 border-r border-slate-800/80 flex-col justify-between shrink-0">
        {navContent}
      </aside>

      {/* Mobile Slide-out Sheet Drawer */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={onCloseMobile}
        >
          <div 
            className="w-80 max-w-[85vw] h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <img 
                  src={currentUser.resellerBranding?.logoUrl || cloudProFavicon} 
                  alt="Logo" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-xl object-cover bg-slate-950 p-0.5 border border-sky-500/40 shadow-sm shrink-0" 
                />
                <div>
                  <h2 className="text-sm font-extrabold text-white leading-tight">
                    {currentUser.resellerBranding?.companyName || (
                      <>Cloud <span className="text-sky-400">PRO</span></>
                    )}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">WHM &amp; cPanel Server Control</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onLanguageChange && (
                  <div className="flex items-center p-0.5 bg-slate-800 rounded-lg border border-slate-700 text-xs">
                    <button
                      onClick={() => onLanguageChange('id')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        currentLang === 'id' ? 'bg-sky-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      ID
                    </button>
                    <button
                      onClick={() => onLanguageChange('en')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        currentLang === 'en' ? 'bg-sky-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                )}
                <button
                  onClick={onCloseMobile}
                  aria-label="Tutup menu navigasi"
                  className="p-2 rounded-lg bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nav list content */}
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
