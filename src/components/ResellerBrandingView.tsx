import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Globe, 
  Mail, 
  ShieldCheck, 
  Palette, 
  Eye, 
  ExternalLink 
} from 'lucide-react';
import { CurrentSessionUser, ResellerBranding } from '../types';
import cloudProFavicon from '../assets/images/cloud_pro_favicon_1790605530299.jpg';

interface ResellerBrandingViewProps {
  currentUser: CurrentSessionUser;
  onUpdateBranding: (branding: ResellerBranding) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ResellerBrandingView: React.FC<ResellerBrandingViewProps> = ({
  currentUser,
  onUpdateBranding,
  onShowToast
}) => {
  const currentBranding = currentUser.resellerBranding || {
    companyName: currentUser.role === 'reseller' ? 'Nusantara Cloud Host' : 'Cloud PRO Reseller',
    portalTitle: 'Portal Hosting Klien CloudPanel',
    supportEmail: currentUser.email || 'support@hostingsaya.id',
    footerText: 'Powered by High-Speed Cloud Infrastructure',
    accentColor: '#0284c7'
  };

  const [companyName, setCompanyName] = useState<string>(currentBranding.companyName);
  const [portalTitle, setPortalTitle] = useState<string>(currentBranding.portalTitle || '');
  const [supportEmail, setSupportEmail] = useState<string>(currentBranding.supportEmail || '');
  const [footerText, setFooterText] = useState<string>(currentBranding.footerText || '');
  const [logoPreview, setLogoPreview] = useState<string | null>(currentBranding.logoUrl || null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onShowToast) onShowToast('Harap unggah file gambar (PNG, JPG, atau SVG)', 'warning');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      if (onShowToast) onShowToast('Ukuran file maksimal 2 MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
      if (onShowToast) onShowToast('Logo berhasil diunggah! Klik "Simpan Branding" untuk menerapkan.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefaultLogo = () => {
    setLogoPreview(null);
    if (onShowToast) onShowToast('Logo dikembalikan ke default Cloud PRO.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ResellerBranding = {
      companyName: companyName.trim() || 'Reseller Hosting',
      portalTitle: portalTitle.trim(),
      supportEmail: supportEmail.trim(),
      footerText: footerText.trim(),
      logoUrl: logoPreview || undefined,
      accentColor: currentBranding.accentColor
    };

    onUpdateBranding(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    if (onShowToast) onShowToast('Branding Reseller White-Label berhasil disimpan dan diterapkan!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Manajemen Akun Cloud PRO</span>
            <span aria-hidden="true">/</span>
            <span className="text-amber-400 font-mono">White-Label Branding</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Kustomisasi Logo &amp; Branding Reseller</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Unggah logo perusahaan Anda sendiri, atur nama merek dagang hosting, dan berikan pengalaman profesional kepada klien Anda saat mengakses CloudPanel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
            White-Label Mode: Aktif
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Branding Settings */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5 shadow-xl">
            {/* Section 1: Logo Upload */}
            <div className="space-y-3 pb-5 border-b border-slate-800">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                1. Unggah Logo Kustom Reseller
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                {/* Logo Box */}
                <div className="w-20 h-20 rounded-xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center p-2 relative overflow-hidden shrink-0 group">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo Reseller" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 text-center">
                      <ImageIcon className="w-6 h-6 mb-1 text-slate-400" />
                      <span className="text-[9px]">Default</span>
                    </div>
                  )}
                </div>

                {/* Upload Action */}
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="cursor-pointer px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih File Logo</span>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/svg+xml, image/webp" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>

                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleResetToDefaultLogo}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reset Default</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Format disarankan: PNG transparan, WebP, atau SVG. Rasio 1:1 atau horizontal, maks 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Identity Settings */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                2. Identitas &amp; Merek Dagang Hosting
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Perusahaan / Merek Hosting Anda <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="misal: Nusantara Cloud Host"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Nama ini akan menggantikan "Cloud PRO" di header panel saat klien Anda login.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Portal Klien CloudPanel
                </label>
                <input
                  type="text"
                  value={portalTitle}
                  onChange={(e) => setPortalTitle(e.target.value)}
                  placeholder="misal: Portal Kontrol Website Mandiri"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Layanan Dukungan (Support)
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@perusahaananda.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teks Hak Cipta Footer
                  </label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="© 2026 PT Hosting Indonesia"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                {isSaved && (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Perubahan branding berhasil disimpan!</span>
                  </>
                )}
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-950/40 active:scale-95 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Branding Reseller</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Portal Preview Sandbox */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Pratinjau Langsung Portal Klien
                </h3>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                Live Preview
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Berikut adalah simulasi tampilan antarmuka saat klien hosting CloudPanel Anda membuka panel kontrol:
            </p>

            {/* Micro Frame Preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
              {/* Micro Header */}
              <div className="h-10 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src={logoPreview || cloudProFavicon} 
                    alt="Logo Preview" 
                    className="w-5 h-5 rounded-md object-contain bg-slate-950 p-0.5 border border-sky-500/40"
                  />
                  <span className="font-bold text-xs text-white truncate max-w-[140px]">
                    {companyName || 'Reseller Hosting'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    CloudPanel Klien
                  </span>
                </div>
              </div>

              {/* Micro Body */}
              <div className="p-3.5 space-y-2.5">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-semibold text-white">
                    {portalTitle || 'Dasbor Pengelolaan Situs Web'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Bantuan Teknis: <span className="text-sky-400 font-mono">{supportEmail || 'admin@domain.id'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                    <span className="block text-[10px] text-slate-400">Domain Utama</span>
                    <span className="text-[11px] font-bold text-white font-mono">klien.anda.com</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                    <span className="block text-[10px] text-slate-400">Penyimpanan</span>
                    <span className="text-[11px] font-bold text-sky-400 font-mono">10.0 GB NVMe</span>
                  </div>
                </div>

                <div className="pt-2 text-center text-[9px] text-slate-500 border-t border-slate-900">
                  {footerText || 'Layanan Web Hosting Berbasis Cloud Cepat'}
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Keuntungan Reseller White-Label:</strong> Klien tidak mengetahui Anda menggunakan server VPS Cloud PRO, sehingga merek dagang hosting Anda tampil 100% independen dan bereputasi tinggi.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
