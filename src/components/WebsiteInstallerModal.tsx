import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Terminal, 
  Globe, 
  Database, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Sparkles,
  Layers,
  Server
} from 'lucide-react';
import { AppType, Website, CentralizedDatabase, DatabaseUser, Language } from '../types';
import { translations } from '../translations';

interface WebsiteInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallComplete: (newSite: Website, newDb?: CentralizedDatabase, newUser?: DatabaseUser) => void;
  currentLang: Language;
}

interface AppOption {
  type: AppType;
  name: string;
  category: string;
  defaultRuntime: string;
  recommendedDb: 'mysql' | 'postgres' | 'redis';
  description: string;
}

const APP_OPTIONS: AppOption[] = [
  {
    type: 'wordpress',
    name: 'WordPress 6.6',
    category: 'CMS & Media',
    defaultRuntime: 'PHP 8.3-FPM',
    recommendedDb: 'mysql',
    description: 'Instalasi otomatis CMS dengan WP-CLI, optimasi Nginx FastCGI cache, dan konfigurasi database terpusat.'
  },
  {
    type: 'laravel',
    name: 'Laravel 11',
    category: 'PHP Framework',
    defaultRuntime: 'PHP 8.3-FPM',
    recommendedDb: 'mysql',
    description: 'Framework PHP modern dengan Composer, APP_KEY generation, migrasi database, dan queue worker.'
  },
  {
    type: 'nodejs',
    name: 'Next.js 14 / Node.js',
    category: 'JavaScript / Fullstack',
    defaultRuntime: 'Node.js 20.x (PM2)',
    recommendedDb: 'postgres',
    description: 'Aplikasi SSR Next.js dengan reverse proxy Nginx, daemon cluster PM2, dan auto-restart.'
  },
  {
    type: 'django',
    name: 'Python Django 5.1',
    category: 'Python Framework',
    defaultRuntime: 'Python 3.11 (Gunicorn)',
    recommendedDb: 'postgres',
    description: 'Framework enterprise Python dengan Gunicorn WSGI socket dan static asset collection.'
  },
  {
    type: 'ghost',
    name: 'Ghost CMS 5.x',
    category: 'Publishing Platform',
    defaultRuntime: 'Node.js 18 LTS',
    recommendedDb: 'mysql',
    description: 'Platform publikasi modern dengan arsitektur headless dan optimasi performa tinggi.'
  },
  {
    type: 'static',
    name: 'Static HTML / React SPA',
    category: 'Frontend / Static',
    defaultRuntime: 'Nginx Static / Brotli',
    recommendedDb: 'mysql',
    description: 'Website statis ultra-cepat dengan kompresi Brotli/Gzip, HTTP/2, dan zero backend overhead.'
  },
  {
    type: 'custom_git',
    name: 'Custom Git Repository',
    category: 'Custom Deployment',
    defaultRuntime: 'PHP 8.3-FPM',
    recommendedDb: 'mysql',
    description: 'Deploy repositori Git kustom dengan webhook auto-deploy saat git push ke branch production.'
  }
];

