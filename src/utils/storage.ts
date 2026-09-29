/**
 * Persistent Storage Utilities for Cloud PRO
 * Ensures all user-created hosting accounts, websites, databases,
 * backups, and tunnel routes persist across browser refreshes,
 * while ensuring default demo/dummy data is strictly purged.
 */

const IS_BROWSER = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const CURRENT_STORAGE_VERSION = 'v3_clean_slate_2026';

// One-time automatic cleanup of legacy demo/dummy data on version upgrade
if (IS_BROWSER) {
  try {
    const installedVersion = window.localStorage.getItem('aethel_storage_version');
    if (installedVersion !== CURRENT_STORAGE_VERSION) {
      // Purge all legacy dummy data keys
      window.localStorage.removeItem('aethel_websites');
      window.localStorage.removeItem('aethel_databases');
      window.localStorage.removeItem('aethel_db_users');
      window.localStorage.removeItem('aethel_backups');
      window.localStorage.removeItem('aethel_hosting_accounts');
      window.localStorage.removeItem('aethel_tunnel_routes');
      window.localStorage.setItem('aethel_storage_version', CURRENT_STORAGE_VERSION);
    }
  } catch (e) {
    console.warn('[Storage] Migration warning:', e);
  }
}

export function loadStorage<T>(key: string, fallback: T): T {
  if (!IS_BROWSER) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[Storage] Failed to read key "${key}":`, error);
    return fallback;
  }
}

export function saveStorage<T>(key: string, value: T): void {
  if (!IS_BROWSER) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[Storage] Failed to write key "${key}":`, error);
  }
}

export function removeStorage(key: string): void {
  if (!IS_BROWSER) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[Storage] Failed to remove key "${key}":`, error);
  }
}

const DUMMY_DOMAINS = new Set([
  'portal-berita.id',
  'api.toko-online.com',
  'dashboard.saas-app.io',
  'blog.techindonesia.or.id',
  'company-profile.co.id'
]);

const DUMMY_DB_NAMES = new Set([
  'db_portal_wp',
  'db_ecommerce_prod',
  'db_saas_metrics',
  'db_ghost_press',
  'db_global_sessions'
]);

const DUMMY_USERS = new Set([
  'portalid',
  'tokoberkah',
  'saasowner',
  'techindo',
  'comppro',
  'u_portal_admin',
  'u_ecommerce_api',
  'u_bi_analytics_readonly',
  'u_saas_service',
  'u_ghost_writer'
]);

/**
 * Filter out legacy dummy websites
 */
export function sanitizeWebsites<T extends { id?: string; domain?: string }>(sites: T[]): T[] {
  if (!Array.isArray(sites)) return [];
  const dummyIds = new Set(['web-1', 'web-2', 'web-3', 'web-4', 'web-5']);
  return sites.filter(s => {
    if (s.id && dummyIds.has(s.id)) return false;
    if (s.domain && DUMMY_DOMAINS.has(s.domain)) return false;
    return true;
  });
}

/**
 * Filter out legacy dummy databases
 */
export function sanitizeDatabases<T extends { id?: string; name?: string }>(dbs: T[]): T[] {
  if (!Array.isArray(dbs)) return [];
  const dummyIds = new Set(['db-1', 'db-2', 'db-3', 'db-4', 'db-5']);
  return dbs.filter(d => {
    if (d.id && dummyIds.has(d.id)) return false;
    if (d.name && DUMMY_DB_NAMES.has(d.name)) return false;
    return true;
  });
}

/**
 * Filter out legacy dummy DB users
 */
export function sanitizeDbUsers<T extends { id?: string; username?: string }>(users: T[]): T[] {
  if (!Array.isArray(users)) return [];
  const dummyIds = new Set(['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5']);
  return users.filter(u => {
    if (u.id && dummyIds.has(u.id)) return false;
    if (u.username && DUMMY_USERS.has(u.username)) return false;
    return true;
  });
}

/**
 * Filter out legacy dummy backups
 */
export function sanitizeBackups<T extends { id?: string }>(backups: T[]): T[] {
  if (!Array.isArray(backups)) return [];
  const dummyIds = new Set(['bak-1', 'bak-2', 'bak-3', 'bak-4']);
  return backups.filter(b => !(b.id && dummyIds.has(b.id)));
}

/**
 * Filter out legacy dummy hosting accounts
 */
export function sanitizeHostingAccounts<T extends { id?: string; username?: string; domain?: string }>(accounts: T[]): T[] {
  if (!Array.isArray(accounts)) return [];
  const dummyIds = new Set(['acc-1', 'acc-2', 'acc-3', 'acc-4', 'acc-5']);
  return accounts.filter(acc => {
    if (acc.id && dummyIds.has(acc.id)) return false;
    if (acc.username && DUMMY_USERS.has(acc.username)) return false;
    if (acc.domain && DUMMY_DOMAINS.has(acc.domain)) return false;
    return true;
  });
}

/**
 * Complete clear cache utility
 */
export function clearPanelDataCache(): void {
  if (!IS_BROWSER) return;
  const keys = [
    'aethel_websites',
    'aethel_databases',
    'aethel_db_users',
    'aethel_backups',
    'aethel_hosting_accounts',
    'aethel_tunnel_routes',
    'aethel_logs'
  ];
  keys.forEach(k => window.localStorage.removeItem(k));
  window.localStorage.setItem('aethel_storage_version', CURRENT_STORAGE_VERSION);
  window.location.reload();
}
