import React, { useState, useEffect } from 'react';
import { 
  ActiveTab, 
  Language, 
  Website, 
  CentralizedDatabase, 
  DatabaseUser, 
  BackupRecord, 
  ServerService, 
  ServerMetricData, 
  SystemLog,
  CloudflareTunnelStatus,
  CloudflareTunnelRoute,
  HostingAccount,
  HostingPackage
} from './types';
import { 
  INITIAL_METRICS, 
  INITIAL_SERVICES, 
  INITIAL_WEBSITES, 
  INITIAL_DATABASES, 
  INITIAL_DB_USERS, 
  INITIAL_BACKUPS, 
  INITIAL_LOGS,
  INITIAL_TUNNEL_STATUS,
  INITIAL_TUNNEL_ROUTES,
  INITIAL_HOSTING_ACCOUNTS,
  INITIAL_HOSTING_PACKAGES
} from './data/initialData';
import { 
  loadStorage, 
  saveStorage, 
  sanitizeHostingAccounts,
  sanitizeWebsites,
  sanitizeDatabases,
  sanitizeDbUsers,
  sanitizeBackups
} from './utils/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { WebsitesView } from './components/WebsitesView';
import { DatabasesView } from './components/DatabasesView';
import { CloudflareTunnelView } from './components/CloudflareTunnelView';
import { WhmAccountsView } from './components/WhmAccountsView';
import { WebServerView } from './components/WebServerView';
import { FileManagerView } from './components/FileManagerView';
import { TerminalView } from './components/TerminalView';
import { BackupsView } from './components/BackupsView';
import { SecurityView } from './components/SecurityView';
import { LogsView } from './components/LogsView';
import { ResellerBrandingView } from './components/ResellerBrandingView';
import { PhpSettingsView } from './components/PhpSettingsView';
import { CronJobsView } from './components/CronJobsView';
import { DnsNetworkView } from './components/DnsNetworkView';
import { EmailFtpView } from './components/EmailFtpView';
import { VpsClusterView } from './components/VpsClusterView';
import { BillingWhmcsView } from './components/BillingWhmcsView';
import { WebsiteInstallerModal } from './components/WebsiteInstallerModal';
import { SyncModal } from './components/SyncModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { ThemeSwitcherModal } from './components/ThemeSwitcherModal';
import { LoginView } from './components/LoginView';
import { ThemeId, getStoredTheme, saveStoredTheme, applyThemeToDocument, AVAILABLE_THEMES } from './utils/theme';
import { CurrentSessionUser, ResellerBranding } from './types';
import { 
  DEFAULT_ROOT_USER, 
  DEFAULT_CLIENT_USER,
  ROLE_CONFIG, 
  filterWebsitesByRole, 
  filterDatabasesByRole, 
  filterAccountsByRole 
} from './utils/rbac';
import { CheckCircle2 } from 'lucide-react';

const OWNER_AUTH_KEY = 'cloudpro_owner_auth_v1';

