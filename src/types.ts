export type AppType = 
  | 'wordpress' 
  | 'laravel' 
  | 'nodejs' 
  | 'django' 
  | 'ghost' 
  | 'static' 
  | 'custom_git';

export type DatabaseEngine = 'mysql' | 'postgres' | 'redis' | 'mongodb';

export interface Website {
  id: string;
  domain: string;
  title: string;
  appType: AppType;
  status: 'running' | 'stopped' | 'installing' | 'error';
  runtime: string;
  documentRoot: string;
  sslEnabled: boolean;
  sslExpiryDays: number;
  sslIssuer: string;
  linkedDbId?: string;
  linkedDbName?: string;
  port?: number;
  gitRepo?: string;
  gitBranch?: string;
  trafficMonthlyGb: number;
  diskUsageMb: number;
  accountUsername?: string;
  createdAt: string;
}

export interface CentralizedDatabase {
  id: string;
  name: string;
  engine: DatabaseEngine;
  host: string;
  port: number;
  collation: string;
  charset: string;
  sizeMb: number;
  tablesCount: number;
  linkedWebsiteDomain?: string;
  accountUsername?: string;
  usersCount: number;
  status: 'healthy' | 'syncing' | 'warning';
  lastBackupDate: string;
  maxConnections: number;
  activeConnections: number;
}

export interface DatabaseUser {
  id: string;
  username: string;
  allowedHost: string;
  privileges: 'ALL PRIVILEGES' | 'READ_WRITE' | 'READ_ONLY' | 'CUSTOM';
  databases: string[];
  createdAt: string;
}

export interface BackupRecord {
  id: string;
  dbName: string;
  filename: string;
  sizeMb: number;
  type: 'automated' | 'manual';
  storageTarget: 'S3-ObjectStore' | 'Local-NVMe-RAID10';
  status: 'completed' | 'in_progress' | 'failed';
  createdAt: string;
}

export interface ServerService {
  id: string;
  name: string;
  displayName: string;
  category: 'webserver' | 'database' | 'cache' | 'runtime' | 'system';
  status: 'active' | 'inactive' | 'reloading';
  uptime: string;
  memoryMb: number;
  cpuPercent: number;
  port: number | string;
  version: string;
  description: string;
}

export interface ServerMetricData {
  cpuUsagePercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  networkInMbps: number;
  networkOutMbps: number;
  queriesPerSecond: number;
  activeDbConnections: number;
  bufferPoolHitRatePercent: number;
}

export interface TerminalEntry {
  id: string;
  command: string;
  output: string;
  timestamp: string;
  type: 'system' | 'user' | 'error' | 'success';
}

export interface SystemLog {
  id: string;
  service: 'nginx' | 'mysql-cluster' | 'php-fpm' | 'redis' | 'certbot' | 'installer';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  timestamp: string;
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowCount: number;
  query: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'websites' 
  | 'databases' 
  | 'php_settings'
  | 'tunnel'
  | 'whm_accounts'
  | 'reseller_branding'
  | 'vps_cluster'
  | 'billing_whmcs'
  | 'vhosts' 
  | 'files' 
  | 'terminal' 
  | 'cron_jobs'
  | 'dns_network'
  | 'email_ftp'
  | 'backups' 
  | 'security' 
  | 'logs';

export type UserRole = 'root' | 'reseller' | 'client';

export interface ResellerBranding {
  companyName: string;
  logoUrl?: string; // base64 data URL or custom URL
  portalTitle?: string;
  supportEmail?: string;
  footerText?: string;
  accentColor?: string;
}

export interface CurrentSessionUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  domain?: string;
  packageName?: string;
  accountId?: string;
  resellerOwner?: string;
  resellerBranding?: ResellerBranding;
  diskQuotaMb?: number;
  diskUsageMb?: number;
  bandwidthQuotaGb?: number;
  bandwidthUsageGb?: number;
  resellerMaxAccounts?: number;
  resellerDiskQuotaGb?: number;
  resellerBandwidthQuotaGb?: number;
}

export interface CloudflareTunnelRoute {
  id: string;
  hostname: string;
  service: string;
  accountId?: string;
  accountUsername?: string;
  status: 'healthy' | 'warning' | 'offline';
  edgeLatencyMs: number;
  dataCenter: string;
  requestsCount: number;
  sslType: 'Full (Strict)' | 'Flexible';
  createdAt: string;
}

export interface CloudflareTunnelStatus {
  tunnelId: string;
  tunnelName: string;
  status: 'connected' | 'syncing' | 'degraded';
  version: string;
  connectorsCount: number;
  nearestEdge: string;
  cgnatBypass: boolean;
  publicIpNeeded: boolean;
  activeRoutesCount: number;
  uptime: string;
}

export interface HostingAccount {
  id: string;
  username: string;
  password?: string;
  domain: string;
  ownerEmail: string;
  packageName: string;
  diskUsageMb: number;
  diskQuotaMb: number;
  bandwidthUsageGb: number;
  bandwidthQuotaGb: number;
  status: 'active' | 'suspended';
  suspendReason?: string;
  databasesCount: number;
  maxDatabases: number;
  homeDirectory: string;
  tunnelHostname: string;
  tunnelConnected: boolean;
  createdAt: string;
  accountType?: 'client' | 'reseller';
  resellerOwner?: string; // Username of reseller who owns this account
  resellerMaxAccounts?: number;
  resellerDiskQuotaGb?: number;
  resellerBandwidthQuotaGb?: number;
  resellerBranding?: ResellerBranding;
}

export interface HostingPackage {
  id: string;
  name: string;
  quotaMb: number;
  bandwidthGb: number;
  maxDatabases: number;
  maxSubdomains: number;
  isResellerPackage?: boolean;
}

export type Language = 'id' | 'en';
