/**
 * Cloud PRO - Theme & Appearance Manager
 * Default: Bright, Modern & Professional Light Mode (cPanel Jupiter / Enterprise Cloud style)
 * Plus 7 additional Light & Dark themes.
 */

export type ThemeId = 
  | 'daylight-pro'
  | 'cpanel-light'
  | 'whm-light'
  | 'emerald-light'
  | 'obsidian' 
  | 'cpanel-jupiter'
  | 'whm-classic'
  | 'royal-amethyst';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  canvasBg: string;
  surfaceBg: string;
  borderHex: string;
  bgAtmosphere: string;
  gradient: string;
  badgeStyle: string;
  borderAccent: string;
  buttonClass: string;
  ringClass: string;
  activeNavClass: string;
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'daylight-pro',
    name: 'Cloud PRO Daylight',
    tagline: 'Terang, Modern & Profesional (Default White & Sky)',
    mode: 'light',
    primaryColor: '#0284c7',
    accentColor: '#0369a1',
    canvasBg: '#f1f5f9',
    surfaceBg: '#ffffff',
    borderHex: '#e2e8f0',
    bgAtmosphere: 'bg-slate-100',
    gradient: 'from-sky-600 to-blue-600',
    badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200',
    borderAccent: 'border-sky-300',
    buttonClass: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20',
    ringClass: 'ring-sky-500/30',
    activeNavClass: 'bg-sky-50 text-sky-700 border-sky-300'
  },
  {
    id: 'cpanel-light',
    name: 'CloudPanel Sapphire Light',
    tagline: 'Gaya Resmi Hosting CloudPanel Putih & Royal Sapphire',
    mode: 'light',
    primaryColor: '#2563eb',
    accentColor: '#1d4ed8',
    canvasBg: '#eef2f6',
    surfaceBg: '#ffffff',
    borderHex: '#dbeafe',
    bgAtmosphere: 'bg-[#eef2f6]',
    gradient: 'from-blue-600 to-indigo-600',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    borderAccent: 'border-blue-300',
    buttonClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20',
    ringClass: 'ring-blue-500/30',
    activeNavClass: 'bg-blue-50 text-blue-700 border-blue-300'
  },
  {
    id: 'whm-light',
    name: 'Cloud PRO Enterprise Light',
    tagline: 'Putih Bersih & Aksen Oranye Resmi Cloud PRO',
    mode: 'light',
    primaryColor: '#ea580c',
    accentColor: '#c2410c',
    canvasBg: '#f8fafc',
    surfaceBg: '#ffffff',
    borderHex: '#fed7aa',
    bgAtmosphere: 'bg-slate-50',
    gradient: 'from-orange-500 to-amber-600',
    badgeStyle: 'bg-orange-50 text-orange-700 border-orange-200',
    borderAccent: 'border-orange-300',
    buttonClass: 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20',
    ringClass: 'ring-orange-500/30',
    activeNavClass: 'bg-orange-50 text-orange-700 border-orange-300'
  },
  {
    id: 'emerald-light',
    name: 'Nordic Mint Light',
    tagline: 'Terang Segar dengan Aksen Hijau Zamrud',
    mode: 'light',
    primaryColor: '#059669',
    accentColor: '#047857',
    canvasBg: '#f0fdf4',
    surfaceBg: '#ffffff',
    borderHex: '#d1fae5',
    bgAtmosphere: 'bg-emerald-50/50',
    gradient: 'from-emerald-600 to-teal-600',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderAccent: 'border-emerald-300',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20',
    ringClass: 'ring-emerald-500/30',
    activeNavClass: 'bg-emerald-50 text-emerald-700 border-emerald-300'
  },
  {
    id: 'obsidian',
    name: 'Cloud PRO Obsidian (Dark)',
    tagline: 'Mode Gelap Navy & Sky Blue Klasik',
    mode: 'dark',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    canvasBg: '#020617',
    surfaceBg: '#0f172a',
    borderHex: '#1e293b',
    bgAtmosphere: 'bg-slate-950',
    gradient: 'from-sky-500 to-blue-600',
    badgeStyle: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderAccent: 'border-sky-500/30',
    buttonClass: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/40',
    ringClass: 'ring-sky-500/40',
    activeNavClass: 'bg-sky-600/20 text-sky-300 border-sky-500/40'
  },
  {
    id: 'cpanel-jupiter',
    name: 'CloudPanel Midnight (Dark)',
    tagline: 'Mode Gelap Royal Sapphire & Slate',
    mode: 'dark',
    primaryColor: '#2563eb',
    accentColor: '#60a5fa',
    canvasBg: '#060d1f',
    surfaceBg: '#0d1830',
    borderHex: '#1e325c',
    bgAtmosphere: 'bg-[#060d1f]',
    gradient: 'from-blue-600 to-indigo-600',
    badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderAccent: 'border-blue-500/30',
    buttonClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40',
    ringClass: 'ring-blue-500/40',
    activeNavClass: 'bg-blue-600/20 text-blue-300 border-blue-500/40'
  },
  {
    id: 'whm-classic',
    name: 'Cloud PRO Carbon (Dark)',
    tagline: 'Mode Gelap Karbon & Oranye Cloud PRO',
    mode: 'dark',
    primaryColor: '#ea580c',
    accentColor: '#fb923c',
    canvasBg: '#0c0a09',
    surfaceBg: '#1c1917',
    borderHex: '#292524',
    bgAtmosphere: 'bg-[#0c0a09]',
    gradient: 'from-orange-500 to-amber-600',
    badgeStyle: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    borderAccent: 'border-orange-500/30',
    buttonClass: 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/40',
    ringClass: 'ring-orange-500/40',
    activeNavClass: 'bg-orange-600/20 text-orange-300 border-orange-500/40'
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst (Dark)',
    tagline: 'Mode Gelap Deep Nebula & Vivid Violet',
    mode: 'dark',
    primaryColor: '#7c3aed',
    accentColor: '#a78bfa',
    canvasBg: '#090516',
    surfaceBg: '#130b29',
    borderHex: '#27174d',
    bgAtmosphere: 'bg-[#090516]',
    gradient: 'from-purple-500 to-indigo-600',
    badgeStyle: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    borderAccent: 'border-violet-500/30',
    buttonClass: 'bg-violet-600 hover:bg-violet-500 text-white shadow-purple-950/40',
    ringClass: 'ring-violet-500/40',
    activeNavClass: 'bg-violet-600/20 text-violet-300 border-violet-500/40'
  }
];

const THEME_STORAGE_KEY = 'cloudpro_theme_v3_light';

export function getStoredTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && AVAILABLE_THEMES.some(t => t.id === saved)) {
      return saved as ThemeId;
    }
  } catch {
    // ignore
  }
  return 'daylight-pro';
}

export function saveStoredTheme(themeId: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    applyThemeToDocument(themeId);
  } catch {
    // ignore
  }
}

export function applyThemeToDocument(themeId: ThemeId): void {
  const theme = AVAILABLE_THEMES.find(t => t.id === themeId) || AVAILABLE_THEMES[0];
  const root = document.documentElement;
  
  root.setAttribute('data-theme', themeId);
  root.setAttribute('data-theme-mode', theme.mode);
  root.style.setProperty('--color-theme-primary', theme.primaryColor);
  root.style.setProperty('--color-theme-accent', theme.accentColor);
  root.style.setProperty('--color-theme-canvas', theme.canvasBg);
  root.style.setProperty('--color-theme-surface', theme.surfaceBg);
  root.style.setProperty('--color-theme-border', theme.borderHex);
}
