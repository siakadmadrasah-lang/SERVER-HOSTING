import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Receipt,
  Package,
  BellRing,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Copy,
  Check,
  ShieldCheck,
  Wallet,
  X,
  Trash2
} from 'lucide-react';
import { CurrentSessionUser } from '../types';

interface BillingWhmcsViewProps {
  currentUser: CurrentSessionUser;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientWhatsapp: string;
  serviceType: 'Hosting cPanel' | 'VPS KVM Cloud' | 'Dedicated Server' | 'Domain & SSL';
  planName: string;
  domainOrIp: string;
  amountIdr: number;
  billingCycle: 'Bulanan' | 'Tahunan';
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  paymentMethod: string;
}

export interface CommercialProductPlan {
  id: string;
  category: 'Hosting NVMe' | 'VPS KVM';
  name: string;
  priceMonthlyIdr: number;
  specsSummary: string;
  features: string[];
  activeSubscribers: number;
}

const DEFAULT_INVOICES: ClientInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0901',
    clientName: 'MAN 1 Kota (Operator RDM)',
    clientWhatsapp: '081234567890',
    serviceType: 'VPS KVM Cloud',
    planName: 'VPS Pro RDM 8GB NVMe',
    domainOrIp: 'rdm.man1kota.sch.id (103.150.190.101)',
    amountIdr: 250000,
    billingCycle: 'Bulanan',
    dueDate: '2026-10-10',
    status: 'paid',
    paymentMethod: 'QRIS Otomatis (Tripay)'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0902',
    clientName: 'MTsN 2 Garut (Admin SIAKAD)',
    clientWhatsapp: '081398765432',
    serviceType: 'Hosting cPanel',
    planName: 'Enterprise Madrasah NVMe 25GB',
    domainOrIp: 'siakad.mtsn2garut.sch.id',
    amountIdr: 125000,
    billingCycle: 'Bulanan',
    dueDate: '2026-10-02',
    status: 'unpaid',
    paymentMethod: 'Virtual Account BRI / QRIS'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0903',
    clientName: 'PT Mitra Niaga Digital',
    clientWhatsapp: '081122334455',
    serviceType: 'VPS KVM Cloud',
    planName: 'Dedicated KVM 16GB RAM',
    domainOrIp: 'erp.ptmitraniaga.co.id',
    amountIdr: 480000,
    billingCycle: 'Bulanan',
    dueDate: '2026-10-15',
    status: 'paid',
    paymentMethod: 'BCA Virtual Account (Midtrans)'
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-0904',
    clientName: 'SMK Islam Terpadu Al-Hikmah',
    clientWhatsapp: '085711223344',
    serviceType: 'Hosting cPanel',
    planName: 'Hosting PPDB & CBT 10GB',
    domainOrIp: 'ppdb.smkalhikmah.sch.id',
    amountIdr: 85000,
    billingCycle: 'Bulanan',
    dueDate: '2026-09-25',
    status: 'overdue',
    paymentMethod: 'Menunggu Pembayaran QRIS'
  }
];

const DEFAULT_PLANS: CommercialProductPlan[] = [
  {
    id: 'plan-h1',
    category: 'Hosting NVMe',
    name: 'Hosting Starter UMKM / Web Profil',
    priceMonthlyIdr: 45000,
    specsSummary: '5 GB NVMe · Unlimited Bandwidth · Gratis SSL',
    features: ['cPanel / Cloud PRO Login', 'MultiPHP 7.4 - 8.4 + ionCube', 'Softaculous 1-Click Installer', '2 Akun Email Bisnis'],
    activeSubscribers: 18
  },
  {
    id: 'plan-h2',
    category: 'Hosting NVMe',
    name: 'Hosting Pro SIAKAD / RDM Madrasah',
    priceMonthlyIdr: 125000,
    specsSummary: '25 GB NVMe · Dedicated PHP Worker · ionCube + cURL',
    features: ['Optimasi RDM Kemenag & CBT', 'ionCube Loader v13 + cURL Aktif', 'Backup Harian Otomatis S3', 'Gratis Subdomain & DNS Zone'],
    activeSubscribers: 34
  },
  {
    id: 'plan-v1',
    category: 'VPS KVM',
    name: 'Cloud VPS KVM Starter 2GB',
    priceMonthlyIdr: 95000,
    specsSummary: '2 vCPU EPYC · 2 GB ECC RAM · 40 GB NVMe',
    features: ['Akses Root SSH Penuh', '1 IPv4 Publik Dedicated', 'Bebas Pilih OS Ubuntu/Debian', 'Reinstall OS & VNC Mandiri'],
    activeSubscribers: 12
  },
  {
    id: 'plan-v2',
    category: 'VPS KVM',
    name: 'Cloud VPS KVM Enterprise 8GB',
    priceMonthlyIdr: 250000,
    specsSummary: '4 vCPU EPYC · 8 GB ECC RAM · 120 GB NVMe',
    features: ['Siap Ratusan Siswa CBT Serentak', 'Pre-installed Cloud PRO Panel', 'Proteksi Anti-DDoS L4/L7', 'Snapshot Backup Mingguan'],
    activeSubscribers: 9
  }
];

