import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Server, 
  Radio, 
  AlertCircle, 
  ArrowRight,
  Palette,
  Terminal,
  Database
} from 'lucide-react';
import { AVAILABLE_THEMES, ThemeId } from '../utils/theme';
import cloudProFavicon from '../assets/images/cloud_pro_favicon_1790605530299.jpg';

interface LoginViewProps {
  onLoginSuccess: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  currentTheme,
  onSelectTheme
}) => {
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
    const cleanPass = password;

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Harap masukkan Username dan Password pemilik server.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (cleanUser === 'denbaguse' && cleanPass === 'masbagus15') {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMsg(
          'Akses Ditolak! Portal ini khusus Pemilik & Pengelola Server Cloud PRO. Gunakan kredensial pemilik yang sah.'
        );
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      {/* Subtle Ambient Background Grid & Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: 'var(--color-theme-primary)' }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: 'var(--color-theme-accent)' }}
        />
      </div>

      {/* Top Bar: Brand + Theme Switcher */}
      <header className="relative z-10 px-4 sm:px-8 py-4 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img 
            src={cloudProFavicon} 
            alt="Cloud PRO" 
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-xl object-cover bg-slate-950 p-0.5 border border-sky-500/40 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Cloud <span className="text-sky-400">PRO</span>
              </span>
              <span className="text-xs font-mono text-slate-400">·</span>
              <span className="text-xs font-mono text-sky-400">WHM &amp; cPanel Root Gate</span>
            </div>
          </div>
        </div>

        {/* Quick Theme Selector on Login Page */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <Palette className="w-3.5 h-3.5 text-sky-400 mr-1 shrink-0" />
          <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Tema:</span>
          {AVAILABLE_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTheme(t.id)}
              title={t.name}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all shrink-0 border ${
                currentTheme === t.id
                  ? 'bg-slate-800 text-white border-sky-400 shadow-sm'
                  : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: t.primaryColor }}
              />
              <span className="hidden md:inline">{t.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Centered Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Left Column: Server Identity & Infrastructure Status (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-950/70 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Cluster Server Aktif · Zero Trust Protected</span>
              </div>

              <div className="flex items-center gap-3">
                <img 
                  src={cloudProFavicon} 
                  alt="Cloud PRO Logo" 
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover border border-sky-500/40 shadow-md"
                />
                <div>
                  <h1 className="text-xl font-extrabold text-white tracking-tight">
                    Cloud <span className="text-sky-400">PRO</span> v3.2
                  </h1>
                  <p className="text-xs text-slate-400">
                    WHM &amp; cPanel Enterprise Server Control
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Sistem manajemen pusat untuk orkestrasi virtual host Nginx, cluster database MySQL/PostgreSQL, MultiPHP 8.3 FPM, serta Cloudflare Tunnel otomatis.
              </p>

              {/* Server Node Specifications */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-sky-400" />
                    <span>Hostname Utama</span>
                  </span>
                  <span className="font-mono text-sky-300 font-semibold">server.denbagoes.my.id</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sistem Operasi</span>
                  </span>
                  <span className="font-mono text-slate-200">Ubuntu 24.04 LTS</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Database &amp; Runtime</span>
                  </span>
                  <span className="font-mono text-slate-200">MySQL 8.0 · PHP 8.3</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Otoritas Akses</span>
                  </span>
                  <span className="font-mono text-amber-300 font-semibold">Khusus Pemilik Server</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Proteksi Keamanan Root Gate:</div>
              <p className="leading-relaxed">
                Halaman login ini dikunci khusus untuk pemilik pengelola server utama (<code className="text-sky-300 font-mono">@denbaguse</code>).
              </p>
            </div>
          </div>

          {/* Right Column: Owner Authentication Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-6">
              <div>
                <div className="text-xs font-mono text-sky-400 mb-1">
                  AUTENTIKASI PEMILIK &amp; PENGELOLA SERVER
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Masuk ke Dasbor Cloud PRO
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan kredensial pemilik server untuk membuka seluruh modul WHM, cPanel, dan Terminal Root.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username Pemilik Server
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username pemilik (denbaguse)"
                      autoComplete="username"
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password Server
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password pemilik server"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
                    />
                    <span>Simpan sesi login pemilik di perangkat ini</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-950/50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Memverifikasi Otoritas Pemilik Server...</span>
                  ) : (
                    <>
                      <span>Login ke Server Cloud PRO</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Owner Credential Fill Card for convenience */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Akun Resmi Pemilik Pengelola Server:</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    User: <strong className="text-sky-300">denbaguse</strong> · Pass: <strong className="text-emerald-400">masbagus15</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('denbaguse');
                    setPassword('masbagus15');
                    setErrorMsg(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-[11px] font-semibold transition-colors shrink-0 active:scale-95"
                >
                  Isi Otomatis
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 border-t border-slate-800/60 bg-slate-900/60 text-center sm:flex sm:items-center sm:justify-between text-[11px] text-slate-400">
        <span>Cloud PRO Enterprise Control Panel · WHM &amp; cPanel Architecture</span>
        <span className="font-mono text-slate-400 mt-1 sm:mt-0 block">
          SSL Strict · Port 3000 / 80 / 443 · Owner: @denbaguse
        </span>
      </footer>
    </div>
  );
};