export default function App() {
  // Owner authentication state (username: denbaguse / pass: masbagus15)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(OWNER_AUTH_KEY) === 'authenticated_denbaguse';
    } catch {
      return false;
    }
  });

  const [currentLang, setCurrentLang] = useState<Language>('id');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isInstallerOpen, setIsInstallerOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState<boolean>(false);
  const [isThemeSwitcherOpen, setIsThemeSwitcherOpen] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => getStoredTheme());

  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    saveStoredTheme(themeId);
    const themeObj = AVAILABLE_THEMES.find(t => t.id === themeId);
    showToast(`Tema server diterapkan: ${themeObj ? themeObj.name : themeId}`, 'info');
  };

  // User session state (Root Admin @denbaguse, Reseller, or Client)
  const [currentUser, setCurrentUser] = useState<CurrentSessionUser>(() => {
    const stored = loadStorage<CurrentSessionUser>('aethel_session_user', DEFAULT_ROOT_USER);
    if (stored.role === 'root' && stored.username !== 'denbaguse') {
      return {
        ...DEFAULT_ROOT_USER,
        resellerBranding: stored.resellerBranding
      };
    }
    return stored;
  });

  useEffect(() => {
    saveStorage('aethel_session_user', currentUser);
  }, [currentUser]);

  const handleLoginSuccess = () => {
    try {
      localStorage.setItem(OWNER_AUTH_KEY, 'authenticated_denbaguse');
    } catch {
      // ignore
    }
    setIsAuthenticated(true);
    setCurrentUser(DEFAULT_ROOT_USER);
    setActiveTab('dashboard');
    showToast('Selamat datang kembali, Pemilik Server (@denbaguse)!', 'success');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(OWNER_AUTH_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setCurrentUser(DEFAULT_ROOT_USER);
    showToast('Sesi pemilik server telah dikunci (Logout berhasil).', 'info');
  };

  const handleSwitchUser = (newUser: CurrentSessionUser) => {
    setCurrentUser(newUser);
    const allowed = ROLE_CONFIG[newUser.role].allowedTabs;
    if (!allowed.includes(activeTab)) {
      setActiveTab('dashboard');
    }
    showToast(`Beralih ke peran: ${ROLE_CONFIG[newUser.role].label} (@${newUser.username})`, 'info');
  };

  const handleUpdateResellerBranding = (branding: ResellerBranding) => {
    setCurrentUser(prev => ({
      ...prev,
      resellerBranding: branding
    }));
  };

  const handleClearCacheAndReload = () => {
    try {
      localStorage.removeItem('aethel_v3_clean_slate_2026');
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch {
      // ignore
    }
    window.location.reload();
  };

  // Close mobile nav on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Core State with LocalStorage Persistence
  const [metrics, setMetrics] = useState<ServerMetricData>(INITIAL_METRICS);
  const [services, setServices] = useState<ServerService[]>(INITIAL_SERVICES);
  const [websites, setWebsites] = useState<Website[]>(() => {
    const stored = loadStorage<Website[]>('aethel_websites', INITIAL_WEBSITES);
    return sanitizeWebsites(stored);
  });
  const [databases, setDatabases] = useState<CentralizedDatabase[]>(() => {
    const stored = loadStorage<CentralizedDatabase[]>('aethel_databases', INITIAL_DATABASES);
    return sanitizeDatabases(stored);
  });
  const [dbUsers, setDbUsers] = useState<DatabaseUser[]>(() => {
    const stored = loadStorage<DatabaseUser[]>('aethel_db_users', INITIAL_DB_USERS);
    return sanitizeDbUsers(stored);
  });
  const [backups, setBackups] = useState<BackupRecord[]>(() => {
    const stored = loadStorage<BackupRecord[]>('aethel_backups', INITIAL_BACKUPS);
    return sanitizeBackups(stored);
  });
  const [logs, setLogs] = useState<SystemLog[]>(() => 
    loadStorage<SystemLog[]>('aethel_logs', INITIAL_LOGS)
  );

  // Cloudflare Tunnel & WHM Accounts State
  const [tunnelStatus] = useState<CloudflareTunnelStatus>(INITIAL_TUNNEL_STATUS);
  const [tunnelRoutes, setTunnelRoutes] = useState<CloudflareTunnelRoute[]>(() => 
    loadStorage<CloudflareTunnelRoute[]>('aethel_tunnel_routes', INITIAL_TUNNEL_ROUTES)
  );
  const [hostingAccounts, setHostingAccounts] = useState<HostingAccount[]>(() => {
    const stored = loadStorage<HostingAccount[]>('aethel_hosting_accounts', INITIAL_HOSTING_ACCOUNTS);
    return sanitizeHostingAccounts(stored);
  });
  const [hostingPackages] = useState<HostingPackage[]>(() => 
    loadStorage<HostingPackage[]>('aethel_hosting_packages', INITIAL_HOSTING_PACKAGES)
  );

  // Synchronize dynamic collections to localStorage whenever they change
  useEffect(() => {
    saveStorage('aethel_hosting_accounts', hostingAccounts);
  }, [hostingAccounts]);

  useEffect(() => {
    saveStorage('aethel_websites', websites);
  }, [websites]);

  useEffect(() => {
    saveStorage('aethel_databases', databases);
  }, [databases]);

  useEffect(() => {
    saveStorage('aethel_db_users', dbUsers);
  }, [dbUsers]);

  useEffect(() => {
    saveStorage('aethel_backups', backups);
  }, [backups]);

  useEffect(() => {
    saveStorage('aethel_tunnel_routes', tunnelRoutes);
  }, [tunnelRoutes]);

  useEffect(() => {
    saveStorage('aethel_hosting_packages', hostingPackages);
  }, [hostingPackages]);

  useEffect(() => {
    saveStorage('aethel_logs', logs.slice(0, 50));
  }, [logs]);

  // Metric fluctuation simulation
  const handleRefreshMetrics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsagePercent: +(24 + Math.random() * 12).toFixed(1),
        networkInMbps: +(75 + Math.random() * 25).toFixed(1),
        networkOutMbps: +(150 + Math.random() * 30).toFixed(1),
        queriesPerSecond: Math.round(3600 + Math.random() * 500)
      }));
      setIsRefreshing(false);
      showToast('Status cluster server dan database terpusat telah disinkronisasi.', 'info');
    }, 600);
  };

  // Add new website & DB from automated installer
  const handleInstallComplete = (newSite: Website, newDb?: CentralizedDatabase, newUser?: DatabaseUser) => {
    setWebsites(prev => [newSite, ...prev]);

    if (newDb) {
      setDatabases(prev => [newDb, ...prev]);
    }
    if (newUser) {
      setDbUsers(prev => [newUser, ...prev]);
    }

    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      service: 'installer',
      level: 'success',
      message: `Website baru ${newSite.domain} (${newSite.appType.toUpperCase()}) dan basis data ${newSite.linkedDbName || 'tanpa-db'} berhasil disiapkan secara otomatis.`,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newLog, ...prev]);

    showToast(`Instalasi website otomatis untuk ${newSite.domain} berhasil selesai!`);
    setActiveTab('websites');
  };

  // Website handlers
  const handleDeleteWebsite = (siteId: string) => {
    const site = websites.find(w => w.id === siteId);
    if (!site) return;
    setWebsites(prev => prev.filter(w => w.id !== siteId));
    showToast(`Website ${site.domain} dan virtual host telah dihapus.`);
  };

  const handleToggleSiteStatus = (siteId: string) => {
    setWebsites(prev => prev.map(w => {
      if (w.id === siteId) {
        const nextStatus = w.status === 'running' ? 'stopped' : 'running';
        showToast(`Virtual host ${w.domain} sekarang ${nextStatus === 'running' ? 'Aktif' : 'Non-Aktif'}.`);
        return { ...w, status: nextStatus };
      }
      return w;
    }));
  };

  const handleRestartSitePool = (siteId: string) => {
    const site = websites.find(w => w.id === siteId);
    if (site) {
      showToast(`Process pool untuk ${site.domain} (${site.runtime}) telah dimuat ulang.`);
    }
  };

  // Database handlers
  const handleAddDatabase = (newDb: CentralizedDatabase) => {
    setDatabases(prev => [newDb, ...prev]);
    showToast(`Database terpusat '${newDb.name}' berhasil dibuat di cluster.`);
  };

  const handleDeleteDatabase = (dbId: string) => {
    const db = databases.find(d => d.id === dbId);
    if (!db) return;
    setDatabases(prev => prev.filter(d => d.id !== dbId));
    showToast(`Database '${db.name}' telah dihapus dari cluster.`);
  };

  const handleAddDbUser = (newUser: DatabaseUser) => {
    setDbUsers(prev => [newUser, ...prev]);
    showToast(`Pengguna '${newUser.username}' berhasil ditambahkan dengan whitelist '${newUser.allowedHost}'.`);
  };

  const handleDeleteDbUser = (userId: string) => {
    setDbUsers(prev => prev.filter(u => u.id !== userId));
    showToast(`Pengguna database telah dihapus.`);
  };

  const handleTriggerBackup = (dbName: string) => {
    const targetDb = databases.find(d => d.name === dbName);
    const newBak: BackupRecord = {
      id: `bak-${Date.now()}`,
      dbName,
      filename: `${dbName}_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}.sql.gz`,
      sizeMb: targetDb ? +(targetDb.sizeMb * 0.45).toFixed(1) : 45.0,
      type: 'manual',
      storageTarget: 'S3-ObjectStore',
      status: 'completed',
      createdAt: new Date().toLocaleString()
    };
    setBackups(prev => [newBak, ...prev]);
    showToast(`Snapshot database terpusat '${dbName}' selesai dibuat dan disimpan ke S3.`);
  };

  const handleRestoreBackup = (backupId: string) => {
    const bak = backups.find(b => b.id === backupId);
    if (bak) {
      showToast(`Database '${bak.dbName}' telah dipulihkan dari arsip ${bak.filename}.`);
    }
  };

  // Cloudflare Tunnel Handlers
  const handleAddTunnelRoute = (newRoute: CloudflareTunnelRoute) => {
    setTunnelRoutes(prev => [newRoute, ...prev]);
    showToast(`Rute Cloudflare Tunnel untuk '${newRoute.hostname}' aktif & terhubung ke edge.`);
  };

  const handleDeleteTunnelRoute = (routeId: string) => {
    const route = tunnelRoutes.find(r => r.id === routeId);
    if (!route) return;
    setTunnelRoutes(prev => prev.filter(r => r.id !== routeId));
    showToast(`Rute tunnel '${route.hostname}' telah dihapus.`);
  };

  // WHM Hosting Account Handlers
  const handleAddHostingAccount = (account: HostingAccount) => {
    setHostingAccounts(prev => [account, ...prev]);

    if (account.tunnelConnected) {
      const newRoute: CloudflareTunnelRoute = {
        id: `tun-rt-${Date.now()}`,
        hostname: account.domain,
        service: 'http://localhost:80',
        accountId: account.id,
        accountUsername: account.username,
        status: 'healthy',
        edgeLatencyMs: +(3.5 + Math.random() * 2).toFixed(1),
        dataCenter: 'CGK',
        requestsCount: 0,
        sslType: 'Full (Strict)',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTunnelRoutes(prev => [newRoute, ...prev]);
    }

    const newSite: Website = {
      id: `web-${Date.now()}`,
      domain: account.domain,
      title: `Website Akun ${account.username}`,
      appType: 'wordpress',
      status: 'running',
      runtime: 'PHP 8.3-FPM',
      documentRoot: account.homeDirectory,
      sslEnabled: true,
      sslExpiryDays: 90,
      sslIssuer: "Cloudflare Origin CA / Let's Encrypt",
      trafficMonthlyGb: 0.1,
      diskUsageMb: account.diskUsageMb,
      createdAt: account.createdAt
    };
    setWebsites(prev => [newSite, ...prev]);

    showToast(`Akun cPanel '@${account.username}' (${account.domain}) berhasil dibuat & ingress tunnel aktif!`);
  };

  const handleDeleteHostingAccount = (accountId: string) => {
    const acc = hostingAccounts.find(a => a.id === accountId);
    if (!acc) return;
    setHostingAccounts(prev => prev.filter(a => a.id !== accountId));
    setTunnelRoutes(prev => prev.filter(r => r.accountId !== accountId && r.hostname !== acc.domain));
    showToast(`Akun hosting '${acc.username}' telah diterminasi.`);
  };

  const handleToggleSuspendAccount = (accountId: string) => {
    setHostingAccounts(prev => prev.map(a => {
      if (a.id === accountId) {
        const nextStatus = a.status === 'active' ? 'suspended' : 'active';
        showToast(`Akun '${a.username}' sekarang berstatus: ${nextStatus === 'active' ? 'Aktif' : 'Suspended'}.`);
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  // Service controls
  const handleToggleService = (serviceId: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        const nextStatus = s.status === 'active' ? 'inactive' : 'active';
        showToast(`Servis systemctl '${s.name}' diubah menjadi: ${nextStatus}.`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleRestartService = (serviceId: string) => {
    const srv = services.find(s => s.id === serviceId);
    if (srv) {
      showToast(`systemctl reload ${srv.name} berhasil dijalankan.`);
    }
  };

  // If not logged in as the server owner (denbaguse / masbagus15), render LoginView
  if (!isAuthenticated) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-white animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        )}
      </>
    );
  }

  // Filtered views based on active role
  const visibleWebsites = filterWebsitesByRole(websites, currentUser);
  const visibleDatabases = filterDatabasesByRole(databases, currentUser);
  const visibleAccounts = filterAccountsByRole(hostingAccounts, currentUser);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Simulation Banner when not in Root Super Admin role */}
      {currentUser.role !== 'root' && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-white text-xs px-3 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-40 sticky top-0 shadow-md">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-black/30 font-bold uppercase text-[10px] tracking-wider shrink-0">
              Mode Simulasi
            </span>
            <span className="text-[11px] sm:text-xs">
              Anda sedang menguji tampilan <strong>{ROLE_CONFIG[currentUser.role].label} (@{currentUser.username})</strong>. Menu root server disembunyikan sesuai hak akses klien.
            </span>
          </div>
          <button
            onClick={() => handleSwitchUser(DEFAULT_ROOT_USER)}
            className="px-3 py-1 bg-black/40 hover:bg-black/60 text-white rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 shrink-0 active:scale-95 border border-white/20"
          >
            <span>Kembali ke Pemilik Server (@denbaguse) &rarr;</span>
          </button>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenInstaller={() => setIsInstallerOpen(true)}
        isRefreshing={isRefreshing}
        onRefreshMetrics={handleRefreshMetrics}
        onNavigateToTunnel={() => setActiveTab('tunnel')}
        onToggleMobileNav={() => setIsMobileNavOpen(prev => !prev)}
        isMobileNavOpen={isMobileNavOpen}
        currentUser={currentUser}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        currentTheme={currentTheme}
        onOpenThemeSwitcher={() => setIsThemeSwitcherOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsMobileNavOpen(false);
          }}
          currentLang={currentLang}
          websitesCount={visibleWebsites.length}
          databasesCount={visibleDatabases.length}
          accountsCount={visibleAccounts.length}
          tunnelRoutesCount={tunnelRoutes.length}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          onOpenSyncModal={currentUser.role === 'root' ? () => setIsSyncModalOpen(true) : undefined}
          onLanguageChange={setCurrentLang}
          currentUser={currentUser}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          onOpenThemeSwitcher={() => setIsThemeSwitcherOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 pb-24 md:pb-8 bg-slate-950 min-w-0">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {activeTab === 'dashboard' && (
              <DashboardView
                metrics={metrics}
                services={services}
                websites={visibleWebsites}
                databases={visibleDatabases}
                currentLang={currentLang}
                onNavigateTab={setActiveTab}
                onOpenInstaller={() => setIsInstallerOpen(true)}
                onToggleService={handleToggleService}
                onRestartService={handleRestartService}
                onOpenSyncModal={currentUser.role === 'root' ? () => setIsSyncModalOpen(true) : undefined}
                currentUser={currentUser}
                accountsCount={visibleAccounts.length}
                tunnelRoutesCount={tunnelRoutes.length}
                onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
                currentTheme={currentTheme}
                onSelectTheme={handleSelectTheme}
                onOpenThemeSwitcher={() => setIsThemeSwitcherOpen(true)}
              />
            )}

            {activeTab === 'tunnel' && (
              <CloudflareTunnelView
                tunnelStatus={tunnelStatus}
                routes={tunnelRoutes}
                websites={websites}
                onAddRoute={handleAddTunnelRoute}
                onDeleteRoute={handleDeleteTunnelRoute}
                currentLang={currentLang}
              />
            )}

            {activeTab === 'whm_accounts' && (
              <WhmAccountsView
                accounts={visibleAccounts}
                packages={hostingPackages}
                onAddAccount={handleAddHostingAccount}
                onDeleteAccount={handleDeleteHostingAccount}
                onToggleSuspend={handleToggleSuspendAccount}
                onOpenInstallerForAccount={() => {
                  setIsInstallerOpen(true);
                }}
                onNavigateTab={setActiveTab}
                onShowToast={showToast}
                currentLang={currentLang}
                currentUser={currentUser}
                onImpersonateAccount={(acc) => handleSwitchUser({ 
                  ...DEFAULT_CLIENT_USER, 
                  id: acc.id, 
                  username: acc.username, 
                  name: `${acc.domain} (${acc.username})`, 
                  domain: acc.domain, 
                  email: acc.ownerEmail, 
                  packageName: acc.packageName, 
                  diskQuotaMb: acc.diskQuotaMb, 
                  diskUsageMb: acc.diskUsageMb, 
                  bandwidthQuotaGb: acc.bandwidthQuotaGb, 
                  bandwidthUsageGb: acc.bandwidthUsageGb 
                })}
              />
            )}

            {activeTab === 'websites' && (
              <WebsitesView
                websites={visibleWebsites}
                onOpenInstaller={() => setIsInstallerOpen(true)}
                onDeleteWebsite={handleDeleteWebsite}
                onToggleSiteStatus={handleToggleSiteStatus}
                onRestartSitePool={handleRestartSitePool}
                onOpenDbStudio={() => {
                  setActiveTab('databases');
                }}
                currentLang={currentLang}
              />
            )}

            {activeTab === 'databases' && (
              <DatabasesView
                databases={visibleDatabases}
                dbUsers={dbUsers}
                onAddDatabase={handleAddDatabase}
                onDeleteDatabase={handleDeleteDatabase}
                onAddDbUser={handleAddDbUser}
                onDeleteDbUser={handleDeleteDbUser}
                onTriggerBackup={handleTriggerBackup}
                currentLang={currentLang}
              />
            )}

            {activeTab === 'php_settings' && (
              <PhpSettingsView
                websites={visibleWebsites}
                currentLang={currentLang}
                currentUser={currentUser}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'vhosts' && (
              <WebServerView
                websites={websites}
                onRestartService={handleRestartService}
                currentLang={currentLang}
              />
            )}

            {activeTab === 'files' && (
              <FileManagerView
                websites={websites}
                currentLang={currentLang}
              />
            )}

            {activeTab === 'reseller_branding' && (
              <ResellerBrandingView
                currentUser={currentUser}
                onUpdateBranding={handleUpdateResellerBranding}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'vps_cluster' && (
              <VpsClusterView
                currentUser={currentUser}
                onShowToast={showToast}
                onOpenTerminal={() => setActiveTab('terminal')}
              />
            )}

            {activeTab === 'billing_whmcs' && (
              <BillingWhmcsView
                currentUser={currentUser}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'terminal' && (
              <TerminalView
                currentLang={currentLang}
                onOpenSyncModal={currentUser.role === 'root' ? () => setIsSyncModalOpen(true) : undefined}
              />
            )}

            {activeTab === 'cron_jobs' && (
              <CronJobsView
                currentLang={currentLang}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'dns_network' && (
              <DnsNetworkView
                currentLang={currentLang}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'email_ftp' && (
              <EmailFtpView
                websites={visibleWebsites}
                currentUser={currentUser}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'backups' && (
              <BackupsView
                backups={backups}
                databases={databases}
                onTriggerBackup={handleTriggerBackup}
                onRestoreBackup={handleRestoreBackup}
                currentLang={currentLang}
              />
            )}

            {activeTab === 'security' && (
              <SecurityView
                websites={websites}
                currentLang={currentLang}
              />
            )}

            {activeTab === 'logs' && (
              <LogsView
                logs={logs}
                onRefreshLogs={() => {
                  showToast('Log sistem telah dimuat ulang.', 'info');
                }}
                currentLang={currentLang}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Dock) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileNavOpen(false);
        }}
        onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        currentLang={currentLang}
        tunnelRoutesCount={tunnelRoutes.length}
        currentUser={currentUser}
      />

      {/* Role Switcher & RBAC Simulation Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onClearCacheAndReload={handleClearCacheAndReload}
      />

      {/* Theme Switcher Modal */}
      <ThemeSwitcherModal
        isOpen={isThemeSwitcherOpen}
        onClose={() => setIsThemeSwitcherOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Automated Website Installer Modal Wizard */}
      <WebsiteInstallerModal
        isOpen={isInstallerOpen}
        onClose={() => setIsInstallerOpen(false)}
        onInstallComplete={handleInstallComplete}
        currentLang={currentLang}
      />

      {/* Auto-Sync & Server Update Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onOpenTerminalTab={() => setActiveTab('terminal')}
        currentUserRole={currentUser.role}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-white animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
