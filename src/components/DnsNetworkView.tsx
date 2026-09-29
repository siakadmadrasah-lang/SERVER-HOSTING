import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Activity, 
  Server, 
  Plus,
  Trash2,
  Save,
  Copy,
  Check,
  Mail,
  ArrowRight,
  Sliders,
  Layers,
  ExternalLink,
  Key,
  RotateCcw
} from 'lucide-react';
import { Language } from '../types';

interface DnsNetworkViewProps {
  currentLang: Language;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA';

interface DnsZoneRecord {
  id: string;
  name: string;
  ttl: number;
  type: DnsRecordType;
  priority?: number;
  value: string;
  proxied?: boolean;
}

interface SubdomainEntry {
  id: string;
  subdomain: string;
  rootDomain: string;
  documentRoot: string;
  sslActive: boolean;
  redirectUrl?: string;
  redirectType?: '301' | '302' | 'none';
  createdAt: string;
}

interface DnsRecordResult {
  node: string;
  location: string;
  ip: string;
  status: 'propagated' | 'resolving' | 'mismatch';
  latencyMs: number;
}

const DEFAULT_ZONE_RECORDS: DnsZoneRecord[] = [
  { id: 'rec-1', name: 'denbagoes.my.id.', ttl: 14400, type: 'A', value: '104.21.48.91', proxied: true },
  { id: 'rec-2', name: 'server.denbagoes.my.id.', ttl: 14400, type: 'A', value: '104.21.48.91', proxied: true },
  { id: 'rec-3', name: 'ns1.denbagoes.my.id.', ttl: 86400, type: 'A', value: '104.21.48.91', proxied: false },
  { id: 'rec-4', name: 'ns2.denbagoes.my.id.', ttl: 86400, type: 'A', value: '172.67.182.44', proxied: false },
  { id: 'rec-5', name: 'www.denbagoes.my.id.', ttl: 14400, type: 'CNAME', value: 'denbagoes.my.id', proxied: true },
  { id: 'rec-6', name: 'mail.denbagoes.my.id.', ttl: 14400, type: 'A', value: '104.21.48.91', proxied: false },
  { id: 'rec-7', name: 'webmail.denbagoes.my.id.', ttl: 14400, type: 'CNAME', value: 'denbagoes.my.id', proxied: true },
  { id: 'rec-8', name: 'cpanel.denbagoes.my.id.', ttl: 14400, type: 'CNAME', value: 'server.denbagoes.my.id', proxied: true },
  { id: 'rec-9', name: 'whm.denbagoes.my.id.', ttl: 14400, type: 'CNAME', value: 'server.denbagoes.my.id', proxied: true },
  { id: 'rec-10', name: 'ftp.denbagoes.my.id.', ttl: 14400, type: 'CNAME', value: 'denbagoes.my.id', proxied: false },
  { id: 'rec-11', name: 'denbagoes.my.id.', ttl: 14400, type: 'MX', priority: 0, value: 'mail.denbagoes.my.id' },
  { id: 'rec-12', name: 'denbagoes.my.id.', ttl: 86400, type: 'NS', value: 'ns1.denbagoes.my.id' },
  { id: 'rec-13', name: 'denbagoes.my.id.', ttl: 86400, type: 'NS', value: 'ns2.denbagoes.my.id' },
  { id: 'rec-14', name: 'denbagoes.my.id.', ttl: 14400, type: 'TXT', value: 'v=spf1 +a +mx +ip4:104.21.48.91 ~all' },
  { id: 'rec-15', name: '_dmarc.denbagoes.my.id.', ttl: 14400, type: 'TXT', value: 'v=DMARC1; p=quarantine; rua=mailto:admin@denbagoes.my.id; pct=100' },
  { id: 'rec-16', name: 'default._domainkey.denbagoes.my.id.', ttl: 14400, type: 'TXT', value: 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy89...' }
];

const DEFAULT_SUBDOMAINS: SubdomainEntry[] = [
  {
    id: 'sub-1',
    subdomain: 'server',
    rootDomain: 'denbagoes.my.id',
    documentRoot: '/var/www/html',
    sslActive: true,
    redirectType: 'none',
    createdAt: '2026-09-01'
  },
  {
    id: 'sub-2',
    subdomain: 'rdm',
    rootDomain: 'denbagoes.my.id',
    documentRoot: '/var/www/html/rdm',
    sslActive: true,
    redirectType: 'none',
    createdAt: '2026-09-10'
  },
  {
    id: 'sub-3',
    subdomain: 'siakad',
    rootDomain: 'denbagoes.my.id',
    documentRoot: '/var/www/html/siakad',
    sslActive: true,
    redirectType: 'none',
    createdAt: '2026-09-15'
  },
  {
    id: 'sub-4',
    subdomain: 'cbt',
    rootDomain: 'denbagoes.my.id',
    documentRoot: '/var/www/html/cbt',
    sslActive: true,
    redirectType: 'none',
    createdAt: '2026-09-20'
  }
];

export const DnsNetworkView: React.FC<DnsNetworkViewProps> = ({ onShowToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<'nameservers' | 'zone_editor' | 'subdomains' | 'deliverability' | 'propagation'>('nameservers');

  // =========================================================================
  // 1. WHM NAMESERVER & RESOLVER STATE
  // =========================================================================
  const [ns1Host, setNs1Host] = useState<string>('ns1.denbagoes.my.id');
  const [ns1Ip, setNs1Ip] = useState<string>('104.21.48.91');
  const [ns2Host, setNs2Host] = useState<string>('ns2.denbagoes.my.id');
  const [ns2Ip, setNs2Ip] = useState<string>('172.67.182.44');
  const [ns3Host, setNs3Host] = useState<string>('ns3.denbagoes.my.id');
  const [ns3Ip, setNs3Ip] = useState<string>('104.21.48.92');
  const [ns4Host, setNs4Host] = useState<string>('ns4.denbagoes.my.id');
  const [ns4Ip, setNs4Ip] = useState<string>('172.67.182.45');
  const [nsDaemon, setNsDaemon] = useState<'powerdns' | 'bind9' | 'cloudflare_sync'>('powerdns');
  const [resolver1, setResolver1] = useState<string>('1.1.1.1');
  const [resolver2, setResolver2] = useState<string>('8.8.8.8');
  const [resolver3, setResolver3] = useState<string>('9.9.9.9');
  const [dnssecEnabled, setDnssecEnabled] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // =========================================================================
  // 2. CPANEL DNS ZONE EDITOR STATE
  // =========================================================================
  const [selectedZoneDomain, setSelectedZoneDomain] = useState<string>('denbagoes.my.id');
  const [recordFilter, setRecordFilter] = useState<DnsRecordType | 'ALL'>('ALL');
  const [zoneRecords, setZoneRecords] = useState<DnsZoneRecord[]>(() => {
    try {
      const saved = localStorage.getItem('cloudpro_dns_zone_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_ZONE_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cloudpro_dns_zone_v1', JSON.stringify(zoneRecords));
    } catch {
      // ignore
    }
  }, [zoneRecords]);

  const [newRecName, setNewRecName] = useState<string>('');
  const [newRecType, setNewRecType] = useState<DnsRecordType>('A');
  const [newRecTtl, setNewRecTtl] = useState<number>(14400);
  const [newRecPriority, setNewRecPriority] = useState<number>(10);
  const [newRecValue, setNewRecValue] = useState<string>('');
  const [newRecProxied, setNewRecProxied] = useState<boolean>(true);

  // =========================================================================
  // 3. SUBDOMAINS & REDIRECTS STATE
  // =========================================================================
  const [subdomains, setSubdomains] = useState<SubdomainEntry[]>(() => {
    try {
      const saved = localStorage.getItem('cloudpro_subdomains_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SUBDOMAINS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cloudpro_subdomains_v1', JSON.stringify(subdomains));
    } catch {
      // ignore
    }
  }, [subdomains]);

  const [newSubName, setNewSubName] = useState<string>('');
  const [newSubRootDomain, setNewSubRootDomain] = useState<string>('denbagoes.my.id');
  const [newSubDocRoot, setNewSubDocRoot] = useState<string>('');
  const [newSubRedirect, setNewSubRedirect] = useState<string>('');
  const [newSubRedirectType, setNewSubRedirectType] = useState<'none' | '301' | '302'>('none');

  // =========================================================================
  // 4. EMAIL DELIVERABILITY (SPF, DKIM, DMARC, MX ROUTING) STATE
  // =========================================================================
  const [mxRouting, setMxRouting] = useState<'local' | 'backup' | 'remote'>('local');
  const [ptrHostname, setPtrHostname] = useState<string>('server.denbagoes.my.id');
  const [spfRecord, setSpfRecord] = useState<string>('v=spf1 +a +mx +ip4:104.21.48.91 include:_spf.google.com ~all');
  const [dmarcRecord, setDmarcRecord] = useState<string>('v=DMARC1; p=quarantine; sp=quarantine; rua=mailto:admin@denbagoes.my.id; pct=100; adkim=r; aspf=r');
  const [dkimPublicKey] = useState<string>('v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy89vQ4xJ7mR2zL8pW1kN5bH3fG9cT2dE6qY0uV4iO7pA...');

  // =========================================================================
  // 5. PROPAGATION & PORT DIAGNOSTICS STATE
  // =========================================================================
  const [targetDomain, setTargetDomain] = useState<string>('denbagoes.my.id');
  const [queryType, setQueryType] = useState<'A' | 'CNAME' | 'MX' | 'TXT' | 'NS'>('NS');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const [dnsResults] = useState<DnsRecordResult[]>([
    { node: 'Cloudflare DNS (1.1.1.1)', location: 'Singapore (SIN)', ip: 'ns1.denbagoes.my.id · 104.21.48.91', status: 'propagated', latencyMs: 12 },
    { node: 'Google Public DNS (8.8.8.8)', location: 'Jakarta, ID (CGK)', ip: 'ns1.denbagoes.my.id · 104.21.48.91', status: 'propagated', latencyMs: 16 },
    { node: 'Telkom Indonesia DNS', location: 'Surabaya, ID (SUB)', ip: 'ns1.denbagoes.my.id · 104.21.48.91', status: 'propagated', latencyMs: 19 },
    { node: 'Quad9 Security (9.9.9.9)', location: 'Tokyo, JP (NRT)', ip: 'ns2.denbagoes.my.id · 172.67.182.44', status: 'propagated', latencyMs: 58 },
    { node: 'OpenDNS Cisco (208.67.222.222)', location: 'Sydney, AU (SYD)', ip: 'ns1.denbagoes.my.id · 104.21.48.91', status: 'propagated', latencyMs: 84 },
    { node: 'Frankfurt Core (DNS0.eu)', location: 'Frankfurt, DE (FRA)', ip: 'ns2.denbagoes.my.id · 172.67.182.44', status: 'propagated', latencyMs: 141 }
  ]);

  const [portChecks] = useState([
    { port: 53, name: 'DNS Server (PowerDNS / BIND)', status: 'open', desc: 'Authoritative Nameserver TCP/UDP Port 53 Aktif' },
    { port: 80, name: 'HTTP (Web Traffic)', status: 'open', desc: 'Nginx Reverse Proxy / Cloudflare Ingress' },
    { port: 443, name: 'HTTPS (SSL/TLS 1.3)', status: 'open', desc: 'Let\'s Encrypt / Cloudflare Edge TLS 1.3' },
    { port: 21, name: 'FTP Server (Pure-FTPd)', status: 'open', desc: 'Explicit TLS FTP File Transfer Aktif' },
    { port: 25, name: 'SMTP / Mail Exchanger (Postfix)', status: 'open', desc: 'Penerimaan & Pengiriman Email Domain' },
    { port: 465, name: 'SMTPS + IMAPS (993)', status: 'open', desc: 'Koneksi Email Terenkripsi SSL/TLS (Roundcube)' },
    { port: 3306, name: 'MySQL Database', status: 'internal', desc: 'Terkunci di 127.0.0.1 / Private Network' }
  ]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onShowToast) onShowToast('Berhasil disalin ke papan klip!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNameservers = (e: React.FormEvent) => {
    e.preventDefault();
    if (onShowToast) {
      onShowToast(`Konfigurasi Nameserver WHM (${ns1Host} & ${ns2Host}) dan Resolver DNS berhasil disimpan & disinkronkan!`, 'success');
    }
  };

  const handleAddDnsRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecName.trim() || !newRecValue.trim()) {
      if (onShowToast) onShowToast('Harap isi Nama Host dan Nilai (Value) Record DNS.', 'warning');
      return;
    }

    const formattedName = newRecName.endsWith('.')
      ? newRecName
      : (newRecName === '@'
          ? `${selectedZoneDomain}.`
          : (newRecName.includes(selectedZoneDomain) ? `${newRecName}.` : `${newRecName}.${selectedZoneDomain}.`));

    const newRecord: DnsZoneRecord = {
      id: `rec-${Date.now()}`,
      name: formattedName,
      ttl: Number(newRecTtl) || 14400,
      type: newRecType,
      priority: newRecType === 'MX' || newRecType === 'SRV' ? Number(newRecPriority) : undefined,
      value: newRecValue.trim(),
      proxied: newRecType === 'A' || newRecType === 'AAAA' || newRecType === 'CNAME' ? newRecProxied : false
    };

    setZoneRecords(prev => [newRecord, ...prev]);
    setNewRecName('');
    setNewRecValue('');
    if (onShowToast) {
      onShowToast(`Record DNS ${newRecType} (${formattedName}) berhasil ditambahkan ke zona ${selectedZoneDomain}!`, 'success');
    }
  };

  const handleDeleteDnsRecord = (id: string, name: string, type: string) => {
    setZoneRecords(prev => prev.filter(r => r.id !== id));
    if (onShowToast) onShowToast(`Record ${type} (${name}) telah dihapus dari zona DNS.`, 'info');
  };

  const handleResetZone = () => {
    setZoneRecords(DEFAULT_ZONE_RECORDS);
    if (onShowToast) onShowToast(`Zona DNS untuk ${selectedZoneDomain} berhasil dikembalikan ke template standar WHM/cPanel.`, 'info');
  };

  const handleCreateSubdomain = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSub = newSubName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanSub) {
      if (onShowToast) onShowToast('Harap masukkan nama subdomain yang valid (contoh: rdm, cbt, ppdb).', 'warning');
      return;
    }

