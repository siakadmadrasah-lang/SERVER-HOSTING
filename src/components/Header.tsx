import React from 'react';
import { 
  Database, 
  ShieldCheck, 
  Globe, 
  RefreshCw, 
  Radio, 
  Menu,
  Palette,
  LogOut
} from 'lucide-react';
import { Language, CurrentSessionUser } from '../types';
import { translations } from '../translations';
import { ROLE_CONFIG } from '../utils/rbac';
import { ThemeId, AVAILABLE_THEMES } from '../utils/theme';

// Import the generated Cloud PRO logo and sysadmin avatar
import cloudProFavicon from '../assets/images/cloud_pro_favicon_1790605530299.jpg';
import sysadminAvatar from '../assets/images/avatar_sysadmin_1790511721428.jpg';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenInstaller: () => void;
  isRefreshing: boolean;
  onRefreshMetrics: () => void;
  onNavigateToTunnel?: () => void;
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
  currentUser: CurrentSessionUser;
  onOpenRoleSwitcher: () => void;
  currentTheme?: ThemeId;
  onOpenThemeSwitcher?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onOpenInstaller,
  isRefreshing,
  onRefreshMetrics,
  onNavigateToTunnel,
  onToggleMobileNav,
  isMobileNavOpen = false,
  currentUser,
  onOpenRoleSwitcher,
  currentTheme = 'daylight-pro',
  onOpenThemeSwitcher,
  onLogout
}) => {
  const t = translations[currentLang];
  const activeThemeConfig = AVAILABLE_THEMES.find(t => t.id === currentTheme) || AVAILABLE_THEMES[0];

  // Dynamic white-label branding for resellers and their clients
  const displayLogo = currentUser.resellerBranding?.logoUrl || cloudProFavicon;
  const displayBrandName = currentUser.resellerBranding?.companyName || (
    <>Cloud <span className="text-sky-400 font-black">PRO</span></>
  );

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-6 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Mobile Hamburger + Clean Brand Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileNav}
          aria-label={isMobileNavOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          className="md:hidden p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition-all flex items-center justify-center shrink-0 min-h-[36px] min-w-[36px]"
        >
          <Menu className="w-4 h-4 text-slate-200" />
        </button>

        <a 
          href="#dashboard" 
          className="flex items-center gap-2 text-white hover:opacity-95 transition-opacity shrink-0 group py-1"
        >
          <img 
            src={displayLogo} 
            alt="Logo" 
            referrerPolicy="no-referrer"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover bg-slate-950 p-0.5 shadow-sm border border-sky-500/40 group-hover:border-sky-400 transition-all shrink-0" 
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white whitespace-nowrap flex items-center gap-1">
                {displayBrandName}
              </span>
            </div>
            <span className="hidden sm:block text-[10px] text-slate-400 tracking-tight leading-tight mt-0.5 truncate">
              WHM &amp; cPanel Cloud Server
            </span>
          </div>
        </a>
      </div>

      {/* Zone 2: Desktop clean status indicators */}
      <nav className="hidden xl:flex items-center gap-5 text-xs text-slate-400 font-medium">
        <button
          onClick={onNavigateToTunnel}
          className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors"
          title="Cloudflare Zero Trust Tunnel Active (Bypass Hosting Provider)"
        >
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>CF Tunnel: <strong>Aktif (0 IP Publik)</strong></span>
        </button>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-300">DB Terpusat:</span>
          <span className="font-mono text-indigo-400 tabular-nums">4 Nodes</span>
        </div>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">Origin SSL:</span>
          <span className="text-emerald-400">Strict</span>
        </div>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Quick Metrics Refresh Button */}
        <button
          onClick={onRefreshMetrics}
          title="Sinkronisasi status server dan database"
          className="hidden sm:flex p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 hover:text-white transition-all items-center gap-1.5 text-xs active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : 'text-slate-300'}`} />
          <span className="hidden lg:inline">Sinkron</span>
        </button>

        {/* Theme Palette Switcher Button */}
        {onOpenThemeSwitcher && (
          <button
            onClick={onOpenThemeSwitcher}
            title="Pilih Warna & Tema Tampilan Cloud PRO"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 hover:text-white transition-all flex items-center gap-1.5 text-xs active:scale-95 group"
          >
            <Palette className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline text-xs font-medium">Tema</span>
            <span 
              className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm shrink-0"
              style={{ backgroundColor: activeThemeConfig.primaryColor }}
            />
          </button>
        )}

        {/* Language Switcher */}
        <div className="hidden sm:flex items-center p-0.5 bg-slate-800/90 rounded-lg border border-slate-700/60 text-xs font-medium">
          <button
            onClick={() => onLanguageChange('id')}
            className={`px-2 py-1 rounded transition-colors text-[11px] ${
              currentLang === 'id' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ID
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-1 rounded transition-colors text-[11px] ${
              currentLang === 'en' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>

        {/* Primary CTA (+ Website / Installer) */}
        <button
          onClick={onOpenInstaller}
          className="hidden md:flex px-2.5 sm:px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-sky-900/30 transition-all items-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t.newWebsiteBtn}</span>
        </button>

        {/* User profile avatar & Role Switcher Trigger */}
        <button
          onClick={onOpenRoleSwitcher}
          title={`Pemilik Server: @${currentUser.username} (${ROLE_CONFIG[currentUser.role].label})`}
          className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2.5 sm:py-1 sm:pr-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 hover:border-slate-600 transition-all shrink-0 active:scale-95 group"
        >
          <span className="hidden sm:inline-block text-[11px] font-mono text-sky-300 font-semibold">
            @{currentUser.username}
          </span>

          <div className="relative">
            <img
              src={sysadminAvatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full border border-slate-700 object-cover ring-2 ring-slate-800/80 group-hover:ring-sky-500/50 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900" />
          </div>
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Keluar dari Sesi Login Pemilik Server"
            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all active:scale-95 shrink-0"
            aria-label="Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
