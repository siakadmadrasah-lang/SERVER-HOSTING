import React from 'react';
import { ActiveTab, UserRole } from '../types';

export type HostingMenuIconId =
  | ActiveTab
  | 'installer'
  | 'git_sync'
  | 'theme_studio'
  | 'role_switcher';

export type HostingCategoryKey =
  | 'vps_infrastructure'
  | 'whm_reseller'
  | 'domains_network'
  | 'files_storage'
  | 'databases_software'
  | 'security_monitoring'
  | 'system_automation';

export interface HostingCategoryMeta {
  id: HostingCategoryKey;
  title: string;
  subtitle: string;
  whmLabel: string;
  accentFrom: string;
  accentTo: string;
  borderClass: string;
  textClass: string;
}

export interface HostingMenuItemMeta {
  id: HostingMenuIconId;
  tab?: ActiveTab;
  actionType?: 'tab' | 'installer' | 'sync' | 'theme' | 'role';
  category: HostingCategoryKey;
  title: string;
  clientTitle?: string;
  resellerTitle?: string;
  description: string;
  badge?: string;
  allowedRoles: UserRole[];
}

export const HOSTING_CATEGORIES: HostingCategoryMeta[] = [
  {
    id: 'vps_infrastructure',
    title: 'Manajemen Infrastruktur VPS & Hypervisor',
    subtitle: 'Modul terisolasi untuk orkestrasi node server fisik, virtualisasi KVM/Proxmox, instance VPS klien, dan container Docker',
    whmLabel: 'VPS INFRASTRUCTURE ENGINE',
    accentFrom: '#2563eb',
    accentTo: '#4f46e5',
    borderClass: 'border-indigo-500/30',
    textClass: 'text-indigo-400'
  },
  {
    id: 'whm_reseller',
    title: 'Manajemen Web Hosting (Cloud PRO) & Billing',
    subtitle: 'Modul terisolasi untuk administrasi akun shared hosting CloudPanel, alokasi kuota NVMe, penagihan otomatis, dan identitas mitra',
    whmLabel: 'WEB HOSTING & BILLING ENGINE',
    accentFrom: '#8b5cf6',
    accentTo: '#6366f1',
    borderClass: 'border-violet-500/30',
    textClass: 'text-violet-400'
  },
  {
    id: 'domains_network',
    title: 'Domain, Zona DNS & Jaringan Cloud',
    subtitle: 'Pengelolaan virtual host domain, katalog instalasi aplikasi web, Cloudflare Zero Trust Ingress, dan nameserver utama',
    whmLabel: 'DOMAINS & NETWORK',
    accentFrom: '#0ea5e9',
    accentTo: '#2563eb',
    borderClass: 'border-sky-500/30',
    textClass: 'text-sky-400'
  },
  {
    id: 'files_storage',
    title: 'Penyimpanan Berkas, Email & Cadangan',
    subtitle: 'Eksplorasi direktori web, layanan kotak surat bisnis, akses protokol FTP, serta penyimpanan snapshot cadangan otomatis',
    whmLabel: 'STORAGE & MAIL',
    accentFrom: '#f59e0b',
    accentTo: '#ea580c',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400'
  },
  {
    id: 'databases_software',
    title: 'Basis Data, Runtime PHP & Web Server',
    subtitle: 'Administrasi cluster MySQL/PostgreSQL, konfigurasi versi PHP beserta modul ionCube dan cURL, serta arsitektur Nginx',
    whmLabel: 'DATABASES & RUNTIME',
    accentFrom: '#10b981',
    accentTo: '#0d9488',
    borderClass: 'border-emerald-500/30',
    textClass: 'text-emerald-400'
  },
  {
    id: 'security_monitoring',
    title: 'Keamanan SSL, Firewall & Audit Sistem',
    subtitle: 'Otoritas sertifikat enkripsi TLS/SSL, perlindungan trafik jaringan UFW, dan rekaman aktivitas log server terpusat',
    whmLabel: 'SECURITY & AUDIT',
    accentFrom: '#f43f5e',
    accentTo: '#e11d48',
    borderClass: 'border-rose-500/30',
    textClass: 'text-rose-400'
  },
  {
    id: 'system_automation',
    title: 'Sistem Inti, Konsol & Otomasi',
    subtitle: 'Pusat telemetri perangkat keras, akses konsol SSH, penjadwalan tugas otomatis, sinkronisasi rilis, dan tema antarmuka',
    whmLabel: 'CORE SYSTEM',
    accentFrom: '#06b6d4',
    accentTo: '#3b82f6',
    borderClass: 'border-cyan-500/30',
    textClass: 'text-cyan-400'
  }
];

