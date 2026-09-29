import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Network, 
  Database, 
  Activity, 
  Globe, 
  Play, 
  RotateCw, 
  Square, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  ArrowDownToLine,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Palette,
  Check,
  Terminal
} from 'lucide-react';
import { 
  ServerMetricData, 
  ServerService, 
  Website, 
  CentralizedDatabase, 
  Language, 
  ActiveTab,
  CurrentSessionUser
} from '../types';
import { translations } from '../translations';
import { AVAILABLE_THEMES, ThemeId } from '../utils/theme';
import { 
  HOSTING_CATEGORIES, 
  HOSTING_MENU_CATALOG, 
  HostingMenuIcon, 
  HostingCategoryKey,
  HostingMenuItemMeta
} from './HostingMenuIcons';

interface DashboardViewProps {
  metrics: ServerMetricData;
  services: ServerService[];
  websites: Website[];
  databases: CentralizedDatabase[];
  currentLang: Language;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenInstaller: () => void;
  onToggleService: (serviceId: string) => void;
  onRestartService: (serviceId: string) => void;
  onOpenSyncModal?: () => void;
  currentUser: CurrentSessionUser;
  accountsCount?: number;
  tunnelRoutesCount?: number;
  onOpenRoleSwitcher?: () => void;
  currentTheme?: ThemeId;
  onSelectTheme?: (themeId: ThemeId) => void;
  onOpenThemeSwitcher?: () => void;
}

