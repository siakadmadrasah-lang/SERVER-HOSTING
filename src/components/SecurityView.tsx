import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Globe, 
  Key, 
  Radio,
  Sparkles,
  RefreshCw,
  FileText,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { Language, Website } from '../types';

interface FirewallRule {
  id: string;
  port: string;
  protocol: 'TCP' | 'UDP' | 'BOTH';
  action: 'ALLOW' | 'DENY';
  source: string;
  comment: string;
}

const INITIAL_FIREWALL_RULES: FirewallRule[] = [
  { id: 'fw-1', port: '80', protocol: 'TCP', action: 'ALLOW', source: 'Anywhere', comment: 'HTTP Web Traffic' },
  { id: 'fw-2', port: '443', protocol: 'TCP', action: 'ALLOW', source: 'Anywhere', comment: 'HTTPS Secure Traffic' },
  { id: 'fw-3', port: '22', protocol: 'TCP', action: 'ALLOW', source: '180.248.0.0/16 (Office VPN)', comment: 'SSH Administration' },
  { id: 'fw-4', port: '3306', protocol: 'TCP', action: 'ALLOW', source: '10.240.0.0/16 (Internal VPC)', comment: 'MySQL Centralized Cluster' },
  { id: 'fw-5', port: '5432', protocol: 'TCP', action: 'ALLOW', source: '10.240.0.0/16 (Internal VPC)', comment: 'PostgreSQL Relational Port' },
  { id: 'fw-6', port: '6379', protocol: 'TCP', action: 'DENY', source: 'Anywhere', comment: 'Redis In-Memory Protection' }
];