export const BillingWhmcsView: React.FC<BillingWhmcsViewProps> = ({
  currentUser,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'plans' | 'gateway'>('invoices');

  const [invoices, setInvoices] = useState<ClientInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('cloudpro_whmcs_invoices_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_INVOICES;
  });

  const [plans, setPlans] = useState<CommercialProductPlan[]>(() => {
    try {
      const saved = localStorage.getItem('cloudpro_whmcs_plans_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PLANS;
  });

  // Payment Gateway & WA Automation config
  const [gatewayProvider, setGatewayProvider] = useState('Tripay & Midtrans QRIS');
  const [merchantCode, setMerchantCode] = useState('T28491-CLOUDPRO');
  const [waApiEndpoint, setWaApiEndpoint] = useState('https://api.fonnte.com/send');
  const [autoSuspendDays, setAutoSuspendDays] = useState('3');
  const [autoProvisionEnabled, setAutoProvisionEnabled] = useState(true);

  // Create Invoice Modal
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [newInvClient, setNewInvClient] = useState('');
  const [newInvWa, setNewInvWa] = useState('');
  const [newInvServiceType, setNewInvServiceType] = useState<ClientInvoice['serviceType']>('Hosting cPanel');
  const [newInvPlan, setNewInvPlan] = useState('Hosting Pro SIAKAD / RDM Madrasah');
  const [newInvDomain, setNewInvDomain] = useState('');
  const [newInvAmount, setNewInvAmount] = useState('125000');

  useEffect(() => {
    try {
      localStorage.setItem('cloudpro_whmcs_invoices_v1', JSON.stringify(invoices));
    } catch {
      // ignore
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('cloudpro_whmcs_plans_v1', JSON.stringify(plans));
    } catch {
      // ignore
    }
  }, [plans]);

  const totalPaidMrr = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, item) => acc + item.amountIdr, 0);

  const totalPendingIdr = invoices
    .filter(i => i.status !== 'paid')
    .reduce((acc, item) => acc + item.amountIdr, 0);

  const handleMarkInvoicePaid = (inv: ClientInvoice) => {
    setInvoices(prev =>
      prev.map(item => (item.id === inv.id ? { ...item, status: 'paid' } : item))
    );
    if (onShowToast) {
      onShowToast(
        `Tagihan ${inv.invoiceNumber} (${inv.clientName}) ditandai LUNAS! Layanan ${inv.domainOrIp} otomatis diaktifkan.`,
        'success'
      );
    }
  };

  const handleSendWhatsappReminder = (inv: ClientInvoice) => {
    if (onShowToast) {
      onShowToast(
        `Notifikasi tagihan & link pembayaran QRIS telah dikirim ke WhatsApp ${inv.clientName} (${inv.clientWhatsapp}).`,
        'info'
      );
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvClient.trim() || !newInvDomain.trim()) return;

    const created: ClientInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: newInvClient.trim(),
      clientWhatsapp: newInvWa.trim() || '081200000000',
      serviceType: newInvServiceType,
      planName: newInvPlan.trim(),
      domainOrIp: newInvDomain.trim(),
      amountIdr: parseInt(newInvAmount, 10) || 100000,
      billingCycle: 'Bulanan',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'unpaid',
      paymentMethod: 'QRIS / Virtual Account'
    };

    setInvoices(prev => [created, ...prev]);
    setIsAddInvoiceOpen(false);
    setNewInvClient('');
    setNewInvWa('');
    setNewInvDomain('');
    if (onShowToast) {
      onShowToast(`Invoice ${created.invoiceNumber} berhasil diterbitkan & siap dikirim ke WhatsApp klien!`, 'success');
    }
  };

  const handleSaveGatewayConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (onShowToast) {
      onShowToast('Konfigurasi Payment Gateway QRIS & Otomasi Billing WHMCS berhasil disimpan!', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <CreditCard className="w-4 h-4" />
              <span>WHMCS / BOXBILLING ENTERPRISE AUTOMATION SUITE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Pusat Billing Pengusaha Hosting &amp; Penyewaan VPS Otomatis
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Kelola langganan klien hosting &amp; VPS, terbitkan invoice otomatis, terima pembayaran via QRIS / Virtual Account Bank, kirim pengingat jatuh tempo via WhatsApp, serta auto-suspend layanan tanpa perlu membeli lisensi WHMCS berbayar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddInvoiceOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tagihan (Invoice) Baru</span>
            </button>
          </div>
        </div>

        {/* Financial Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Pendapatan Lunas (MRR)</div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400 mt-0.5 tabular-nums">
              Rp {totalPaidMrr.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Bulan Berjalan</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Menunggu Pembayaran</div>
            <div className="text-lg sm:text-xl font-extrabold text-amber-400 mt-0.5 tabular-nums">
              Rp {totalPendingIdr.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {invoices.filter(i => i.status !== 'paid').length} Invoice Belum Lunas
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Total Pelanggan Aktif</div>
            <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tabular-nums">
              {plans.reduce((acc, p) => acc + p.activeSubscribers, 0)} Layanan
            </div>
            <div className="text-[11px] text-sky-400 mt-0.5">Shared Hosting &amp; KVM VPS</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Otomasi Provisioning</div>
            <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              QRIS + WA Aktif
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Auto-Unsuspend Real-Time</div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => setActiveSubTab('invoices')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'invoices'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>1. Daftar Invoice &amp; Tagihan Klien ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('plans')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'plans'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>2. Katalog Paket Jualan Hosting &amp; VPS ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gateway')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'gateway'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>3. Payment Gateway QRIS &amp; Notifikasi WhatsApp</span>
        </button>
      </div>

      {/* SUB-TAB 1: INVOICES */}
      {activeSubTab === 'invoices' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                  <th className="py-3 px-3">No. Invoice &amp; Tanggal</th>
                  <th className="py-3 px-3">Pelanggan &amp; WhatsApp</th>
                  <th className="py-3 px-3">Layanan &amp; Domain/IP</th>
                  <th className="py-3 px-3">Nominal Tagihan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Tindakan Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-bold text-white">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-400">Jatuh Tempo: {inv.dueDate}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{inv.clientName}</div>
                      <div className="text-[11px] font-mono text-slate-400">WA: {inv.clientWhatsapp}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-sky-400">
                        {inv.serviceType} — {inv.planName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{inv.domainOrIp}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-bold text-white">
                        Rp {inv.amountIdr.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[11px] text-slate-400">{inv.paymentMethod}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      {inv.status === 'paid' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>LUNAS (Paid)</span>
                        </span>
                      ) : inv.status === 'overdue' ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Jatuh Tempo</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Belum Dibayar</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkInvoicePaid(inv)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Tandai Lunas</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleSendWhatsappReminder(inv)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Send className="w-3 h-3 text-sky-400" />
                          <span>Kirim WA</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: COMMERCIAL PLANS */}
      {activeSubTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-sky-400">{plan.category}</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {plan.activeSubscribers} Pelanggan Aktif
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{plan.name}</h3>
                <div className="text-xl font-extrabold text-emerald-400 font-mono">
                  Rp {plan.priceMonthlyIdr.toLocaleString('id-ID')}{' '}
                  <span className="text-xs font-normal text-slate-400">/ bulan</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">{plan.specsSummary}</div>

                <ul className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Auto-Setup cPanel / KVM</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://denbagoes.my.id/order?plan=${plan.id}`);
                    if (onShowToast) {
                      onShowToast(`Link order untuk "${plan.name}" berhasil disalin!`, 'success');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Link Order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: PAYMENT GATEWAY & WA CONFIG */}
      {activeSubTab === 'gateway' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 max-w-3xl">
          <h3 className="text-base font-bold text-white mb-1">
            Integrasi Payment Gateway Indonesia (QRIS / Virtual Account) &amp; WhatsApp Bot
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Setiap pembayaran yang masuk via QRIS atau Virtual Account akan otomatis membuat akun hosting/VPS atau membuka status suspend klien tanpa intervensi manual.
          </p>

          <form onSubmit={handleSaveGatewayConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Provider Payment Gateway Utama
                </label>
                <select
                  value={gatewayProvider}
                  onChange={(e) => setGatewayProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="Tripay & Midtrans QRIS">Tripay &amp; Midtrans (QRIS + VA All Bank)</option>
                  <option value="Xendit Enterprise">Xendit Indonesia (QRIS + E-Wallet + Alfamart)</option>
                  <option value="Duitku Payment">Duitku Payment Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kode Merchant / Callback Key
                </label>
                <input
                  type="text"
                  value={merchantCode}
                  onChange={(e) => setMerchantCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Endpoint API WhatsApp Gateway (Fonnte / Wablas / Baileys)
                </label>
                <input
                  type="text"
                  value={waApiEndpoint}
                  onChange={(e) => setWaApiEndpoint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Toleransi Jatuh Tempo Sebelum Auto-Suspend (Hari)
                </label>
                <input
                  type="number"
                  value={autoSuspendDays}
                  onChange={(e) => setAutoSuspendDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">
                  Auto-Provisioning &amp; Auto-Unsuspend Saat Callback QRIS Lunas
                </div>
                <div className="text-[11px] text-slate-400">
                  Aktifkan akun cPanel atau nyalakan kembali VPS KVM secara instan begitu dana diterima.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoProvisionEnabled}
                onChange={(e) => setAutoProvisionEnabled(e.target.checked)}
                className="w-4 h-4 accent-sky-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              Simpan Konfigurasi Billing &amp; Webhook
            </button>
          </form>
        </div>
      )}

      {/* MODAL CREATE INVOICE */}
      {isAddInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Buat Tagihan (Invoice) Pelanggan Baru</h3>
                <p className="text-xs text-slate-400">
                  Terbitkan invoice sewa Hosting atau VPS beserta tautan pembayaran QRIS.
                </p>
              </div>
              <button
                onClick={() => setIsAddInvoiceOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Klien / Instansi</label>
                  <input
                    type="text"
                    required
                    value={newInvClient}
                    onChange={(e) => setNewInvClient(e.target.value)}
                    placeholder="Contoh: MTsN 3 Ciamis"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor WhatsApp Klien</label>
                  <input
                    type="text"
                    value={newInvWa}
                    onChange={(e) => setNewInvWa(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Layanan</label>
                  <select
                    value={newInvServiceType}
                    onChange={(e) => setNewInvServiceType(e.target.value as ClientInvoice['serviceType'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Hosting cPanel">Hosting cPanel NVMe</option>
                    <option value="VPS KVM Cloud">VPS KVM Cloud</option>
                    <option value="Dedicated Server">Dedicated Baremetal Server</option>
                    <option value="Domain & SSL">Registrasi Domain &amp; SSL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nominal Tagihan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newInvAmount}
                    onChange={(e) => setNewInvAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Paket Layanan</label>
                <input
                  type="text"
                  value={newInvPlan}
                  onChange={(e) => setNewInvPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Domain / IP VPS Terkait</label>
                <input
                  type="text"
                  required
                  value={newInvDomain}
                  onChange={(e) => setNewInvDomain(e.target.value)}
                  placeholder="rdm.mtsn3ciamis.sch.id"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddInvoiceOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Terbitkan Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
