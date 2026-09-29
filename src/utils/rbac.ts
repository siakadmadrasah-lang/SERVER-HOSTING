import { ActiveTab, CurrentSessionUser, DatabaseEngine, HostingAccount, UserRole, Website, CentralizedDatabase } from '../types';

export const DEFAULT_ROOT_USER: CurrentSessionUser = {
  id: 'root-sysadmin',
  username: 'denbaguse',
  name: 'Denbaguse (Pemilik & Pengelola Server)',
  email: 'siakadmadrasahku@gmail.com',
  role: 'root'
};

export const DEFAULT_RESELLER_USER: CurrentSessionUser = {
  id: 'reseller-demo',
  username: 'reseller_utama',
  name: 'Mitra Reseller Hosting',
  email: 'reseller@denbagoes.my.id',
  role: 'reseller',
  resellerMaxAccounts: 10,
  resellerDiskQuotaGb: 50,
  resellerBandwidthQuotaGb: 500
};

export const DEFAULT_CLIENT_USER: CurrentSessionUser = {
  id: 'client-demo',
  username: 'klien_web',
  name: 'Bagus Web Studio (Klien cPanel)',
  email: 'klien@denbagoes.my.id',
  role: 'client',
  domain: 'klien.denbagoes.my.id',
  packageName: 'Business-NVMe',
  diskQuotaMb: 10000,
  diskUsageMb: 850,
  bandwidthQuotaGb: 100,
  bandwidthUsageGb: 4.5
};

export const ROLE_CONFIG: Record<UserRole, {
  label: string;
  badgeLabel: string;
  badgeColor: string;
  description: string;
  allowedTabs: ActiveTab[];
  canManageServerDaemons: boolean;
  canAccessRootTerminal: boolean;
  canAccessCloudflareTunnel: boolean;
  canAccessVhosts: boolean;
  canAccessFirewall: boolean;
  canAccessSystemLogs: boolean;
  canCreateResellers: boolean;
  canManageAllAccounts: boolean;
  homeDirPrefix: string;
}> = {
  root: {
    label: 'Root Super Admin',
    badgeLabel: 'Root WHM',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Akses penuh tanpa batas: Kelola seluruh infrastruktur server, Multi-VPS Cluster, Billing Hosting/VPS, Cloudflare Ingress, Daemon, dan Terminal Root.',
    allowedTabs: ['dashboard', 'vps_cluster', 'billing_whmcs', 'tunnel', 'whm_accounts', 'reseller_branding', 'websites', 'databases', 'php_settings', 'vhosts', 'files', 'email_ftp', 'terminal', 'cron_jobs', 'dns_network', 'backups', 'security', 'logs'],
    canManageServerDaemons: true,
    canAccessRootTerminal: true,
    canAccessCloudflareTunnel: true,
    canAccessVhosts: true,
    canAccessFirewall: true,
    canAccessSystemLogs: true,
    canCreateResellers: true,
    canManageAllAccounts: true,
    homeDirPrefix: '/var/www'
  },
  reseller: {
    label: 'Reseller Hosting',
    badgeLabel: 'Reseller WHM',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Tingkat Reseller: Membuat dan mengelola klien hosting/VPS sendiri, tagihan klien, serta alokasi kuota disk & akun.',
    allowedTabs: ['dashboard', 'vps_cluster', 'billing_whmcs', 'whm_accounts', 'reseller_branding', 'websites', 'databases', 'php_settings', 'files', 'email_ftp', 'cron_jobs', 'dns_network', 'backups'],
    canManageServerDaemons: false,
    canAccessRootTerminal: false,
    canAccessCloudflareTunnel: false,
    canAccessVhosts: false,
    canAccessFirewall: false,
    canAccessSystemLogs: false,
    canCreateResellers: false,
    canManageAllAccounts: false, // Hanya akun klien milik reseller ini
    homeDirPrefix: '/home'
  },
  client: {
    label: 'Klien Hosting (cPanel)',
    badgeLabel: 'cPanel Klien',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Tingkat Klien Mandiri: Mengelola situs web, database, berkas, dan cadangan miliknya sendiri.',
    allowedTabs: ['dashboard', 'websites', 'databases', 'php_settings', 'files', 'email_ftp', 'cron_jobs', 'dns_network', 'backups'],
    canManageServerDaemons: false,
    canAccessRootTerminal: false,
    canAccessCloudflareTunnel: false,
    canAccessVhosts: false,
    canAccessFirewall: false,
    canAccessSystemLogs: false,
    canCreateResellers: false,
    canManageAllAccounts: false,
    homeDirPrefix: '/home'
  }
};

/**
 * Filter websites based on active session role
 */
export function filterWebsitesByRole(
  websites: Website[], 
  user: CurrentSessionUser
): Website[] {
  if (user.role === 'root') return websites;
  if (user.role === 'client') {
    return websites.filter(w => 
      w.accountUsername === user.username || 
      (user.domain && w.domain.includes(user.domain))
    );
  }
  // Reseller sees websites of its owned clients + reseller's own
  return websites.filter(w => 
    w.accountUsername === user.username || 
    !w.accountUsername ||
    w.accountUsername.startsWith(user.username)
  );
}

/**
 * Filter databases based on active session role
 */
export function filterDatabasesByRole(
  databases: CentralizedDatabase[], 
  user: CurrentSessionUser
): CentralizedDatabase[] {
  if (user.role === 'root') return databases;
  if (user.role === 'client') {
    return databases.filter(d => 
      d.accountUsername === user.username || 
      d.name.startsWith(user.username)
    );
  }
  // Reseller sees databases of its clients
  return databases.filter(d => 
    d.accountUsername === user.username || 
    !d.accountUsername ||
    d.name.startsWith(user.username)
  );
}

/**
 * Filter hosting accounts based on active session role
 */
export function filterAccountsByRole(
  accounts: HostingAccount[], 
  user: CurrentSessionUser
): HostingAccount[] {
  if (user.role === 'root') return accounts;
  if (user.role === 'reseller') {
    return accounts.filter(a => a.resellerOwner === user.username);
  }
  // Client does not manage other accounts
  return accounts.filter(a => a.username === user.username);
}