    const docRoot = newSubDocRoot.trim() || `/var/www/html/${cleanSub}`;
    const entry: SubdomainEntry = {
      id: `sub-${Date.now()}`,
      subdomain: cleanSub,
      rootDomain: newSubRootDomain,
      documentRoot: docRoot,
      sslActive: true,
      redirectUrl: newSubRedirectType !== 'none' ? newSubRedirect.trim() : undefined,
      redirectType: newSubRedirectType,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSubdomains(prev => [entry, ...prev]);
    // Also add corresponding A record to DNS Zone automatically!
    setZoneRecords(prev => [
      {
        id: `rec-sub-${Date.now()}`,
        name: `${cleanSub}.${newSubRootDomain}.`,
        ttl: 14400,
        type: 'A',
        value: ns1Ip,
        proxied: true
      },
      ...prev
    ]);

    setNewSubName('');
    setNewSubDocRoot('');
    setNewSubRedirect('');
    setNewSubRedirectType('none');

    if (onShowToast) {
      onShowToast(`Subdomain ${cleanSub}.${newSubRootDomain} (${docRoot}) beserta Record A DNS & AutoSSL berhasil dibuat!`, 'success');
    }
  };

  const handleDeleteSubdomain = (id: string, fullDomain: string) => {
    setSubdomains(prev => prev.filter(s => s.id !== id));
    if (onShowToast) onShowToast(`Subdomain ${fullDomain} berhasil dihapus.`, 'info');
  };

