import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  HardDrive, 
  Activity, 
  Database, 
  Lock, 
  Radio, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  FolderTree,
  Mail,
  Key,
  Globe,
  Server,
  Sparkles,
  ArrowLeft,
  X,
  FileCode,
  Layers,
  Settings,
  Download,
  Copy,
  Check,
  UserCheck,
  Building2
} from 'lucide-react';
import { HostingAccount, HostingPackage, Language, ActiveTab, CurrentSessionUser } from '../types';

interface WhmAccountsViewProps {
  accounts: HostingAccount[];
  packages: HostingPackage[];
  onAddAccount: (account: HostingAccount) => void;
  onDeleteAccount: (accountId: string) => void;
  onToggleSuspend: (accountId: string) => void;
  onOpenInstallerForAccount: (account: HostingAccount) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  currentLang: Language;
  currentUser?: CurrentSessionUser;
  onImpersonateAccount?: (account: HostingAccount) => void;
}

type CpanelSubModal = 
  | null 
  | 'file_manager' 
  | 'disk_usage' 
  | 'ftp_accounts' 
  | 'backup_wizard' 
  | 'mysql_db' 
  | 'mysql_users' 
  | 'remote_mysql' 
  | 'php_version' 
  | 'ssl_status';

export const WhmAccountsView: React.FC<WhmAccountsViewProps> = ({
  accounts,
  packages,
  onAddAccount,
  onDeleteAccount,
  onToggleSuspend,
  onOpenInstallerForAccount,
  onNavigateTab,
  onShowToast,
  currentLang,
  currentUser,
  onImpersonateAccount
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedAccountForCpanel, setSelectedAccountForCpanel] = useState<HostingAccount | null>(null);
  const [activeSubModal, setActiveSubModal] = useState<CpanelSubModal>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Sub-modal specific states
  const [newSubDbName, setNewSubDbName] = useState<string>('');
  const [subDatabases, setSubDatabases] = useState<string[]>(['portalid_siakad', 'portalid_wp']);
  const [selectedPhpVersion, setSelectedPhpVersion] = useState<string>('PHP 8.5-FPM (Aktif)');
  const [remoteIpWhitelist, setRemoteIpWhitelist] = useState<string[]>(['10.240.0.% (Cluster VPC)', '127.0.0.1 (Localhost)']);
  const [newRemoteIp, setNewRemoteIp] = useState<string>('');

  // New account form state
  const [newDomain, setNewDomain] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || 'pkg-starter');
  const [autoAddTunnel, setAutoAddTunnel] = useState<boolean>(true);
  const [accountType, setAccountType] = useState<'client' | 'reseller'>('client');

  // Stats
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(a => a.status === 'active').length;
  const suspendedAccounts = accounts.filter(a => a.status === 'suspended').length;
  const totalDiskUsedMb = accounts.reduce((sum, a) => sum + a.diskUsageMb, 0);

  const handleDomainChange = (val: string) => {
    setNewDomain(val);
    const cleanUser = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toLowerCase();
    setNewUsername(cleanUser);
    if (!newEmail && val) {
      setNewEmail(`admin@${val}`);
    }
    if (!newPassword) {
      setNewPassword(`Pass_${Math.random().toString(36).substring(2, 9)}!`);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !newUsername.trim()) return;

    if (currentUser?.role === 'reseller' && accounts.length >= (currentUser.resellerMaxAccounts || 10)) {
      if (onShowToast) onShowToast(`Batas alokasi akun reseller Anda (${currentUser.resellerMaxAccounts || 10} akun) telah tercapai. Hubungi Super Admin untuk penambahan.`, 'warning');
      return;
    }

    const pkg = packages.find(p => p.id === selectedPackageId) || packages[0];

    const newAcc: HostingAccount = {
      id: `acc-${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      domain: newDomain.trim().toLowerCase(),
      ownerEmail: newEmail.trim() || `admin@${newDomain.trim()}`,
      packageName: pkg.name,
      diskUsageMb: 85,
      diskQuotaMb: pkg.quotaMb,
      bandwidthUsageGb: 0.1,
      bandwidthQuotaGb: pkg.bandwidthGb,
      status: 'active',
      databasesCount: 0,
      maxDatabases: pkg.maxDatabases,
      homeDirectory: `/home/${newUsername.trim().toLowerCase()}/public_html`,
      tunnelHostname: newDomain.trim().toLowerCase(),
      tunnelConnected: autoAddTunnel,
      createdAt: new Date().toISOString().split('T')[0],
      accountType: currentUser?.role === 'reseller' ? 'client' : accountType,
      resellerOwner: currentUser?.role === 'reseller' ? currentUser.username : undefined,
      resellerMaxAccounts: accountType === 'reseller' ? 10 : undefined,
      resellerDiskQuotaGb: accountType === 'reseller' ? 50 : undefined,
      resellerBandwidthQuotaGb: accountType === 'reseller' ? 500 : undefined
    };

    onAddAccount(newAcc);

    setNewDomain('');
    setNewUsername('');
    setNewPassword('');
    setNewEmail('');
    setAccountType('client');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Tingkat Root Administrator</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-400 font-mono">Manajer Server (Cloud PRO Core)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Manajemen Akun Hosting & Multi-Tenant CloudPanel
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola akun klien di Cloud PRO & CloudPanel: kuota disk terisolasi, prefix database otomatis, direktori /home, dan auto-routing Cloudflare Tunnel.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Buat Akun Baru (Klien / Reseller)</span>
        </button>
      </div>

      {/* Arsitektur Tingkatan Akun Cloud PRO */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Panduan Tingkatan Akun Server: Reseller vs Klien Biasa
            </h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
            3-Tier RBAC Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 bg-slate-950/70 border border-purple-500/30 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300">1. Super Admin (Root)</span>
              <span className="text-[10px] text-purple-400 font-mono">Pemilik Server</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Memiliki akses total ke VPS, Terminal SSH, Ingress Cloudflare global, dan <strong>SATU-SATUNYA yang berhak menjalankan Git Sync &amp; Update VPS</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-amber-500/30 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300">2. Reseller Hosting</span>
              <span className="text-[10px] text-amber-400 font-mono">Mitra / Agensi</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bisa membuat dan mengelola klien hosting sendiri dalam batas alokasi kuota disk &amp; akun. <u>TIDAK DAPAT</u> mengakses Git Sync atau terminal root server.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-emerald-500/30 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">3. Klien Biasa (CloudPanel)</span>
              <span className="text-[10px] text-emerald-400 font-mono">End-User</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pemilik website individual. Terisolasi hanya di <code className="text-white font-mono">/home/user/public_html</code> &amp; database MySQL sendiri. Tidak ada akses sistem.
            </p>
          </div>
        </div>
      </div>

      {/* Cloud PRO Resource Pool Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Total Akun CloudPanel</div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">{totalAccounts} Akun Klien</div>
          <div className="text-[11px] text-emerald-400 mt-1">{activeAccounts} Aktif · {suspendedAccounts} Suspend</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Penggunaan Kuota Disk Klien</div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">
            {(totalDiskUsedMb / 1024).toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 1,024 GB Pool</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">NVMe Isolasi /home/user</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Status Cloudflare Tunnel</div>
          <div className="text-lg font-bold text-amber-400 font-mono flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>5/5 Terhubung</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Auto Ingress ke localhost:80</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Paket Hosting Default</div>
          <div className="text-lg font-bold text-indigo-400 font-mono">3 Template Paket</div>
          <div className="text-[11px] text-slate-500 mt-1">Starter, Business, Enterprise</div>
        </div>
      </div>

      {/* Accounts Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Daftar Akun Hosting Klien (Cloud PRO List Accounts)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Setiap akun memiliki isolasi sistem UNIX, direktori root tersendiri, dan portal CloudPanel terpisah.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {accounts.length} tenant
          </span>
        </div>

        {/* Mobile View: Dedicated Adaptive Cards (< md) */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {accounts.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Belum Ada Akun Hosting Klien</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Semua akun default proyek telah dibersihkan. Buat akun hosting pertama Anda untuk mengaktifkan direktori dan virtual host baru.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat Akun Baru</span>
              </button>
            </div>
          ) : (
            accounts.map((acc) => {
            const diskPercent = Math.min(100, Math.round((acc.diskUsageMb / acc.diskQuotaMb) * 100));
            const isActive = acc.status === 'active';

            return (
              <div key={acc.id} className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-white font-mono flex items-center gap-1.5 text-xs sm:text-sm">
                      <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{acc.domain}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      user: <span className="text-indigo-300 font-semibold">{acc.username}</span> · {acc.packageName}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                    isActive 
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                      : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                  }`}>
                    {isActive ? '● Aktif' : '○ Suspended'}
                  </span>
                </div>

                {/* Disk & Stats Row */}
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1 text-slate-400">
                      <span>Kapasitas Disk:</span>
                      <span className="text-slate-200">{(acc.diskUsageMb / 1024).toFixed(2)} / {(acc.diskQuotaMb / 1024).toFixed(0)} GB ({diskPercent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${diskPercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${diskPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <div className="flex items-center gap-1">
                      <span>Database:</span>
                      <span className="text-emerald-400 font-mono font-semibold">{acc.databasesCount}/{acc.maxDatabases}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Radio className="w-2.5 h-2.5 text-amber-400" />
                      <span>CF Tunnel</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
                  {onImpersonateAccount && (
                    <button
                      onClick={() => onImpersonateAccount(acc)}
                      className="py-1.5 px-2 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
                      title="Simulasikan login langsung ke dasbor CloudPanel akun ini"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Login Klien</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAccountForCpanel(acc)}
                    className="flex-1 py-1.5 px-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>CloudPanel</span>
                  </button>
                  <button
                    onClick={() => onToggleSuspend(acc.id)}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      isActive 
                        ? 'text-slate-300 border-slate-700 hover:bg-slate-800' 
                        : 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                    }`}
                    title={isActive ? 'Suspend' : 'Buka Suspend'}
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg"
                    title="Hapus Akun"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Desktop View: Full Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-3">Nama Domain & Pengguna</th>
                <th className="px-4 py-3">Paket Hosting</th>
                <th className="px-4 py-3">Penggunaan Kuota Disk</th>
                <th className="px-4 py-3">Bandwidth Bulanan</th>
                <th className="px-4 py-3">Database</th>
                <th className="px-4 py-3">Cloudflare Tunnel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi CloudPanel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400 mb-3">
                      <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">Belum Ada Akun Hosting Klien</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                      Semua akun default proyek telah dibersihkan. Klik tombol di bawah untuk membuat akun hosting CloudPanel / virtual host klien pertama Anda.
                    </p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Buat Akun Baru</span>
                    </button>
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                const diskPercent = Math.min(100, Math.round((acc.diskUsageMb / acc.diskQuotaMb) * 100));
                const bwPercent = Math.min(100, Math.round((acc.bandwidthUsageGb / acc.bandwidthQuotaGb) * 100));
                const isActive = acc.status === 'active';

                return (
                  <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white font-mono flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{acc.domain}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        user: <span className="text-indigo-300 font-semibold">{acc.username}</span> · <span className="text-slate-500">{acc.ownerEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-[11px]">
                      <span className="font-medium text-slate-200">{acc.packageName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-300 tabular-nums">{(acc.diskUsageMb / 1024).toFixed(2)} GB</span>
                        <span className="text-slate-500 tabular-nums">/ {(acc.diskQuotaMb / 1024).toFixed(0)} GB</span>
                      </div>
                      <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${diskPercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                          style={{ width: `${diskPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-300 tabular-nums">{acc.bandwidthUsageGb.toFixed(1)} GB</span>
                        <span className="text-slate-500 tabular-nums">/ {acc.bandwidthQuotaGb} GB</span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${bwPercent}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-300">
                      <span className="text-emerald-400 font-semibold">{acc.databasesCount}</span> / {acc.maxDatabases}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Radio className="w-2.5 h-2.5 text-amber-400" />
                        <span>Tunnel Aktif</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        isActive ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}>
                        {isActive ? '● Aktif' : '○ Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onImpersonateAccount && (
                          <button
                            onClick={() => onImpersonateAccount(acc)}
                            className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 active:scale-95"
                            title="Simulasikan login langsung ke dasbor CloudPanel akun ini"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Login Klien</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedAccountForCpanel(acc)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="Buka panel kontrol CloudPanel akun ini"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>CloudPanel</span>
                        </button>
                        <button
                          onClick={() => onToggleSuspend(acc.id)}
                          className={`p-1.5 rounded transition-colors text-[11px] ${
                            isActive 
                              ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' 
                              : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800'
                          }`}
                          title={isActive ? 'Suspend Akun' : 'Buka Suspend'}
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteAccount(acc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Hapus Akun (Terminate)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud PRO Modal: Create New Account Wizard */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateAccount} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-semibold text-white">Buat Akun Hosting Baru (Cloud PRO)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tingkat Jenis Akun: Reseller vs Klien Biasa */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Pilih Jenis Tingkatan Akun <span className="text-sky-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('client')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    accountType === 'client'
                      ? 'bg-sky-600/20 border-sky-500 text-sky-200 ring-1 ring-sky-500/40 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white">Klien Biasa</span>
                    <span className="text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-mono">CloudPanel</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Untuk pemilik website perorangan. Akses terbatas ke folder dan domain sendiri.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('reseller')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    accountType === 'reseller'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/40 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white">Reseller Hosting</span>
                    <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">Mitra Cloud PRO</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Untuk mitra/agensi. Dapat membuat dan mengelola akun klien dalam batas kuota pool.
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Domain Utama (Primary Domain) <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: tokomaju.id"
                value={newDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username Akun <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="tokomaju"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  Root: /home/{newUsername || 'user'}/public_html
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kata Sandi
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Pemilik Akun
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@tokomaju.id"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Paket Hosting
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.quotaMb / 1024}GB Disk / {pkg.bandwidthGb}GB BW)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cloudflare Tunnel Auto-route switch */}
            <div className="p-3 bg-slate-950/70 border border-amber-500/20 rounded-lg">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">
                      Otomatis Rutekan via Cloudflare Tunnel
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Menambahkan domain ini ke ingress rule cloudflared daemon tanpa butuh IP Publik statis
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoAddTunnel}
                  onChange={(e) => setAutoAddTunnel(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold shadow-sm"
              >
                Buat Akun Hosting
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FULL CloudPanel SIMULATION MODAL (When clicking 'CloudPanel') */}
      {selectedAccountForCpanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* CloudPanel Top Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-orange-600 text-white font-mono font-bold text-xs tracking-wider">
                  CloudPanel
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{selectedAccountForCpanel.domain}</span>
                    <span className="text-xs font-mono text-slate-400 font-normal">
                      (Pengguna: <strong className="text-indigo-300">{selectedAccountForCpanel.username}</strong>)
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Home Directory: {selectedAccountForCpanel.homeDirectory}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAccountForCpanel(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Cloud PRO Root</span>
              </button>
            </div>

            {/* CloudPanel Content Layout */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950">
              {/* Right Sidebar: General Information / Statistics (4 cols) */}
              <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
                    Informasi Akun CloudPanel
                  </h3>

                  <div className="space-y-2 text-xs font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Current User:</span>
                      <span className="text-indigo-400 font-semibold">{selectedAccountForCpanel.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Primary Domain:</span>
                      <span className="text-white">{selectedAccountForCpanel.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">MySQL Prefix:</span>
                      <span className="text-indigo-300">{selectedAccountForCpanel.username}_*</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Paket Hosting:</span>
                      <span className="text-slate-200">{selectedAccountForCpanel.packageName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Cloudflare Tunnel:</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5" /> Active (Direct)
                      </span>
                    </div>
                  </div>

                  {/* Disk Usage Gauge */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Disk Space Usage:</span>
                      <span className="text-white">
                        {(selectedAccountForCpanel.diskUsageMb / 1024).toFixed(2)} GB / {(selectedAccountForCpanel.diskQuotaMb / 1024).toFixed(0)} GB
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: `${Math.min(100, (selectedAccountForCpanel.diskUsageMb / selectedAccountForCpanel.diskQuotaMb) * 100)}%` }} 
                      />
                    </div>
                  </div>

                  {/* Bandwidth Usage Gauge */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Bandwidth Bulan Ini:</span>
                      <span className="text-white">
                        {selectedAccountForCpanel.bandwidthUsageGb.toFixed(1)} GB / {selectedAccountForCpanel.bandwidthQuotaGb} GB
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500" 
                        style={{ width: `${Math.min(100, (selectedAccountForCpanel.bandwidthUsageGb / selectedAccountForCpanel.bandwidthQuotaGb) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Cloudflare Tunnel Status Badge for Tenant */}
                <div className="p-4 bg-slate-900 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Radio className="w-4 h-4" />
                    <span>Cloudflare Zero-Trust Ingress</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Situs klien ini dapat diakses oleh siapa saja di seluruh dunia tanpa perlu langganan hosting provider eksternal. Semua permintaan melewati edge Cloudflare dan diteruskan ke PC lokal.
                  </p>
                </div>
              </div>

              {/* Main Area: cPanel Classic Feature Groups (8 cols) */}
              <div className="lg:col-span-8 space-y-5 order-1 lg:order-2">
                {/* 1. Files Category */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-amber-400" />
                    <span>Files & Direktori (Terisolasi di /home/{selectedAccountForCpanel.username})</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                    <div 
                      onClick={() => setActiveSubModal('file_manager')}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-indigo-500/40 hover:bg-slate-800/40 cursor-pointer transition-colors active:scale-95"
                    >
                      <FolderTree className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-200">File Manager</div>
                      <div className="text-[10px] text-slate-500">public_html</div>
                    </div>
                    <div 
                      onClick={() => setActiveSubModal('disk_usage')}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-indigo-500/40 hover:bg-slate-800/40 cursor-pointer transition-colors active:scale-95"
                    >
                      <HardDrive className="w-6 h-6 text-cyan-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-200">Disk Usage</div>
                      <div className="text-[10px] text-slate-500">Breakdown</div>
                    </div>
                    <div 
                      onClick={() => setActiveSubModal('ftp_accounts')}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-indigo-500/40 hover:bg-slate-800/40 cursor-pointer transition-colors active:scale-95"
                    >
                      <Key className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-200">FTP Accounts</div>
                      <div className="text-[10px] text-slate-500">SFTP / FTPS</div>
                    </div>
                    <div 
                      onClick={() => setActiveSubModal('backup_wizard')}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-indigo-500/40 hover:bg-slate-800/40 cursor-pointer transition-colors active:scale-95"
                    >
                      <FileCode className="w-6 h-6 text-purple-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-200">Backup Wizard</div>
                      <div className="text-[10px] text-slate-500">Download .tar</div>
                    </div>
                  </div>
                </div>

                {/* 2. Databases Category */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <span>Basis Data Terpusat (Prefix: {selectedAccountForCpanel.username}_)</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                    <div 
                      onClick={() => setActiveSubModal('mysql_db')}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-indigo-500/40 hover:bg-slate-800/40 cursor-pointer transition-colors active:scale-95"
                    >
                      <Database className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-200">MySQL Database</div>
                      <div className="text-[10px] text-slate-500">Manage DBs</div>
                    </div>
                    <div 
                      onClick={() => {
                        setSelectedAccountForCpanel(null);
                        setActiveSubModal(null);
                        if (onNavigateTab) onNavigateTab('databases');
                        if (onShowToast) onShowToast('Membuka Manajemen Database Terpusat...', 'info');
                      }}
                      className="p-3 bg-slate-950/60 border border-amber-500/30 rounded-lg hover:bg-amber-500/10 cursor-pointer transition-colors active:scale-95"
                    >
                      <Layers className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-200">Database Studio</div>
                      <div className="text-[10px] text-amber-400 flex items-center justify-center gap-1">
                        <span>Buka Studio</span>
                      </div>
                    </div>
                    <div 
                      onClick={() => setActiveSubModal('mysql_users')}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-indigo-500/40 hover:bg-slate-800/40 cursor-pointer transition-colors active:scale-95"
                    >
                      <Users className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-200">MySQL Users</div>
                      <div className="text-[10px] text-slate-500">Privileges</div>
                    </div>
                    <div 
                      onClick={() => setActiveSubModal('remote_mysql')}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-indigo-500/40 hover:bg-slate-800/40 cursor-pointer transition-colors active:scale-95"
                    >
                      <Radio className="w-6 h-6 text-cyan-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-200">Remote MySQL</div>
                      <div className="text-[10px] text-slate-500">VPC Whitelist</div>
                    </div>
                  </div>
                </div>

                {/* 3. Software & 1-Click Installer (Softaculous style) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Instalasi Aplikasi Otomatis (Softaculous App Installer)</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                    <div 
                      onClick={() => {
                        setSelectedAccountForCpanel(null);
                        onOpenInstallerForAccount(selectedAccountForCpanel);
                      }}
                      className="p-3 bg-slate-950/60 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 cursor-pointer transition-colors active:scale-95"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-1 text-xs">
                        W
                      </div>
                      <div className="font-semibold text-white">WordPress</div>
                      <div className="text-[10px] text-indigo-400">Instal Cepat</div>
                    </div>

                    <div 
                      onClick={() => {
                        setSelectedAccountForCpanel(null);
                        onOpenInstallerForAccount(selectedAccountForCpanel);
                      }}
                      className="p-3 bg-slate-950/60 border border-red-500/30 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors active:scale-95"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center mx-auto mb-1 text-xs">
                        L
                      </div>
                      <div className="font-semibold text-white">Laravel 11</div>
                      <div className="text-[10px] text-red-400">PHP Framework</div>
                    </div>

                    <div 
                      onClick={() => setActiveSubModal('php_version')}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-indigo-500/40 hover:bg-slate-800/40 cursor-pointer transition-colors active:scale-95"
                    >
                      <Settings className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-200">PHP Version</div>
                      <div className="text-[10px] text-slate-500">PHP 8.5 / 8.3</div>
                    </div>

                    <div 
                      onClick={() => setActiveSubModal('ssl_status')}
                      className="p-3 bg-slate-950/60 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/10 cursor-pointer transition-colors active:scale-95"
                    >
                      <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-200">SSL Status</div>
                      <div className="text-[10px] text-emerald-400">Cloudflare Edge</div>
                    </div>
                  </div>
                </div>
              </div>
            {/* Sub-Modals for cPanel Actions */}
            {activeSubModal && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-5 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
                  <button 
                    onClick={() => setActiveSubModal(null)}
                    className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* 1. File Manager Modal */}
                  {activeSubModal === 'file_manager' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                        <FolderTree className="w-5 h-5 text-indigo-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">File Manager ({selectedAccountForCpanel.domain})</h3>
                          <p className="text-xs text-slate-400">Direktori: {selectedAccountForCpanel.homeDirectory}</p>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <p className="text-slate-300">Pilih mode akses manajer berkas:</p>
                        <div className="grid grid-cols-1 gap-2.5">
                          <button
                            onClick={() => {
                              window.open('/filemanager/index.php', '_blank');
                              onShowToast?.(`Membuka TinyFileManager (User: server / Pass: masbagus15)...`, 'info');
                            }}
                            className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-lg hover:bg-indigo-600/30 text-left transition-colors flex items-center justify-between"
                          >
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>Buka Web TinyFileManager GUI</span>
                                <ExternalLink className="w-3.5 h-3.5 text-indigo-300" />
                              </div>
                              <p className="text-[11px] text-indigo-200 mt-0.5">
                                Upload .zip, ekstrak otomatis, &amp; edit berkas lewat browser (/filemanager/index.php).
                              </p>
                              <div className="mt-1 text-[10px] text-slate-400 font-mono">
                                Login: <span className="text-emerald-400 font-bold">server</span> / <span className="text-emerald-400 font-bold">masbagus15</span>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAccountForCpanel(null);
                              setActiveSubModal(null);
                              if (onNavigateTab) onNavigateTab('files');
                              onShowToast?.(`Membuka Manajer Berkas terintegrasi...`, 'info');
                            }}
                            className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:bg-slate-800/60 text-left transition-colors flex items-center justify-between"
                          >
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>Buka File Manager Terintegrasi di Panel</span>
                                <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">Jelajahi berkas, buat file/folder, &amp; atur izin langsung di halaman panel ini.</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>

                          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
                            <div className="font-semibold text-white flex items-center justify-between">
                              <span>Akses Langsung dari Windows Explorer:</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText('\\\\wsl$\\Ubuntu\\var\\www\\html');
                                  setCopiedItem('winpath');
                                  setTimeout(() => setCopiedItem(null), 2000);
                                  onShowToast?.('Path Windows berhasil disalin!', 'success');
                                }}
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                {copiedItem === 'winpath' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedItem === 'winpath' ? 'Disalin' : 'Salin Path'}</span>
                              </button>
                            </div>
                            <code className="block p-1.5 bg-slate-900 rounded font-mono text-[11px] text-indigo-300 select-all">
                              \\wsl$\Ubuntu\var\www\html
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Disk Usage Modal */}
                  {activeSubModal === 'disk_usage' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                        <HardDrive className="w-5 h-5 text-cyan-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Rincian Penggunaan Disk</h3>
                          <p className="text-xs text-slate-400">Total: {selectedAccountForCpanel.diskUsageMb} MB / {selectedAccountForCpanel.diskQuotaMb} MB</p>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                          <span className="text-slate-300 font-mono">/public_html (Script & Asset)</span>
                          <span className="font-bold text-white font-mono">68.4 MB</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                          <span className="text-slate-300 font-mono">MySQL Databases ({selectedAccountForCpanel.username}_*)</span>
                          <span className="font-bold text-indigo-400 font-mono">14.2 MB</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                          <span className="text-slate-300 font-mono">Server Error & Access Logs</span>
                          <span className="font-bold text-amber-400 font-mono">2.1 MB</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                          <span className="text-slate-300 font-mono">Arsip Backup Lokal</span>
                          <span className="font-bold text-slate-400 font-mono">0.0 MB</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onShowToast?.('Cache temporary dan error logs telah dibersihkan!', 'success');
                          setActiveSubModal(null);
                        }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Bersihkan Cache & Log Sementara
                      </button>
                    </div>
                  )}

                  {/* 3. FTP Accounts Modal */}
                  {activeSubModal === 'ftp_accounts' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                        <Key className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Akun SFTP / FTP Client</h3>
                          <p className="text-xs text-slate-400">Gunakan di FileZilla, WinSCP, atau VS Code Remote</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Host:</span>
                          <span className="text-white font-bold">server.denbagoes.my.id (atau 127.0.0.1)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Protokol:</span>
                          <span className="text-emerald-400 font-bold">SFTP (SSH File Transfer)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Port:</span>
                          <span className="text-cyan-400 font-bold">22 (SFTP) / 21 (FTP)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Username:</span>
                          <span className="text-indigo-400 font-bold">{selectedAccountForCpanel.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Direktori Awal:</span>
                          <span className="text-slate-300">{selectedAccountForCpanel.homeDirectory}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`sftp://${selectedAccountForCpanel.username}@server.denbagoes.my.id:22`);
                          onShowToast?.('URL Koneksi SFTP disalin ke clipboard!', 'success');
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Konfigurasi Cepat FileZilla</span>
                      </button>
                    </div>
                  )}

                  {/* 4. Backup Wizard Modal */}
                  {activeSubModal === 'backup_wizard' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                        <FileCode className="w-5 h-5 text-purple-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Wizard Pencadangan (Backup)</h3>
                          <p className="text-xs text-slate-400">Unduh snapshot lengkap website dan basis data</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 text-xs">
                        <button
                          onClick={() => {
                            onShowToast?.(`Memulai pembuatan arsip ${selectedAccountForCpanel.username}_full.tar.gz...`, 'info');
                            setTimeout(() => {
                              onShowToast?.('Snapshot backup berhasil disimpan di server!', 'success');
                              setActiveSubModal(null);
                            }, 1200);
                          }}
                          className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-lg hover:bg-purple-600/30 text-left transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <Download className="w-3.5 h-3.5 text-purple-400" />
                              <span>Unduh Cadangan Penuh (.tar.gz)</span>
                            </div>
                            <p className="text-[11px] text-purple-200 mt-0.5">Mencakup seluruh file /public_html dan dump database MySQL.</p>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            onShowToast?.(`Dump database ${selectedAccountForCpanel.username}_db.sql.gz berhasil dibuat!`, 'success');
                            setActiveSubModal(null);
                          }}
                          className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg hover:bg-slate-800 text-left transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-white">Cadangkan Database MySQL Saja (.sql)</div>
                            <p className="text-[11px] text-slate-400 mt-0.5">Ekspor instan seluruh tabel MySQL akun ini.</p>
                          </div>
                          <Database className="w-4 h-4 text-indigo-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 5. MySQL Database Modal */}
                  {activeSubModal === 'mysql_db' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                        <Database className="w-5 h-5 text-indigo-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Kelola Basis Data ({selectedAccountForCpanel.username}_)</h3>
                          <p className="text-xs text-slate-400">Prefix akun otomatis terisolasi</p>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-slate-300 font-medium">Buat Database Baru:</label>
                          <div className="flex gap-2">
                            <span className="px-2.5 py-1.5 bg-slate-800 text-indigo-300 font-mono rounded-lg border border-slate-700 flex items-center text-xs">
                              {selectedAccountForCpanel.username}_
                            </span>
                            <input
                              type="text"
                              value={newSubDbName}
                              onChange={(e) => setNewSubDbName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                              placeholder="nama_db"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!newSubDbName.trim()) return;
                                const fullDb = `${selectedAccountForCpanel.username}_${newSubDbName.trim()}`;
                                setSubDatabases(prev => [...prev, fullDb]);
                                setNewSubDbName('');
                                onShowToast?.(`Database '${fullDb}' berhasil dibuat di MariaDB!`, 'success');
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
                            >
                              Buat
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-slate-800">
                          <label className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Database Aktif:</label>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto">
                            {subDatabases.map((db) => (
                              <div key={db} className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
                                <span className="text-indigo-300 font-semibold">{db}</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedAccountForCpanel(null);
                                      setActiveSubModal(null);
                                      if (onNavigateTab) onNavigateTab('databases');
                                      onShowToast?.(`Membuka Manajemen Database Terpusat...`, 'info');
                                    }}
                                    className="px-2 py-0.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded text-[10px]"
                                  >
                                    Database Studio
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSubDatabases(prev => prev.filter(d => d !== db));
                                      onShowToast?.(`Database '${db}' telah dihapus.`, 'warning');
                                    }}
                                    className="p-1 text-slate-500 hover:text-red-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. MySQL Users Modal */}
                  {activeSubModal === 'mysql_users' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                        <Users className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Pengguna Database ({selectedAccountForCpanel.username}_)</h3>
                          <p className="text-xs text-slate-400">Atur hak akses GRANT ALL PRIVILEGES</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-bold">{selectedAccountForCpanel.username}_admin</span>
                          <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ALL PRIVILEGES</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          Host Akses: <strong className="text-slate-200 font-mono">localhost</strong> (Koneksi lokal soket cepat)
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onShowToast?.('Pengguna database disinkronkan ke MariaDB.', 'success');
                          setActiveSubModal(null);
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Simpan Perubahan Hak Akses
                      </button>
                    </div>
                  )}

                  {/* 7. Remote MySQL Modal */}
                  {activeSubModal === 'remote_mysql' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                        <Radio className="w-5 h-5 text-cyan-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Remote MySQL (Whitelist IP)</h3>
                          <p className="text-xs text-slate-400">Izinkan server lain mengakses basis data ini</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newRemoteIp}
                            onChange={(e) => setNewRemoteIp(e.target.value)}
                            placeholder="Contoh: 103.24.12.5 atau % (semua)"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              if (!newRemoteIp.trim()) return;
                              setRemoteIpWhitelist(prev => [...prev, newRemoteIp.trim()]);
                              setNewRemoteIp('');
                              onShowToast?.('IP remote berhasil ditambahkan ke whitelist!', 'success');
                            }}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg"
                          >
                            Tambah IP
                          </button>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          {remoteIpWhitelist.map((ip) => (
                            <div key={ip} className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between font-mono text-slate-300">
                              <span>{ip}</span>
                              <button
                                onClick={() => setRemoteIpWhitelist(prev => prev.filter(i => i !== ip))}
                                className="text-slate-500 hover:text-red-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. PHP Version Selector */}
                  {activeSubModal === 'php_version' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                        <Settings className="w-5 h-5 text-indigo-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Pilih Versi PHP FPM</h3>
                          <p className="text-xs text-slate-400">Virtual host: {selectedAccountForCpanel.domain}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        {['PHP 8.5-FPM (Aktif Terpasang di Ubuntu)', 'PHP 8.3-FPM (Standard)', 'PHP 8.2-FPM (Legacy Compatible)', 'PHP 8.1-FPM'].map((ver) => (
                          <label
                            key={ver}
                            onClick={() => setSelectedPhpVersion(ver)}
                            className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                              selectedPhpVersion.startsWith(ver.slice(0, 7))
                                ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="font-mono font-medium">{ver}</span>
                            {selectedPhpVersion.startsWith(ver.slice(0, 7)) && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                          </label>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          onShowToast?.(`Konfigurasi Nginx FastCGI dimutakhirkan ke ${selectedPhpVersion}.`, 'success');
                          setActiveSubModal(null);
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Terapkan Versi PHP
                      </button>
                    </div>
                  )}

                  {/* 9. SSL Status Modal */}
                  {activeSubModal === 'ssl_status' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Status Sertifikat SSL / HTTPS</h3>
                          <p className="text-xs text-slate-400">Proteksi Edge Cloudflare Zero Trust</p>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Sertifikat SSL Aktif & Valid (Gembok Hijau)</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Domain <strong>{selectedAccountForCpanel.domain}</strong> dilindungi dengan enkripsi TLS 1.3 otomatis dari Cloudflare. Tidak perlu perpanjangan manual!
                        </p>
                      </div>

                      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Issuer:</span>
                          <span className="text-white">Cloudflare Origin CA / Google Trust Services</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Auto-Renew:</span>
                          <span className="text-emerald-400">Otomatis Selamanya</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Force HTTPS:</span>
                          <span className="text-indigo-400">Aktif (Port 80 ➡️ 443)</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveSubModal(null)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Tutup
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
