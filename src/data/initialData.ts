import { 
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
} from '../types';

export const INITIAL_METRICS: ServerMetricData = {
  cpuUsagePercent: 28.4,
  ramUsedGb: 19.8,
  ramTotalGb: 64.0,
  diskUsedGb: 284.5,
  diskTotalGb: 1024.0,
  networkInMbps: 84.2,
  networkOutMbps: 162.7,
  queriesPerSecond: 3840,
  activeDbConnections: 48,
  bufferPoolHitRatePercent: 99.6
};

export const INITIAL_SERVICES: ServerService[] = [
  {
    id: 'srv-nginx',
    name: 'nginx',
    displayName: 'Nginx High-Performance Web Server',
    category: 'webserver',
    status: 'active',
    uptime: '48 hari 14 jam',
    memoryMb: 245,
    cpuPercent: 3.2,
    port: '80, 443 (HTTP/2, HTTP/3)',
    version: '1.26.2 (Ubuntu)',
    description: 'Reverse proxy utama, penanganan virtual host, dan terminasi SSL.'
  },
  {
    id: 'srv-mysql',
    name: 'mysql-cluster',
    displayName: 'MySQL 8.4 Centralized Cluster Primary',
    category: 'database',
    status: 'active',
    uptime: '48 hari 14 jam',
    memoryMb: 8420,
    cpuPercent: 12.8,
    port: '3306 (VPC 10.240.0.0/16)',
    version: '8.4.2 LTS Enterprise',
    description: 'Node basis data terpusat utama dengan InnoDB buffer pool 16GB dan binlog streaming.'
  },
  {
    id: 'srv-postgres',
    name: 'postgresql',
    displayName: 'PostgreSQL 16 Relational Engine',
    category: 'database',
    status: 'active',
    uptime: '32 hari 6 jam',
    memoryMb: 4120,
    cpuPercent: 4.6,
    port: '5432 (Internal)',
    version: '16.4',
    description: 'Mesin database relasional ACID untuk analitik dan transaksi kompleks.'
  },
  {
    id: 'srv-redis',
    name: 'redis-server',
    displayName: 'Redis 7.2 In-Memory Object Cache',
    category: 'cache',
    status: 'active',
    uptime: '48 hari 14 jam',
    memoryMb: 1120,
    cpuPercent: 1.8,
    port: '6379 (Protected)',
    version: '7.2.5',
    description: 'Penyimpanan sesi terdistribusi, query cache, dan message broker.'
  },
  {
    id: 'srv-php83',
    name: 'php8.3-fpm',
    displayName: 'PHP 8.3 FastCGI Process Manager',
    category: 'runtime',
    status: 'active',
    uptime: '14 hari 8 jam',
    memoryMb: 1850,
    cpuPercent: 5.4,
    port: 'unix:/run/php/php8.3-fpm.sock',
    version: '8.3.11 with OPcache JIT',
    description: 'Eksekusi aplikasi PHP modern (Laravel 11, WordPress 6.6).'
  },
  {
    id: 'srv-php82',
    name: 'php8.2-fpm',
    displayName: 'PHP 8.2 FastCGI Process Manager',
    category: 'runtime',
    status: 'active',
    uptime: '14 hari 8 jam',
    memoryMb: 920,
    cpuPercent: 1.2,
    port: 'unix:/run/php/php8.2-fpm.sock',
    version: '8.2.23',
    description: 'Pool proses kompatibilitas untuk aplikasi legacy.'
  },
  {
    id: 'srv-supervisor',
    name: 'supervisor',
    displayName: 'Supervisor Daemon Process Controller',
    category: 'system',
    status: 'active',
    uptime: '48 hari 14 jam',
    memoryMb: 120,
    cpuPercent: 0.3,
    port: 'local socket',
    version: '4.2.5',
    description: 'Manajer antrean queue worker Laravel dan servis latar belakang Node.js.'
  }
];

export const INITIAL_WEBSITES: Website[] = [];

export const INITIAL_DATABASES: CentralizedDatabase[] = [];

export const INITIAL_DB_USERS: DatabaseUser[] = [];

export const INITIAL_BACKUPS: BackupRecord[] = [];

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    service: 'mysql-cluster',
    level: 'info',
    message: '[Note] Server hostname: db-cluster-primary.internal, Version: 8.4.2, InnoDB buffer pool hit rate: 99.6%.',
    timestamp: '05:18:22'
  },
  {
    id: 'log-2',
    service: 'nginx',
    level: 'info',
    message: 'GET /api/v1/catalog HTTP/2.0 - 200 OK - 12.4ms - Client: 180.248.92.14',
    timestamp: '05:19:04'
  },
  {
    id: 'log-3',
    service: 'php-fpm',
    level: 'info',
    message: '[pool default] child executed in 28.2ms, memory 14.5MB',
    timestamp: '05:19:42'
  },
  {
    id: 'log-4',
    service: 'certbot',
    level: 'success',
    message: 'Auto-renewal daemon: Certbot SSL monitoring ready.',
    timestamp: '05:20:00'
  },
  {
    id: 'log-5',
    service: 'installer',
    level: 'info',
    message: 'Sistem siap. Belum ada website klien yang terpasang.',
    timestamp: '05:20:30'
  }
];

// Sample table records for the SQL Query Studio
export const SAMPLE_SQL_TABLES: Record<string, { columns: string[]; rows: Record<string, any>[] }> = {};

export const INITIAL_TUNNEL_STATUS: CloudflareTunnelStatus = {
  tunnelId: 'cf-tun-8941a7b2-0391-4cf1-889a',
  tunnelName: 'aethel-homelab-prod',
  status: 'connected',
  version: '2024.8.3 (cloudflared daemon)',
  connectorsCount: 4,
  nearestEdge: 'CGK (Jakarta Edge) & SIN (Singapore Edge)',
  cgnatBypass: true,
  publicIpNeeded: false,
  activeRoutesCount: 0,
  uptime: '48 hari 14 jam'
};

export const INITIAL_TUNNEL_ROUTES: CloudflareTunnelRoute[] = [];

export const INITIAL_HOSTING_PACKAGES: HostingPackage[] = [
  {
    id: 'pkg-starter',
    name: 'Starter Plan (UMKM)',
    quotaMb: 5120, // 5GB
    bandwidthGb: 50,
    maxDatabases: 2,
    maxSubdomains: 3
  },
  {
    id: 'pkg-business',
    name: 'Business Pro (High Traffic)',
    quotaMb: 25600, // 25GB
    bandwidthGb: 250,
    maxDatabases: 8,
    maxSubdomains: 15
  },
  {
    id: 'pkg-unlimited',
    name: 'Enterprise Unmetered',
    quotaMb: 102400, // 100GB
    bandwidthGb: 1000,
    maxDatabases: 50,
    maxSubdomains: 50
  }
];

export const INITIAL_HOSTING_ACCOUNTS: HostingAccount[] = [];