  const handleRunLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDomain.trim()) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (onShowToast) onShowToast(`Propagasi Nameserver & DNS (${queryType}) untuk ${targetDomain} sinkron 100% di seluruh dunia.`, 'success');
    }, 650);
  };

  const filteredRecords = zoneRecords.filter(r => recordFilter === 'ALL' || r.type === recordFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Domain, Nameserver &amp; Cloud Ingress</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-400 font-mono font-semibold">WHM Nameserver &amp; cPanel DNS Zone Studio</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Pengaturan Nameserver (NS1/NS2), DNS Zone Editor &amp; Subdomain</span>
            <Globe className="w-5 h-5 text-sky-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Konfigurasi Child Nameserver WHM (Glue Record IP), kelola penuh record DNS (A, AAAA, CNAME, MX, TXT, SRV), Subdomain, Redirect 301, serta SPF/DKIM/DMARC.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PowerDNS + DNSSEC Aktif</span>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto touch-scroll">
        <button
          type="button"
          onClick={() => setActiveSubTab('nameservers')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'nameservers'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Nameserver WHM (NS1–NS4 &amp; Resolver)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('zone_editor')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'zone_editor'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>cPanel DNS Zone Editor ({zoneRecords.length} Record)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('subdomains')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'subdomains'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Subdomain, Alias &amp; Redirect ({subdomains.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('deliverability')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'deliverability'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email Deliverability (SPF, DKIM &amp; DMARC)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('propagation')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'propagation'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Cek Propagasi Global &amp; Port</span>
        </button>
      </div>

      {/* =====================================================================
       * SUBTAB 1: WHM NAMESERVER CONFIGURATION (NS1-NS4, GLUE RECORDS & RESOLVERS)
       * ===================================================================== */}
      {activeSubTab === 'nameservers' && (
        <form onSubmit={handleSaveNameservers} className="space-y-6">
          {/* Primary & Secondary Nameservers Card (WHM Basic WebHost Manager Setup) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-400" />
                  <span>Konfigurasi Nameserver Utama Server WHM (Child Nameserver / Glue Records)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nameserver ini otomatis digunakan pada setiap akun cPanel &amp; domain baru yang dibuat di server Anda. Arahkan domain klien ke Nameserver di bawah ini.
                </p>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan Nameserver</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* NS1 */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 font-mono uppercase">Primary Nameserver (NS1)</span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Glue Record Aktif
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-7 space-y-1">
                    <label className="block text-[11px] text-slate-400">Hostname NS1</label>
                    <input
                      type="text"
                      value={ns1Host}
                      onChange={(e) => setNs1Host(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="sm:col-span-5 space-y-1">
                    <label className="block text-[11px] text-slate-400">Alamat IPv4 (Glue IP)</label>
                    <input
                      type="text"
                      value={ns1Ip}
                      onChange={(e) => setNs1Ip(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyText(ns1Host, 'ns1')}
                    className="text-[11px] font-semibold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'ns1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Salin Hostname NS1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onShowToast) onShowToast(`Record A untuk ${ns1Host} -> ${ns1Ip} telah diverifikasi aktif.`, 'success');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium cursor-pointer"
                  >
                    Konfigurasi A Record
                  </button>
                </div>
              </div>

              {/* NS2 */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 font-mono uppercase">Secondary Nameserver (NS2)</span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Glue Record Aktif
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-7 space-y-1">
                    <label className="block text-[11px] text-slate-400">Hostname NS2</label>
                    <input
                      type="text"
                      value={ns2Host}
                      onChange={(e) => setNs2Host(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="sm:col-span-5 space-y-1">
                    <label className="block text-[11px] text-slate-400">Alamat IPv4 (Glue IP)</label>
                    <input
                      type="text"
                      value={ns2Ip}
                      onChange={(e) => setNs2Ip(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyText(ns2Host, 'ns2')}
                    className="text-[11px] font-semibold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'ns2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Salin Hostname NS2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onShowToast) onShowToast(`Record A untuk ${ns2Host} -> ${ns2Ip} telah diverifikasi aktif.`, 'success');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium cursor-pointer"
                  >
                    Konfigurasi A Record
                  </button>
                </div>
              </div>

              {/* NS3 (Optional Redundancy) */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 font-mono uppercase">Tertiary Nameserver (NS3 - Opsional)</span>
                  <span className="text-[11px] font-mono text-slate-400">Cadangan Cluster</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-7 space-y-1">
                    <label className="block text-[11px] text-slate-400">Hostname NS3</label>
                    <input
                      type="text"
                      value={ns3Host}
                      onChange={(e) => setNs3Host(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="sm:col-span-5 space-y-1">
                    <label className="block text-[11px] text-slate-400">Alamat IPv4</label>
                    <input
                      type="text"
                      value={ns3Ip}
                      onChange={(e) => setNs3Ip(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* NS4 (Optional Redundancy) */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 font-mono uppercase">Quaternary Nameserver (NS4 - Opsional)</span>
                  <span className="text-[11px] font-mono text-slate-400">Cadangan Cluster</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-7 space-y-1">
                    <label className="block text-[11px] text-slate-400">Hostname NS4</label>
                    <input
                      type="text"
                      value={ns4Host}
                      onChange={(e) => setNs4Host(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="sm:col-span-5 space-y-1">
                    <label className="block text-[11px] text-slate-400">Alamat IPv4</label>
                    <input
                      type="text"
                      value={ns4Ip}
                      onChange={(e) => setNs4Ip(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nameserver Daemon Selection + Resolver Configuration (/etc/resolv.conf) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Nameserver Daemon Engine (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pemilihan Nameserver Daemon (WHM Nameserver Selection)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pilih engine server DNS otoritatif yang menangani permintaan domain di port 53.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  {
                    id: 'powerdns',
                    name: 'PowerDNS Authoritative Server (Direkomendasikan WHM/cPanel)',
                    desc: 'Sangat cepat, hemat memori RAM, mendukung penuh DNSSEC otomatis dan integrasi database zona.',
                    badge: 'Default Aktif'
                  },
                  {
                    id: 'bind9',
                    name: 'BIND9 (Berkeley Internet Name Domain)',
                    desc: 'Server DNS klasik standar industri Linux dengan dukungan file zona .db tradisional.',
                    badge: 'Kompatibilitas Tinggi'
                  },
                  {
                    id: 'cloudflare_sync',
                    name: 'Cloudflare Edge DNS Cluster + Zero Trust',
                    desc: 'Menyinkronkan seluruh record DNS lokal ke jaringan anycast global Cloudflare (300+ kota).',
                    badge: 'Zero-IP Ready'
                  }
                ].map((engine) => (
                  <label
                    key={engine.id}
                    onClick={() => setNsDaemon(engine.id as any)}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                      nsDaemon === engine.id
                        ? 'bg-slate-800/90 border-sky-400 ring-1 ring-sky-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{engine.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {engine.desc}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-sky-400 font-bold shrink-0">
                      {engine.badge}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Server DNS Resolvers (/etc/resolv.conf) (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Resolver Configuration (/etc/resolv.conf)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Digunakan oleh server Ubuntu saat mengunduh paket, cURL API Kemenag, &amp; git pull.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Primary Resolver IP</label>
                    <input
                      type="text"
                      value={resolver1}
                      onChange={(e) => setResolver1(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Secondary Resolver IP</label>
                    <input
                      type="text"
                      value={resolver2}
                      onChange={(e) => setResolver2(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Tertiary Resolver IP (Cadangan)</label>
                    <input
                      type="text"
                      value={resolver3}
                      onChange={(e) => setResolver3(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">DNSSEC Signing:</span>
                <button
                  type="button"
                  onClick={() => {
                    setDnssecEnabled(!dnssecEnabled);
                    if (onShowToast) onShowToast(`DNSSEC Zone Signing ${!dnssecEnabled ? 'diaktifkan' : 'dinonaktifkan'}.`, 'info');
                  }}
                  className="font-mono font-bold text-emerald-400 cursor-pointer"
                >
                  {dnssecEnabled ? 'AKTIF (ECDSAP256SHA256)' : 'NONAKTIF'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* =====================================================================
       * SUBTAB 2: CPANEL FULL DNS ZONE EDITOR (A, AAAA, CNAME, MX, TXT, SRV, CAA, NS)
       * ===================================================================== */}
      {activeSubTab === 'zone_editor' && (
        <div className="space-y-5">
          {/* Add New Record Form */}
          <form onSubmit={handleAddDnsRecord} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-sky-400" />
                  <span>Tambah Record DNS Baru ke Zona: <span className="text-sky-400 font-mono">{selectedZoneDomain}</span></span>
                </h3>
                <p className="text-xs text-slate-400">
                  Mendukung pembuatan Record A, AAAA (IPv6), CNAME, MX (Email), TXT (Verifikasi Google/SPF/DKIM), NS, SRV, dan CAA.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedZoneDomain}
                  onChange={(e) => setSelectedZoneDomain(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                >
                  <option value="denbagoes.my.id">Zona: denbagoes.my.id</option>
                  <option value="server.denbagoes.my.id">Zona: server.denbagoes.my.id</option>
                  <option value="siakad.denbagoes.my.id">Zona: siakad.denbagoes.my.id</option>
                  <option value="rdm.denbagoes.my.id">Zona: rdm.denbagoes.my.id</option>
                </select>
                <button
                  type="button"
                  onClick={handleResetZone}
                  title="Reset ke Template Default WHM"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs items-end">
              <div className="lg:col-span-3 space-y-1">
                <label className="block font-semibold text-slate-300">Nama Host (Name)</label>
                <input
                  type="text"
                  value={newRecName}
                  onChange={(e) => setNewRecName(e.target.value)}
                  placeholder="Misal: @, www, rdm, mail"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="lg:col-span-2 space-y-1">
                <label className="block font-semibold text-slate-300">Tipe Record</label>
                <select
                  value={newRecType}
                  onChange={(e) => setNewRecType(e.target.value as DnsRecordType)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value="A">A (IPv4)</option>
                  <option value="AAAA">AAAA (IPv6)</option>
                  <option value="CNAME">CNAME (Alias)</option>
                  <option value="MX">MX (Mail Server)</option>
                  <option value="TXT">TXT (SPF/DKIM)</option>
                  <option value="NS">NS (Nameserver)</option>
                  <option value="SRV">SRV (Service)</option>
                  <option value="CAA">CAA (SSL Auth)</option>
                </select>
              </div>

              <div className="lg:col-span-1 space-y-1">
                <label className="block font-semibold text-slate-300">TTL</label>
                <input
                  type="number"
                  value={newRecTtl}
                  onChange={(e) => setNewRecTtl(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              {(newRecType === 'MX' || newRecType === 'SRV') && (
                <div className="lg:col-span-1 space-y-1">
                  <label className="block font-semibold text-slate-300">Prioritas</label>
                  <input
                    type="number"
                    value={newRecPriority}
                    onChange={(e) => setNewRecPriority(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              )}

              <div className={`${newRecType === 'MX' || newRecType === 'SRV' ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-1`}>
                <label className="block font-semibold text-slate-300">Nilai Tujuan (IP / Domain / Teks)</label>
                <input
                  type="text"
                  value={newRecValue}
                  onChange={(e) => setNewRecValue(e.target.value)}
                  placeholder={newRecType === 'A' ? '104.21.48.91' : (newRecType === 'CNAME' ? 'denbagoes.my.id' : 'Masukkan nilai record...')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Record</span>
                </button>
              </div>
            </div>
          </form>

          {/* DNS Zone Records Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['ALL', 'A', 'CNAME', 'MX', 'TXT', 'NS'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRecordFilter(type)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      recordFilter === type
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type === 'ALL' ? `Semua (${zoneRecords.length})` : type}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Serial SOA: 2026092801 · Refresh: 3600s
              </span>
            </div>

            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Nama Host (Name)</th>
                    <th className="px-4 py-3">TTL</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Nilai Record (Record Data)</th>
                    <th className="px-4 py-3">Status Proxy</th>
                    <th className="px-4 py-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-white">
                        {rec.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {rec.ttl}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-sky-400">
                          {rec.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300 max-w-md truncate">
                        {rec.priority !== undefined ? <strong className="text-amber-400 mr-1.5">[{rec.priority}]</strong> : null}
                        {rec.value}
                      </td>
                      <td className="px-4 py-3">
                        {rec.proxied !== undefined ? (
                          <button
                            type="button"
                            onClick={() => {
                              setZoneRecords(prev => prev.map(r => r.id === rec.id ? { ...r, proxied: !r.proxied } : r));
                            }}
                            className={`text-[11px] font-mono font-semibold cursor-pointer ${
                              rec.proxied ? 'text-amber-400' : 'text-slate-400'
                            }`}
                          >
                            {rec.proxied ? '☁️ CF Proxied' : '⚪ DNS Only'}
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">DNS Only</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteDnsRecord(rec.id, rec.name, rec.type)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                          title="Hapus Record"
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
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 3: SUBDOMAINS, ALIASES & URL REDIRECTS (301 / 302)
       * ===================================================================== */}
      {activeSubTab === 'subdomains' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateSubdomain} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Buat Subdomain Baru, Addon Domain &amp; Redirect (301/302)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Setiap subdomain baru otomatis dibuatkan direktori Document Root, blok Virtual Host Nginx, Record A DNS, serta SSL Let&apos;s Encrypt.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 text-xs items-end">
              <div className="lg:col-span-3 space-y-1">
                <label className="block font-semibold text-slate-300">Subdomain</label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => {
                    setNewSubName(e.target.value);
                    setNewSubDocRoot(`/var/www/html/${e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '')}`);
                  }}
                  placeholder="ppdb / elearning / ujian"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="lg:col-span-3 space-y-1">
                <label className="block font-semibold text-slate-300">Domain Induk</label>
                <select
                  value={newSubRootDomain}
                  onChange={(e) => setNewSubRootDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                >
                  <option value="denbagoes.my.id">.denbagoes.my.id</option>
                  <option value="server.denbagoes.my.id">.server.denbagoes.my.id</option>
                </select>
              </div>

              <div className="lg:col-span-4 space-y-1">
                <label className="block font-semibold text-slate-300">Document Root (Folder Server)</label>
                <input
                  type="text"
                  value={newSubDocRoot}
                  onChange={(e) => setNewSubDocRoot(e.target.value)}
                  placeholder="/var/www/html/ppdb"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sky-300 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Subdomain</span>
                </button>
              </div>
            </div>

            {/* Optional Redirect Configuration */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-center">
              <div className="sm:col-span-4">
                <select
                  value={newSubRedirectType}
                  onChange={(e) => setNewSubRedirectType(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
                >
                  <option value="none">Tanpa Redirect (Jalankan Folder Lokal)</option>
                  <option value="301">Redirect 301 (Permanent Redirect)</option>
                  <option value="302">Redirect 302 (Temporary Redirect)</option>
                </select>
              </div>
              {newSubRedirectType !== 'none' && (
                <div className="sm:col-span-8">
                  <input
                    type="url"
                    value={newSubRedirect}
                    onChange={(e) => setNewSubRedirect(e.target.value)}
                    placeholder="https://tujuan-redirect.com"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              )}
            </div>
          </form>

          {/* Subdomain List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Daftar Subdomain Aktif ({subdomains.length})
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">AutoSSL Wildcard Aktif</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Subdomain Lengkap</th>
                    <th className="px-4 py-3">Document Root</th>
                    <th className="px-4 py-3">Status HTTPS</th>
                    <th className="px-4 py-3">Redirect</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {subdomains.map((sub) => {
                    const fullHost = `${sub.subdomain}.${sub.rootDomain}`;
                    return (
                      <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-white">
                          <a
                            href={`https://${fullHost}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-sky-400 flex items-center gap-1.5"
                          >
                            <span>{fullHost}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </td>
                        <td className="px-4 py-3 font-mono text-sky-400">
                          {sub.documentRoot}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> SSL Aktif
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {sub.redirectType && sub.redirectType !== 'none'
                            ? `${sub.redirectType} → ${sub.redirectUrl}`
                            : 'Tidak dialihkan'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteSubdomain(sub.id, fullHost)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                            title="Hapus Subdomain"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 4: EMAIL DELIVERABILITY (SPF, DKIM, DMARC, PTR & MX ROUTING)
       * ===================================================================== */}
      {activeSubTab === 'deliverability' && (
        <div className="space-y-5">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-sky-400" />
                  <span>cPanel Email Deliverability (Autentikasi SPF, DKIM, DMARC &amp; Reverse PTR)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Memastikan email notifikasi dari website (reset password, pendaftaran PPDB, invoice) masuk ke Inbox utama (bukan folder Spam).
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onShowToast) onShowToast('Seluruh tanda tangan kriptografi DKIM 2048-bit, SPF, dan DMARC berhasil diverifikasi & diperbarui di zona DNS!', 'success');
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-sm shrink-0 cursor-pointer"
              >
                Perbaiki &amp; Pasang Otomatis (1-Klik)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* SPF */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">SPF (Sender Policy Framework)</span>
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VALID
                  </span>
                </div>
                <input
                  type="text"
                  value={spfRecord}
                  onChange={(e) => setSpfRecord(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg font-mono text-[11px] text-sky-300"
                />
              </div>

              {/* DMARC */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">DMARC Policy (_dmarc)</span>
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VALID
                  </span>
                </div>
                <input
                  type="text"
                  value={dmarcRecord}
                  onChange={(e) => setDmarcRecord(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg font-mono text-[11px] text-sky-300"
                />
              </div>

              {/* DKIM */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">DKIM (default._domainkey 2048-bit RSA)</span>
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg font-mono text-[11px] text-slate-300 truncate">
                  {dkimPublicKey}
                </div>
              </div>

              {/* Reverse DNS (PTR) & MX Routing */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Reverse DNS (PTR) &amp; Email Routing</span>
                  <span className="text-sky-400 font-mono font-bold">{ptrHostname}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={ptrHostname}
                    onChange={(e) => setPtrHostname(e.target.value)}
                    className="p-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-[11px] text-white"
                  />
                  <select
                    value={mxRouting}
                    onChange={(e) => {
                      setMxRouting(e.target.value as any);
                      if (onShowToast) onShowToast(`Email Routing diubah ke mode: ${e.target.value.toUpperCase()}`, 'info');
                    }}
                    className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-white"
                  >
                    <option value="local">Local Mail Exchanger</option>
                    <option value="backup">Backup Mail Exchanger</option>
                    <option value="remote">Remote Mail Exchanger (Google/Zoho)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * SUBTAB 5: GLOBAL DNS PROPAGATION & PORT DIAGNOSTICS
       * ===================================================================== */}
      {activeSubTab === 'propagation' && (
        <div className="space-y-6">
          <form onSubmit={handleRunLookup} className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                placeholder="Masukkan domain (misal: denbagoes.my.id)"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={queryType}
                onChange={(e) => setQueryType(e.target.value as any)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              >
                <option value="NS">Record NS (Nameserver)</option>
                <option value="A">Record A (IPv4)</option>
                <option value="CNAME">Record CNAME</option>
                <option value="MX">Record MX (Mail)</option>
                <option value="TXT">Record TXT (SPF/DKIM)</option>
              </select>

              <button
                type="submit"
                disabled={isScanning}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Memeriksa...' : 'Cek Propagasi'}</span>
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>Pemeriksaan Propagasi Nameserver Global ({queryType})</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  6/6 Resolusi Sinkron
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {dnsResults.map((res, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>{res.node}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({res.location})</span>
                      </div>
                      <div className="text-[11px] font-mono text-sky-300">
                        Hasil: <span className="font-bold">{res.ip}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400">
                        {res.latencyMs} ms
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Terpropagasi</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Status Port Layanan Hosting (DNS/Web/Mail/FTP)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">UFW Shield</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {portChecks.map((p, idx) => (
                  <div key={idx} className="p-3 hover:bg-slate-800/30 transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          Port {p.port}
                        </span>
                        <span className="text-xs font-medium text-slate-200">{p.name}</span>
                      </div>

                      <span className="text-[10px] font-mono font-semibold text-emerald-400">
                        {p.status === 'open' ? 'Buka (Aktif)' : 'Lokal (Aman)'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 pl-1">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
