import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Database, 
  ExternalLink, 
  RotateCw, 
  Square, 
  Play, 
  Trash2, 
  Settings2, 
  Search, 
  FolderTree, 
  Eye, 
  CheckCircle2, 
  X,
  Code2,
  Plus
} from 'lucide-react';
import { Website, Language, AppType } from '../types';
import { translations } from '../translations';

interface WebsitesViewProps {
  websites: Website[];
  onOpenInstaller: () => void;
  onDeleteWebsite: (siteId: string) => void;
  onToggleSiteStatus: (siteId: string) => void;
  onRestartSitePool: (siteId: string) => void;
  onOpenDbStudio: (dbName: string) => void;
  currentLang: Language;
}

export const WebsitesView: React.FC<WebsitesViewProps> = ({
  websites,
  onOpenInstaller,
  onDeleteWebsite,
  onToggleSiteStatus,
  onRestartSitePool,
  onOpenDbStudio,
  currentLang
}) => {
  const t = translations[currentLang];

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedSiteForPreview, setSelectedSiteForPreview] = useState<Website | null>(null);
  const [selectedSiteForNginx, setSelectedSiteForNginx] = useState<Website | null>(null);
  const [nginxConfigContent, setNginxConfigContent] = useState<string>('');

  const filteredWebsites = websites.filter(site => {
    const matchesSearch = site.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || site.appType === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenNginxModal = (site: Website) => {
    setSelectedSiteForNginx(site);
    const config = `# ====================================================================
# Cloud PRO Automated Virtual Host Configuration
# Domain: ${site.domain}
# App Type: ${site.appType.toUpperCase()}
# ====================================================================

server {
    listen 80;
    listen [::]:80;
    server_name ${site.domain} www.${site.domain};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${site.domain} www.${site.domain};

    root ${site.documentRoot};
    index index.php index.html index.htm;

    # SSL Certificates (Automated Let's Encrypt ACME)
    ssl_certificate /etc/letsencrypt/live/${site.domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${site.domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # FastCGI Cache & Reverse Proxy Configuration
    access_log /var/log/nginx/${site.domain}_access.log combined buffer=64k flush=5m;
    error_log /var/log/nginx/${site.domain}_error.log warn;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/${site.runtime.toLowerCase().includes('8.2') ? 'php8.2' : 'php8.3'}-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\\.ht {
        deny all;
    }
}`;
    setNginxConfigContent(config);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Server Web</span>
            <span aria-hidden="true">/</span>
            <span className="text-indigo-400">Virtual Host & Domain</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t.websites.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.websites.subtitle}
          </p>
        </div>

        <button
          onClick={onOpenInstaller}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t.newWebsiteBtn}</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-full sm:w-auto overflow-x-auto">
          {['all', 'wordpress', 'laravel', 'nodejs', 'ghost', 'static'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'all' ? 'Semua Framework' : type.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari domain atau website..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Websites Grid */}
      {filteredWebsites.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Globe className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Belum Ada Website yang Terpasang</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Semua website demo default telah dibersihkan. Anda dapat memasang website WordPress, Laravel, Node.js, Ghost, atau HTML Statis baru dengan wizard otomatis.
            </p>
          </div>
          <button
            onClick={onOpenInstaller}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Pasang Website Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWebsites.map((site) => {
          const isRunning = site.status === 'running';

          return (
            <div
              key={site.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all space-y-4"
            >
              <div>
                {/* Domain & Status Indicator */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">{site.domain}</span>
                    <button
                      onClick={() => setSelectedSiteForPreview(site)}
                      title="Lihat Pratinjau Situs"
                      className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className={`text-[11px] font-mono tabular-nums ${
                    isRunning ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isRunning ? '● Aktif' : '○ Non-Aktif'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium line-clamp-1 mb-3">
                  {site.title}
                </div>

                {/* Metadata items (Anti-pill text layout with typographic separators) */}
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Framework:</span>
                    <span className="font-semibold text-slate-200 uppercase">{site.appType}</span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span className="font-mono text-indigo-400">{site.runtime}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-slate-500 font-sans">Root:</span>
                    <span className="truncate text-slate-300" title={site.documentRoot}>
                      {site.documentRoot}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Let's Encrypt ({site.sslExpiryDays} hari)</span>
                    </div>
                  </div>

                  {site.linkedDbName && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 font-sans">Database:</span>
                      <button
                        onClick={() => onOpenDbStudio(site.linkedDbName!)}
                        className="text-indigo-400 font-mono hover:underline flex items-center gap-1"
                      >
                        <Database className="w-3 h-3" />
                        <span>{site.linkedDbName}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Trafik: <span className="text-slate-300 font-mono tabular-nums">{site.trafficMonthlyGb} GB</span></span>
                    <span aria-hidden="true">·</span>
                    <span>Disk: <span className="text-slate-300 font-mono tabular-nums">{site.diskUsageMb} MB</span></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenNginxModal(site)}
                    title="Edit Konfigurasi Nginx Virtual Host"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRestartSitePool(site.id)}
                    title="Restart PHP-FPM / Node Process Pool"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onToggleSiteStatus(site.id)}
                    title={isRunning ? 'Hentikan Virtual Host' : 'Aktifkan Virtual Host'}
                    className={`p-1.5 rounded transition-colors ${
                      isRunning 
                        ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' 
                        : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                    }`}
                  >
                    {isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onDeleteWebsite(site.id)}
                    title="Hapus Website & Virtual Host"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedSiteForPreview(site)}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center gap-1 font-medium"
                >
                  <span>Pratinjau</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Modal: Live In-App Website Preview */}
      {selectedSiteForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Browser Top Chrome */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs font-mono text-slate-300 flex items-center gap-2 w-80">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">https://{selectedSiteForPreview.domain}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSiteForPreview(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Website Render */}
            <div className="p-8 bg-slate-950 overflow-y-auto flex-1">
              {selectedSiteForPreview.appType === 'wordpress' && (
                <div className="max-w-2xl mx-auto space-y-6 text-slate-200">
                  <header className="border-b border-slate-800 pb-4">
                    <h2 className="text-2xl font-bold text-white">{selectedSiteForPreview.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">Situs didukung oleh WordPress 6.6 & Cloud PRO Centralized DB Engine</p>
                  </header>
                  <article className="space-y-3">
                    <h3 className="text-lg font-semibold text-indigo-400">Selamat Datang di WordPress!</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Instalasi website Anda telah berhasil diselesaikan secara otomatis. Virtual host Nginx telah dikonfigurasi dengan FastCGI caching, sertifikat SSL Let's Encrypt aktif, dan basis data terpusat <code className="text-indigo-300 font-mono">{selectedSiteForPreview.linkedDbName}</code> telah terhubung ke klaster MySQL utama.
                    </p>
                  </article>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
                    Host: <span className="font-mono text-white">10.240.0.10 (Edge Nginx)</span> · Database Cluster: <span className="font-mono text-white">10.240.0.12 (Primary)</span>
                  </div>
                </div>
              )}

              {selectedSiteForPreview.appType === 'laravel' && (
                <div className="max-w-2xl mx-auto space-y-4 font-mono text-xs">
                  <div className="text-emerald-400 font-semibold text-sm">
                    {"// 200 OK - Laravel 11.2 API Framework Endpoint"}
                  </div>
                  <pre className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 overflow-x-auto leading-relaxed">
{JSON.stringify({
  status: "success",
  app: selectedSiteForPreview.title,
  domain: selectedSiteForPreview.domain,
  environment: "production",
  runtime: selectedSiteForPreview.runtime,
  database: {
    connection: "mysql_centralized",
    host: "10.240.0.12",
    name: selectedSiteForPreview.linkedDbName,
    status: "connected",
    latency_ms: 0.8
  },
  timestamp: new Date().toISOString()
}, null, 2)}
                  </pre>
                </div>
              )}

              {selectedSiteForPreview.appType !== 'wordpress' && selectedSiteForPreview.appType !== 'laravel' && (
                <div className="max-w-2xl mx-auto text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedSiteForPreview.title}</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Aplikasi ({selectedSiteForPreview.appType.toUpperCase()}) sedang berjalan secara nominal pada port virtual host Nginx.
                  </p>
                  <div className="text-xs font-mono text-indigo-400 bg-slate-900 py-1.5 px-3 rounded-md border border-slate-800 inline-block">
                    {selectedSiteForPreview.documentRoot}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nginx Virtual Host Editor */}
      {selectedSiteForNginx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white font-mono">
                  /etc/nginx/sites-available/{selectedSiteForNginx.domain}.conf
                </h3>
                <p className="text-xs text-slate-400">
                  Konfigurasi virtual host server Nginx dan aturan reverse proxy.
                </p>
              </div>
              <button
                onClick={() => setSelectedSiteForNginx(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950">
              <textarea
                value={nginxConfigContent}
                onChange={(e) => setNginxConfigContent(e.target.value)}
                rows={16}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
              <div className="text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>nginx -t: Syntax is valid</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSiteForNginx(null)}
                  className="px-3.5 py-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setSelectedSiteForNginx(null);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  Simpan & Reload Nginx
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