export const HOSTING_MENU_CATALOG: HostingMenuItemMeta[] = [
  // Category 1: Dedicated VPS Infrastructure Engine
  {
    id: 'vps_cluster',
    tab: 'vps_cluster',
    actionType: 'tab',
    category: 'vps_infrastructure',
    title: 'Manajemen Node & Virtualisasi VPS',
    resellerTitle: 'Manajemen Instance VPS Klien',
    description: 'Pusat kendali terisolasi untuk cluster node server, mesin virtual KVM/LXC, manajemen container Docker, dan migrasi sistem.',
    allowedRoles: ['root', 'reseller']
  },

  // Category 2: Dedicated Cloud PRO Web Hosting & Billing Engine
  {
    id: 'whm_accounts',
    tab: 'whm_accounts',
    actionType: 'tab',
    category: 'whm_reseller',
    title: 'Manajemen Akun Hosting (Cloud PRO)',
    resellerTitle: 'Manajemen Akun Klien Hosting',
    description: 'Sistem administrasi akun CloudPanel terisolasi, alokasi paket penyimpanan NVMe, manajemen status layanan, dan akses panel klien.',
    allowedRoles: ['root', 'reseller']
  },
  {
    id: 'billing_whmcs',
    tab: 'billing_whmcs',
    actionType: 'tab',
    category: 'whm_reseller',
    title: 'Manajemen Billing & Lisensi Layanan',
    resellerTitle: 'Manajemen Tagihan Pelanggan',
    description: 'Sistem faktur berlangganan hosting dan VPS, katalog harga paket komersial, serta integrasi gerbang pembayaran otomatis.',
    allowedRoles: ['root', 'reseller']
  },
  {
    id: 'reseller_branding',
    tab: 'reseller_branding',
    actionType: 'tab',
    category: 'whm_reseller',
    title: 'Identitas Brand White-Label',
    description: 'Konfigurasi profil perusahaan penyedia layanan, logo resmi organisasi, serta tata warna khusus pada portal pelanggan.',
    allowedRoles: ['root', 'reseller']
  },
  {
    id: 'role_switcher',
    actionType: 'role',
    category: 'whm_reseller',
    title: 'Manajemen Peran & Akses (RBAC)',
    description: 'Pengaturan tingkat otoritas akses antara Administrator Utama (Root), Mitra Reseller Cloud PRO, dan Pengguna Akhir CloudPanel.',
    allowedRoles: ['root', 'reseller', 'client']
  },

  // Category 3: Domains, DNS & Cloud Ingress
  {
    id: 'websites',
    tab: 'websites',
    actionType: 'tab',
    category: 'domains_network',
    title: 'Manajer Domain & Virtual Host',
    clientTitle: 'Domain & Situs Web',
    resellerTitle: 'Domain & Situs Klien',
    description: 'Administrasi domain aktif, pemetaan direktori virtual host, pemantauan trafik bulanan, dan status enkripsi HTTPS.',
    allowedRoles: ['root', 'reseller', 'client']
  },
  {
    id: 'installer',
    actionType: 'installer',
    category: 'domains_network',
    title: 'Katalog Instalasi Aplikasi Web',
    description: 'Pustaka penyediaan otomatis untuk CMS WordPress, framework Laravel, Node.js, SIAKAD/RDM, dan integrasi repositori Git.',
    allowedRoles: ['root', 'reseller', 'client']
  },
  {
    id: 'tunnel',
    tab: 'tunnel',
    actionType: 'tab',
    category: 'domains_network',
    title: 'Cloudflare Zero Trust Ingress',
    description: 'Arsitektur publikasi jaringan terenkripsi ke jaringan edge global tanpa kebutuhan IP publik statis maupun pembukaan port router.',
    allowedRoles: ['root']
  },
  {
    id: 'dns_network',
    tab: 'dns_network',
    actionType: 'tab',
    category: 'domains_network',
    title: 'Nameserver Cloud PRO & Editor Zona DNS',
    description: 'Konfigurasi nameserver otoritatif (NS1–NS4), catatan Glue IP, rekaman A/CNAME/MX/TXT, manajemen subdomain, dan autentikasi DKIM/SPF.',
    allowedRoles: ['root', 'reseller', 'client']
  },

  // Category 4: Files, Mail & Backup Storage
  {
    id: 'files',
    tab: 'files',
    actionType: 'tab',
    category: 'files_storage',
    title: 'Manajer Berkas & Editor Kode',
    clientTitle: 'Manajer Berkas Direktori Web',
    description: 'Sistem manajemen berkas direktori publik, ekstraksi arsip ZIP, pengaturan izin akses berkas, dan penyuntingan kode sumber.',
    allowedRoles: ['root', 'reseller', 'client']
  },
  {
    id: 'email_ftp',
    tab: 'email_ftp',
    actionType: 'tab',
    category: 'files_storage',
    title: 'Layanan Email Bisnis & Akun FTP',
    clientTitle: 'Kotak Surat Email & Akses FTP',
    description: 'Administrasi akun email domain, antarmuka Roundcube Webmail, penerusan pesan, akun transfer Pure-FTPd, dan proteksi direktori.',
    allowedRoles: ['root', 'reseller', 'client']
  },
  {
    id: 'backups',
    tab: 'backups',
    actionType: 'tab',
    category: 'files_storage',
    title: 'Pusat Cadangan & Pemulihan Data',
    clientTitle: 'Cadangan Situs & Basis Data',
    description: 'Manajemen salinan cadangan terjadwal untuk basis data dan berkas aplikasi ke penyimpanan objek S3 maupun array NVMe lokal.',
    allowedRoles: ['root', 'reseller', 'client']
  },

  // Category 5: Databases, PHP & Web Server
  {
    id: 'databases',
    tab: 'databases',
    actionType: 'tab',
    category: 'databases_software',
    title: 'Basis Data MySQL & Studio SQL',
    clientTitle: 'Basis Data MySQL & phpMyAdmin',
    resellerTitle: 'Basis Data Pelanggan',
    description: 'Pengelolaan cluster basis data terpusat, otorisasi hak akses pengguna SQL, serta antarmuka eksekusi kueri interaktif.',
    allowedRoles: ['root', 'reseller', 'client']
  },
  {
    id: 'php_settings',
    tab: 'php_settings',
    actionType: 'tab',
    category: 'databases_software',
    title: 'Manajer MultiPHP & Modul Ekstensi',
    description: 'Konfigurasi runtime PHP (7.4–8.4), dekoder ionCube Loader, SourceGuardian, pustaka cURL, GD, Imagick, Zip, Intl, serta parameter php.ini.',
    allowedRoles: ['root', 'reseller', 'client']
  },
  {
    id: 'vhosts',
    tab: 'vhosts',
    actionType: 'tab',
    category: 'databases_software',
    title: 'Arsitektur Nginx & Reverse Proxy',
    description: 'Manajemen konfigurasi blok server Nginx, soket FastCGI PHP-FPM, serta pengaturan penyeimbang beban trafik web.',
    allowedRoles: ['root']
  },

  // Category 6: Security & Monitoring
  {
    id: 'security',
    tab: 'security',
    actionType: 'tab',
    category: 'security_monitoring',
    title: 'Sertifikat SSL/TLS & Firewall UFW',
    description: 'Manajemen sertifikat keamanan AutoSSL Let’s Encrypt, otoritas Origin CA, aturan penyaringan port jaringan, dan mitigasi ancaman.',
    allowedRoles: ['root']
  },
  {
    id: 'logs',
    tab: 'logs',
    actionType: 'tab',
    category: 'security_monitoring',
    title: 'Log Analitik & Audit Aktivitas',
    description: 'Pemantauan rekaman akses trafik web, diagnostik kesalahan layanan, replikasi basis data, serta jejak audit operasional sistem.',
    allowedRoles: ['root']
  },

  // Category 7: System, Terminal & Automation
  {
    id: 'terminal',
    tab: 'terminal',
    actionType: 'tab',
    category: 'system_automation',
    title: 'Konsol Terminal SSH Terpadu',
    description: 'Antarmuka interaksi baris perintah sistem operasi secara langsung melalui peramban web serta dokumentasi koneksi klien SSH.',
    allowedRoles: ['root']
  },
  {
    id: 'cron_jobs',
    tab: 'cron_jobs',
    actionType: 'tab',
    category: 'system_automation',
    title: 'Penjadwal Tugas Otomatis (Cron)',
    description: 'Manajemen penjadwalan otomatisasi tugas sistem untuk pencadangan berkala, pemeliharaan indeks, dan pembersihan berkas sementara.',
    allowedRoles: ['root', 'reseller', 'client']
  },
  {
    id: 'git_sync',
    actionType: 'sync',
    category: 'system_automation',
    title: 'Pembaruan & Sinkronisasi Sistem',
    description: 'Manajemen rilis versi panel kontrol dan sinkronisasi distribusi pembaruan sistem dari repositori pusat ke server produksi.',
    allowedRoles: ['root']
  },
  {
    id: 'theme_studio',
    actionType: 'theme',
    category: 'system_automation',
    title: 'Personalisasi Tema Antarmuka',
    description: 'Pengaturan profil visual antarmuka panel kontrol dengan pilihan mode terang profesional maupun mode gelap klasik.',
    allowedRoles: ['root', 'reseller', 'client']
  },
  {
    id: 'dashboard',
    tab: 'dashboard',
    actionType: 'tab',
    category: 'system_automation',
    title: 'Pusat Telemetri & Performa',
    description: 'Pemantauan indikator kinerja prosesor EPYC, alokasi memori ECC, utilisasi penyimpanan NVMe, dan kesehatan daemon.',
    allowedRoles: ['root', 'reseller', 'client']
  }
];