interface SecurityViewProps {
  websites: Website[];
  currentLang: Language;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  websites,
  currentLang
}) => {
  const [activeTab, setActiveTab] = useState<'firewall' | 'ssl'>('firewall');
  const [rules, setRules] = useState<FirewallRule[]>(INITIAL_FIREWALL_RULES);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState<boolean>(false);
  const [newPort, setNewPort] = useState<string>('');
  const [newProtocol, setNewProtocol] = useState<'TCP' | 'UDP' | 'BOTH'>('TCP');
  const [newAction, setNewAction] = useState<'ALLOW' | 'DENY'>('ALLOW');
  const [newSource, setNewSource] = useState<string>('Anywhere');
  const [newComment, setNewComment] = useState<string>('');

  // SSL State
  const [issuingSslSiteId, setIssuingSslSiteId] = useState<string | null>(null);
  const [isCustomSslModalOpen, setIsCustomSslModalOpen] = useState<boolean>(false);
  const [selectedSslDomain, setSelectedSslDomain] = useState<string>(websites[0]?.domain || '');
  const [sslCertText, setSslCertText] = useState<string>('');
  const [sslKeyText, setSslKeyText] = useState<string>('');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPort.trim()) return;

    setRules(prev => [
      ...prev,
      {
        id: `fw-${Date.now()}`,
        port: newPort.trim(),
        protocol: newProtocol,
        action: newAction,
        source: newSource.trim(),
        comment: newComment.trim() || 'Custom Rule'
      }
    ]);

    setNewPort('');
    setNewComment('');
    setIsAddRuleOpen(false);
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleIssueLetsEncrypt = (domain: string, id: string) => {
    setIssuingSslSiteId(id);
    setTimeout(() => {
      setIssuingSslSiteId(null);
      alert(`Sertifikat SSL Let's Encrypt untuk ${domain} berhasil diterbitkan dan diaktifkan dengan TLS 1.3!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Perlindungan Server</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-400 font-mono">Security &amp; SSL Center</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Keamanan Server, Firewall &amp; Sertifikat SSL</span>
            <ShieldCheck className="w-5 h-5 text-sky-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Konfigurasi whitelist port firewall UFW, proteksi intrusi Fail2ban, dan penerbitan otomatis sertifikat SSL Let's Encrypt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'firewall' ? (
            <button
              onClick={() => setIsAddRuleOpen(true)}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Aturan Firewall</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCustomSslModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <Key className="w-3.5 h-3.5" />
              <span>+ Pasang Custom SSL</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('firewall')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'firewall'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Firewall UFW &amp; Fail2ban</span>
        </button>

        <button
          onClick={() => setActiveTab('ssl')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'ssl'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Sertifikat SSL / TLS ({websites.filter(w => w.sslEnabled).length} Aktif)</span>
        </button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-white">Status UFW Firewall</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            ● AKTIF (ENFORCED)
          </div>
          <p className="text-[11px] text-slate-400">
            Default Inbound: REJECT · Outbound: ALLOW
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-white">Fail2ban Intrusion Guard</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            14 IP Diblokir
          </div>
          <p className="text-[11px] text-slate-400">
            Jail: sshd (max 3 percobaan) &amp; nginx-wp-login
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-white">Auto SSL Let's Encrypt</span>
            <Globe className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {websites.filter(w => w.sslEnabled).length} Sertifikat Terpasang
          </div>
          <p className="text-[11px] text-slate-400">
            Perpanjangan otomatis via cron certbot renew
          </p>
        </div>
      </div>

      {/* TAB 1: Firewall Rules */}
      {activeTab === 'firewall' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Daftar Aturan Firewall (UFW Rules)
            </h3>
            <span className="text-xs text-slate-400 font-mono">{rules.length} aturan aktif</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Port</th>
                  <th className="px-4 py-3">Protokol</th>
                  <th className="px-4 py-3">Aksi</th>
                  <th className="px-4 py-3">Sumber IP</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white font-mono">
                      {rule.port}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300 text-[11px]">
                      {rule.protocol}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        rule.action === 'ALLOW' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {rule.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300 text-[11px]">
                      {rule.source}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {rule.comment}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        title="Hapus Aturan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SSL / TLS Certificate Manager */}
      {activeTab === 'ssl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4">
          <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Manajer Sertifikat SSL / TLS &amp; Let's Encrypt ACME</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Penerbitan otomatis sertifikat HTTPS gratis via Certbot, perpanjangan otomatis, dan pemaksaan HTTPS 301.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              TLS 1.3 Strict Mode
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Nama Domain</th>
                  <th className="px-4 py-3">Status SSL</th>
                  <th className="px-4 py-3">Penerbit (Issuer)</th>
                  <th className="px-4 py-3">Masa Berlaku</th>
                  <th className="px-4 py-3">Force HTTPS</th>
                  <th className="px-4 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {websites.map((site) => (
                  <tr key={site.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white font-mono">
                      {site.domain}
                    </td>
                    <td className="px-4 py-3">
                      {site.sslEnabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Aktif (Valid)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Belum Terpasang</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                      {site.sslEnabled ? "Let's Encrypt Authority X3" : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] font-mono">
                      {site.sslEnabled ? "82 hari tersisa (Auto-Renew)" : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        301 Redirect: ON
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleIssueLetsEncrypt(site.domain, site.id)}
                        disabled={issuingSslSiteId === site.id}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-semibold transition-colors shadow-sm inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3 h-3 ${issuingSslSiteId === site.id ? 'animate-spin' : ''}`} />
                        <span>{issuingSslSiteId === site.id ? 'Menerbitkan...' : 'Perbarui SSL'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Firewall Rule */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddRule} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Tambah Aturan Firewall UFW</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Port</label>
              <input
                type="text"
                required
                placeholder="misal: 8080 atau 9000:9050"
                value={newPort}
                onChange={(e) => setNewPort(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Protokol</label>
                <select
                  value={newProtocol}
                  onChange={(e) => setNewProtocol(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="BOTH">TCP & UDP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Aksi</label>
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="ALLOW">ALLOW (Izinkan)</option>
                  <option value="DENY">DENY (Tolak)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sumber IP / Subnet Whitelist</label>
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="Anywhere atau 10.240.0.0/16"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Keterangan Aturan</label>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="misal: API Microservice Gateway"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddRuleOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs text-white bg-sky-600 hover:bg-sky-500 rounded-lg font-semibold"
              >
                Terapkan Aturan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Custom SSL */}
      {isCustomSslModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">Pasang Sertifikat SSL Kustom</h3>
              <button onClick={() => setIsCustomSslModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Domain Target</label>
              <select
                value={selectedSslDomain}
                onChange={(e) => setSelectedSslDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
              >
                {websites.map(w => (
                  <option key={w.id} value={w.domain}>{w.domain}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sertifikat SSL (CRT / PEM)</label>
              <textarea
                rows={4}
                value={sslCertText}
                onChange={(e) => setSslCertText(e.target.value)}
                placeholder="-----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kunci Privat (Private Key)</label>
              <textarea
                rows={4}
                value={sslKeyText}
                onChange={(e) => setSslKeyText(e.target.value)}
                placeholder="-----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY-----"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-300 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCustomSslModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  alert(`Sertifikat SSL kustom untuk ${selectedSslDomain} berhasil diinstal dan dipasang di Nginx.`);
                  setIsCustomSslModalOpen(false);
                }}
                className="px-4 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold"
              >
                Simpan &amp; Pasang SSL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
