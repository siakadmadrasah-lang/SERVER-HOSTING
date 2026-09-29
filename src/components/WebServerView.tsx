import React, { useState } from 'react';
import { 
  Settings2, 
  ShieldCheck, 
  RotateCw, 
  CheckCircle2, 
  FileCode, 
  Flame, 
  Globe, 
  Terminal,
  Zap,
  Server
} from 'lucide-react';
import { Website, Language } from '../types';

interface WebServerViewProps {
  websites: Website[];
  onRestartService: (serviceName: string) => void;
  currentLang: Language;
}

export const WebServerView: React.FC<WebServerViewProps> = ({
  websites,
  onRestartService,
  currentLang
}) => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isPurgingCache, setIsPurgingCache] = useState<boolean>(false);
  const [cachePurgedSuccess, setCachePurgedSuccess] = useState<boolean>(false);

  const handleTestNginx = () => {
    setIsTesting(true);
    setTimeout(() => {
      setTestResult("nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful");
      setIsTesting(false);
    }, 400);
  };

  const handlePurgeCache = () => {
    setIsPurgingCache(true);
    setTimeout(() => {
      setIsPurgingCache(false);
      setCachePurgedSuccess(true);
      setTimeout(() => setCachePurgedSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Web Server Engine</span>
            <span aria-hidden="true">/</span>
            <span className="text-indigo-400">Nginx 1.26.2 & FastCGI Cache</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Konfigurasi Web Server & Virtual Host
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Orkestrasi reverse proxy, terminasi SSL otomatis, optimasi kompresi Brotli/HTTP3, dan caching halaman dinamis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePurgeCache}
            disabled={isPurgingCache}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{isPurgingCache ? 'Membersihkan Cache...' : 'Bersihkan Cache FastCGI'}</span>
          </button>
          <button
            onClick={handleTestNginx}
            disabled={isTesting}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isTesting ? 'Menguji...' : 'Uji Sintaksis (nginx -t)'}</span>
          </button>
        </div>
      </div>

      {cachePurgedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Cache FastCGI dan Nginx proxy buffer berhasil dibersihkan di seluruh virtual host.</span>
        </div>
      )}

      {/* Syntax test output */}
      {testResult && (
        <div className="bg-slate-950 border border-emerald-500/30 rounded-lg p-3 font-mono text-xs text-emerald-400 space-y-1">
          <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-900 text-[11px]">
            <span>Hasil Verifikasi Konfigurasi Web Server:</span>
            <button onClick={() => setTestResult(null)} className="hover:text-white">✕</button>
          </div>
          <pre className="whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}

      {/* Server Directives Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-slate-400">Worker Processes</span>
          <div className="text-base font-bold text-white font-mono mt-1">auto (16 Core)</div>
          <span className="text-[11px] text-slate-500">Sesuaikan dengan vCPU fisik</span>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-slate-400">Max Upload Limit</span>
          <div className="text-base font-bold text-white font-mono mt-1">client_max_body 128M</div>
          <span className="text-[11px] text-slate-500">Mendukung upload media besar</span>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-slate-400">Protokol Keamanan</span>
          <div className="text-base font-bold text-emerald-400 font-mono mt-1">TLS 1.2 & TLS 1.3</div>
          <span className="text-[11px] text-slate-500">Enkripsi forward secrecy</span>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-slate-400">Fitur Akselerasi</span>
          <div className="text-base font-bold text-cyan-400 font-mono mt-1">HTTP/2 + Brotli On</div>
          <span className="text-[11px] text-slate-500">Multiplexing & kompresi tinggi</span>
        </div>
      </div>

      {/* Virtual Hosts List */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Virtual Host Terdaftar di /etc/nginx/sites-enabled/
          </h3>
          <span className="text-xs text-slate-400 font-mono">{websites.length} vhost aktif</span>
        </div>

        {/* Mobile View: Dedicated Adaptive Cards (< md) */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {websites.map((site) => (
            <div key={site.id} className="p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-white font-mono text-xs sm:text-sm">
                    {site.domain}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    /etc/nginx/sites-available/{site.domain}.conf
                  </div>
                </div>
                <span className="text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                  ● enabled
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                <span className="font-mono text-indigo-300">
                  {site.appType === 'nodejs' ? 'proxy_pass :3001' : 'php8.3-fpm'}
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SSL ({site.sslExpiryDays}d)</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-3">Domain VHost</th>
                <th className="px-4 py-3">Server Block File</th>
                <th className="px-4 py-3">FastCGI Pass / Upstream</th>
                <th className="px-4 py-3">Sertifikat SSL</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {websites.map((site) => (
                <tr key={site.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white font-mono">
                    {site.domain}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                    /etc/nginx/sites-available/{site.domain}.conf
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-300 text-[11px]">
                    {site.appType === 'nodejs' ? 'proxy_pass http://127.0.0.1:3001' : 'unix:/run/php/php8.3-fpm.sock'}
                  </td>
                  <td className="px-4 py-3 text-emerald-400 text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Let's Encrypt ({site.sslExpiryDays} hari)</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-mono text-[11px]">● enabled</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