export const WebsiteInstallerModal: React.FC<WebsiteInstallerModalProps> = ({
  isOpen,
  onClose,
  onInstallComplete,
  currentLang
}) => {
  const t = translations[currentLang];

  const [step, setStep] = useState<number>(1);
  const [selectedApp, setSelectedApp] = useState<AppType>('wordpress');
  
  // Form state
  const [domain, setDomain] = useState<string>('');
  const [siteTitle, setSiteTitle] = useState<string>('');
  const [runtime, setRuntime] = useState<string>('PHP 8.3-FPM');
  const [enableSsl, setEnableSsl] = useState<boolean>(true);
  const [enableHttp2, setEnableHttp2] = useState<boolean>(true);
  const [gitRepoUrl, setGitRepoUrl] = useState<string>('');

  // Centralized DB state
  const [enableAutoDb, setEnableAutoDb] = useState<boolean>(true);
  const [dbEngine, setDbEngine] = useState<'mysql' | 'postgres'>('mysql');
  const [dbName, setDbName] = useState<string>('');
  const [dbUser, setDbUser] = useState<string>('');
  const [dbPassword, setDbPassword] = useState<string>('');
  const [allowedHost, setAllowedHost] = useState<string>('10.240.0.% (Cluster VPC)');

  // Execution state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  // Auto-generate DB names based on domain
  const handleDomainChange = (val: string) => {
    setDomain(val);
    const cleanName = val.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    setDbName(`db_${cleanName.slice(0, 16)}`);
    setDbUser(`u_${cleanName.slice(0, 12)}`);
    if (!dbPassword) {
      setDbPassword(`Sec_${Math.random().toString(36).substring(2, 10)}!`);
    }
  };

  const handleAppSelect = (app: AppOption) => {
    setSelectedApp(app.type);
    setRuntime(app.defaultRuntime);
    setDbEngine(app.recommendedDb === 'postgres' ? 'postgres' : 'mysql');
  };

  const runAutomatedInstall = () => {
    setIsExecuting(true);
    setStep(4);
    setExecutionLogs([]);
    setInstallProgress(10);

    const logs = [
      `[05:25:01] [Init] Memulai proses instalasi website otomatis untuk ${domain}...`,
      `[05:25:02] [VHost] Membuat direktori isolasi: /var/www/vhosts/${domain}/public_html`,
      `[05:25:03] [Permissions] Mengatur hak akses chown -R www-data:www-data dan chmod 755`,
      `[05:25:04] [Nginx] Mengenerate konfigurasi virtual host /etc/nginx/sites-available/${domain}.conf`,
      `[05:25:05] [Nginx] Memvalidasi sintaksis: 'nginx -t' -> Syntax OK, test successful`,
      enableSsl ? `[05:25:06] [SSL] Menghubungi ACME Let's Encrypt untuk sertifikat SSL ${domain}...` : null,
      enableSsl ? `[05:25:07] [SSL] Sertifikat SSL (RSA 4096-bit) berhasil diterbitkan dan diinstal.` : null,
      enableAutoDb ? `[05:25:08] [DB-Cluster] Menghubungi klaster database terpusat pada 10.240.0.12:3306...` : null,
      enableAutoDb ? `[05:25:09] [DB-Cluster] Menjalankan: CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;` : null,
      enableAutoDb ? `[05:25:10] [DB-Cluster] Membuat user '${dbUser}'@'10.240.0.%' dan memberikan ALL PRIVILEGES...` : null,
      enableAutoDb ? `[05:25:11] [DB-Cluster] Sinkronisasi hak akses FLUSH PRIVILEGES berhasil.` : null,
      `[05:25:12] [Runtime] Menginisialisasi paket core untuk framework ${selectedApp}...`,
      `[05:25:13] [Config] Menginjeksi kredensial database terpusat ke file konfigurasi aplikasi...`,
      `[05:25:14] [Systemctl] Memuat ulang service Nginx dan pool ${runtime}...`,
      `[05:25:15] [Success] Selesai! Website https://${domain} sekarang berjalan aktif di server.`
    ].filter(Boolean) as string[];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setExecutionLogs(prev => [...prev, logs[currentLogIndex]]);
        setInstallProgress(Math.round(((currentLogIndex + 1) / logs.length) * 100));
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsExecuting(false);
        setIsCompleted(true);
      }
    }, 450);
  };

  const handleFinish = () => {
    const newSiteId = `web-${Date.now().toString().slice(-4)}`;
    const newDbId = `db-${Date.now().toString().slice(-4)}`;

    const newSite: Website = {
      id: newSiteId,
      domain: domain.trim() || 'website-baru.id',
      title: siteTitle.trim() || domain || 'Website Baru',
      appType: selectedApp,
      status: 'running',
      runtime: runtime,
      documentRoot: `/var/www/vhosts/${domain || 'website-baru.id'}/public_html`,
      sslEnabled: enableSsl,
      sslExpiryDays: 90,
      sslIssuer: "Let's Encrypt Authority X3",
      linkedDbId: enableAutoDb ? newDbId : undefined,
      linkedDbName: enableAutoDb ? dbName : undefined,
      trafficMonthlyGb: 0.1,
      diskUsageMb: 85,
      createdAt: new Date().toISOString().split('T')[0]
    };

    let newDb: CentralizedDatabase | undefined;
    let newUser: DatabaseUser | undefined;

    if (enableAutoDb) {
      newDb = {
        id: newDbId,
        name: dbName,
        engine: dbEngine,
        host: dbEngine === 'postgres' ? '10.240.0.14 (pg-cluster-main)' : '10.240.0.12 (db-cluster-primary)',
        port: dbEngine === 'postgres' ? 5432 : 3306,
        collation: dbEngine === 'postgres' ? 'en_US.UTF-8' : 'utf8mb4_unicode_ci',
        charset: 'utf8mb4',
        sizeMb: 8.5,
        tablesCount: selectedApp === 'wordpress' ? 12 : selectedApp === 'laravel' ? 6 : 4,
        linkedWebsiteDomain: domain || 'website-baru.id',
        usersCount: 1,
        status: 'healthy',
        lastBackupDate: 'Baru saja diinisialisasi',
        maxConnections: 120,
        activeConnections: 2
      };

      newUser = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        username: dbUser,
        allowedHost: allowedHost,
        privileges: 'ALL PRIVILEGES',
        databases: [dbName],
        createdAt: new Date().toISOString().split('T')[0]
      };
    }

    onInstallComplete(newSite, newDb, newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{t.installer.modalTitle}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.installer.modalSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isExecuting}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/20 text-xs font-medium">
          <div className={`px-4 py-2.5 border-b-2 flex items-center gap-2 ${step === 1 ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400'}`}>
            <span>1. Aplikasi</span>
          </div>
          <div className={`px-4 py-2.5 border-b-2 flex items-center gap-2 ${step === 2 ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400'}`}>
            <span>2. Domain & VHost</span>
          </div>
          <div className={`px-4 py-2.5 border-b-2 flex items-center gap-2 ${step === 3 ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400'}`}>
            <span>3. Database Terpusat</span>
          </div>
          <div className={`px-4 py-2.5 border-b-2 flex items-center gap-2 ${step === 4 ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400'}`}>
            <span>4. Eksekusi Otomatis</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Application Framework Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Pilih Kerangka Kerja / CMS yang Ingin Diinstal Otomatis:
                </label>
                <p className="text-xs text-slate-400">
                  Panel akan mengkonfigurasi runtime, dependensi, dan virtual host secara terisolasi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {APP_OPTIONS.map((app) => {
                  const isSelected = selectedApp === app.type;
                  return (
                    <div
                      key={app.type}
                      onClick={() => handleAppSelect(app)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white">{app.name}</span>
                        <span className="text-[11px] text-slate-400">{app.category}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2.5">
                        {app.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-mono text-indigo-400">{app.defaultRuntime}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400 uppercase">{app.recommendedDb} Cluster</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Domain & VHost Settings */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.installer.domainLabel} <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => handleDomainChange(e.target.value)}
                    placeholder="misal: portal.perusahaan.co.id"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Virtual host akan diarahkan ke: <code className="text-slate-300 font-mono">/var/www/vhosts/{domain || 'domain'}/public_html</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.installer.siteTitleLabel}
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="misal: Toko Online Resmi & Portal Berita"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t.installer.runtimeLabel}
                  </label>
                  <select
                    value={runtime}
                    onChange={(e) => setRuntime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PHP 8.3-FPM">PHP 8.3-FPM (Rekomendasi Modern)</option>
                    <option value="PHP 8.2-FPM">PHP 8.2-FPM (Kompatibel)</option>
                    <option value="Node.js 20.x (PM2)">Node.js 20.x LTS (PM2 Cluster)</option>
                    <option value="Node.js 18 LTS">Node.js 18.x LTS</option>
                    <option value="Python 3.11 (Gunicorn)">Python 3.11 (Gunicorn WSGI)</option>
                    <option value="Nginx Static / Brotli">Nginx Static Brotli / Gzip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Web Server Reverse Proxy
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Nginx 1.26.2 (FastCGI & WebSocket)"
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono"
                  />
                </div>
              </div>

              {selectedApp === 'custom_git' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    URL Repositori Git (HTTPS / SSH)
                  </label>
                  <input
                    type="text"
                    value={gitRepoUrl}
                    onChange={(e) => setGitRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/project-repository.git"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              )}

              {/* Toggles */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-slate-200">{t.installer.autoSslLabel}</div>
                      <div className="text-[11px] text-slate-400">Verifikasi otomatis via HTTP-01 ACME challenge & auto-renew 90 hari</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSsl}
                    onChange={(e) => setEnableSsl(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-medium text-slate-200">Aktifkan HTTP/2, HTTP/3 (QUIC) & Brotli Compression</div>
                      <div className="text-[11px] text-slate-400">Meningkatkan skor PageSpeed dan kecepatan throughput aset statis</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableHttp2}
                    onChange={(e) => setEnableHttp2(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Centralized Database Configuration */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/70 border border-indigo-500/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{t.installer.autoDbLabel}</h4>
                    <p className="text-[11px] text-slate-400">
                      Otomatis membuat skema database, membuat user terisolasi, dan mengatur remote privilege di cluster terpusat.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableAutoDb}
                  onChange={(e) => setEnableAutoDb(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                />
              </div>

              {enableAutoDb && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {t.installer.dbEngineLabel}
                      </label>
                      <select
                        value={dbEngine}
                        onChange={(e) => setDbEngine(e.target.value as 'mysql' | 'postgres')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="mysql">MySQL 8.4 LTS Enterprise (Primary Cluster)</option>
                        <option value="postgres">PostgreSQL 16 Relational Engine</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Node Target Cluster
                      </label>
                      <input
                        type="text"
                        disabled
                        value={dbEngine === 'postgres' ? '10.240.0.14:5432 (pg-cluster-main)' : '10.240.0.12:3306 (db-cluster-primary)'}
                        className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {t.installer.dbNameLabel}
                      </label>
                      <input
                        type="text"
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                        placeholder="db_website"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {t.installer.dbUserLabel}
                      </label>
                      <input
                        type="text"
                        value={dbUser}
                        onChange={(e) => setDbUser(e.target.value)}
                        placeholder="u_webadmin"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Kata Sandi Basis Data
                      </label>
                      <input
                        type="text"
                        value={dbPassword}
                        onChange={(e) => setDbPassword(e.target.value)}
                        placeholder="Password kuat terenkripsi"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Whitelist Host Akses Remote
                      </label>
                      <input
                        type="text"
                        value={allowedHost}
                        onChange={(e) => setAllowedHost(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300">Catatan Otomasi:</span> Panel kontrol server akan secara otomatis menuliskan kredensial ini ke dalam file konfigurasi lingkungan aplikasi (<code className="text-indigo-300 font-mono">.env</code> atau <code className="text-indigo-300 font-mono">wp-config.php</code>) sehingga website langsung terhubung tanpa konfigurasi manual.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Live Execution Simulation */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Instalasi Selesai & Berhasil Diterapkan</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                        <span>Sedang Menjalankan Otomasi Server & Basis Data...</span>
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Proses otomasi virtual host, penerbitan SSL, dan provisioning cluster database.
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums font-semibold text-indigo-400">
                  {installProgress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${installProgress}%` }}
                />
              </div>

              {/* Terminal Execution Output */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-64 overflow-y-auto">
                <div className="flex items-center gap-2 text-slate-500 pb-2 border-b border-slate-800/60 mb-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Cloud PRO Automated Provisioning Engine - Output Log</span>
                </div>
                {executionLogs.map((line, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {line.includes('[Success]') ? (
                      <span className="text-emerald-400 font-semibold">{line}</span>
                    ) : line.includes('[DB-Cluster]') ? (
                      <span className="text-indigo-400">{line}</span>
                    ) : line.includes('[SSL]') ? (
                      <span className="text-cyan-400">{line}</span>
                    ) : (
                      <span className="text-slate-300">{line}</span>
                    )}
                  </div>
                ))}
              </div>

              {isCompleted && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-emerald-400">Website Siap Digunakan</div>
                    <div className="text-slate-300 mt-0.5">
                      URL: <span className="font-mono text-white underline">https://{domain || 'website-anda.id'}</span>
                      {enableAutoDb && (
                        <span className="ml-3 text-slate-400">· DB: <span className="font-mono text-indigo-300">{dbName}</span></span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleFinish}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-sm transition-colors"
                  >
                    {t.installer.finishBtn}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 && (
            <button
              onClick={() => {
                if (step === 2 && !domain.trim()) {
                  handleDomainChange('portal-baru.id');
                }
                setStep(step + 1);
              }}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={runAutomatedInstall}
              disabled={isExecuting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.installer.startInstallBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