interface HostingMenuIconProps {
  id: HostingMenuIconId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Renders an official WHM / cPanel Jupiter style multi-layered illustrated vector icon
 * with a rich gradient app-tile container and detailed domain emblem.
 */
export const HostingMenuIcon: React.FC<HostingMenuIconProps> = ({
  id,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg p-1',
    md: 'w-10 h-10 rounded-xl p-1.5',
    lg: 'w-12 h-12 rounded-2xl p-2'
  }[size];

  switch (id) {
    case 'dashboard':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-sky-500 to-blue-600 shadow-sm shadow-sky-500/25 border border-sky-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="4" y="5" width="28" height="11" rx="3" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" />
            <circle cx="9" cy="10.5" r="2" fill="#86efac" />
            <circle cx="14" cy="10.5" r="2" fill="#fde047" />
            <path d="M20 10.5H28" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <rect x="4" y="20" width="28" height="11" rx="3" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" />
            <circle cx="9" cy="25.5" r="2" fill="#86efac" />
            <path d="M14 27.5L17.5 23.5L21 26.5L25 22.5L28.5 25.5" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'websites':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/25 border border-blue-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <circle cx="17" cy="18" r="12" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="2" />
            <ellipse cx="17" cy="18" rx="5.5" ry="12" stroke="white" strokeWidth="1.7" />
            <path d="M5.5 18H28.5M7 12.5H27M7 23.5H27" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="21" y="20" width="11" height="11" rx="2.5" fill="#10b981" stroke="white" strokeWidth="1.6" />
            <path d="M24.5 25.5L26 27L29 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'installer':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm shadow-indigo-500/25 border border-indigo-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path d="M18 4L30 10.5V25.5L18 32L6 25.5V10.5L18 4Z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" />
            <path d="M6 10.5L18 17L30 10.5M18 17V32" stroke="white" strokeWidth="1.7" />
            <circle cx="26" cy="10" r="6" fill="#f59e0b" stroke="white" strokeWidth="1.6" />
            <path d="M26 7.5V12.5M23.5 10H28.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'tunnel':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shadow-orange-500/25 border border-amber-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path d="M10.5 24H26.5C29.5 24 31.5 21.8 31.5 19C31.5 16.4 29.6 14.3 27 14C26.2 9.8 22.5 6.8 18 6.8C13.8 6.8 10.2 9.5 9.2 13.4C6.5 13.9 4.5 16.2 4.5 19C4.5 21.8 6.8 24 10.5 24Z" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="2" />
            <path d="M12 28.5H24M15 24V28.5M21 24V28.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M18.5 11L14.5 17H18.5L17 22L22 15.5H18L18.5 11Z" fill="#fef08a" />
          </svg>
        </div>
      );

    case 'dns_network':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-cyan-600 to-sky-600 shadow-sm shadow-cyan-500/25 border border-cyan-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <circle cx="18" cy="9" r="4" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" />
            <circle cx="9" cy="26" r="4" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" />
            <circle cx="27" cy="26" r="4" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" />
            <path d="M15.5 12.5L11 22.5M20.5 12.5L25 22.5M13 26H23" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="19.5" r="2.5" fill="#fde047" />
          </svg>
        </div>
      );

