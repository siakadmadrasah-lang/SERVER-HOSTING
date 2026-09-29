import React, { useState } from 'react';
import { 
  Code2, 
  RotateCw, 
  Save, 
  Check, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Cpu, 
  FileText, 
  Eye, 
  X, 
  ShieldCheck,
  Terminal,
  Copy,
  Sparkles,
  Lock,
  Globe,
  PackageCheck,
  Search
} from 'lucide-react';
import { Website, Language, CurrentSessionUser } from '../types';

interface PhpSettingsViewProps {
  websites: Website[];
  currentLang: Language;
  currentUser: CurrentSessionUser;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

interface PhpVersionInfo {
  version: string;
  status: 'active' | 'installed' | 'legacy';
  socketPath: string;
  ioncubeVersion: string;
  isDefault?: boolean;
}

type ExtensionCategory = 'loader' | 'network' | 'core' | 'database' | 'media' | 'security' | 'cache';

interface ExtensionItem {
  id: string;
  name: string;
  title: string;
  desc: string;
  category: ExtensionCategory;
  requiredFor: string;
  enabled: boolean;
  isCritical?: boolean;
}

export const PhpSettingsView: React.FC<PhpSettingsViewProps> = ({
  websites,
  currentUser,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'loaders_deps' | 'extensions' | 'multiphp' | 'ini_editor' | 'fpm_pool' | 'raw_ini'>('loaders_deps');
  const [selectedPhpVer, setSelectedPhpVer] = useState<string>('8.3');
  const [isRestartingFpm, setIsRestartingFpm] = useState<boolean>(false);
  const [isPhpInfoModalOpen, setIsPhpInfoModalOpen] = useState<boolean>(false);
  const [extSearch, setExtSearch] = useState<string>('');
  const [selectedExtCat, setSelectedExtCat] = useState<ExtensionCategory | 'all'>('all');
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string>('rdm_siakad');

  // Available PHP Versions in System with ionCube Loader status
  const [phpVersions] = useState<PhpVersionInfo[]>([
    { version: '8.4', status: 'installed', socketPath: '/run/php/php8.4-fpm.sock', ioncubeVersion: 'ionCube v13.3' },
    { version: '8.3', status: 'active', socketPath: '/run/php/php8.3-fpm.sock', ioncubeVersion: 'ionCube v13.0.4', isDefault: true },
    { version: '8.2', status: 'installed', socketPath: '/run/php/php8.2-fpm.sock', ioncubeVersion: 'ionCube v13.0.4' },
    { version: '8.1', status: 'installed', socketPath: '/run/php/php8.1-fpm.sock', ioncubeVersion: 'ionCube v13.0.4' },
    { version: '7.4', status: 'legacy', socketPath: '/run/php/php7.4-fpm.sock', ioncubeVersion: 'ionCube v12.0.5' }
  ]);

  // PHP INI Directives state
  const [uploadMaxFilesize, setUploadMaxFilesize] = useState<string>('256M');
  const [postMaxSize, setPostMaxSize] = useState<string>('256M');
  const [memoryLimit, setMemoryLimit] = useState<string>('512M');
  const [maxExecutionTime, setMaxExecutionTime] = useState<number>(300);
  const [maxInputTime, setMaxInputTime] = useState<number>(300);
  const [maxInputVars, setMaxInputVars] = useState<number>(5000);
  const [displayErrors, setDisplayErrors] = useState<boolean>(false);
  const [allowUrlFopen, setAllowUrlFopen] = useState<boolean>(true);
  const [timezone, setTimezone] = useState<string>('Asia/Jakarta');
  const [opcacheEnabled, setOpcacheEnabled] = useState<boolean>(true);
  const [ioncubeEnabled, setIoncubeEnabled] = useState<boolean>(true);
  const [sourceGuardianEnabled, setSourceGuardianEnabled] = useState<boolean>(true);

  // Raw INI File Content including ionCube Loader & cURL
  const [rawIniContent, setRawIniContent] = useState<string>(
`; /etc/php/8.3/fpm/php.ini - Cloud PRO Managed Configuration
; =====================================================================
; ZEND EXTENSIONS & ENCRYPTED SCRIPT LOADERS (MUST BE LOADED FIRST)
; =====================================================================
zend_extension = /usr/lib/php/20230831/ioncube_loader_lin_8.3.so
zend_extension = opcache.so
extension = ixed.8.3.lin

[PHP]
engine = On
short_open_tag = On
precision = 14
output_buffering = 4096
zlib.output_compression = Off
implicit_flush = Off
serialize_precision = -1

; Resource Limits (Optimized for RDM Kemenag, SIAKAD, CBT & Laravel)
max_execution_time = 300
max_input_time = 300
max_input_vars = 5000
memory_limit = 512M

error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
display_errors = Off
display_startup_errors = Off
log_errors = On
log_errors_max_len = 1024

post_max_size = 256M
upload_max_filesize = 256M
max_file_uploads = 50

allow_url_fopen = On
allow_url_include = Off
default_mimetype = "text/html"
default_charset = "UTF-8"

[curl]
; cURL SSL CA Bundle for HTTPS API requests (Kemenag / Payment / WA Gateway)
curl.cainfo = "/etc/ssl/certs/ca-certificates.crt"

[openssl]
openssl.cafile = "/etc/ssl/certs/ca-certificates.crt"

[Date]
date.timezone = Asia/Jakarta

[opcache]
opcache.enable = 1
opcache.enable_cli = 1
opcache.memory_consumption = 256
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 20000
opcache.revalidate_freq = 2
`
  );

  // Comprehensive 26 Essential PHP Loaders & Extensions
  const [extensions, setExtensions] = useState<ExtensionItem[]>([
    {
      id: 'ext-ioncube',
      name: 'ioncube_loader',
      title: 'ionCube PHP Loader v13.0.4',
      desc: 'Zend Extension utama untuk menjalankan skrip PHP terenkripsi ionCube (Wajib untuk RDM Kemenag, SIAKAD, CBT, & Cloud PRO Billing).',
      category: 'loader',
      requiredFor: 'RDM Kemenag, SIAKAD, Cloud PRO Billing',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-sourceguardian',
      name: 'sourceguardian',
      title: 'SourceGuardian Loader (ixed)',
      desc: 'Loader dekripsi bytecode untuk aplikasi web komersial dan plugin berlisensi.',
      category: 'loader',
      requiredFor: 'Aplikasi Komersial & Plugin Pro',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-curl',
      name: 'curl',
      title: 'cURL (Client URL Library)',
      desc: 'Pustaka komunikasi HTTP/HTTPS/REST API eksternal (Sinkronisasi Server Pusat Kemenag/EMIS, WhatsApp Gateway, Payment Gateway).',
      category: 'network',
      requiredFor: 'Sinkronisasi API, WA Gateway, cURL',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-zip',
      name: 'zip',
      title: 'ZipArchive (libzip)',
      desc: 'Kompresi dan ekstraksi arsip .zip otomatis (Update aplikasi RDM/SIAKAD, Ekspor/Impor Excel .xlsx, & Backup).',
      category: 'core',
      requiredFor: 'Update Otomatis, Excel, WordPress',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-gd',
      name: 'gd',
      title: 'GD Graphics Library (FreeType)',
      desc: 'Pemrosesan gambar, generasi QR Code, Barcode kartu ujian/pelajar, captcha, dan kompresi foto profil.',
      category: 'media',
      requiredFor: 'Cetak Rapor, QR Code, Kartu Ujian',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-imagick',
      name: 'imagick',
      title: 'ImageMagick (imagick)',
      desc: 'Konversi dokumen PDF ke gambar, manipulasi foto resolusi tinggi, dan optimasi WebP.',
      category: 'media',
      requiredFor: 'Konversi PDF, Rapor Digital, CMS',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-mbstring',
      name: 'mbstring',
      title: 'Multibyte String (UTF-8)',
      desc: 'Penanganan string karakter multi-byte UTF-8 (Wajib untuk Laravel, CodeIgniter, DomPDF, mPDF, & PhpSpreadsheet).',
      category: 'core',
      requiredFor: 'Laravel, CI4, Cetak PDF & Excel',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-xml',
      name: 'xml',
      title: 'XML, DOM, SimpleXML & XMLWriter',
      desc: 'Parser dokumen XML & HTML DOM untuk pembangkitan laporan Word/Excel/PDF dan feed data.',
      category: 'core',
      requiredFor: 'PhpSpreadsheet, DomPDF, Moodle',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-intl',
      name: 'intl',
      title: 'Intl (Internationalization ICU)',
      desc: 'Format tanggal bahasa Indonesia, format mata uang Rupiah, dan lokalisasi regional.',
      category: 'core',
      requiredFor: 'Format Tanggal/Rupiah, Moodle, CI4',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-bcmath',
      name: 'bcmath',
      title: 'BCMath Arbitrary Precision',
      desc: 'Kalkulasi angka desimal presisi tinggi untuk rumus nilai rapor, IPK, dan transaksi keuangan.',
      category: 'core',
      requiredFor: 'Kalkulasi Nilai Rapor, E-Commerce',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-soap',
      name: 'soap',
      title: 'SOAP Web Services Client/Server',
      desc: 'Protokol pertukaran data XML terstruktur untuk integrasi Feeder, Moodle LMS, dan layanan perbankan.',
      category: 'network',
      requiredFor: 'Moodle LMS, Web Service Feeder',
      enabled: true
    },
    {
      id: 'ext-openssl',
      name: 'openssl',
      title: 'OpenSSL Cryptography & TLS 1.3',
      desc: 'Enkripsi trafik HTTPS, pembuatan token JWT, tanda tangan digital SSL, dan koneksi SMTP aman.',
      category: 'security',
      requiredFor: 'HTTPS, JWT Auth, Lisensi Server',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-sodium',
      name: 'sodium',
      title: 'Libsodium Modern Crypto',
      desc: 'Algoritma kriptografi modern (Argon2id password hashing & enkripsi kunci publik).',
      category: 'security',
      requiredFor: 'WordPress 6+, Laravel, Keamanan',
      enabled: true
    },
    {
      id: 'ext-fileinfo',
      name: 'fileinfo',
      title: 'Fileinfo MIME Type Detector',
      desc: 'Validasi tipe berkas asli saat pengguna mengunggah tugas PDF, dokumen, atau foto.',
      category: 'security',
      requiredFor: 'Validasi Upload File, Laravel',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-pdo-mysql',
      name: 'pdo_mysql',
      title: 'PDO MySQL / MariaDB Driver',
      desc: 'Driver utama koneksi database relasional MySQL & MariaDB berbasis PDO.',
      category: 'database',
      requiredFor: 'Semua Website PHP & SIAKAD',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-mysqli',
      name: 'mysqli',
      title: 'MySQLi + mysqlnd Native Driver',
      desc: 'Konektor MySQL performa tinggi untuk aplikasi PHP native, WordPress, dan RDM.',
      category: 'database',
      requiredFor: 'WordPress, RDM, Aplikasi Native',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-pdo-pgsql',
      name: 'pdo_pgsql',
      title: 'PDO PostgreSQL Driver',
      desc: 'Driver koneksi database enterprise PostgreSQL.',
      category: 'database',
      requiredFor: 'Aplikasi Enterprise & PostgreSQL',
      enabled: true
    },
    {
      id: 'ext-sqlite3',
      name: 'sqlite3',
      title: 'SQLite3 & PDO_SQLite',
      desc: 'Engine database lokal berbasis berkas tanpa server terpisah.',
      category: 'database',
      requiredFor: 'Cache Lokal & Aplikasi Ringan',
      enabled: true
    },
    {
      id: 'ext-opcache',
      name: 'opcache',
      title: 'Zend OPcache + JIT Compiler',
      desc: 'Menyimpan bytecode PHP terkompilasi di RAM untuk mempercepat loading website hingga 3x lipat.',
      category: 'cache',
      requiredFor: 'Akselerasi Semua Website & CBT',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-redis',
      name: 'redis',
      title: 'PhpRedis In-Memory Driver',
      desc: 'Konektor cache dan penyimpanan session berkecepatan tinggi (Sangat penting untuk ujian CBT ratusan siswa serentak).',
      category: 'cache',
      requiredFor: 'Ujian CBT Serentak, Laravel Queue',
      enabled: true,
      isCritical: true
    },
    {
      id: 'ext-memcached',
      name: 'memcached',
      title: 'Memcached Object Caching',
      desc: 'Sistem caching objek terdistribusi di memori RAM untuk mengurangi beban query database.',
      category: 'cache',
      requiredFor: 'Optimasi Database Trafik Tinggi',
      enabled: true
    },
    {
      id: 'ext-exif',
      name: 'exif',
      title: 'EXIF Image Metadata',
      desc: 'Membaca orientasi kamera dan metadata foto agar foto upload tidak terbalik.',
      category: 'media',
      requiredFor: 'Upload Foto Siswa / Produk',
      enabled: true
    },
    {
      id: 'ext-imap',
      name: 'imap',
      title: 'IMAP / POP3 Mail Extension',
      desc: 'Membaca kotak masuk email dan mengotomasi tiket bantuan / notifikasi.',
      category: 'network',
      requiredFor: 'Cloud PRO Billing, Helpdesk, Email Piping',
      enabled: true
    },
    {
      id: 'ext-gmp',
      name: 'gmp',
      title: 'GMP (GNU Multiple Precision)',
      desc: 'Modul aritmatika bilangan bulat besar untuk validasi kunci lisensi dan kriptografi.',
      category: 'security',
      requiredFor: 'Validasi Lisensi, WebPush Notification',
      enabled: true
    },
    {
      id: 'ext-sockets',
      name: 'sockets',
      title: 'PHP Network Sockets',
      desc: 'Koneksi socket TCP/UDP langsung untuk komunikasi real-time, WebSocket, & cetak printer jaringan.',
      category: 'network',
      requiredFor: 'Realtime Socket, RabbitMQ',
      enabled: true
    },
    {
      id: 'ext-ldap',
      name: 'ldap',
      title: 'LDAP Directory Auth',
      desc: 'Autentikasi pengguna terpusat (Single Sign-On / Active Directory sekolah atau kampus).',
      category: 'network',
      requiredFor: 'SSO Kampus / Sekolah, Moodle',
      enabled: true
    }
  ]);

  // PHP-FPM Pool Settings
  const [fpmPm, setFpmPm] = useState<'dynamic' | 'ondemand' | 'static'>('dynamic');
  const [maxChildren, setMaxChildren] = useState<number>(60);
  const [startServers, setStartServers] = useState<number>(12);
  const [minSpareServers, setMinSpareServers] = useState<number>(6);
  const [maxSpareServers, setMaxSpareServers] = useState<number>(24);
  const [maxRequests, setMaxRequests] = useState<number>(1000);

  const sshInstallCommand = `cd /var/www/html/siakad && sudo git fetch origin main && sudo git reset --hard origin/main && sudo bash install-php-extensions.sh`;

  const handleCopyInstallCmd = () => {
    navigator.clipboard.writeText(sshInstallCommand);
    setCopiedCmd(true);
    if (onShowToast) onShowToast('Perintah SSH instalasi ionCube, cURL & ekstensi lengkap berhasil disalin!', 'success');
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleApplyPreset = (presetId: string, presetName: string) => {
    setActivePresetId(presetId);
    setIoncubeEnabled(true);
    setSourceGuardianEnabled(true);
    setOpcacheEnabled(true);
    setAllowUrlFopen(true);
    setUploadMaxFilesize('256M');
    setPostMaxSize('256M');
    setMemoryLimit('512M');
    setMaxExecutionTime(300);
    setMaxInputVars(5000);
    setExtensions(prev => prev.map(e => ({ ...e, enabled: true })));
    if (onShowToast) {
      onShowToast(`Profil "${presetName}" diterapkan! ionCube Loader, cURL, GD, Zip & seluruh modul wajib telah diaktifkan.`, 'success');
    }
  };

  const handleToggleExtension = (id: string) => {
    setExtensions(prev => prev.map(ext => {
      if (ext.id === id) {
        const nextState = !ext.enabled;
        if (onShowToast) onShowToast(`Ekstensi ${ext.name} (${ext.title}) ${nextState ? 'diaktifkan' : 'dinonaktifkan'}.`, 'info');
        return { ...ext, enabled: nextState };
      }
      return ext;
    }));
  };

  const handleEnableAllExtensions = () => {
    setExtensions(prev => prev.map(ext => ({ ...ext, enabled: true })));
    setIoncubeEnabled(true);
    setSourceGuardianEnabled(true);
    if (onShowToast) {
      onShowToast('Seluruh 26 modul ekstensi PHP (termasuk ionCube Loader, SourceGuardian & cURL) telah diaktifkan!', 'success');
    }
  };

  const handleSaveIni = () => {
    if (onShowToast) onShowToast('Direktif php.ini, ionCube Loader, dan cURL berhasil disimpan & diterapkan.', 'success');
  };

  const handleRestartPhpFpm = () => {
    setIsRestartingFpm(true);
    setTimeout(() => {
      setIsRestartingFpm(false);
      if (onShowToast) onShowToast(`Daemon php${selectedPhpVer}-fpm (beserta ionCube Loader & cURL) berhasil dimuat ulang!`, 'success');
    }, 900);
  };

  const handleSaveFpmPool = () => {
    if (onShowToast) onShowToast('Konfigurasi PHP-FPM Worker Pool berhasil diperbarui.', 'success');
  };

  const filteredExtensions = extensions.filter(ext => {
    if (selectedExtCat !== 'all' && ext.category !== selectedExtCat) return false;
    if (!extSearch.trim()) return true;
    const q = extSearch.toLowerCase();
    return (
      ext.name.toLowerCase().includes(q) ||
      ext.title.toLowerCase().includes(q) ||
      ext.desc.toLowerCase().includes(q) ||
      ext.requiredFor.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Database &amp; Perangkat Lunak</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-400 font-mono font-semibold">MultiPHP, ionCube Loader &amp; cURL Engine</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Pusat Manajemen MultiPHP, ionCube Loader &amp; Ekstensi Website</span>
            <Code2 className="w-5 h-5 text-sky-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola ionCube Loader, SourceGuardian, cURL, GD, ZipArchive, ImageMagick, Intl, SOAP, serta batas memori php.ini untuk mendukung semua jenis aplikasi website (RDM, SIAKAD, CBT, Laravel, WordPress).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <button
            onClick={() => setIsPhpInfoModalOpen(true)}
            className="h-10 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">Cek phpinfo()</span>
          </button>

          <button
            onClick={handleRestartPhpFpm}
            disabled={isRestartingFpm}
            className="h-10 px-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 shrink-0 ${isRestartingFpm ? 'animate-spin' : ''}`} />
            <span className="truncate">{isRestartingFpm ? 'Reloading...' : `Reload PHP ${selectedPhpVer}`}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto touch-scroll">
        <button
          onClick={() => setActiveSubTab('loaders_deps')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'loaders_deps'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ionCube, cURL &amp; Pustaka Wajib Website</span>
        </button>

        <button
          onClick={() => setActiveSubTab('extensions')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'extensions'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Daftar Lengkap Ekstensi PHP ({extensions.filter(e => e.enabled).length}/{extensions.length} Aktif)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('multiphp')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'multiphp'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Versi PHP per Domain (MultiPHP)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ini_editor')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'ini_editor'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Editor php.ini (Batas Upload &amp; RAM)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fpm_pool')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'fpm_pool'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>PHP-FPM Worker Pool</span>
        </button>

        <button
          onClick={() => setActiveSubTab('raw_ini')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'raw_ini'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Konfigurasi Mentah php.ini</span>
        </button>
      </div>

      {/* =====================================================================
       * SUBTAB 1: IONCUBE, CURL & ESSENTIAL WEBSITE DEPENDENCIES HUB
       * ===================================================================== */}
      {activeSubTab === 'loaders_deps' && (
        <div className="space-y-6">
          {/* Core Loaders Status Cards (ionCube, cURL, SourceGuardian, Zip/GD/PDF) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: ionCube PHP Loader */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-sky-400 uppercase">ZEND EXTENSION #1</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{ioncubeEnabled ? 'TERPASANG & AKTIF' : 'NONAKTIF'}</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>ionCube PHP Loader v13.0.4</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dekoder wajib untuk menjalankan website terenkripsi seperti <strong>RDM (Rapor Digital Madrasah)</strong>, SIAKAD, aplikasi ujian CBT, dan Cloud PRO Billing.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">ioncube_loader_lin_{selectedPhpVer}.so</span>
                <button
                  type="button"
                  onClick={() => {
                    setIoncubeEnabled(!ioncubeEnabled);
                    handleToggleExtension('ext-ioncube');
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    ioncubeEnabled ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ioncubeEnabled ? 'Aktif ✓' : 'Aktifkan'}
                </button>
              </div>
            </div>

            {/* Card 2: cURL Engine */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase">HTTP/HTTPS API ENGINE</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AKTIF (SSL TLS 1.3)</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>cURL &amp; OpenSSL (libcurl 8.5)</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Wajib untuk sinkronisasi data ke server pusat Kemenag/EMIS, pengiriman pesan <strong>WhatsApp Gateway</strong>, Payment Gateway, &amp; REST API.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">php{selectedPhpVer}-curl + ca-certs</span>
                <span className="font-mono text-emerald-400 font-bold">HTTP/2 Ready</span>
              </div>
            </div>

            {/* Card 3: SourceGuardian & OPcache JIT */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase">LOADER &amp; JIT CACHE</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{sourceGuardianEnabled ? 'AKTIF' : 'NONAKTIF'}</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>SourceGuardian &amp; OPcache JIT</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Mendukung skrip terproteksi SourceGuardian (<code>ixed</code>) sekaligus mengakselerasi eksekusi PHP hingga 300% dengan Zend OPcache + Redis.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">ixed.{selectedPhpVer}.lin + opcache</span>
                <button
                  type="button"
                  onClick={() => {
                    setSourceGuardianEnabled(!sourceGuardianEnabled);
                    handleToggleExtension('ext-sourceguardian');
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    sourceGuardianEnabled ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {sourceGuardianEnabled ? 'Aktif ✓' : 'Aktifkan'}
                </button>
              </div>
            </div>

            {/* Card 4: Essential Document, Image & Archive Suite */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">DOKUMEN, CETAK &amp; ARSIP</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>LENGKAP</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>GD, Imagick, Zip, Intl &amp; Mbstring</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Wajib untuk cetak Rapor PDF (<code>DomPDF</code>/<code>mPDF</code>), impor/ekspor nilai Excel (<code>.xlsx</code>), pembuatan QR Code, &amp; ekstrak update ZIP.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">gd · imagick · zip · intl · xml</span>
                <span className="font-mono text-sky-400 font-bold">26 Modul Aktif</span>
              </div>
            </div>
          </div>

          {/* 1-Click Website Compatibility Profiles */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Profil Prasetel Kebutuhan Website (1-Click Compatibility Tuning)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pilih jenis website yang Anda jalankan di server untuk langsung mengaktifkan seluruh ekstensi dan batas memori yang dibutuhkan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleEnableAllExtensions}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aktifkan Semua 26 Modul Sekaligus</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                {
                  id: 'rdm_siakad',
                  title: 'RDM Kemenag, SIAKAD & Ujian CBT',
                  badge: 'Wajib ionCube + cURL',
                  desc: 'Mengaktifkan ionCube Loader, cURL, ZipArchive, GD, Mbstring, XML, OpenSSL, MySQLi, Redis + max_input_vars 5000 (agar simpan nilai rapor 1 kelas tidak terpotong).',
                  specs: 'ionCube · cURL · Zip · GD · RAM 512M'
                },
                {
                  id: 'laravel_ci4',
                  title: 'Laravel, Filament & CodeIgniter 4',
                  badge: 'Modern Framework',
                  desc: 'Mengaktifkan cURL, BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO MySQL/PgSQL, Intl, Tokenizer, XML, Imagick & Redis Queue.',
                  specs: 'BCMath · Intl · Fileinfo · Redis · PDO'
                },
                {
                  id: 'wordpress_moodle',
                  title: 'WordPress, WooCommerce & Moodle LMS',
                  badge: 'CMS & E-Learning',
                  desc: 'Mengaktifkan cURL, ImageMagick, GD, Soap, XML-RPC, Intl, Zip, Exif, Sodium, dan Zend OPcache untuk performa kursus/toko online.',
                  specs: 'Imagick · SOAP · Exif · Zip · OPcache'
                },
                {
                  id: 'whmcs_commercial',
                  title: 'Cloud PRO Billing & Skrip Komersial Terproteksi',
                  badge: 'Dual Loader Aktif',
                  desc: 'Mengaktifkan ionCube Loader + SourceGuardian (ixed), cURL SSL, GMP Cryptography, IMAP Email Piping, GD, dan SOAP Client.',
                  specs: 'ionCube · SourceGuardian · GMP · IMAP'
                }
              ].map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-slate-800/80 border-sky-400 ring-2 ring-sky-500/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">
                          {preset.badge}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Aktif
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                        {preset.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {preset.specs}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset.id, preset.title)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {isSelected ? 'Profil Diterapkan ✓' : 'Terapkan Profil Ini'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Ubuntu VPS Auto-Installer Command Box for ionCube, cURL & All PHP Extensions */}
          {currentUser.role === 'root' && (
            <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      Instalasi Otomatis ionCube Loader, cURL &amp; 26 Ekstensi di Server Ubuntu (Real VPS)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Skrip <code className="text-sky-400 font-mono">update.sh</code> dan <code className="text-sky-400 font-mono">install-php-extensions.sh</code> otomatis mengunduh binary resmi ionCube Linux 64-bit, memasang <code className="text-sky-400 font-mono">php-curl</code>, <code className="text-sky-400 font-mono">php-gd</code>, <code className="text-sky-400 font-mono">php-zip</code>, <code className="text-sky-400 font-mono">php-imagick</code>, <code className="text-sky-400 font-mono">php-intl</code>, <code className="text-sky-400 font-mono">php-soap</code>, dll.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyInstallCmd}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd ? 'Perintah Disalin!' : 'Salin Perintah SSH'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-sky-400 overflow-x-auto select-all">
                {sshInstallCommand}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 2: ALL 26 EXTENSIONS & MODULES MANAGER
       * ===================================================================== */}
      {activeSubTab === 'extensions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>Pustaka Modul, Loader &amp; Ekstensi PHP {selectedPhpVer} ({extensions.filter(e => e.enabled).length} Aktif)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aktifkan atau nonaktifkan modul PHP termasuk <strong>ionCube Loader</strong>, <strong>SourceGuardian</strong>, <strong>cURL</strong>, <strong>GD</strong>, <strong>Imagick</strong>, <strong>Zip</strong>, <strong>Intl</strong>, <strong>SOAP</strong>, dan <strong>Redis</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={extSearch}
                  onChange={(e) => setExtSearch(e.target.value)}
                  placeholder="Cari ioncube, curl, gd, zip, soap..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleEnableAllExtensions}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Aktifkan Semua
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: `Semua (${extensions.length})` },
              { id: 'loader', label: 'Encrypted Loader (ionCube / SG)' },
              { id: 'network', label: 'Jaringan & API (cURL / SOAP / IMAP)' },
              { id: 'core', label: 'Core & Dokumen (Zip / Mbstring / Intl)' },
              { id: 'media', label: 'Gambar & PDF (GD / Imagick / EXIF)' },
              { id: 'database', label: 'Database (MySQL / PgSQL / SQLite)' },
              { id: 'cache', label: 'Cache & Performa (OPcache / Redis)' },
              { id: 'security', label: 'Keamanan (OpenSSL / Sodium / Fileinfo)' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedExtCat(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  selectedExtCat === cat.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredExtensions.map((ext) => (
              <div 
                key={ext.id} 
                className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start justify-between gap-3 hover:border-sky-500/40 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-sky-400">{ext.name}</span>
                    <span className="text-xs font-bold text-white">— {ext.title}</span>
                    {ext.isCritical && (
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        · Wajib
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {ext.desc}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                    Digunakan oleh: <span className="text-slate-300 font-semibold">{ext.requiredFor}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleExtension(ext.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 mt-1 cursor-pointer ${
                    ext.enabled ? 'bg-sky-600' : 'bg-slate-700'
                  }`}
                  aria-label={`Toggle ${ext.name}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    ext.enabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 3: MULTIPHP SELECTOR PER WEBSITE
       * ===================================================================== */}
      {activeSubTab === 'multiphp' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Daftar Pemilihan Versi PHP per Domain Website</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Setiap versi PHP sudah dilengkapi dengan <strong>ionCube Loader</strong>, <strong>cURL</strong>, <strong>GD</strong>, dan <strong>ZipArchive</strong>.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Default Server: PHP {selectedPhpVer}-FPM + ionCube v13.0.4
              </span>
            </div>

            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Nama Domain</th>
                    <th className="px-4 py-3">Aplikasi / Tipe</th>
                    <th className="px-4 py-3">Versi PHP &amp; Loader</th>
                    <th className="px-4 py-3">FastCGI Socket</th>
                    <th className="px-4 py-3 text-right">Ubah Versi PHP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {websites.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Belum ada website yang terinstal di server.
                      </td>
                    </tr>
                  ) : (
                    websites.map((site) => (
                      <tr key={site.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white font-mono">
                          {site.domain}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <span className="capitalize">{site.appType}</span> ({site.runtime})
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sky-400 font-bold">
                            PHP {selectedPhpVer}-FPM · ionCube + cURL
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono text-slate-400">
                          /run/php/php{selectedPhpVer}-fpm.sock
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select
                            value={selectedPhpVer}
                            onChange={(e) => {
                              setSelectedPhpVer(e.target.value);
                              if (onShowToast) onShowToast(`Versi PHP untuk ${site.domain} dialihkan ke PHP ${e.target.value}-FPM (ionCube & cURL Aktif).`, 'success');
                            }}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                          >
                            <option value="8.4">PHP 8.4 (Latest + ionCube)</option>
                            <option value="8.3">PHP 8.3 (Direkomendasikan + ionCube)</option>
                            <option value="8.2">PHP 8.2 (RDM / Laravel Stabil + ionCube)</option>
                            <option value="8.1">PHP 8.1 (RDM / SIAKAD LTS + ionCube)</option>
                            <option value="7.4">PHP 7.4 (Aplikasi Lama + ionCube)</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PHP Version Status Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {phpVersions.map((p) => (
              <div key={p.version} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs font-mono">PHP {p.version}</span>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                    {p.status}
                  </span>
                </div>
                <div className="text-[10px] text-sky-400 font-mono font-semibold">
                  {p.ioncubeVersion} · cURL
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  {p.socketPath}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 4: INI DIRECTIVES EDITOR (VISUAL)
       * ===================================================================== */}
      {activeSubTab === 'ini_editor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Pengaturan Direktif php.ini (PHP {selectedPhpVer})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Nilai konfigurasi runtime memori, batas unggah berkas rapor/backup, dan batasan eksekusi skrip PHP.
              </p>
            </div>

            <button
              onClick={handleSaveIni}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* upload_max_filesize */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <label className="block font-bold text-white font-mono">
                upload_max_filesize
              </label>
              <p className="text-[11px] text-slate-400">Ukuran maksimal file ZIP/SQL/PDF yang diunggah.</p>
              <select
                value={uploadMaxFilesize}
                onChange={(e) => setUploadMaxFilesize(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono mt-1"
              >
                <option value="64M">64 MB</option>
                <option value="128M">128 MB</option>
                <option value="256M">256 MB (Rekomendasi RDM/SIAKAD)</option>
                <option value="512M">512 MB</option>
                <option value="1024M">1024 MB (1 GB)</option>
              </select>
            </div>

            {/* post_max_size */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <label className="block font-bold text-white font-mono">
                post_max_size
              </label>
              <p className="text-[11px] text-slate-400">Total volume data POST yang diterima form.</p>
              <select
                value={postMaxSize}
                onChange={(e) => setPostMaxSize(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono mt-1"
              >
                <option value="64M">64 MB</option>
                <option value="128M">128 MB</option>
                <option value="256M">256 MB (Rekomendasi)</option>
                <option value="512M">512 MB</option>
                <option value="1024M">1024 MB (1 GB)</option>
              </select>
            </div>

            {/* memory_limit */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <label className="block font-bold text-white font-mono">
                memory_limit
              </label>
              <p className="text-[11px] text-slate-400">Batas alokasi memori RAM per skrip (Cetak PDF/Excel).</p>
              <select
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono mt-1"
              >
                <option value="128M">128 MB</option>
                <option value="256M">256 MB</option>
                <option value="512M">512 MB (RDM/SIAKAD/Laravel Rekomendasi)</option>
                <option value="1024M">1024 MB (1 GB)</option>
                <option value="2048M">2048 MB (2 GB)</option>
              </select>
            </div>

            {/* max_execution_time */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <label className="block font-bold text-white font-mono">
                max_execution_time (detik)
              </label>
              <p className="text-[11px] text-slate-400">Waktu maksimal proses sinkronisasi cURL / generate rapor.</p>
              <input
                type="number"
                value={maxExecutionTime}
                onChange={(e) => setMaxExecutionTime(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono mt-1"
              />
            </div>

            {/* max_input_vars */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <label className="block font-bold text-white font-mono">
                max_input_vars
              </label>
              <p className="text-[11px] text-slate-400">Wajib &ge; 5000 agar input nilai ratusan siswa sekaligus tidak terpotong.</p>
              <input
                type="number"
                value={maxInputVars}
                onChange={(e) => setMaxInputVars(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono mt-1"
              />
            </div>

            {/* date.timezone */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <label className="block font-bold text-white font-mono">
                date.timezone
              </label>
              <p className="text-[11px] text-slate-400">Zona waktu default fungsi tanggal &amp; jadwal ujian.</p>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono mt-1"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                <option value="UTC">UTC (Universal Time)</option>
              </select>
            </div>

            {/* allow_url_fopen */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <label className="block font-bold text-white font-mono">
                  allow_url_fopen (cURL Stream)
                </label>
                <p className="text-[11px] text-slate-400">Izinkan pengambilan data API &amp; lisensi jarak jauh.</p>
              </div>
              <button
                type="button"
                onClick={() => setAllowUrlFopen(!allowUrlFopen)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  allowUrlFopen ? 'bg-sky-600' : 'bg-slate-700'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  allowUrlFopen ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            {/* display_errors */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <label className="block font-bold text-white font-mono">
                  display_errors
                </label>
                <p className="text-[11px] text-slate-400">Tampilkan pesan error PHP untuk debugging.</p>
              </div>
              <button
                type="button"
                onClick={() => setDisplayErrors(!displayErrors)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  displayErrors ? 'bg-amber-600' : 'bg-slate-700'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  displayErrors ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            {/* opcache.enable */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <label className="block font-bold text-white font-mono">
                  opcache.enable + ionCube
                </label>
                <p className="text-[11px] text-slate-400">Zend OPcache + ionCube Loader aktif bersamaan.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpcacheEnabled(!opcacheEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  opcacheEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  opcacheEnabled ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 5: PHP-FPM WORKER POOL
       * ===================================================================== */}
      {activeSubTab === 'fpm_pool' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Manajemen Proses Worker PHP-FPM (Pool www.conf)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfigurasi penanganan konkurensi request tinggi untuk mencegah server lag saat jam sibuk pengisian RDM/CBT.
              </p>
            </div>

            <button
              onClick={handleSaveFpmPool}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              Simpan Pool Config
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <label className="block font-bold text-white font-mono">Process Manager (pm)</label>
              <select
                value={fpmPm}
                onChange={(e) => setFpmPm(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1"
              >
                <option value="dynamic">dynamic (Rekomendasi - Fleksibel)</option>
                <option value="ondemand">ondemand (Hemat RAM, hidup saat request)</option>
                <option value="static">static (Kecepatan Maksimal, RAM Tinggi)</option>
              </select>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <label className="block font-bold text-white font-mono">pm.max_children</label>
              <input
                type="number"
                value={maxChildren}
                onChange={(e) => setMaxChildren(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1 font-mono"
              />
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <label className="block font-bold text-white font-mono">pm.start_servers</label>
              <input
                type="number"
                value={startServers}
                onChange={(e) => setStartServers(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1 font-mono"
              />
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <label className="block font-bold text-white font-mono">pm.min_spare_servers</label>
              <input
                type="number"
                value={minSpareServers}
                onChange={(e) => setMinSpareServers(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1 font-mono"
              />
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <label className="block font-bold text-white font-mono">pm.max_spare_servers</label>
              <input
                type="number"
                value={maxSpareServers}
                onChange={(e) => setMaxSpareServers(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1 font-mono"
              />
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <label className="block font-bold text-white font-mono">pm.max_requests</label>
              <input
                type="number"
                value={maxRequests}
                onChange={(e) => setMaxRequests(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 6: RAW INI FILE EDITOR
       * ===================================================================== */}
      {activeSubTab === 'raw_ini' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Editor Berkas Mentah (/etc/php/{selectedPhpVer}/fpm/php.ini)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Termasuk direktif <code className="font-mono text-sky-400">zend_extension = ioncube_loader_lin_{selectedPhpVer}.so</code> dan <code className="font-mono text-sky-400">curl.cainfo</code>.
              </p>
            </div>

            <button
              onClick={() => {
                if (onShowToast) onShowToast(`Berkas /etc/php/${selectedPhpVer}/fpm/php.ini berhasil ditulis ke disk server.`, 'success');
              }}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan ke Server</span>
            </button>
          </div>

          <textarea
            rows={20}
            value={rawIniContent}
            onChange={(e) => setRawIniContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-emerald-300 font-mono focus:outline-none focus:border-sky-500 leading-relaxed selection:bg-sky-500 selection:text-white"
          />
        </div>
      )}

      {/* phpinfo() Simulation Modal showing ionCube Loader & cURL */}
      {isPhpInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  phpinfo() - PHP Version {selectedPhpVer}.11 + ionCube Loader v13.0.4
                </h3>
              </div>
              <button
                onClick={() => setIsPhpInfoModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-slate-300">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-sky-400 font-bold text-sm">
                  PHP Version {selectedPhpVer}.11-1+ubuntu24.04.1+deb.sury.org+1
                </div>
                <div className="text-emerald-400 font-semibold text-xs pt-1">
                  This program makes use of the Zend Scripting Language Engine:<br />
                  Zend Engine v4.{selectedPhpVer.split('.')[1] || '3'}.11, Copyright (c) Zend Technologies<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;with the ionCube PHP Loader v13.0.4, Copyright (c) 2002-2024, by ionCube Ltd.<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;with Zend OPcache v{selectedPhpVer}.11, Copyright (c), by Zend Technologies<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;with SourceGuardian v15.0.0, Copyright (c) 2000-2024, by SourceGuardian Ltd.
                </div>
                <div className="text-slate-400 text-[11px] pt-1">
                  Server API: FPM/FastCGI · Loaded Configuration: /etc/php/{selectedPhpVer}/fpm/php.ini
                </div>
                <div className="text-slate-400 text-[11px]">
                  Additional .ini files parsed: /etc/php/{selectedPhpVer}/fpm/conf.d/00-ioncube.ini, 10-opcache.ini, 20-curl.ini, 20-gd.ini, 20-imagick.ini, 20-intl.ini, 20-mbstring.ini, 20-mysqli.ini, 20-pdo_mysql.ini, 20-redis.ini, 20-soap.ini, 20-zip.ini
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                    <tr>
                      <th className="p-2.5">Module / Directive</th>
                      <th className="p-2.5">Status / Local Value</th>
                      <th className="p-2.5">Version / Master Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    <tr><td className="p-2 font-bold text-white">ionCube PHP Loader</td><td className="p-2 text-emerald-400 font-bold">Enabled (Zend Extension)</td><td className="p-2 text-slate-300">v13.0.4 (Linux x86-64)</td></tr>
                    <tr><td className="p-2 font-bold text-white">cURL support</td><td className="p-2 text-emerald-400 font-bold">Enabled</td><td className="p-2 text-slate-300">libcurl/8.5.0 OpenSSL/3.0.13 zlib/1.3 HTTP/2</td></tr>
                    <tr><td className="p-2 font-bold text-white">SourceGuardian Loader</td><td className="p-2 text-emerald-400 font-bold">Enabled</td><td className="p-2 text-slate-300">v15.0.0 (ixed.{selectedPhpVer}.lin)</td></tr>
                    <tr><td className="p-2 font-bold text-white">GD Support &amp; FreeType</td><td className="p-2 text-emerald-400 font-bold">Enabled</td><td className="p-2 text-slate-300">2.3.3 (JPEG, PNG, WebP, AVIF, FreeType)</td></tr>
                    <tr><td className="p-2 font-bold text-white">ZipArchive &amp; libzip</td><td className="p-2 text-emerald-400 font-bold">Enabled</td><td className="p-2 text-slate-300">1.22.3 (BZip2, ZSTD, AES-256)</td></tr>
                    <tr><td className="p-2 font-bold text-white">ImageMagick (imagick)</td><td className="p-2 text-emerald-400 font-bold">Enabled</td><td className="p-2 text-slate-300">3.7.0 (ImageMagick 6.9.12-98)</td></tr>
                    <tr><td className="p-2 font-bold text-white">Multibyte (mbstring) &amp; Intl</td><td className="p-2 text-emerald-400 font-bold">Enabled</td><td className="p-2 text-slate-300">Oniguruma 6.9.9 · ICU 74.2</td></tr>
                    <tr><td className="p-2 font-bold text-white">memory_limit</td><td className="p-2 text-sky-300">{memoryLimit}</td><td className="p-2 text-slate-400">{memoryLimit}</td></tr>
                    <tr><td className="p-2 font-bold text-white">upload_max_filesize</td><td className="p-2 text-sky-300">{uploadMaxFilesize}</td><td className="p-2 text-slate-400">{uploadMaxFilesize}</td></tr>
                    <tr><td className="p-2 font-bold text-white">post_max_size</td><td className="p-2 text-sky-300">{postMaxSize}</td><td className="p-2 text-slate-400">{postMaxSize}</td></tr>
                    <tr><td className="p-2 font-bold text-white">max_execution_time</td><td className="p-2 text-sky-300">{maxExecutionTime}</td><td className="p-2 text-slate-400">{maxExecutionTime}</td></tr>
                    <tr><td className="p-2 font-bold text-white">max_input_vars</td><td className="p-2 text-sky-300">{maxInputVars}</td><td className="p-2 text-slate-400">{maxInputVars}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
