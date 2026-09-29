import React, { useState } from 'react';
import { 
  Radio, 
  ShieldCheck, 
  ExternalLink, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Check, 
  Terminal, 
  Globe, 
  Server, 
  Zap, 
  Lock, 
  Cpu, 
  ArrowRight,
  Trash2,
  AlertTriangle,
  FileCode,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  CheckSquare,
  Sparkles,
  Layers,
  BookOpen,
  Smartphone,
  BatteryCharging,
  Cloud,
  Laptop,
  HardDrive,
  Coins,
  Info,
  Clock,
  GraduationCap,
  Key,
  Database,
  X
} from 'lucide-react';
import { CloudflareTunnelStatus, CloudflareTunnelRoute, Language, Website } from '../types';

interface CloudflareTunnelViewProps {
  tunnelStatus: CloudflareTunnelStatus;
  routes: CloudflareTunnelRoute[];
  websites: Website[];
  onAddRoute: (newRoute: CloudflareTunnelRoute) => void;
  onDeleteRoute: (routeId: string) => void;
  currentLang: Language;
}

export const CloudflareTunnelView: React.FC<CloudflareTunnelViewProps> = ({
  tunnelStatus,
  routes,
  websites,
  onAddRoute,
  onDeleteRoute,
  currentLang
}) => {
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState<boolean>(false);
  const [isPrepGuideOpen, setIsPrepGuideOpen] = useState<boolean>(true);
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  // Form states for new route
  const [newHostname, setNewHostname] = useState<string>('');
  const [newService, setNewService] = useState<string>('http://localhost:80');
  const [newSslType, setNewSslType] = useState<'Full (Strict)' | 'Flexible'>('Full (Strict)');

  // Test latency state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testedHost, setTestedHost] = useState<string | null>(null);

  // Oracle Cloud Always Free & RDM Guide modal state
  const [isOracleModalOpen, setIsOracleModalOpen] = useState<boolean>(false);
  const [oracleTab, setOracleTab] = useState<'legit' | 'syarat' | 'vm' | 'rdm' | 'risiko'>('legit');

  const sampleToken = `cloudflared service install eyJhIjoiMjk4OGFiMmEyY2Q5OGEwMWI5MmFjNDkiLCJ0IjoiYTg5NGE3YjItMDM5MS00Y2YxLTg4OWEtYzRkOTExMzI4MTk1IiwicyI6Ik1UQTVZV0psWkdVdFpHVmxaaTAwTnpVMExXRTRabUV0Wm1Sa05XTXlNMlV4WmpaaCJ9`;

  const yamlConfig = `# ====================================================================
# /etc/cloudflared/config.yml (Cloud PRO Automated Zero-Trust Ingress)
# Tunnel ID: ${tunnelStatus.tunnelId}
# Tidak butuh IP Publik statis, tidak butuh Port Forwarding di Router!
# ====================================================================

tunnel: ${tunnelStatus.tunnelId}
credentials-file: /etc/cloudflared/${tunnelStatus.tunnelId}.json

ingress:
${routes.map(r => `  # Cloud PRO Account Route: ${r.hostname}
  - hostname: ${r.hostname}
    service: ${r.service}
    originRequest:
      noTLSVerify: true
      connectTimeout: 10s`).join('\n\n')}

  # Catch-all default fallback rule (Wajib di Cloudflare Tunnel)
  - service: http_status:404
`;

  const handleCopy = (text: string, type: 'token' | 'config') => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    }
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostname.trim()) return;

    const route: CloudflareTunnelRoute = {
      id: `tun-rt-${Date.now()}`,
      hostname: newHostname.trim().toLowerCase(),
      service: newService.trim(),
      status: 'healthy',
      edgeLatencyMs: +(3 + Math.random() * 4).toFixed(1),
      dataCenter: 'CGK',
      requestsCount: 120,
      sslType: newSslType,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddRoute(route);
    setNewHostname('');
    setIsAddRouteOpen(false);
  };

  const handleTestLatency = (hostname: string) => {
    setIsTesting(true);
    setTestedHost(hostname);
    setTimeout(() => {
      setIsTesting(false);
      setTimeout(() => setTestedHost(null), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Infrastruktur Tanpa Hosting Provider</span>
            <span aria-hidden="true">/</span>
            <span className="text-amber-400 font-mono">Cloudflare Zero Trust Tunnel</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Arsitektur Website Tanpa Hosting Provider (Cloudflare Tunnel)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Jalankan website di PC lokal / Mini PC / Home Server Anda sendiri tanpa IP publik statis, tanpa port forwarding, otomatis SSL, dan proteksi DDoS global.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddRouteOpen(true)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Rute Domain</span>
          </button>
        </div>
      </div>

      {/* Architectural Explanation Card: How it works without hosting provider */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Berjalan Tanpa Sewa Hosting Provider (VPS / Shared Hosting)</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Bagaimana Website Tetap Online dari Komputer Lokal Anda?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dengan <strong className="text-amber-300 font-semibold">Cloudflare Tunnel (`cloudflared`)</strong>, server Anda membuat koneksi keluar (<em className="text-slate-200">outbound-only TLS tunnel</em>) langsung ke 330+ kota datacenter Cloudflare.
              Anda <strong>tidak memerlukan IP Publik Statis</strong> dari ISP (Indihome, Biznet, MyRepublic, dll.) dan <strong>tidak perlu membuka port router (bypasses CGNAT)</strong>. Pengunjung membuka domain Anda di internet, dan Cloudflare secara aman menyalurkan lalu lintas ke Nginx lokal Anda dengan enkripsi penuh.
            </p>
          </div>

          {/* Mini Flow Diagram */}
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 shrink-0 overflow-x-auto">
            <div className="text-center p-2 rounded bg-slate-900 border border-slate-800">
              <Globe className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-[11px] text-white font-semibold">Pengunjung</div>
              <div className="text-[10px] text-slate-500">Internet</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="text-center p-2 rounded bg-slate-900 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-[11px] text-amber-300 font-semibold">Cloudflare Edge</div>
              <div className="text-[10px] text-slate-400">CGK / SIN (Anycast)</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="text-center p-2 rounded bg-slate-900 border border-emerald-500/30">
              <Server className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-[11px] text-emerald-300 font-semibold">Server Lokal Anda</div>
              <div className="text-[10px] text-slate-400">Mini PC / Home Server</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panduan Langkah Pertama: Persiapan SEBELUM Memasang Domain di Cloudflare */}
      <div className="bg-slate-900 border border-indigo-500/40 rounded-xl overflow-hidden shadow-xl">
        <div 
          onClick={() => setIsPrepGuideOpen(!isPrepGuideOpen)}
          className="p-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border-b border-indigo-500/20 flex items-center justify-between cursor-pointer select-none hover:bg-slate-850 transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Langkah Pertama: Apa yang Harus Dilakukan SEBELUM Memasang Domain di Cloudflare?
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Panduan Pemula & Checklist
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Urutan persiapan dari membeli domain, akses panel registrar, hingga menghubungkannya ke Cloudflare Tunnel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-400 hidden sm:inline">
              {isPrepGuideOpen ? 'Sembunyikan' : 'Buka Panduan'}
            </span>
            {isPrepGuideOpen ? (
              <ChevronUp className="w-5 h-5 text-indigo-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-indigo-400" />
            )}
          </div>
        </div>

        {isPrepGuideOpen && (
          <div className="p-5 space-y-5 bg-slate-900/90 text-xs">
            {/* Step navigation tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-slate-800 pb-3">
              {[
                { step: 1, title: '1. Beli Nama Domain', subtitle: 'Hanya Domain (0 Hosting)' },
                { step: 2, title: '2. Panel Registrar', subtitle: 'Akses Pengaturan NS' },
                { step: 3, title: '3. Siapkan PC Server', subtitle: 'Cloud PRO / Nginx Aktif' },
                { step: 4, title: '4. Pasang di Cloudflare', subtitle: 'Daftar & Connect Tunnel' }
              ].map((tab) => (
                <button
                  key={tab.step}
                  onClick={() => setActiveStepTab(tab.step)}
                  className={`p-2.5 rounded-lg text-left transition border ${
                    activeStepTab === tab.step
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{tab.title}</span>
                    {activeStepTab === tab.step && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">{tab.subtitle}</div>
                </button>
              ))}
            </div>

            {/* Step 1 Content: Beli Domain Saja */}
            {activeStepTab === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-slate-200">
                    <strong className="text-amber-300 font-semibold">PENTING: Jangan Beli Paket Hosting!</strong>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Karena Anda menggunakan <strong>Cloudflare Tunnel & Server Lokal Anda sendiri</strong>, Anda <strong>HANYA butuh membeli nama domain</strong> saja. Jangan centang paket CloudPanel hosting, shared hosting, atau WordPress hosting di registrar agar tidak membuang biaya ratusan ribu rupiah.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Rekomendasi Domain Termurah untuk Belajar/Uji Coba:
                    </h4>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-mono">.my.id</strong> — Sekitar <strong>Rp 12.000 – Rp 15.000 / tahun</strong> (Sangat murah, resmi Indonesia, proses aktivasi instan tanpa syarat rumit).
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-mono">.xyz / .site / .top</strong> — Sekitar <strong>$1.5 – $2 / tahun</strong> di registrar internasional.
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-mono">.com / .id</strong> — Sekitar <strong>Rp 140.000 – Rp 200.000 / tahun</strong> (Cocok untuk branding bisnis atau produksi serius).
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      Tempat Beli Domain (Registrar Populer):
                    </h4>
                    <div className="space-y-2 text-slate-300 text-[11px]">
                      <div>
                        <strong className="text-white">Penyedia Lokal Indonesia (Bayar via QRIS/BCA):</strong>
                        <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">DomaiNesia</span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">Niagahoster</span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">Rumahweb</span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">Dewaweb</span>
                        </div>
                      </div>
                      <div className="pt-1">
                        <strong className="text-white">Penyedia Global (Kartu Kredit / PayPal):</strong>
                        <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">Namecheap</span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">Porkbun</span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">Dynadot</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={() => setActiveStepTab(2)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    Lanjut ke Langkah 2: Akses Panel Registrar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 Content: Akses Dashboard Registrar */}
            {activeStepTab === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Memastikan Akses ke Dashboard Registrar Domain
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Setelah berhasil membeli domain, pastikan Anda bisa masuk ke area pelanggan (Client Area / Dashboard) tempat Anda membeli domain. Di sana ada menu bernama <strong>&quot;Manage Name Servers&quot;</strong> atau <strong>&quot;Kelola Name Server&quot;</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <strong className="text-amber-300 block font-semibold">Mengapa ini diperlukan?</strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Secara default, domain baru Anda diarahkan ke nameserver bawaan penjual. Ketika Anda mendaftarkan domain ke Cloudflare, Cloudflare akan memberikan 2 alamat Nameserver khusus gratis (contoh: <code className="text-amber-300 font-mono">alina.ns.cloudflare.com</code> dan <code className="text-amber-300 font-mono">bob.ns.cloudflare.com</code>).
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Tugas Anda nantinya cukup mengganti 2 baris NameServer tersebut di panel registrar Anda.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <strong className="text-emerald-300 block font-semibold">Cek Status Domain Aktif:</strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Setelah dibeli, pastikan status domain di registrar adalah <strong>Active / Aktif</strong> (biasanya instan dalam 1–5 menit setelah pembayaran selesai).
                    </p>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 font-mono">
                      Domain: <span className="text-emerald-400">tokoanda.my.id</span> &rarr; Status: <span className="text-emerald-400 font-bold">Active</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setActiveStepTab(1)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    &larr; Kembali ke Langkah 1
                  </button>
                  <button 
                    onClick={() => setActiveStepTab(3)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    Lanjut ke Langkah 3: Siapkan PC Server Lokal <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 Content: Siapkan PC Server Lokal */}
            {activeStepTab === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Menyiapkan Komputer / Server Lokal Anda
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Sebelum menghubungkan Cloudflare Tunnel, pastikan komputer yang akan menjadi &quot;hosting&quot; Anda sudah siap menerima koneksi di jaringan lokal.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-400" /> Perangkat Keras
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Bisa menggunakan PC bekas, Laptop (hemat listrik 15-25 watt), Mini PC (Intel N100 / Beelink), Raspberry Pi, atau <strong>bahkan HP Android bekas!</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" /> Koneksi Internet
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Cukup sambungkan ke WiFi rumah atau kabel LAN router (Indihome, Biznet, FirstMedia, XL Home, dll). <strong>Tidak perlu beli IP Publik Statis!</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Web Server Aktif
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Cloud PRO / Nginx / Apache Anda sudah aktif di komputer dan bisa dibuka lewat browser lokal: <code className="text-emerald-400 font-mono">http://localhost:80</code>.
                    </p>
                  </div>
                </div>

                {/* Penjelasan Khusus: Apakah Bisa Pakai HP? */}
                <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/40 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-xs flex items-center gap-2">
                        <span>Apakah Perangkat Bisa Menggunakan HP (Smartphone)?</span>
                        <span className="px-2 py-0.2 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                          BISA SEKALI!
                        </span>
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        HP (Smartphone) bisa digunakan dalam 2 peran penting:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        1. HP sebagai Remote / Pengendali (Pengganti PC/PuTTY)
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        Anda tidak wajib punya laptop untuk mengelola server. Dari HP Anda:
                      </p>
                      <ul className="text-slate-400 space-y-1 list-disc pl-4">
                        <li>Buka <strong>Cloudflare Dashboard</strong> via browser Chrome/Safari di HP.</li>
                        <li>Remote terminal Linux via aplikasi <strong>JuiceSSH</strong> atau <strong>Termius</strong> (Android &amp; iOS).</li>
                        <li>Pantau status website dan tunnel langsung dari genggaman kapan saja.</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
                        2. HP Android Bekas Disulap Jadi Server Fisik (Termux)
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        Banyak pengguna homelab memanfaatkan HP Android bekas sebagai server 24 jam:
                      </p>
                      <ul className="text-slate-400 space-y-1 list-disc pl-4">
                        <li><strong>Super hemat listrik:</strong> Hanya 2-4 Watt (hemat tagihan listrik bulanan).</li>
                        <li><strong>Baterai bawaan = UPS mini:</strong> Server tidak langsung mati jika listrik PLN padam.</li>
                        <li>Install <strong>Termux</strong> &rarr; jalankan Web Server &rarr; install binary <code>cloudflared</code> versi ARM64.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Solusi Alternatif: Jika PC Tidak Bisa Nyala 24 Jam */}
                <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl space-y-4 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                          <span>Dilema: PC Kerja Tidak Mungkin Nyala 24 Jam Terus?</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                            4 Solusi Terbaik &amp; Realistis
                          </span>
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Jangan khawatir! Anda <strong>TIDAK WAJIB</strong> membiarkan PC pengetikan Anda menyala 24 jam nonstop. Berikut alternatif terbaiknya:
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Opsi 1: Cloud VPS Mandiri */}
                    <div className="p-3.5 bg-slate-900 border border-indigo-500/40 rounded-xl space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-600 text-[10px] font-bold text-white rounded-bl-lg">
                        PALING DIREKOMENDASIKAN
                      </div>
                      <div className="flex items-center gap-2 font-bold text-indigo-300">
                        <Cloud className="w-4 h-4 text-indigo-400" />
                        <span>Solusi 1: Cloud VPS Mandiri (Bukan Hosting Biasa)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Sewa 1 unit virtual server mandiri di datacenter (Biznet Gio / IDCloudHost / Hetzner / DigitalOcean):
                      </p>
                      <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                        <li><strong>Harga:</strong> Mulai Rp 30.000 – Rp 50.000 / bulan ($2.5 - $3.5).</li>
                        <li><strong>FAKTA MENARIK:</strong> Lebih hemat daripada tagihan listrik PC rumah Anda! (PC 150W hidup 24 jam x 30 hari = ~Rp 150.000/bln biaya listrik PLN).</li>
                        <li><strong>Bebas Batasan Hosting:</strong> Punya akses <code>root</code> mandiri, bebas install Cloud PRO &amp; puluhan website tanpa limit inode CloudPanel.</li>
                        <li><strong>Trik Gratis:</strong> Bisa gunakan <strong>Oracle Cloud Always Free</strong> (4 OCPU ARM + 24GB RAM GRATIS selamanya).</li>
                      </ul>
                      <div className="text-[10px] text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20 font-medium">
                        ✓ PC pengetikan Anda 100% bebas, bisa dimatikan setiap selesai dipakai!
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsOracleModalOpen(true)}
                        className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-amber-500/20 via-indigo-500/25 to-emerald-500/20 hover:from-amber-500/30 hover:to-indigo-500/35 text-amber-200 hover:text-white border border-amber-500/40 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm group"
                      >
                        <GraduationCap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span>Buka Panduan: Oracle Cloud Free Tier &amp; RDM Madrasah</span>
                      </button>
                    </div>

                    {/* Opsi 2: Mini PC Hemat Listrik */}
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <HardDrive className="w-4 h-4 text-amber-400" />
                        <span>Solusi 2: Mini PC / Thin Client Bekas (Di Rumah)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Jika tetap ingin server fisik sendiri di rumah tanpa biaya langganan apapun:
                      </p>
                      <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                        <li><strong>Alat:</strong> Mini PC bekas seukuran telapak tangan (HP T630 / Dell Wyse / Beelink Intel N100) seharga Rp 500rb – Rp 800rb.</li>
                        <li><strong>Daya Listrik:</strong> Hanya <strong>6 – 10 Watt</strong> (setara 1 lampu bohlam kecil). Biaya listrik cuma ~Rp 10.000/bulan!</li>
                        <li><strong>Kelebihan:</strong> Tanpa suara kipas (silent), dingin, ditaruh di pojok dekat router WiFi tanpa monitor.</li>
                      </ul>
                      <div className="text-[10px] text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20 font-medium">
                        ✓ PC pengetikan Anda tetap aman &amp; tidak perlu hidup semalaman.
                      </div>
                    </div>

                    {/* Opsi 3: Laptop Bekas / Jadul */}
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 font-bold text-cyan-300">
                        <Laptop className="w-4 h-4 text-cyan-400" />
                        <span>Solusi 3: Laptop Bekas Layar Tertutup</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Manfaatkan laptop lama yang jarang dipakai:
                      </p>
                      <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                        <li><strong>Modal Rp 0:</strong> Cukup pakai laptop jadul (Core i3 generasi lama / Celeron).</li>
                        <li><strong>Daya Listrik:</strong> Cuma 15 – 25 Watt (sangat hemat dibanding PC desktop).</li>
                        <li><strong>Anti Mati Lampu:</strong> Baterai bawaan laptop berfungsi otomatis sebagai UPS darurat.</li>
                        <li><strong>Trik:</strong> Atur di Windows/Linux <em>&quot;When lid is closed: Do nothing&quot;</em> agar bisa hidup dengan layar tertutup.</li>
                      </ul>
                      <div className="text-[10px] text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20 font-medium">
                        ✓ Laptop ditaruh di rak/meja, PC pengetikan Anda bebas dimatikan.
                      </div>
                    </div>

                    {/* Opsi 4: Cloudflare Pages / Vercel */}
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 font-bold text-emerald-300">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        <span>Solusi 4: Cloudflare Pages / Jamstack (100% Gratis)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Jika website Anda adalah website profil perusahaan, portofolio, atau landing page:
                      </p>
                      <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                        <li><strong>Tanpa Server Fisik:</strong> File HTML/CSS/JS di-host langsung di jaringan global Cloudflare.</li>
                        <li><strong>Cara Kerja:</strong> Anda membuat/mengedit web di PC pengetikan. Begitu selesai di-upload (deploy), <strong>PC pengetikan langsung dimatikan</strong>.</li>
                        <li><strong>Status Web:</strong> Website tetap online 24 jam nonstop di seluruh dunia selamanya secara 100% GRATIS!</li>
                      </ul>
                      <div className="text-[10px] text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20 font-medium">
                        ✓ Nol rupiah biaya hosting &amp; nol rupiah biaya listrik!
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Perbandingan */}
                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg overflow-x-auto">
                    <div className="text-[11px] font-bold text-white mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-400" />
                      Perbandingan Biaya &amp; Kemudahan (Tanpa Nyalakan PC Rumah 24 Jam):
                    </div>
                    <table className="w-full text-[11px] text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-1 px-2">Solusi</th>
                          <th className="py-1 px-2">Biaya Alat</th>
                          <th className="py-1 px-2">Biaya Listrik PLN</th>
                          <th className="py-1 px-2">Status PC Kerja Anda</th>
                          <th className="py-1 px-2">Kestabilan 24 Jam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        <tr>
                          <td className="py-1.5 px-2 font-medium text-indigo-300">Cloud VPS Mandiri</td>
                          <td className="py-1.5 px-2">Rp 0 (Sewa Rp 35rb/bln)</td>
                          <td className="py-1.5 px-2 text-emerald-400">Rp 0 (Listrik Datacenter)</td>
                          <td className="py-1.5 px-2 text-emerald-400">Bebas Mati Kapan Saja</td>
                          <td className="py-1.5 px-2 text-emerald-400">99.99% (Sangat Stabil)</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 font-medium text-amber-300">Mini PC Bekas</td>
                          <td className="py-1.5 px-2">Rp 500rb - 800rb (1x beli)</td>
                          <td className="py-1.5 px-2 text-emerald-400">~Rp 10.000 / bulan</td>
                          <td className="py-1.5 px-2 text-emerald-400">Bebas Mati Kapan Saja</td>
                          <td className="py-1.5 px-2 text-amber-400">Tergantung WiFi Rumah</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 font-medium text-cyan-300">Laptop Bekas</td>
                          <td className="py-1.5 px-2">Rp 0 (Jika ada bekas)</td>
                          <td className="py-1.5 px-2 text-emerald-400">~Rp 20.000 / bulan</td>
                          <td className="py-1.5 px-2 text-emerald-400">Bebas Mati Kapan Saja</td>
                          <td className="py-1.5 px-2 text-emerald-400">Ada Baterai Backup</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 font-medium text-slate-400">PC Pengetikan Rumah</td>
                          <td className="py-1.5 px-2">Rp 0 (Sudah punya)</td>
                          <td className="py-1.5 px-2 text-rose-400">~Rp 150.000 / bulan!</td>
                          <td className="py-1.5 px-2 text-rose-400">Harus Nyala Terus (Bising)</td>
                          <td className="py-1.5 px-2 text-amber-400">Rentan Mati Lampu</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setActiveStepTab(2)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    &larr; Kembali ke Langkah 2
                  </button>
                  <button 
                    onClick={() => setActiveStepTab(4)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    Lanjut ke Langkah 4: Hubungkan ke Cloudflare <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 Content: Pasang di Cloudflare */}
            {activeStepTab === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Langkah Eksekusi di Cloudflare (Gratis &amp; Otomatis)
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Setelah domain Anda beli dan server lokal siap, berikut urutan eksekusi di Cloudflare:
                  </p>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <div className="space-y-1">
                      <div className="font-bold text-white">Buat Akun Gratis di Cloudflare</div>
                      <p className="text-[11px] text-slate-400">
                        Buka <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noreferrer" className="text-amber-400 underline">dash.cloudflare.com</a> dan daftar dengan email Anda.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <div className="space-y-1">
                      <div className="font-bold text-white">Klik &quot;Add a domain&quot; (Tambahkan Domain)</div>
                      <p className="text-[11px] text-slate-400">
                        Ketik nama domain yang telah Anda beli di Langkah 1 (contoh: <code className="text-indigo-300 font-mono">tokoanda.my.id</code>), lalu pilih paket <strong>Free (Gratis $0/bln)</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <div className="space-y-1">
                      <div className="font-bold text-white">Ganti Nameserver di Registrar Anda</div>
                      <p className="text-[11px] text-slate-400">
                        Cloudflare akan menampilkan 2 Nameserver (misal <code className="text-amber-300 font-mono">alina.ns.cloudflare.com</code>). Buka dashboard tempat Anda beli domain (Langkah 2), ganti NS-nya, lalu klik &quot;Check nameservers&quot;.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                    <div className="space-y-1">
                      <div className="font-bold text-white">Buka Menu Zero Trust &rarr; Networks &rarr; Tunnels</div>
                      <p className="text-[11px] text-slate-400">
                        Klik <strong>Create a Tunnel</strong> &rarr; beri nama tunnel (misal <code className="text-indigo-300 font-mono">home-server</code>) &rarr; salin perintah token &rarr; jalankan di terminal server Anda (lihat tombol salin di bawah)!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <button 
                    onClick={() => setActiveStepTab(3)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    &larr; Kembali ke Langkah 3
                  </button>
                  <div className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Semua persiapan selesai! Siap terhubung secara global.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guide: Step-by-Step Onboarding (Domain Sendiri vs Quick Tunnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Uji Coba Kilat (Quick Tunnel) - TANPA Akun & TANPA Domain */}
        <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              OPSI 1: UJI COBA KILAT (INSTAN)
            </span>
            <span className="text-[11px] text-slate-400">0 Biaya · Tanpa Akun</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            Uji Coba Sekarang Tanpa Akun Cloudflare & Tanpa Beli Domain
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Jika Anda ingin <strong>langsung tes dalam 10 detik</strong> apakah website lokal Anda bisa diakses dari HP atau teman di luar rumah, Cloudflare menyediakan fitur gratis <strong>Quick Tunnel (trycloudflare.com)</strong>:
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 space-y-1">
            <div className="text-slate-500 text-[11px]"># Jalankan di terminal PC lokal Anda:</div>
            <div className="text-white font-semibold">cloudflared tunnel --url http://localhost:80</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Cloudflare akan langsung memberikan URL publik gratis (contoh: <code className="text-emerald-400 font-mono">https://rapid-growth-asia.trycloudflare.com</code>) dengan SSL aktif!
          </p>
        </div>

        {/* Card 2: Penggunaan Permanen dengan Domain Sendiri (Untuk Cloud PRO & CloudPanel) */}
        <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              OPSI 2: PRODUKSI DOMAIN SENDIRI
            </span>
            <span className="text-[11px] text-slate-400">Permanen · Multi-Tenant</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            Langkah Setup dengan Domain Pribadi (Cloud PRO & CloudPanel)
          </h3>
          <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Buat Akun Gratis di Cloudflare:</strong> Daftar di <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noreferrer" className="text-amber-400 underline">dash.cloudflare.com</a> (Paket Free 100% gratis).
            </li>
            <li>
              <strong>Tambahkan Domain Anda:</strong> Masukkan domain yang Anda miliki, lalu ganti <em>Nameserver</em> di tempat Anda membeli domain ke Nameserver Cloudflare.
            </li>
            <li>
              <strong>Buka Menu Zero Trust:</strong> Di dashboard Cloudflare &rarr; pilih <em>Networks</em> &rarr; <em>Tunnels</em> &rarr; Klik <em>Create a Tunnel</em>.
            </li>
            <li>
              <strong>Salin Perintah Token:</strong> Jalankan perintah yang diberikan satu kali di server lokal Anda (lihat box terminal di bawah).
            </li>
          </ol>
        </div>
      </div>

      {/* Daemon Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Status Koneksi Tunnel</div>
          <div className="text-base font-bold text-emerald-400 font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>TERHUBUNG</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">{tunnelStatus.version}</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Datacenter Terhubung</div>
          <div className="text-base font-bold text-white font-mono">CGK & SIN Edge</div>
          <div className="text-[11px] text-slate-500 mt-1">Jakarta (3.8ms) · Singapore (5.2ms)</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Status CGNAT ISP</div>
          <div className="text-base font-bold text-cyan-400 font-mono">BYPASSED (100%)</div>
          <div className="text-[11px] text-slate-500 mt-1">Tanpa IP Publik / Port Forward</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Jumlah Rute Ingress</div>
          <div className="text-base font-bold text-amber-400 font-mono tabular-nums">{routes.length} Domain Aktif</div>
          <div className="text-[11px] text-slate-500 mt-1">Otomatis sinkron dengan Cloud PRO</div>
        </div>
      </div>

      {/* Ingress Routing Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Aturan Ingress Routing (Domain Publik &rarr; Port Lokal Server)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Setiap kali Anda membuat akun baru di Cloud PRO, domain otomatis dirutekan ke port Nginx lokal.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {routes.length} host mapping
          </span>
        </div>

        {/* Mobile View: Dedicated Adaptive Cards (< md) */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {routes.map((rt) => (
            <div key={rt.id} className="p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-white font-mono flex items-center gap-1.5 text-xs sm:text-sm">
                    <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{rt.hostname}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-0.5 truncate">
                    &rarr; {rt.service}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  {rt.sslType}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-slate-400">
                <span>Tenant: {rt.accountUsername ? `@${rt.accountUsername}` : 'root'}</span>
                <span>Edge: {rt.dataCenter}</span>
                <span>
                  {isTesting && testedHost === rt.hostname ? (
                    <span className="text-amber-400 animate-pulse">pinging...</span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">{rt.edgeLatencyMs} ms</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <button
                  onClick={() => handleTestLatency(rt.hostname)}
                  className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Uji Latensi RTT</span>
                </button>
                <button
                  onClick={() => onDeleteRoute(rt.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg"
                  title="Hapus Rute"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-3">Domain Publik (Cloudflare)</th>
                <th className="px-4 py-3">Tujuan Servis Lokal</th>
                <th className="px-4 py-3">Akun Cloud PRO / CloudPanel</th>
                <th className="px-4 py-3">Datacenter Edge</th>
                <th className="px-4 py-3">Latensi RTT</th>
                <th className="px-4 py-3">Enkripsi SSL</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {routes.map((rt) => (
                <tr key={rt.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white font-mono">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      <span>{rt.hostname}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400 text-[11px]">
                    {rt.service}
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-300 text-[11px]">
                    {rt.accountUsername ? `@${rt.accountUsername}` : 'root'}
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                    {rt.dataCenter} (Edge)
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300 tabular-nums text-[11px]">
                    {isTesting && testedHost === rt.hostname ? (
                      <span className="text-amber-400 animate-pulse">pinging...</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">{rt.edgeLatencyMs} ms</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {rt.sslType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleTestLatency(rt.hostname)}
                        title="Uji RTT Latency"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteRoute(rt.id)}
                        title="Hapus Rute Tunnel"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
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

      {/* Two Column Section: Installation Command & Live YAML Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Token & Systemd Command - 6 cols */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Perintah Instalasi Daemon di Komputer Lokal</span>
            </h4>
            <button
              onClick={() => handleCopy(sampleToken, 'token')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Tersalin!' : 'Salin Perintah'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Jalankan perintah ini satu kali di terminal Linux/Mac/Windows server lokal Anda. Daemon akan berjalan di latar belakang sebagai service systemd dan otomatis terhubung kembali saat PC di-restart:
          </p>

          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
{`# 1. Unduh binary resmi cloudflared (Linux amd64/arm64)
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# 2. Instalasi dan jalankan service tunnel otomatis:
sudo ${sampleToken}`}
          </pre>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Keunggulan Utama:</div>
            <div>✓ Tidak perlu static IP dari IndiHome/Biznet/FirstMedia</div>
            <div>✓ Aman dari scanning hacker port scanner (Port 80/443 modem tetap tertutup rapat)</div>
            <div>✓ Dilindungi Cloudflare DDoS Guard & Web Application Firewall (WAF)</div>
          </div>
        </div>

        {/* Live YAML Config - 6 cols */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Konfigurasi /etc/cloudflared/config.yml</span>
            </h4>
            <button
              onClick={() => handleCopy(yamlConfig, 'config')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
            >
              {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedConfig ? 'Tersalin!' : 'Salin YAML'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Cloud PRO mengupdate file konfigurasi ini secara instan setiap ada perubahan domain atau penambahan akun:
          </p>

          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-64 leading-relaxed">
{yamlConfig}
          </pre>
        </div>
      </div>

      {/* Modal: Add Ingress Route */}
      {isAddRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateRoute} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Tambah Rute Domain Cloudflare Tunnel</span>
            </h3>
            <p className="text-xs text-slate-400">
              Arahkan nama domain publik yang ada di Cloudflare DNS langsung ke servis di komputer server lokal Anda.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Domain Publik (Hostname)
              </label>
              <input
                type="text"
                required
                placeholder="misal: tokomaju.id atau api.perusahaan.com"
                value={newHostname}
                onChange={(e) => setNewHostname(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Servis Lokal (Origin Service)
              </label>
              <input
                type="text"
                required
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="http://localhost:80 atau http://localhost:3000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Nginx biasanya di <code className="text-indigo-300">http://localhost:80</code>, atau port Node/Python/Docker tertentu.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mode Enkripsi SSL Cloudflare
              </label>
              <select
                value={newSslType}
                onChange={(e) => setNewSslType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Full (Strict)">Full (Strict) - Paling Aman (Sertifikat Let's Encrypt / Origin CA)</option>
                <option value="Flexible">Flexible (Enkripsi antara Browser & Cloudflare)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddRouteOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg font-semibold"
              >
                Simpan & Aktifkan Rute
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Panduan Oracle Cloud Always Free & Setup RDM Madrasah */}
      {isOracleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 text-amber-400 border border-amber-500/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base sm:text-lg">
                      Oracle Cloud Always Free &amp; Setup RDM Madrasah
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                      100% Gratis Selamanya
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Server cloud mandiri spesifikasi monster (24 GB RAM) untuk Rapor Digital Madrasah &amp; website sekolah tanpa biaya bulanan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOracleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigasi Modal */}
            <div className="flex border-b border-slate-800 bg-slate-950 px-3 sm:px-5 gap-2 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setOracleTab('legit')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  oracleTab === 'legit'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>1. Fakta &amp; Apakah Benar Gratis?</span>
              </button>
              <button
                type="button"
                onClick={() => setOracleTab('syarat')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  oracleTab === 'syarat'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>2. Syarat &amp; Cara Daftar Akun</span>
              </button>
              <button
                type="button"
                onClick={() => setOracleTab('vm')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  oracleTab === 'vm'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>3. Buat VM Ampere 24 GB RAM</span>
              </button>
              <button
                type="button"
                onClick={() => setOracleTab('rdm')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  oracleTab === 'rdm'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>4. Setup RDM Madrasah &amp; Cloudflare</span>
              </button>
              <button
                type="button"
                onClick={() => setOracleTab('risiko')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  oracleTab === 'risiko'
                    ? 'border-rose-400 text-rose-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>5. Risiko, Kendala &amp; Alternatif Tanpa Biaya Sewa</span>
              </button>
            </div>

            {/* Konten Tab Modal */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed flex-1">
              {/* TAB 1: FAKTA & KEABSAHAN */}
              {oracleTab === 'legit' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>JAWABANNYA: YA, 100% BENAR-BENAR GRATIS RESMI SELAMANYA!</span>
                    </div>
                    <p className="text-slate-300">
                      Bukan trial 30 hari seperti AWS atau Google Cloud. Ini adalah program resmi bernama <strong>Oracle Cloud Infrastructure (OCI) Always Free Tier</strong> yang diberikan oleh raksasa teknologi Oracle Corporation tanpa batas waktu kedaluwarsa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="font-bold text-white flex items-center gap-2 text-xs">
                        <Cpu className="w-4 h-4 text-amber-400" />
                        <span>Spesifikasi Monster yang Anda Dapatkan Gratis:</span>
                      </div>
                      <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                        <li><strong>Prosesor Ampere ARM:</strong> Hingga 4 OCPU (setara 4-8 vCPU komputer modern).</li>
                        <li><strong>Kapasitas RAM:</strong> <strong>24 GB RAM!</strong> (Hosting biasa Rp 50rb/bln rata-rata cuma dapat 1 GB RAM).</li>
                        <li><strong>Kapasitas Penyimpanan:</strong> 200 GB Block Volume SSD NVMe gratis.</li>
                        <li><strong>Bandwidth Jaringan:</strong> 10.000 GB (10 TB) per bulan gratis.</li>
                        <li><strong>Alamat IP:</strong> 1 Alamat Public IPv4 statis gratis.</li>
                      </ul>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="font-bold text-white flex items-center gap-2 text-xs">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <span>Kenapa Oracle Kasih Gratisan Semewah Ini?</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Oracle sedang bersaing keras melawan AWS dan Google Cloud. Strategi mereka adalah menarik developer, dunia pendidikan, dan pebisnis pemula agar menggunakan platform Oracle Cloud. Selama Anda memilih produk berlabel <strong>&quot;Always Free Eligible&quot;</strong>, Anda <strong>tidak akan pernah ditagih uang sepeser pun</strong>.
                      </p>
                      <div className="p-2 bg-indigo-950/40 border border-indigo-500/20 rounded text-[10px] text-indigo-300">
                        💡 <strong>Sangat Cocok untuk RDM:</strong> Rapor Digital Madrasah sangat haus memori RAM saat musim ujian/rapor. RAM 24 GB ini mampu menampung ratusan guru &amp; siswa login bersamaan tanpa membuat server hang!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SYARAT & CARA DAFTAR */}
              {oracleTab === 'syarat' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4" />
                      <span>Syarat Wajib untuk Pendaftaran Akun Oracle Cloud:</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 text-xs list-disc pl-4">
                      <li><strong>Email Aktif &amp; Nomor HP Aktif:</strong> Untuk verifikasi kode OTP SMS / WhatsApp.</li>
                      <li>
                        <strong>Kartu Debit atau Kredit Berlogo Visa / Mastercard:</strong>
                        <br />
                        <span className="text-slate-400 text-[11px]">
                          Contoh yang terbukti berhasil: <strong>Bank Jago, Jenius BTPN, BCA Mastercard, Mandiri Visa, BRI, CIMB Niaga, atau Seabank</strong>. Pastikan fitur <em>&quot;Transaksi Online / Internasional (3D Secure)&quot;</em> sudah diaktifkan di aplikasi mobile banking Anda.
                        </span>
                      </li>
                      <li>
                        <strong>Saldo di Rekening Minimal Rp 20.000 – Rp 25.000:</strong>
                        <br />
                        <span className="text-slate-400 text-[11px]">
                          Saat mendaftar, Oracle akan melakukan otorisasi penahanan saldo sementara sebesar $1.38 USD (~Rp 22.000) untuk memvalidasi bahwa Anda manusia asli (bukan bot). <strong>Uang ini 100% langsung dikembalikan (di-refund) ke rekening Anda dalam hitungan menit/hari.</strong>
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="font-bold text-white text-xs flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                      <span>Langkah Pendaftaran:</span>
                    </div>
                    <ol className="space-y-2 text-slate-300 text-[11px] list-decimal pl-4">
                      <li>
                        Buka browser dan kunjungi: <a href="https://www.oracle.com/cloud/free/" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">oracle.com/cloud/free</a> &rarr; klik tombol <strong>&quot;Start for free&quot;</strong>.
                      </li>
                      <li>
                        Isi <strong>Country/Territory: Indonesia</strong>, Nama Depan, Nama Belakang, dan Alamat Email Anda.
                      </li>
                      <li>
                        <strong className="text-amber-300">PENTING - PILIH HOME REGION:</strong>
                        <br />
                        Pilih <strong>Singapore (ap-singapore-1)</strong>. <em>(Lokasi ini paling dekat dengan Indonesia, kecepatan ping sangat cepat hanya 15-25 ms!). Catatan: Home Region tidak bisa diubah setelah akun dibuat.</em>
                      </li>
                      <li>
                        Masukkan alamat rumah Anda sesuai identitas KTP/SIM.
                      </li>
                      <li>
                        Pada tahap pembayaran (Add Payment Method), masukkan nomor kartu debit Anda. Masukkan kode OTP verifikasi bank yang masuk ke SMS.
                      </li>
                      <li>
                        Tunggu proses pembuatan akun (biasanya 5 hingga 15 menit). Setelah akun siap, Anda akan menerima email konfirmasi untuk login ke <strong>Oracle Cloud Console</strong>.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 3: BUAT VM AMPERE 24GB RAM */}
              {oracleTab === 'vm' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="font-bold text-white text-xs flex items-center gap-2">
                      <Server className="w-4 h-4 text-indigo-400" />
                      <span>Panduan Membuat Server VM Ampere A1 (24 GB RAM):</span>
                    </div>

                    <ol className="space-y-3 text-slate-300 text-[11px] list-decimal pl-4">
                      <li>
                        Setelah login ke Oracle Cloud Console, klik menu garis tiga di kiri atas &rarr; pilih <strong>Compute</strong> &rarr; <strong>Instances</strong> &rarr; klik <strong>&quot;Create Instance&quot;</strong>.
                      </li>
                      <li>
                        <strong>Name:</strong> Beri nama server, misalnya <code>server-madrasah</code>.
                      </li>
                      <li>
                        <strong>Image and Shape:</strong>
                        <div className="mt-1 p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                          <p>• <strong>Image:</strong> Klik <em>Change Image</em> &rarr; Pilih <strong>Ubuntu 22.04 LTS (AArch64)</strong> atau Ubuntu 24.04.</p>
                          <p>• <strong>Shape:</strong> Klik <em>Change Shape</em> &rarr; Pilih <strong>Ampere (ARM Processor)</strong> &rarr; centang <code>VM.Standard.A1.Flex</code>.</p>
                          <p className="text-emerald-400 font-semibold">• Geser slider <strong>OCPU</strong> ke <strong>4</strong>, dan slider <strong>Memory (RAM)</strong> ke <strong>24 GB</strong>.</p>
                          <span className="text-[10px] text-amber-300">✓ Pastikan terlihat label hijau &quot;Always Free Eligible&quot;!</span>
                        </div>
                      </li>
                      <li>
                        <strong>Networking:</strong> Biarkan opsi default (Create new virtual cloud network).
                      </li>
                      <li>
                        <strong className="text-amber-300">SSH Keys (Kunci Rahasia Login):</strong>
                        <div className="mt-1 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                          Pilih <strong>&quot;Generate a key pair for me&quot;</strong> &rarr; klik tombol <strong>&quot;Save Private Key&quot;</strong>.
                          <br />
                          <span className="text-rose-400 font-bold">PERINGATAN:</span> File kunci <code>.key</code> ini wajib Anda simpan di HP atau PC. File ini adalah kunci untuk login ke server lewat Termius atau PuTTY!
                        </div>
                      </li>
                      <li>
                        Klik tombol <strong>&quot;Create&quot;</strong> di bagian bawah. Tunggu sekitar 1–2 menit, kotak status akan berubah menjadi warna hijau <strong>&quot;RUNNING&quot;</strong>.
                      </li>
                      <li>
                        Salin <strong>Public IP Address</strong> yang muncul di halaman instance (contoh: <code>129.150.x.x</code>).
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 4: SETUP RDM & CLOUDFLARE */}
              {oracleTab === 'rdm' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-1.5">
                    <div className="font-bold text-indigo-300 flex items-center gap-2 text-xs">
                      <GraduationCap className="w-4 h-4" />
                      <span>Kenapa RDM Madrasah Sangat Sukses Dijalankan di Sini?</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Aplikasi <strong>Rapor Digital Madrasah (RDM)</strong> rilisan Dirjen Pendis Kemenag menggunakan arsitektur web berbasis <strong>PHP dan MariaDB/MySQL</strong>. Pada shared hosting biasa, ketika 40 dewan guru input nilai bersamaan, hosting akan langsung crash <em>(503 Service Unavailable)</em>. Di server Oracle ini, dengan <strong>RAM 24 GB</strong> dan koneksi datacenter gigabit, RDM dapat diakses puluhan bahkan ratusan guru dan siswa serentak tanpa kendala!
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="font-bold text-amber-300 text-xs flex items-center gap-2">
                        <span>Langkah 1: Hubungkan Termius (di HP) atau PuTTY (di PC) ke Server</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Buka Termius &rarr; New Host &rarr; Masukkan IP Server &rarr; Username: <code className="text-indigo-300">ubuntu</code> &rarr; Masukkan file Private Key <code>.key</code> yang diunduh tadi &rarr; Connect!
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="font-bold text-amber-300 text-xs flex items-center gap-2">
                        <span>Langkah 2: Pasang Paket Web Server (Nginx, MariaDB, PHP)</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Jalankan perintah ini di terminal:</p>
                      <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-emerald-400 overflow-x-auto">
sudo apt update &amp;&amp; sudo apt upgrade -y{'\n'}
sudo apt install nginx mariadb-server php-fpm php-mysql php-curl php-gd php-mbstring php-xml php-zip php-bcmath php-intl unzip -y
                      </pre>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="font-bold text-amber-300 text-xs flex items-center gap-2">
                        <span>Langkah 3: Buat Database MariaDB untuk RDM</span>
                      </div>
                      <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-cyan-300 overflow-x-auto">
sudo mysql{'\n'}
CREATE DATABASE db_rdm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;{'\n'}
CREATE USER 'rdm_user'@'localhost' IDENTIFIED BY 'PasswordRahasia123!';{'\n'}
GRANT ALL PRIVILEGES ON db_rdm.* TO 'rdm_user'@'localhost';{'\n'}
FLUSH PRIVILEGES;{'\n'}
EXIT;
                      </pre>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="font-bold text-amber-300 text-xs flex items-center gap-2">
                        <span>Langkah 4: Upload Source Code RDM &amp; Sambungkan Cloudflare Tunnel</span>
                      </div>
                      <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4">
                        <li>Letakkan file RDM Kemenag di folder <code>/var/www/rdm/</code>.</li>
                        <li>Hubungkan domain sekolah Anda (misal: <code>rdm.mtsn1-daerah.sch.id</code>) melalui menu <strong>Cloudflare Tunnel</strong> di Cloud PRO.</li>
                        <li><strong>Hasil Sempurna:</strong> RDM otomatis aktif 24 jam nonstop dengan HTTPS (gembok hijau), aman dari serangan hacker/DDoS, guru bisa input nilai dari rumah dengan santai, dan <strong>PC pengetikan Anda di rumah tetap mati dan bebas dipakai bekerja seperti biasa!</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: RISIKO, KENDALA & ALTERNATIF */}
              {oracleTab === 'risiko' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Bagian 1: Realita & Risiko Jujur Oracle */}
                  <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-3">
                    <div className="font-bold text-rose-300 flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      <span>Jujur &amp; Transparan: 3 Kendala Nyata di Oracle Cloud Always Free</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      Meskipun gratis selamanya dan berspesifikasi monster, Anda harus tahu fakta dan risikonya secara terbuka:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
                      <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-1">
                        <strong className="text-rose-400 block">1. Idle Reclamation (Server Ditarik Jika Nganggur)</strong>
                        <p className="text-slate-400">
                          Sejak 2023, jika CPU &lt; 20% dan RAM &lt; 20% selama 7 hari berturut-turut, Oracle bisa mematikan instance gratis karena dianggap tidak terpakai. 
                        </p>
                        <span className="text-[10px] text-amber-300 block">✓ Solusi: Pasang script auto-load ringan (cron) atau aktifkan Pay As You Go (tetap $0 jika di kuota free).</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-1">
                        <strong className="text-amber-400 block">2. Pendaftaran Sangat Ketat (Sering Ditolak)</strong>
                        <p className="text-slate-400">
                          Sistem anti-fraud Oracle terkenal sangat sensitif. Jika nama di kartu, IP internet, atau data alamat ada sedikit selisih, pendaftaran sering gagal (&quot;Error processing transaction&quot;).
                        </p>
                        <span className="text-[10px] text-indigo-300 block">✓ Solusi: Pakai kartu Bank Jago / Jenius &amp; jangan pakai VPN saat daftar.</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-1">
                        <strong className="text-cyan-400 block">3. Tanpa Customer Support (CS) Manusia</strong>
                        <p className="text-slate-400">
                          Pengguna akun gratis tidak berhak mendapatkan tiket bantuan / live chat teknisi Oracle. Jika ada kendala, Anda harus mencari solusi di forum Reddit / komunitas.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Bagaimana Jika Ada Gangguan Teknis? */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="font-bold text-amber-300 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Bagaimana Jika Ada Gangguan Teknis di Oracle?</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Kabar baiknya: karena arsitektur <strong>Cloud PRO + Cloudflare Tunnel</strong> bersifat modular dan terpisah dari server fisik:
                    </p>
                    <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc pl-4">
                      <li>
                        <strong className="text-white">Backup Otomatis adalah Kunci:</strong> Selalu aktifkan fitur auto-backup file website &amp; database MariaDB (misal tiap malam dikirim ke Google Drive atau Cloudflare R2).
                      </li>
                      <li>
                        <strong className="text-white">Pindah Server Hanya 5 Menit:</strong> Jika server Oracle bermasalah, Anda tidak perlu pusing mengubah setelan DNS domain madrasah / website Anda. Cukup sewa server baru atau nyalakan laptop rumah &rarr; pasang Cloudflare Tunnel Token &rarr; semua website otomatis langsung online kembali tanpa masa tunggu (propagasi)!
                      </li>
                    </ul>
                  </div>

                  {/* Bagian 3: Alternatif Selain Oracle Tanpa Biaya Sewa */}
                  <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-3">
                    <div className="font-bold text-white text-xs flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Alternatif Selain Oracle yang Lebih Mudah &amp; Tanpa Biaya Sewa:</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      {/* Opsi 1: Laptop Bekas */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                          <Laptop className="w-4 h-4 text-cyan-400" />
                          <span>1. Laptop Bekas di Rumah (Paling Mudah, Rp 0)</span>
                        </div>
                        <p className="text-slate-400">
                          Manfaatkan laptop lama (Core i3 jadul / Celeron) yang tidak dipakai:
                        </p>
                        <ul className="text-slate-300 space-y-1 list-disc pl-4 text-[10px]">
                          <li><strong>Tanpa Kartu Kredit:</strong> Tidak ada proses daftar yang ribet atau risiko ditolak.</li>
                          <li><strong>100% Milik Anda Sendiri:</strong> Tidak ada risiko akun disuspend atau server ditarik sepihak.</li>
                          <li><strong>Aman Mati Lampu:</strong> Baterai laptop otomatis berfungsi sebagai UPS genset darurat.</li>
                          <li><strong>Listrik Super Hemat:</strong> Hanya ~15 Watt (setara biaya listrik Rp 15.000/bln).</li>
                        </ul>
                      </div>

                      {/* Opsi 2: Mini PC */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="font-bold text-amber-300 flex items-center gap-1.5">
                          <HardDrive className="w-4 h-4 text-amber-400" />
                          <span>2. Mini PC Bekas (Beli Sekali Rp 500rb, Tanpa Sewa Selamanya)</span>
                        </div>
                        <p className="text-slate-400">
                          Jika tidak punya laptop bekas, beli Mini PC bekas (HP T630 / Dell Wyse / Lenovo Tiny):
                        </p>
                        <ul className="text-slate-300 space-y-1 list-disc pl-4 text-[10px]">
                          <li>Beli 1x di Tokopedia/Shopee (~Rp 500rb - Rp 750rb).</li>
                          <li>Tanpa biaya langganan seumur hidup.</li>
                          <li>Ukuran saku, dingin, hening tanpa kipas, listrik hanya 6–10 Watt (~Rp 10rb/bln).</li>
                        </ul>
                      </div>
                    </div>

                    {/* Mengapa PaaS gratisan seperti Render/Railway kurang cocok */}
                    <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-[10px] text-slate-400 space-y-1">
                      <strong className="text-slate-300 block">Catatan Tentang Layanan Cloud Gratis Lain (Render.com, Koyeb, Fly.io):</strong>
                      <p>
                        Banyak yang bertanya apakah bisa pakai platform seperti Render atau Fly.io secara gratis. Untuk website profil statis memang bisa, tetapi <strong>sangat tidak cocok untuk RDM &amp; Multi-Website PHP/MariaDB</strong> karena: (1) Database gratisnya dihapus otomatis setelah 30 hari, (2) Server akan &quot;tidur&quot; jika sepi sehingga loading awal butuh 1 menit, dan (3) Tidak ada kebebasan multi-domain / instalasi software seperti di server sendiri.
                      </p>
                    </div>

                    {/* Peringatan Kritis: Batasan 1GB RAM untuk RDM */}
                    <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-1.5">
                      <div className="font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Peringatan Nyata: VPS 1 vCPU &amp; 1 GB RAM Kurang Maksimal untuk RDM!</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Firasat Anda <strong>100% benar</strong>! Menjalankan <strong>RDM + Multi-Website</strong> di VPS RAM 1 GB adalah &quot;bom waktu&quot;. Saat 10–20 guru login dan mencetak rapor PDF bersamaan, konsumsi RAM akan melonjak melebihi 1 GB sehingga sistem Linux <em>(OOM Killer)</em> akan otomatis mematikan paksa database MariaDB / MySQL (error 502 Bad Gateway).
                      </p>
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800 text-[10px] text-amber-300 space-y-1">
                        <strong>Standar Kebutuhan RAM Nyata untuk RDM + Multi-Web:</strong>
                        <ul className="list-disc pl-4 text-slate-300 space-y-0.5">
                          <li>Sistem Linux Ubuntu + Nginx + Tunnel: ~250 MB</li>
                          <li>MariaDB / MySQL Database: ~350 MB</li>
                          <li>PHP-FPM (Proses Generate Nilai &amp; Cetak PDF RDM): ~500 MB – 1.2 GB</li>
                          <li><strong>Rekomendasi Aman:</strong> Minimal <strong>RAM 2 GB – 4 GB</strong> agar tidak pernah crash saat musim pembagian rapor!</li>
                        </ul>
                      </div>
                    </div>

                    {/* Opsi Teraman & Termurah dengan RAM 2GB - 4GB */}
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1.5">
                      <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-emerald-400" />
                        <span>Solusi Jika Pendaftaran Oracle Ditolak (Rekomendasi RAM 2GB – 4GB):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-300">
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                          <strong className="text-emerald-400 block mb-0.5">Opsi 1: Laptop Bekas Rumah (Modal Rp 0)</strong>
                          Umumnya sudah punya <strong>RAM 4 GB atau 8 GB</strong>. Jauh lebih kencang dari VPS Rp 25rb, anti mati lampu (ada baterai), dan 100% gratis selamanya.
                        </div>
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                          <strong className="text-amber-400 block mb-0.5">Opsi 2: Mini PC Bekas (Rp 600rb - 800rb)</strong>
                          Langsung dapat <strong>RAM 8 GB + SSD</strong>. Listrik cuma 6-10 Watt (~Rp 10rb/bln), tanpa sewa bulanan selamanya.
                        </div>
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                          <strong className="text-cyan-400 block mb-0.5">Opsi 3: Promo VPS KVM Tahunan ($16 - $20/tahun)</strong>
                          Di provider seperti <em>RackNerd</em> (promo Flash Sale tahunan): ~$17/tahun (sekitar <strong>Rp 22.000/bulan</strong>) tapi dapat <strong>RAM 2.5 GB – 3 GB</strong>! Bisa bayar QRIS / Dana.
                        </div>
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                          <strong className="text-indigo-400 block mb-0.5">Opsi 4: Trik Swap RAM (Jika Tetap Pakai 1GB)</strong>
                          Buat <strong>Swap Memory 4 GB</strong> di SSD: <code>sudo fallocate -l 4G /swapfile</code> agar server tidak langsung mati saat RAM penuh.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Punya pertanyaan seputar aktivasi kartu debit atau instalasi script RDM?
              </span>
              <button
                type="button"
                onClick={() => setIsOracleModalOpen(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
