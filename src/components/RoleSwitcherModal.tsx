import React from 'react';
import { 
  X, 
  Crown, 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Check, 
  RotateCcw, 
  Sparkles,
  ExternalLink,
  HardDrive,
  Activity,
  Layers
} from 'lucide-react';
import { CurrentSessionUser, UserRole } from '../types';
import { 
  ROLE_CONFIG, 
  DEFAULT_ROOT_USER, 
  DEFAULT_RESELLER_USER, 
  DEFAULT_CLIENT_USER 
} from '../utils/rbac';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentSessionUser;
  onSwitchUser: (user: CurrentSessionUser) => void;
  onClearCacheAndReload: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  onClearCacheAndReload
}) => {
  if (!isOpen) return null;

  const rolesList: {
    role: UserRole;
    user: CurrentSessionUser;
    icon: React.FC<{ className?: string }>;
    title: string;
    subtitle: string;
    highlight: string;
    features: string[];
    restrictions: string[];
    theme: {
      border: string;
      bg: string;
      activeBg: string;
      iconColor: string;
      badge: string;
    };
  }[] = [
    {
      role: 'root',
      user: DEFAULT_ROOT_USER,
      icon: Crown,
      title: 'Root Super Admin',
      subtitle: 'Pemilik Server (Akses Penuh Tanpa Batas)',
      highlight: '11 Modul Lengkap',
      features: [
        'Akses Web Terminal SSH Root & Konsol CLI',
        'Manajemen Cloudflare Tunnel Ingress & Routing',
        'Restart Service Server (Nginx, MariaDB, PHP-FPM)',
        'Buat & atur kuota akun Reseller & Klien baru',
        'Konfigurasi Firewall (UFW) & Blokir IP Fail2ban'
      ],
      restrictions: [],
      theme: {
        border: 'border-purple-500/40',
        bg: 'bg-purple-950/20 hover:bg-purple-950/40',
        activeBg: 'bg-purple-950/60 ring-2 ring-purple-500/60 border-purple-500',
        iconColor: 'text-purple-400',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      }
    },
    {
      role: 'reseller',
      user: DEFAULT_RESELLER_USER,
      icon: Building2,
      title: 'Reseller Hosting (Cloud PRO Lite)',
      subtitle: 'Mitra Reseller (Kelola Klien Sendiri)',
      highlight: '6 Modul Reseller',
      features: [
        'Membuat & memanajemen akun klien sendiri',
        'Alokasi kuota disk & bandwidth untuk klien',
        'Memasang website & database klien',
        'File Manager & Backup khusus data klien'
      ],
      restrictions: [
        'Dilarang: Terminal SSH Root OS',
        'Dilarang: Mengubah Cloudflare Tunnel Global',
        'Dilarang: Restart Service Server Utama',
        'Dilarang: Mengubah Firewall UFW Root'
      ],
      theme: {
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/20 hover:bg-amber-950/40',
        activeBg: 'bg-amber-950/60 ring-2 ring-amber-500/60 border-amber-500',
        iconColor: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      }
    },
    {
      role: 'client',
      user: DEFAULT_CLIENT_USER,
      icon: UserCheck,
      title: 'Klien Hosting (CloudPanel)',
      subtitle: 'Pelanggan Akhir (Self-Service Mandiri)',
      highlight: '5 Modul CloudPanel',
      features: [
        'Dasbor CloudPanel: Pantau kuota disk & bandwidth',
        'Manajemen Domain & 1-Click Installer WordPress',
        'File Manager folder website (/public_html)',
        'Kelola Database MySQL & phpMyAdmin',
        'Unduh arsip backup situs sendiri'
      ],
      restrictions: [
        'Terisolasi hanya untuk domain & file miliknya',
        'Dilarang: Akses akun atau data klien lain',
        'Dilarang: Akses Terminal Root / Daemon Server'
      ],
      theme: {
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-950/20 hover:bg-emerald-950/40',
        activeBg: 'bg-emerald-950/60 ring-2 ring-emerald-500/60 border-emerald-500',
        iconColor: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-5 text-slate-200 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Simulasi Peran & Akses Login (RBAC)
              </h2>
              <p className="text-xs text-slate-400">
                Pilih peran untuk menguji batasan menu dan hak akses seperti di Cloud PRO/CloudPanel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User Banner */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-indigo-300 border border-slate-600">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{currentUser.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${ROLE_CONFIG[currentUser.role].badgeColor}`}>
                  {ROLE_CONFIG[currentUser.role].badgeLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Username: <code className="text-slate-300 font-mono font-medium">{currentUser.username}</code> • Email: {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearCacheAndReload}
              title="Bersihkan cache browser dan muat ulang halaman"
              className="px-2.5 py-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600/60 text-[11px] font-medium flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Cache Web</span>
            </button>
          </div>
        </div>

        {/* Roles Selection Cards */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pilih Tingkat Akses Akun:
          </p>

          <div className="grid grid-cols-1 gap-3">
            {rolesList.map((item) => {
              const Icon = item.icon;
              const isActive = currentUser.role === item.role;

              return (
                <div
                  key={item.role}
                  onClick={() => onSwitchUser(item.user)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isActive ? item.theme.activeBg : `${item.theme.bg} ${item.theme.border}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-slate-900/80 border border-slate-800 ${item.theme.iconColor} shrink-0 mt-0.5`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{item.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${item.theme.badge}`}>
                            {item.highlight}
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Sedang Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwitchUser(item.user);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isActive ? 'Aktif' : 'Ganti Akun'}
                    </button>
                  </div>

                  {/* Permissions & Restrictions Pills */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <p className="font-medium text-emerald-400 mb-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Fitur yang Dapat Diakses:
                      </p>
                      <ul className="text-slate-300 space-y-0.5 pl-3 list-disc marker:text-emerald-500">
                        {item.features.slice(0, 3).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    {item.restrictions.length > 0 ? (
                      <div>
                        <p className="font-medium text-rose-400 mb-1 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Menu Dibatasi / Disembunyikan:
                        </p>
                        <ul className="text-slate-400 space-y-0.5 pl-3 list-disc marker:text-rose-500">
                          {item.restrictions.slice(0, 3).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="flex items-center text-purple-300/80 italic text-xs">
                        Semua 11 modul dan terminal root terbuka 100%.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Sistem isolasi multi-tenant Cloud PRO + CloudPanel standar industri</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