const COMPACT_THEME_LABELS: Record<ThemeId, string> = {
  'daylight-pro': 'Daylight Pro',
  'cpanel-light': 'cPanel Light',
  'whm-light': 'WHM Light',
  'emerald-light': 'Mint Light',
  'obsidian': 'Obsidian Dark',
  'cpanel-jupiter': 'cPanel Dark',
  'whm-classic': 'WHM Dark',
  'royal-amethyst': 'Amethyst Dark'
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  services,
  websites,
  databases,
  currentLang,
  onNavigateTab,
  onOpenInstaller,
  onToggleService,
  onRestartService,
  onOpenSyncModal,
  currentUser,
  accountsCount = 0,
  tunnelRoutesCount = 0,
  onOpenRoleSwitcher,
  currentTheme = 'daylight-pro',
  onSelectTheme,
  onOpenThemeSwitcher
}) => {
  const t = translations[currentLang];

  // Category & Search state for WHM / cPanel Categorized Menu Showcase
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<HostingCategoryKey | 'all'>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCollapseCategory = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Filter menu items allowed for current role & search query
  const visibleMenuItems = useMemo(() => {
    return HOSTING_MENU_CATALOG.filter(item => {
      if (!item.allowedRoles.includes(currentUser.role)) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (!menuSearch.trim()) return true;
      const q = menuSearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    });
  }, [currentUser.role, selectedCategory, menuSearch]);

  const handleMenuCardClick = (item: HostingMenuItemMeta) => {
    if (item.actionType === 'installer') {
      onOpenInstaller();
      return;
    }
    if (item.actionType === 'sync' && onOpenSyncModal) {
      onOpenSyncModal();
      return;
    }
    if (item.actionType === 'theme' && onOpenThemeSwitcher) {
      onOpenThemeSwitcher();
      return;
    }
    if (item.actionType === 'role' && onOpenRoleSwitcher) {
      onOpenRoleSwitcher();
      return;
    }
    if (item.tab) {
      onNavigateTab(item.tab);
    }
  };

  const getDynamicItemCount = (item: HostingMenuItemMeta): string | null => {
    if (item.id === 'websites') return `${websites.length} Domain`;
    if (item.id === 'databases') return `${databases.length} DB`;
    if (item.id === 'whm_accounts') return `${accountsCount} Akun`;
    if (item.id === 'tunnel') return `${tunnelRoutesCount} Rute`;
    return item.badge || null;
  };

  const getDisplayTitle = (item: HostingMenuItemMeta): string => {
    if (currentUser.role === 'client' && item.clientTitle) return item.clientTitle;
    if (currentUser.role === 'reseller' && item.resellerTitle) return item.resellerTitle;
    return item.title;
  };

  // Reusable WHM / cPanel Categorized Menu Showcase Block
  const renderCategorizedHostingMenus = () => (
    <div className="space-y-4">
      {/* Section Header + Search & Category Filter */}
      <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-sky-400 font-mono mb-0.5">
              <span className="whitespace-nowrap">WHM &amp; CPANEL MODULE DIRECTORY</span>
              <span>·</span>
              <span className="whitespace-nowrap">{visibleMenuItems.length} FITUR AKTIF</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Pusat Menu &amp; Modul Server Berdasarkan Kategori
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih fitur pengelolaan website, database, nameserver DNS, ionCube/cURL, email, hingga terminal root.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Cari menu (Nameserver, ionCube, Email, File, MySQL)..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Interactive Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Semua Kategori ({HOSTING_MENU_CATALOG.filter(i => i.allowedRoles.includes(currentUser.role)).length})
          </button>
          {HOSTING_CATEGORIES.map((cat) => {
            const count = HOSTING_MENU_CATALOG.filter(
              i => i.category === cat.id && i.allowedRoles.includes(currentUser.role)
            ).length;
            if (count === 0) return null;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.title.split(',')[0]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Sections (WHM / cPanel Jupiter Style) */}
      <div className="space-y-4">
        {HOSTING_CATEGORIES.map((cat) => {
          const items = visibleMenuItems.filter(i => i.category === cat.id);
          if (items.length === 0) return null;
          const isCollapsed = !!collapsedCategories[cat.id];

          return (
            <div 
              key={cat.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
            >
              {/* Category Title Bar */}
              <button
                type="button"
                onClick={() => toggleCollapseCategory(cat.id)}
                className="w-full px-4 sm:px-5 py-3.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-left hover:bg-slate-950 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-2 h-8 rounded-full shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${cat.accentFrom}, ${cat.accentTo})` }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {cat.title}
                      </h3>
                      <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400">
                        · {cat.whmLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    {items.length} menu
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Category Icon Cards Grid */}
              {!isCollapsed && (
                <div className="p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {items.map((item) => {
                    const metaBadge = getDynamicItemCount(item);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleMenuCardClick(item)}
                        className="group text-left p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/90 hover:border-sky-500/50 transition-all flex items-start gap-3.5 active:scale-[0.99] cursor-pointer"
                      >
                        {/* Illustrated WHM/cPanel Icon */}
                        <HostingMenuIcon 
                          id={item.id} 
                          size="lg" 
                          className="group-hover:scale-105 transition-transform"
                        />

                        {/* Menu Text & Metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-400 transition-colors leading-snug">
                              {getDisplayTitle(item)}
                            </h4>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>

                          {metaBadge && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-sky-400">
                              <span>{metaBadge}</span>
                              <span>·</span>
                              <span className="text-slate-400 group-hover:text-sky-400">Buka Modul &rarr;</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Clean, Symmetrical Mobile-First Theme Bar Component
  const renderThemeQuickSelector = () => (
    <div className="p-3.5 sm:p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <HostingMenuIcon id="theme_studio" size="sm" />
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate">
              Pilihan Tema Server Cloud PRO
            </h3>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              Pilih dari 4 tema terang modern &amp; 4 tema gelap klasik dengan 1 klik
            </p>
          </div>
        </div>

        {onOpenThemeSwitcher && (
          <button
            type="button"
            onClick={onOpenThemeSwitcher}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <Palette className="w-3.5 h-3.5 text-sky-400" />
            <span>Studio Tema</span>
          </button>
        )}
      </div>

      {/* Symmetrical Responsive Grid: 2x4 on mobile, 4x2 on tablet, 8x1 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-1.5">
        {AVAILABLE_THEMES.map((theme) => {
          const isActive = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme && onSelectTheme(theme.id)}
              className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-between gap-1.5 transition-all border cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-sky-400'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <span className="truncate">{COMPACT_THEME_LABELS[theme.id] || theme.name}</span>
              </div>
              {isActive && <Check className="w-3 h-3 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ==========================================
  // VIEW UNTUK TINGKAT KLIEN (cPanel End-User)
  // ==========================================
  if (currentUser.role === 'client') {
    const diskUsage = currentUser.diskUsageMb || 350;
    const diskQuota = currentUser.diskQuotaMb || 5000;
    const diskPercent = Math.min(100, Math.round((diskUsage / diskQuota) * 100));

    const bwUsage = currentUser.bandwidthUsageGb || 1.8;
    const bwQuota = currentUser.bandwidthQuotaGb || 50;
    const bwPercent = Math.min(100, Math.round((bwUsage / bwQuota) * 100));

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Client Welcome Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 font-mono">
                <span className="text-emerald-400 font-semibold whitespace-nowrap">Panel Hosting cPanel</span>
                <span>·</span>
                <span className="whitespace-nowrap">Paket: <strong className="text-slate-200">{currentUser.packageName || 'Standard-NVMe'}</strong></span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                Selamat Datang, {currentUser.name}
              </h1>
              <p className="text-xs text-slate-400">
                Domain Utama: <code className="text-sky-400 font-mono font-semibold">{currentUser.domain || 'webklien.denbagoes.my.id'}</code>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <a
                href={`https://${currentUser.domain || 'server.denbagoes.my.id'}`}
                target="_blank"
                rel="noreferrer"
                className="h-10 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Buka Website</span>
              </a>
              {onOpenRoleSwitcher && (
                <button
                  onClick={onOpenRoleSwitcher}
                  className="h-10 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">Uji Peran</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Theme Bar */}
        {renderThemeQuickSelector()}

        {/* Client Usage Quotas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Disk NVMe</span>
              <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums truncate">
              {diskUsage} <span className="text-[11px] font-normal text-slate-400">/ {diskQuota} MB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${diskPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Bandwidth</span>
              <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums truncate">
              {bwUsage} <span className="text-[11px] font-normal text-slate-400">/ {bwQuota} GB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-cyan-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${bwPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Situs Aktif</span>
              <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
              {websites.length} <span className="text-[11px] font-normal text-slate-400">Domain</span>
            </div>
            <div className="text-[11px] text-emerald-400 truncate">
              AutoSSL Aktif
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Basis Data</span>
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
              {databases.length} <span className="text-[11px] font-normal text-slate-400">DB</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              localhost:3306
            </div>
          </div>
        </div>

        {/* Full Categorized cPanel Menu Showcase */}
        {renderCategorizedHostingMenus()}
      </div>
    );
  }

  // ==========================================
  // VIEW UNTUK TINGKAT RESELLER (WHM Reseller)
  // ==========================================
  if (currentUser.role === 'reseller') {
    const maxAcc = currentUser.resellerMaxAccounts || 10;
    const diskQuotaGb = currentUser.resellerDiskQuotaGb || 50;
    const bwQuotaGb = currentUser.resellerBandwidthQuotaGb || 500;

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Reseller Welcome Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-slate-400">
                <span className="text-amber-400 font-semibold whitespace-nowrap">Reseller Hosting (WHM)</span>
                <span>·</span>
                <span className="whitespace-nowrap">Alokasi: <strong className="text-amber-400">{maxAcc} Akun Klien</strong></span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                Dasbor Reseller: {currentUser.name}
              </h1>
              <p className="text-xs text-slate-400">
                Kelola paket hosting dan akun cPanel klien Anda secara terisolasi.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('whm_accounts')}
                className="h-10 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">+ Akun Klien</span>
              </button>
              {onOpenRoleSwitcher && (
                <button
                  onClick={onOpenRoleSwitcher}
                  className="h-10 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">Uji Peran</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Theme Bar */}
        {renderThemeQuickSelector()}

        {/* Reseller Allocation Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Akun Klien</span>
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
              {accountsCount} <span className="text-[11px] font-normal text-slate-400">/ {maxAcc}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Alokasi Disk</span>
              <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
              {diskQuotaGb} <span className="text-[11px] font-normal text-slate-400">GB NVMe</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Bandwidth</span>
              <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
              {bwQuotaGb} <span className="text-[11px] font-normal text-slate-400">GB/bln</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Situs Aktif</span>
              <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
              {websites.length} <span className="text-[11px] font-normal text-slate-400">Domain</span>
            </div>
          </div>
        </div>

        {/* Categorized WHM Reseller Menu Showcase */}
        {renderCategorizedHostingMenus()}
      </div>
    );
  }

  // =========================================================================
  // VIEW UNTUK TINGKAT ROOT (Pemilik & Pengelola Server @denbaguse)
  // =========================================================================
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Server Identity & Symmetrical Mobile Action Card */}
      <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div className="space-y-1">
            {/* Compact Status Strip - Never breaks mid-phrase on Android */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-300 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Cluster SGP-Production</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-sky-400 font-semibold whitespace-nowrap">
                Pemilik (@{currentUser.username})
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-emerald-400 font-semibold whitespace-nowrap">
                WHM Root Active
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {t.appSubtitle}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Orkestrasi otomatis web server, isolasi vhost WHM/cPanel, ionCube + cURL, dan manajemen cluster database terpusat.
            </p>
          </div>

          {/* Symmetrical 2x2 Action Grid on Mobile Android -> Horizontal Row on Desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0 pt-0.5">
            <button
              type="button"
              onClick={onOpenInstaller}
              className="h-10 px-3.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98] cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ Instal Website</span>
            </button>

            {currentUser.role === 'root' && onOpenSyncModal && (
              <button
                type="button"
                onClick={onOpenSyncModal}
                className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98] cursor-pointer"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Update Server</span>
              </button>
            )}

            {onOpenRoleSwitcher && (
              <button
                type="button"
                onClick={onOpenRoleSwitcher}
                className="h-10 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98] cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">Uji Peran RBAC</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateTab('terminal')}
              className="h-10 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98] cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Terminal SSH</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Theme Bar right on Dashboard */}
      {renderThemeQuickSelector()}

      {/* Primary Metrics Grid - Uniform Card Heights on Mobile Android */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="truncate">{t.metrics.cpuUsage}</span>
            <Cpu className="w-4 h-4 text-sky-400 shrink-0" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
            {metrics.cpuUsagePercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            EPYC 7763 (16 vCPU)
          </div>
        </div>

        <div className="p-3 sm:p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="truncate">{t.metrics.ramUsage}</span>
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums truncate">
            {metrics.ramUsedGb.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ {metrics.ramTotalGb} GB</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            DDR4 ECC 3200MHz
          </div>
        </div>

        <div className="p-3 sm:p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="truncate">{t.metrics.nvmeStorage}</span>
            <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums truncate">
            {metrics.diskUsedGb.toFixed(0)} <span className="text-xs text-slate-400 font-normal">/ {metrics.diskTotalGb} GB</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            RAID-10 NVMe Array
          </div>
        </div>

        <div className="p-3 sm:p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="truncate">{t.metrics.networkBandwidth}</span>
            <Network className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums truncate">
            {metrics.networkInMbps.toFixed(0)} <span className="text-xs text-slate-400 font-normal">Mbps</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            10 Gbps Uplink
          </div>
        </div>

        <div className="p-3 sm:p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="truncate">{t.metrics.qps}</span>
            <Database className="w-4 h-4 text-purple-400 shrink-0" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums truncate">
            {metrics.queriesPerSecond.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {metrics.activeDbConnections} koneksi aktif
          </div>
        </div>

        <div className="p-3 sm:p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="truncate">{t.metrics.bufferPoolHit}</span>
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums truncate">
            {metrics.bufferPoolHitRatePercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            InnoDB Buffer Cache
          </div>
        </div>
      </div>

      {/* ALL HOSTING MENUS BY CATEGORY WITH ILLUSTRATED ICONS (WHM / cPanel Official Style) */}
      {renderCategorizedHostingMenus()}

      {/* Services Grid & Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Core Services Control */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Status Servis Sistem ({services.length})
            </h2>
            <span className="text-xs text-slate-400">
              Semua daemon beroperasi optimal
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
            {services.map((svc) => (
              <div key={svc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    svc.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-white truncate">{svc.displayName}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        · {svc.version} ·
                      </span>
                      {svc.status === 'active' ? (
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> running
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> stopped
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Port: <span className="font-mono text-slate-300">{svc.port}</span> <span aria-hidden="true">·</span> RAM: <span className="font-mono tabular-nums text-slate-300">{svc.memoryMb} MB</span> <span aria-hidden="true">·</span> Uptime: <span className="font-mono text-slate-300">{svc.uptime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onRestartService(svc.id)}
                    title="Muat ulang konfigurasi servis"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onToggleService(svc.id)}
                    title={svc.status === 'active' ? 'Hentikan servis' : 'Jalankan servis'}
                    className={`p-2 rounded-lg transition-colors ${
                      svc.status === 'active' 
                        ? 'text-rose-400 hover:bg-rose-500/10' 
                        : 'text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {svc.status === 'active' ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Websites & Database Overview */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Situs Web Terpasang ({websites.length})
              </h2>
              <button
                onClick={() => onNavigateTab('websites')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                Lihat Semua →
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
              {websites.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Belum ada website. Klik tombol <span className="text-sky-400 font-semibold">+ Instal Website</span> untuk memasang WordPress, Laravel, atau Node.js.
                </div>
              ) : (
                websites.slice(0, 3).map((site) => (
                  <div key={site.id} className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {site.domain}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {site.appType.toUpperCase()} <span aria-hidden="true">·</span> <span className="text-emerald-400">SSL Aktif</span> <span aria-hidden="true">·</span> <span className="tabular-nums font-mono">{site.trafficMonthlyGb} GB</span>
                      </div>
                    </div>

                    <a
                      href={`https://${site.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-md transition-colors shrink-0"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Database Terpusat ({databases.length})
              </h2>
              <button
                onClick={() => onNavigateTab('databases')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                SQL Query Studio →
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
              {databases.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Belum ada database. Buka tab <span className="text-sky-400 font-semibold">Database</span> untuk membuat database MySQL atau PostgreSQL.
                </div>
              ) : (
                databases.slice(0, 3).map((db) => (
                  <div key={db.id} className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-sky-300 font-mono truncate">
                        {db.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {db.engine.toUpperCase()} <span aria-hidden="true">·</span> <span className="tabular-nums font-mono">{db.sizeMb} MB</span> <span aria-hidden="true">·</span> <span className="tabular-nums font-mono">{db.tablesCount} tabel</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                      {db.activeConnections} conn
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
