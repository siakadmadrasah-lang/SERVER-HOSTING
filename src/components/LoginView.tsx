import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Palette
} from 'lucide-react';
import { AVAILABLE_THEMES, ThemeId } from '../utils/theme';
import { CurrentSessionUser, HostingAccount, UserRole } from '../types';
import { 
  DEFAULT_ROOT_USER, 
  DEFAULT_RESELLER_USER, 
  DEFAULT_CLIENT_USER 
} from '../utils/rbac';
import cloudProFavicon from '../assets/images/cloud_pro_favicon_1790605530299.jpg';

interface LoginViewProps {
  onLoginSuccess: (user: CurrentSessionUser) => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  hostingAccounts?: HostingAccount[];
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  currentTheme,
  onSelectTheme,
  hostingAccounts = []
}) => {
  const [portalMode, setPortalMode] = useState<UserRole>('root');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Harap masukkan Username / Domain dan Kata Sandi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // 1. Cek Kredensial Root Super Admin (Cloud PRO)
      if (cleanUser === 'denbaguse' && cleanPass === 'masbagus15') {
        setIsLoading(false);
        onLoginSuccess(DEFAULT_ROOT_USER);
        return;
      }

      // 2. Cek Akun Reseller atau Klien CloudPanel yang terdaftar di daftar Akun Hosting
      const matchedAccount = hostingAccounts.find(
        (acc) =>
          acc.username.toLowerCase() === cleanUser ||
          acc.domain.toLowerCase() === cleanUser ||
          acc.ownerEmail.toLowerCase() === cleanUser
      );

      if (matchedAccount) {
        const expectedPass = matchedAccount.password || 'klien123';
        if (cleanPass !== expectedPass) {
          setIsLoading(false);
          setErrorMsg('Kata sandi akun tidak sesuai. Periksa kembali kredensial akun Anda.');
          return;
        }

        if (matchedAccount.status === 'suspended') {
          setIsLoading(false);
          setErrorMsg(
            `Akun '${matchedAccount.username}' (${matchedAccount.domain}) sedang ditangguhkan (Suspended). Hubungi Administrator Cloud PRO.`
          );
          return;
        }

        const isReseller = matchedAccount.accountType === 'reseller';
        const sessionUser: CurrentSessionUser = isReseller
          ? {
              id: matchedAccount.id,
              username: matchedAccount.username,
              name: `${matchedAccount.domain} (Reseller Cloud PRO)`,
              email: matchedAccount.ownerEmail,
              role: 'reseller',
              domain: matchedAccount.domain,
              packageName: matchedAccount.packageName,
              accountId: matchedAccount.id,
              resellerMaxAccounts: matchedAccount.resellerMaxAccounts || 10,
              resellerDiskQuotaGb:
                matchedAccount.resellerDiskQuotaGb ||
                Math.max(10, Math.round(matchedAccount.diskQuotaMb / 1024)),
              resellerBandwidthQuotaGb:
                matchedAccount.resellerBandwidthQuotaGb || matchedAccount.bandwidthQuotaGb,
              resellerBranding: matchedAccount.resellerBranding
            }
          : {
              id: matchedAccount.id,
              username: matchedAccount.username,
              name: `${matchedAccount.domain} (CloudPanel)`,
              email: matchedAccount.ownerEmail,
              role: 'client',
              domain: matchedAccount.domain,
              packageName: matchedAccount.packageName,
              accountId: matchedAccount.id,
              resellerOwner: matchedAccount.resellerOwner,
              diskQuotaMb: matchedAccount.diskQuotaMb,
              diskUsageMb: matchedAccount.diskUsageMb,
              bandwidthQuotaGb: matchedAccount.bandwidthQuotaGb,
              bandwidthUsageGb: matchedAccount.bandwidthUsageGb
            };

        setIsLoading(false);
        onLoginSuccess(sessionUser);
        return;
      }

      // 3. Cek Akun Bawaan Reseller Cloud PRO
      if (
        (cleanUser === 'reseller_utama' || cleanUser === 'reseller' || cleanUser === 'reseller@denbagoes.my.id') &&
        (cleanPass === 'reseller123' || cleanPass === 'masbagus15')
      ) {
        setIsLoading(false);
        onLoginSuccess(DEFAULT_RESELLER_USER);
        return;
      }

      // 4. Cek Akun Bawaan Klien CloudPanel
      if (
        (cleanUser === 'klien_web' || cleanUser === 'klien' || cleanUser === 'klien.denbagoes.my.id' || cleanUser === 'klien@denbagoes.my.id') &&
        (cleanPass === 'klien123' || cleanPass === 'masbagus15')
      ) {
        setIsLoading(false);
        onLoginSuccess(DEFAULT_CLIENT_USER);
        return;
      }

      setIsLoading(false);
      setErrorMsg(
        'Otorisasi ditolak. Gunakan kredensial Root Cloud PRO, Mitra Reseller, atau Akun Klien CloudPanel yang terdaftar.'
      );
    }, 250);
  };

  const handleQuickFill = () => {
    setErrorMsg(null);
    if (portalMode === 'root') {
      setUsername('denbaguse');
      setPassword('masbagus15');
    } else if (portalMode === 'reseller') {
      const firstReseller = hostingAccounts.find((a) => a.accountType === 'reseller' && a.status === 'active');
      if (firstReseller) {
        setUsername(firstReseller.username);
        setPassword(firstReseller.password || 'klien123');
      } else {
        setUsername('reseller_utama');
        setPassword('reseller123');
      }
    } else {
      const firstClient = hostingAccounts.find((a) => a.accountType !== 'reseller' && a.status === 'active');
      if (firstClient) {
        setUsername(firstClient.username);
        setPassword(firstClient.password || 'klien123');
      } else {
        setUsername('klien_web');
        setPassword('klien123');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      {/* Subtle Ambient Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div 
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: 'var(--color-theme-primary)' }}
        />
      </div>

      {/* Minimal Top Bar: Theme Selector */}
      <header className="relative z-10 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={cloudProFavicon} 
            alt="Cloud PRO" 
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-lg object-cover border border-sky-500/40"
          />
          <span className="font-extrabold text-xs tracking-tight text-white">
            Cloud <span className="text-sky-400">PRO</span> &amp; CloudPanel
          </span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <Palette className="w-3.5 h-3.5 text-sky-400 mr-1 shrink-0" />
          {AVAILABLE_THEMES.slice(0, 4).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTheme(t.id)}
              title={t.name}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all shrink-0 border ${
                currentTheme === t.id
                  ? 'bg-slate-800 text-white border-sky-400 shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: t.primaryColor }}
              />
              <span className="hidden sm:inline">{t.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Slim Centered Executive Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[400px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-4">
          
          {/* Official Brand Logo & Compact Header */}
          <div className="text-center space-y-2">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl p-1 bg-slate-950 border-2 border-sky-500/40 shadow-lg flex items-center justify-center">
                <img 
                  src={cloudProFavicon} 
                  alt="Logo Cloud PRO" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center" title="Sistem Terlindungi">
                <ShieldCheck className="w-3 h-3 text-white" />
              </span>
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                {portalMode === 'client' ? (
                  <>Cloud<span className="text-sky-400">Panel</span> Client Login</>
                ) : portalMode === 'reseller' ? (
                  <>Cloud <span className="text-sky-400">PRO</span> Reseller</>
                ) : (
                  <>Cloud <span className="text-sky-400">PRO</span> Control</>
                )}
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {portalMode === 'client'
                  ? 'Portal Mandiri Pengelolaan Website, Domain & Database Klien'
                  : portalMode === 'reseller'
                  ? 'Portal Mitra Reseller Hosting & Manajemen Pelanggan'
                  : 'Portal Administrasi Server Cloud PRO & Infrastruktur VPS'}
              </p>
            </div>
          </div>

          {/* 3-Tier Portal Mode Selector (Root / Reseller / CloudPanel) */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl text-[11px]">
            <button
              type="button"
              onClick={() => {
                setPortalMode('root');
                setErrorMsg(null);
              }}
              className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                portalMode === 'root'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cloud PRO
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalMode('reseller');
                setErrorMsg(null);
              }}
              className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                portalMode === 'reseller'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reseller
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalMode('client');
                setErrorMsg(null);
              }}
              className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                portalMode === 'client'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CloudPanel
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Slim Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {portalMode === 'root'
                  ? 'ID Administrator Cloud PRO'
                  : portalMode === 'reseller'
                  ? 'Username / Domain Mitra Reseller'
                  : 'Username / Domain Akun CloudPanel'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    portalMode === 'root'
                      ? 'denbaguse'
                      : portalMode === 'reseller'
                      ? 'reseller_utama atau domain reseller'
                      : 'klien_web atau domain klien'
                  }
                  autoComplete="username"
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
                />
                <span>Ingat sesi perangkat</span>
              </label>

              <button
                type="button"
                onClick={handleQuickFill}
                className="text-sky-400 hover:text-sky-300 font-semibold transition-colors cursor-pointer"
              >
                {portalMode === 'root'
                  ? 'Otorisasi Admin'
                  : portalMode === 'reseller'
                  ? 'Akun Reseller'
                  : 'Akun CloudPanel'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Memverifikasi Akses...</span>
              ) : (
                <>
                  <span>
                    {portalMode === 'client'
                      ? 'Masuk ke CloudPanel'
                      : portalMode === 'reseller'
                      ? 'Masuk ke Cloud PRO Reseller'
                      : 'Masuk ke Cloud PRO'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Compact Footer Meta inside Card */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>server.denbagoes.my.id</span>
            <span className="text-emerald-400">Multi-Role Auth Active</span>
          </div>
        </div>
      </main>

      {/* Minimal Bottom Bar */}
      <footer className="relative z-10 px-6 py-2.5 text-center text-[11px] text-slate-400">
        <span>Cloud PRO &amp; CloudPanel · Sistem Login Terpadu Admin, Reseller &amp; Klien</span>
      </footer>
    </div>
  );
};
