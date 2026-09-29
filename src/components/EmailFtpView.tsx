import React, { useState, useEffect } from 'react';
import {
  Mail,
  FolderKanban,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Lock,
  Copy,
  Check,
  Send,
  ArrowRight,
  KeyRound,
  FileWarning,
  X
} from 'lucide-react';
import { Website, CurrentSessionUser } from '../types';

interface EmailFtpViewProps {
  websites: Website[];
  currentUser: CurrentSessionUser;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

interface EmailAccount {
  id: string;
  email: string;
  quotaMb: number | 'unlimited';
  usedMb: number;
  status: 'active' | 'suspended';
  createdAt: string;
}

interface EmailForwarder {
  id: string;
  sourceEmail: string;
  destinationEmail: string;
  keepCopy: boolean;
}

interface FtpAccount {
  id: string;
  username: string;
  directory: string;
  quotaMb: number | 'unlimited';
  port: number;
  createdAt: string;
}

const INITIAL_EMAIL_ACCOUNTS: EmailAccount[] = [
  {
    id: 'mail-1',
    email: 'admin@denbagoes.my.id',
    quotaMb: 'unlimited',
    usedMb: 124,
    status: 'active',
    createdAt: '2026-09-01'
  },
  {
    id: 'mail-2',
    email: 'operator.rdm@denbagoes.my.id',
    quotaMb: 2048,
    usedMb: 48,
    status: 'active',
    createdAt: '2026-09-10'
  },
  {
    id: 'mail-3',
    email: 'ppdb@denbagoes.my.id',
    quotaMb: 1024,
    usedMb: 15,
    status: 'active',
    createdAt: '2026-09-15'
  }
];

const INITIAL_FORWARDERS: EmailForwarder[] = [
  {
    id: 'fwd-1',
    sourceEmail: 'admin@denbagoes.my.id',
    destinationEmail: 'siakadmadrasahku@gmail.com',
    keepCopy: true
  }
];

const INITIAL_FTP_ACCOUNTS: FtpAccount[] = [
  {
    id: 'ftp-1',
    username: 'denbaguse@denbagoes.my.id',
    directory: '/var/www/html',
    quotaMb: 'unlimited',
    port: 21,
    createdAt: '2026-09-01'
  },
  {
    id: 'ftp-2',
    username: 'dev_siakad@denbagoes.my.id',
    directory: '/var/www/html/siakad',
    quotaMb: 5000,
    port: 21,
    createdAt: '2026-09-12'
  },
  {
    id: 'ftp-3',
    username: 'operator_rdm@denbagoes.my.id',
    directory: '/var/www/html/rdm',
    quotaMb: 2000,
    port: 21,
    createdAt: '2026-09-18'
  }
];

export const EmailFtpView: React.FC<EmailFtpViewProps> = ({
  websites,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'emails' | 'forwarders' | 'ftp' | 'cpanel_tools'>('emails');

  // Email Accounts State
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>(() => {
    try {
      const saved = localStorage.getItem('cloudpro_email_accounts_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_EMAIL_ACCOUNTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cloudpro_email_accounts_v1', JSON.stringify(emailAccounts));
    } catch {
      // ignore
    }
  }, [emailAccounts]);

  const [newMailUser, setNewMailUser] = useState<string>('');
  const [newMailDomain, setNewMailDomain] = useState<string>(websites[0]?.domain || 'denbagoes.my.id');
  const [newMailPass, setNewMailPass] = useState<string>('');
  const [newMailQuota, setNewMailQuota] = useState<string>('2048');
  const [webmailModalAccount, setWebmailModalAccount] = useState<string | null>(null);
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Forwarders State
  const [forwarders, setForwarders] = useState<EmailForwarder[]>(INITIAL_FORWARDERS);
  const [fwdSource, setFwdSource] = useState<string>('');
  const [fwdDest, setFwdDest] = useState<string>('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState<boolean>(true);
  const [autoReplyMessage, setAutoReplyMessage] = useState<string>(
    'Terima kasih telah menghubungi Layanan Akademik & Server Cloud PRO. Pesan Anda telah kami terima dan akan segera ditindaklanjuti oleh tim operator.'
  );

  // FTP Accounts State
  const [ftpAccounts, setFtpAccounts] = useState<FtpAccount[]>(() => {
    try {
      const saved = localStorage.getItem('cloudpro_ftp_accounts_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_FTP_ACCOUNTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cloudpro_ftp_accounts_v1', JSON.stringify(ftpAccounts));
    } catch {
      // ignore
    }
  }, [ftpAccounts]);

  const [newFtpUser, setNewFtpUser] = useState<string>('');
  const [newFtpPass, setNewFtpPass] = useState<string>('');
  const [newFtpDir, setNewFtpDir] = useState<string>('/var/www/html/public_html');
  const [newFtpQuota, setNewFtpQuota] = useState<string>('unlimited');

  // Advanced cPanel Tools State
  const [hotlinkProtected, setHotlinkProtected] = useState<boolean>(true);
  const [dirPrivacyEnabled, setDirPrivacyEnabled] = useState<boolean>(true);
  const [blockedIps, setBlockedIps] = useState<string[]>(['185.220.101.44', '45.155.205.233']);
  const [newBlockedIp, setNewBlockedIp] = useState<string>('');
  const [error404Html, setError404Html] = useState<string>(
    '<h1>404 - Halaman Tidak Ditemukan</h1><p>Maaf, berkas atau halaman yang Anda cari di Server Cloud PRO tidak tersedia.</p>'
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onShowToast) onShowToast('Berhasil disalin ke clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newMailUser.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (!cleanUser || !newMailPass.trim()) {
      if (onShowToast) onShowToast('Harap lengkapi username email dan password.', 'warning');
      return;
    }

    const fullEmail = `${cleanUser}@${newMailDomain}`;
    const item: EmailAccount = {
      id: `mail-${Date.now()}`,
      email: fullEmail,
      quotaMb: newMailQuota === 'unlimited' ? 'unlimited' : Number(newMailQuota),
      usedMb: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setEmailAccounts(prev => [item, ...prev]);
    setNewMailUser('');
    setNewMailPass('');
    if (onShowToast) {
      onShowToast(`Akun email ${fullEmail} (Postfix + Dovecot IMAPS) berhasil dibuat!`, 'success');
    }
  };

  const handleDeleteEmail = (id: string, email: string) => {
    setEmailAccounts(prev => prev.filter(m => m.id !== id));
    if (onShowToast) onShowToast(`Akun email ${email} berhasil dihapus.`, 'info');
  };

  const handleCreateForwarder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fwdSource.trim() || !fwdDest.trim()) return;
    setForwarders(prev => [
      {
        id: `fwd-${Date.now()}`,
        sourceEmail: fwdSource.includes('@') ? fwdSource.trim() : `${fwdSource.trim()}@denbagoes.my.id`,
        destinationEmail: fwdDest.trim(),
        keepCopy: true
      },
      ...prev
    ]);
    setFwdSource('');
    setFwdDest('');
    if (onShowToast) onShowToast('Aturan Email Forwarder berhasil ditambahkan!', 'success');
  };

  const handleCreateFtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFtp = newFtpUser.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (!cleanFtp || !newFtpPass.trim()) {
      if (onShowToast) onShowToast('Harap isi Username FTP dan Password.', 'warning');
      return;
    }

    const fullFtpUser = `${cleanFtp}@denbagoes.my.id`;
    const item: FtpAccount = {
      id: `ftp-${Date.now()}`,
      username: fullFtpUser,
      directory: newFtpDir.trim() || `/var/www/html/${cleanFtp}`,
      quotaMb: newFtpQuota === 'unlimited' ? 'unlimited' : Number(newFtpQuota),
      port: 21,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setFtpAccounts(prev => [item, ...prev]);
    setNewFtpUser('');
    setNewFtpPass('');
    if (onShowToast) {
      onShowToast(`Akun FTP ${fullFtpUser} (${item.directory}) berhasil dibuat di Pure-FTPd!`, 'success');
    }
  };

  const handleSendWebmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;
    if (onShowToast) {
      onShowToast(`Email dari ${webmailModalAccount} berhasil dikirim ke ${composeTo} via Postfix TLS!`, 'success');
    }
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setWebmailModalAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Berkas, Email &amp; Fitur Lanjutan CloudPanel</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-400 font-mono font-semibold">Mail Server, FTP &amp; Directory Tools</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Manajemen Email Domain, Roundcube Webmail, Akun FTP &amp; Fitur CloudPanel</span>
            <Mail className="w-5 h-5 text-sky-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola kotak surat email resmi (@domain), Webmail Roundcube, Email Forwarder, Akun FTP (Pure-FTPd), Hotlink Protection, dan Directory Privacy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Postfix + Dovecot + Pure-FTPd Aktif</span>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto touch-scroll">
        <button
          type="button"
          onClick={() => setActiveSubTab('emails')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'emails'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Akun Email &amp; Webmail ({emailAccounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('forwarders')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'forwarders'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Forwarders &amp; Autoresponder</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ftp')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ftp'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>Akun FTP Server ({ftpAccounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('cpanel_tools')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'cpanel_tools'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Proteksi Folder, Hotlink, IP Blocker &amp; Error Pages</span>
        </button>
      </div>

      {/* =====================================================================
       * SUBTAB 1: EMAIL ACCOUNTS & ROUNDCUBE WEBMAIL
       * ===================================================================== */}
      {activeSubTab === 'emails' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateEmail} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-400" />
              <span>Buat Akun Email Resmi Baru</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs items-end">
              <div className="lg:col-span-3 space-y-1">
                <label className="block font-semibold text-slate-300">Username Email</label>
                <input
                  type="text"
                  value={newMailUser}
                  onChange={(e) => setNewMailUser(e.target.value)}
                  placeholder="info / kepala / keuangan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="lg:col-span-3 space-y-1">
                <label className="block font-semibold text-slate-300">Domain</label>
                <select
                  value={newMailDomain}
                  onChange={(e) => setNewMailDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                >
                  <option value="denbagoes.my.id">@denbagoes.my.id</option>
                  <option value="server.denbagoes.my.id">@server.denbagoes.my.id</option>
                  {websites.map(w => (
                    <option key={w.id} value={w.domain}>@{w.domain}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 space-y-1">
                <label className="block font-semibold text-slate-300">Password</label>
                <input
                  type="password"
                  value={newMailPass}
                  onChange={(e) => setNewMailPass(e.target.value)}
                  placeholder="Password email"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="lg:col-span-2 space-y-1">
                <label className="block font-semibold text-slate-300">Kuota Penyimpanan</label>
                <select
                  value={newMailQuota}
                  onChange={(e) => setNewMailQuota(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                >
                  <option value="1024">1024 MB (1 GB)</option>
                  <option value="2048">2048 MB (2 GB)</option>
                  <option value="5120">5120 MB (5 GB)</option>
                  <option value="unlimited">Unlimited (Tanpa Batas)</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Email</span>
                </button>
              </div>
            </div>
          </form>

          {/* Email Accounts Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Daftar Kotak Surat Email Aktif ({emailAccounts.length})
              </h3>
              <span className="text-[11px] font-mono text-sky-400">
                IMAP: 993 (SSL) · SMTP: 465 (SSL)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Alamat Email</th>
                    <th className="px-4 py-3">Pemakaian / Kuota</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Webmail &amp; Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {emailAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {acc.email}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {acc.usedMb} MB / {acc.quotaMb === 'unlimited' ? '∞ Unlimited' : `${acc.quotaMb} MB`}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setWebmailModalAccount(acc.email)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka Webmail</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmail(acc.id, acc.email)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                            title="Hapus Email"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 2: FORWARDERS & AUTORESPONDER
       * ===================================================================== */}
      {activeSubTab === 'forwarders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white">
              Penerusan Email Otomatis (CloudPanel Email Forwarders)
            </h3>
            <p className="text-xs text-slate-400">
              Teruskan setiap email yang masuk ke domain server langsung ke akun Gmail/pribadi Anda.
            </p>

            <form onSubmit={handleCreateForwarder} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
              <input
                type="text"
                value={fwdSource}
                onChange={(e) => setFwdSource(e.target.value)}
                placeholder="Asal (misal: info@denbagoes.my.id)"
                className="sm:col-span-5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
              <input
                type="email"
                value={fwdDest}
                onChange={(e) => setFwdDest(e.target.value)}
                placeholder="Tujuan (misal: emailanda@gmail.com)"
                className="sm:col-span-5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
              <button
                type="submit"
                className="sm:col-span-2 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold cursor-pointer"
              >
                + Tambah
              </button>
            </form>

            <div className="divide-y divide-slate-800 pt-2">
              {forwarders.map((f) => (
                <div key={f.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="font-mono flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold">{f.sourceEmail}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-emerald-400 font-semibold">{f.destinationEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForwarders(prev => prev.filter(x => x.id !== f.id))}
                    className="text-rose-400 hover:underline text-[11px] cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Autoresponder (Balasan Otomatis)</h3>
              <button
                type="button"
                onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                className="text-xs font-mono font-bold text-emerald-400 cursor-pointer"
              >
                {autoReplyEnabled ? 'AKTIF ✓' : 'NONAKTIF'}
              </button>
            </div>
            <textarea
              rows={5}
              value={autoReplyMessage}
              onChange={(e) => setAutoReplyMessage(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed"
            />
            <button
              type="button"
              onClick={() => {
                if (onShowToast) onShowToast('Pesan Autoresponder berhasil disimpan!', 'success');
              }}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Simpan Autoresponder
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 3: FTP ACCOUNTS MANAGER (PURE-FTPD / VSFTPD)
       * ===================================================================== */}
      {activeSubTab === 'ftp' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateFtp} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-sky-400" />
              <span>Buat Akun FTP Baru (Mendukung FileZilla, WinSCP &amp; Cyberduck)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs items-end">
              <div className="lg:col-span-3 space-y-1">
                <label className="block font-semibold text-slate-300">Username FTP</label>
                <input
                  type="text"
                  value={newFtpUser}
                  onChange={(e) => {
                    setNewFtpUser(e.target.value);
                    setNewFtpDir(`/var/www/html/${e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`);
                  }}
                  placeholder="developer_web"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="lg:col-span-3 space-y-1">
                <label className="block font-semibold text-slate-300">Password FTP</label>
                <input
                  type="password"
                  value={newFtpPass}
                  onChange={(e) => setNewFtpPass(e.target.value)}
                  placeholder="Password FTP"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="lg:col-span-4 space-y-1">
                <label className="block font-semibold text-slate-300">Direktori Akses (Home Folder)</label>
                <input
                  type="text"
                  value={newFtpDir}
                  onChange={(e) => setNewFtpDir(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sky-300 font-mono"
                />
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Akun FTP</span>
                </button>
              </div>
            </div>
          </form>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Daftar Akun FTP Terdaftar ({ftpAccounts.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Host FTP: ftp.denbagoes.my.id · Port 21 (Explicit TLS)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Login FTP</th>
                    <th className="px-4 py-3">Direktori Path</th>
                    <th className="px-4 py-3">Kuota</th>
                    <th className="px-4 py-3 text-right">Konfigurasi Klien</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {ftpAccounts.map((ftp) => (
                    <tr key={ftp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {ftp.username}
                      </td>
                      <td className="px-4 py-3 font-mono text-sky-400">
                        {ftp.directory}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {ftp.quotaMb === 'unlimited' ? '∞ Unlimited' : `${ftp.quotaMb} MB`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(`Host: ftp.denbagoes.my.id | User: ${ftp.username} | Port: 21`, ftp.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === ftp.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>Salin Koneksi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFtpAccounts(prev => prev.filter(x => x.id !== ftp.id))}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 4: ADVANCED CPANEL TOOLS (DIRECTORY PRIVACY, HOTLINK, IP BLOCKER, ERROR PAGES)
       * ===================================================================== */}
      {activeSubTab === 'cpanel_tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Directory Privacy (.htpasswd) */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Directory Privacy (Password Protect Folder)</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDirPrivacyEnabled(!dirPrivacyEnabled);
                  if (onShowToast) onShowToast(`Proteksi password folder /admin ${!dirPrivacyEnabled ? 'diaktifkan' : 'dinonaktifkan'}.`, 'info');
                }}
                className="font-mono font-bold text-emerald-400 cursor-pointer"
              >
                {dirPrivacyEnabled ? 'AKTIF (.htpasswd)' : 'NONAKTIF'}
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Kunci direktori sensitif (seperti <code className="font-mono text-sky-400">/var/www/html/admin</code> atau <code className="font-mono text-sky-400">/backup</code>) dengan autentikasi HTTP Basic sebelum halaman web dibuka.
            </p>
          </div>

          {/* Hotlink Protection */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Hotlink Protection (Anti Pencurian Bandwidth)</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHotlinkProtected(!hotlinkProtected);
                  if (onShowToast) onShowToast(`Hotlink Protection ${!hotlinkProtected ? 'diaktifkan' : 'dinonaktifkan'}.`, 'info');
                }}
                className="font-mono font-bold text-emerald-400 cursor-pointer"
              >
                {hotlinkProtected ? 'AKTIF ✓' : 'NONAKTIF'}
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Mencegah website lain menautkan langsung gambar/PDF/video (<code className="font-mono text-sky-400">jpg, png, pdf, mp4, zip</code>) dari server Anda sehingga hemat bandwidth.
            </p>
          </div>

          {/* IP Blocker */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>CloudPanel IP Blocker (Blokir IP Mencurigakan)</span>
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBlockedIp}
                onChange={(e) => setNewBlockedIp(e.target.value)}
                placeholder="Masukkan IP atau CIDR (misal: 103.22.11.9)"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newBlockedIp.trim()) return;
                  setBlockedIps(prev => [newBlockedIp.trim(), ...prev]);
                  setNewBlockedIp('');
                  if (onShowToast) onShowToast('Alamat IP berhasil ditambahkan ke daftar blokir!', 'success');
                }}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold cursor-pointer"
              >
                Blokir IP
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {blockedIps.map((ip) => (
                <span key={ip} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md font-mono text-slate-300 flex items-center gap-1.5">
                  <span>{ip}</span>
                  <button
                    type="button"
                    onClick={() => setBlockedIps(prev => prev.filter(x => x !== ip))}
                    className="text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Custom Error Pages */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-amber-400" />
                <span>Custom Error Pages (403 / 404 / 500)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (onShowToast) onShowToast('Halaman Error Kustom 404/500 berhasil disimpan ke konfigurasi Nginx!', 'success');
                }}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-md font-bold cursor-pointer"
              >
                Simpan HTML
              </button>
            </div>
            <textarea
              rows={3}
              value={error404Html}
              onChange={(e) => setError404Html(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-sky-300"
            />
          </div>
        </div>
      )}

      {/* Roundcube Webmail Composer Modal */}
      {webmailModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">
                  Roundcube Webmail — {webmailModalAccount}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWebmailModalAccount(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendWebmail} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kepada (To)</label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="tujuan@gmail.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subjek</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Informasi Resmi Server Cloud PRO"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Isi Pesan</label>
                <textarea
                  rows={4}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Tulis pesan email Anda..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWebmailModalAccount(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Email Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