    case 'files':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-amber-500 to-yellow-600 shadow-sm shadow-amber-500/25 border border-amber-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path d="M4.5 10C4.5 8.34315 5.84315 7 7.5 7H14.5L17.5 10.5H28.5C30.1569 10.5 31.5 11.8431 31.5 13.5V26C31.5 27.6569 30.1569 29 28.5 29H7.5C5.84315 29 4.5 27.6569 4.5 26V10Z" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="2" />
            <path d="M14 17.5L11 20.5L14 23.5M22 17.5L25 20.5L22 23.5M19 16.5L17 24.5" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'email_ftp':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-sky-600 to-indigo-600 shadow-sm shadow-sky-500/25 border border-sky-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="4.5" y="7.5" width="24" height="17" rx="3" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="2" />
            <path d="M5.5 9.5L16.5 17L27.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="26.5" cy="24.5" r="5.5" fill="#10b981" stroke="white" strokeWidth="1.6" />
            <path d="M24 24.5H29M26.5 22V27" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'backups':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-orange-500 to-red-600 shadow-sm shadow-orange-500/25 border border-orange-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="6" y="7" width="24" height="22" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" />
            <path d="M18 11.5V21.5M18 21.5L14 17.5M18 21.5L22 17.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 25H25" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'databases':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-emerald-600 to-teal-600 shadow-sm shadow-emerald-500/25 border border-emerald-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <ellipse cx="18" cy="9.5" rx="11" ry="4.5" fill="white" fillOpacity="0.28" stroke="white" strokeWidth="2" />
            <path d="M7 9.5V18C7 20.5 11.9 22.5 18 22.5C24.1 22.5 29 20.5 29 18V9.5" stroke="white" strokeWidth="2" />
            <path d="M7 18V26.5C7 29 11.9 31 18 31C24.1 31 29 29 29 26.5V18" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="2" />
            <circle cx="24" cy="17.5" r="1.8" fill="#fde047" />
            <circle cx="24" cy="26" r="1.8" fill="#86efac" />
          </svg>
        </div>
      );

    case 'php_settings':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-indigo-600 to-blue-700 shadow-sm shadow-indigo-500/25 border border-indigo-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <ellipse cx="18" cy="18" rx="13.5" ry="9" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" />
            <text x="18" y="21" textAnchor="middle" fill="white" fontSize="9.5" fontWeight="800" fontFamily="monospace">PHP8</text>
            <circle cx="28" cy="26" r="4.8" fill="#10b981" stroke="white" strokeWidth="1.5" />
            <path d="M28 24V28M26 26H30" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'vhosts':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-teal-600 to-emerald-600 shadow-sm shadow-teal-500/25 border border-teal-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <polygon points="18,4 31,11.5 31,24.5 18,32 5,24.5 5,11.5" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" />
            <path d="M13 23V13L23 23V13" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'whm_accounts':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-violet-600 to-purple-700 shadow-sm shadow-violet-500/25 border border-violet-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <circle cx="14" cy="13" r="4.5" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" />
            <path d="M6.5 27.5C6.5 23.5 9.8 20.5 14 20.5C18.2 20.5 21.5 23.5 21.5 27.5" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24.5" cy="14.5" r="3.5" fill="#38bdf8" stroke="white" strokeWidth="1.7" />
            <path d="M21.5 26.5C22.2 23.5 24.5 21.5 27.5 21.5C29.5 21.5 31 22.5 31.5 24.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'vps_cluster':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 shadow-sm shadow-indigo-500/25 border border-indigo-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="4.5" y="5.5" width="27" height="7.5" rx="2" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="1.9" />
            <circle cx="8.5" cy="9.2" r="1.5" fill="#4ade80" />
            <circle cx="12.5" cy="9.2" r="1.5" fill="#38bdf8" />
            <rect x="4.5" y="15" width="27" height="7.5" rx="2" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="1.9" />
            <circle cx="8.5" cy="18.7" r="1.5" fill="#4ade80" />
            <circle cx="12.5" cy="18.7" r="1.5" fill="#fde047" />
            <path d="M18 22.5V28.5M10 28.5H26" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="28.5" r="2.5" fill="#fde047" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'billing_whmcs':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-emerald-600 to-teal-700 shadow-sm shadow-emerald-500/25 border border-emerald-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="4.5" y="8" width="27" height="20" rx="3.5" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="2" />
            <path d="M4.5 14H31.5" stroke="white" strokeWidth="2.2" />
            <rect x="8.5" y="19" width="7" height="4.5" rx="1" fill="#fde047" />
            <path d="M20 21.5H27.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'reseller_branding':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-fuchsia-600 to-pink-600 shadow-sm shadow-fuchsia-500/25 border border-fuchsia-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path d="M7 25L9.5 12L15 17.5L18 10L21 17.5L26.5 12L29 25H7Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            <rect x="7" y="27" width="22" height="3" rx="1.5" fill="#fde047" />
            <circle cx="18" cy="7" r="2" fill="#fde047" />
          </svg>
        </div>
      );

    case 'role_switcher':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-purple-600 to-indigo-600 shadow-sm shadow-purple-500/25 border border-purple-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="5" y="7" width="16" height="11" rx="2.5" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" />
            <rect x="15" y="18" width="16" height="11" rx="2.5" fill="#10b981" fillOpacity="0.5" stroke="white" strokeWidth="2" />
            <path d="M24 9.5H28.5V14M12 26.5H7.5V22" stroke="#fde047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'security':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-rose-600 to-red-600 shadow-sm shadow-rose-500/25 border border-rose-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path d="M18 5L29 9.5V17.5C29 24.5 24.2 29.8 18 32C11.8 29.8 7 24.5 7 17.5V9.5L18 5Z" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="2" />
            <rect x="14" y="16.5" width="8" height="7" rx="1.5" fill="white" />
            <path d="M15.5 16.5V14C15.5 12.6 16.6 11.5 18 11.5C19.4 11.5 20.5 12.6 20.5 14V16.5" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      );

    case 'logs':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-pink-600 to-rose-600 shadow-sm shadow-pink-500/25 border border-pink-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="6" y="6" width="20" height="24" rx="3" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="2" />
            <path d="M10 12H22M10 17H19M10 22H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24.5" cy="23.5" r="4.8" fill="#0284c7" stroke="white" strokeWidth="1.8" />
            <path d="M28 27L31 30" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'terminal':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-slate-800 to-slate-950 shadow-sm shadow-slate-900/25 border border-slate-700 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="4.5" y="6.5" width="27" height="23" rx="3.5" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
            <circle cx="8.5" cy="10.5" r="1.4" fill="#f43f5e" />
            <circle cx="12.5" cy="10.5" r="1.4" fill="#fbbf24" />
            <circle cx="16.5" cy="10.5" r="1.4" fill="#10b981" />
            <path d="M10 17L14.5 20.5L10 24" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 24H24" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'cron_jobs':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-sky-600 to-cyan-600 shadow-sm shadow-sky-500/25 border border-sky-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <circle cx="18" cy="18" r="11.5" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="2" />
            <path d="M18 11.5V18L22.5 21" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M27 8L30 11M9 8L6 11" stroke="#fde047" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'git_sync':
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-emerald-600 to-green-600 shadow-sm shadow-emerald-500/25 border border-emerald-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <circle cx="11" cy="10" r="3" fill="white" stroke="white" strokeWidth="1.6" />
            <circle cx="11" cy="26" r="3" fill="white" stroke="white" strokeWidth="1.6" />
            <circle cx="25" cy="18" r="3" fill="#fde047" stroke="white" strokeWidth="1.6" />
            <path d="M11 13V23M14 10H19C22 10 25 12.5 25 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M25 21C25 23.5 22 26 19 26H14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'theme_studio':
    default:
      return (
        <div className={`${sizeClasses} bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-600 shadow-sm shadow-indigo-500/25 border border-indigo-400/30 flex items-center justify-center shrink-0 ${className}`}>
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path d="M18 6C11.4 6 6 11.1 6 17.5C6 23.9 11.4 29 18 29C19.9 29 21.5 27.5 21.5 25.6C21.5 24.7 21.1 23.9 20.6 23.3C20.1 22.8 19.8 22.1 19.8 21.3C19.8 19.6 21.2 18.2 23 18.2H25C27.8 18.2 30 16 30 13.2C30 9.1 24.6 6 18 6Z" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="2" />
            <circle cx="12.5" cy="14.5" r="2.2" fill="#fde047" />
            <circle cx="17.5" cy="11.5" r="2.2" fill="#86efac" />
            <circle cx="23" cy="13" r="2.2" fill="#7dd3fc" />
            <circle cx="12" cy="20.5" r="2.2" fill="#fda4af" />
          </svg>
        </div>
      );
  }
};
