import React, { useState } from 'react';
import { 
  Database, 
  Users, 
  Code2, 
  Activity, 
  Plus, 
  Search, 
  Play, 
  Archive, 
  Trash2, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  Layers, 
  Clock, 
  ArrowRight,
  ExternalLink,
  Table as TableIcon
} from 'lucide-react';
import { 
  CentralizedDatabase, 
  DatabaseUser, 
  SqlQueryResult, 
  Language, 
  BackupRecord 
} from '../types';
import { SAMPLE_SQL_TABLES } from '../data/initialData';
import { translations } from '../translations';

interface DatabasesViewProps {
  databases: CentralizedDatabase[];
  dbUsers: DatabaseUser[];
  onAddDatabase: (db: CentralizedDatabase) => void;
  onDeleteDatabase: (dbId: string) => void;
  onAddDbUser: (user: DatabaseUser) => void;
  onDeleteDbUser: (userId: string) => void;
  onTriggerBackup: (dbName: string) => void;
  currentLang: Language;
}

export const DatabasesView: React.FC<DatabasesViewProps> = ({
  databases,
  dbUsers,
  onAddDatabase,
  onDeleteDatabase,
  onAddDbUser,
  onDeleteDbUser,
  onTriggerBackup,
  currentLang
}) => {
  const t = translations[currentLang];

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'users' | 'studio' | 'perf'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New DB Modal state
  const [isNewDbModalOpen, setIsNewDbModalOpen] = useState<boolean>(false);
  const [newDbName, setNewDbName] = useState<string>('');
  const [newDbEngine, setNewDbEngine] = useState<'mysql' | 'postgres' | 'redis'>('mysql');
  const [newDbCollation, setNewDbCollation] = useState<string>('utf8mb4_unicode_ci');
  const [autoCreateUser, setAutoCreateUser] = useState<boolean>(true);

  // New User Modal state
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newUserHost, setNewUserHost] = useState<string>('10.240.0.% (Edge VPC)');
  const [newUserPrivileges, setNewUserPrivileges] = useState<'ALL PRIVILEGES' | 'READ_WRITE' | 'READ_ONLY'>('ALL PRIVILEGES');
  const [newUserDb, setNewUserDb] = useState<string>('');

  // SQL Studio state
  const [selectedDbForStudio, setSelectedDbForStudio] = useState<string>(databases[0]?.name || 'db_portal_wp');
  const [sqlQueryInput, setSqlQueryInput] = useState<string>('SELECT * FROM posts LIMIT 10;');
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState<boolean>(false);

  // Filtered databases
  const filteredDbs = databases.filter(db => 
    db.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    db.engine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (db.linkedWebsiteDomain && db.linkedWebsiteDomain.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle SQL Query Execution
  const handleExecuteQuery = () => {
    setIsExecutingQuery(true);
    setTimeout(() => {
      // Find sample data or generate simulated data
      const sample = SAMPLE_SQL_TABLES[selectedDbForStudio];
      if (sample) {
        setQueryResult({
          columns: sample.columns,
          rows: sample.rows,
          executionTimeMs: Math.round(Math.random() * 8 + 2),
          rowCount: sample.rows.length,
          query: sqlQueryInput
        });
      } else {
        setQueryResult({
          columns: ['id', 'name', 'status', 'created_at', 'updated_at'],
          rows: [
            { id: 1, name: 'Record Alpha', status: 'ACTIVE', created_at: '2026-09-27 02:00:10', updated_at: '2026-09-27 04:15:20' },
            { id: 2, name: 'Record Beta', status: 'SYNCED', created_at: '2026-09-27 03:12:00', updated_at: '2026-09-27 04:50:11' },
            { id: 3, name: 'Record Gamma', status: 'PENDING', created_at: '2026-09-27 04:30:44', updated_at: '2026-09-27 05:00:00' }
          ],
          executionTimeMs: Math.round(Math.random() * 5 + 1),
          rowCount: 3,
          query: sqlQueryInput
        });
      }
      setIsExecutingQuery(false);
    }, 200);
  };

  const handleCreateDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbName.trim()) return;

    const newDb: CentralizedDatabase = {
      id: `db-${Date.now().toString().slice(-4)}`,
      name: newDbName.trim(),
      engine: newDbEngine,
      host: newDbEngine === 'postgres' ? '10.240.0.14 (pg-cluster-main)' : '10.240.0.12 (db-cluster-primary)',
      port: newDbEngine === 'postgres' ? 5432 : 3306,
      collation: newDbCollation,
      charset: 'utf8mb4',
      sizeMb: 4.2,
      tablesCount: 0,
      usersCount: autoCreateUser ? 1 : 0,
      status: 'healthy',
      lastBackupDate: 'Baru saja dibuat',
      maxConnections: 100,
      activeConnections: 0
    };

    onAddDatabase(newDb);

    if (autoCreateUser) {
      onAddDbUser({
        id: `usr-${Date.now().toString().slice(-4)}`,
        username: `u_${newDbName.trim().slice(0, 12)}`,
        allowedHost: '10.240.0.% (Edge VPC)',
        privileges: 'ALL PRIVILEGES',
        databases: [newDbName.trim()],
        createdAt: new Date().toISOString().split('T')[0]
      });
    }

    setNewDbName('');
    setIsNewDbModalOpen(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const newUser: DatabaseUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      username: newUsername.trim(),
      allowedHost: newUserHost,
      privileges: newUserPrivileges,
      databases: newUserDb ? [newUserDb] : [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddDbUser(newUser);
    setNewUsername('');
    setIsNewUserModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Cluster Database</span>
            <span aria-hidden="true">/</span>
            <span className="text-indigo-400 font-mono">10.240.0.12:3306 & 10.240.0.14:5432</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t.databases.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.databases.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewUserModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.databases.createNewUser}</span>
          </button>
          <button
            onClick={() => setIsNewDbModalOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.databases.createNewDb}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation (Functional buttons, clean segmented control) */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-full sm:w-fit overflow-x-auto touch-scroll">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'list'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{t.databases.tabList}</span>
          <span className="text-[11px] font-mono tabular-nums opacity-80 bg-black/20 px-1 rounded">
            {databases.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'users'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t.databases.tabUsers}</span>
          <span className="text-[11px] font-mono tabular-nums opacity-80 bg-black/20 px-1 rounded">
            {dbUsers.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('studio');
            if (!queryResult) handleExecuteQuery();
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'studio'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{t.databases.tabStudio}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('perf')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'perf'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{t.databases.tabPerf}</span>
        </button>
      </div>

      {/* SUB-TAB 1: Database List */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari database, host, atau website..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              Total Ukuran Cluster: <span className="font-mono text-white tabular-nums">1.78 GB</span>
            </div>
          </div>

          {/* Database List Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            {filteredDbs.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">Belum Ada Database</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Semua database demo default telah dibersihkan. Klik tombol di bawah untuk membuat database MySQL atau PostgreSQL baru.
                </p>
                <button
                  onClick={() => setIsNewDbModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Buat Database Baru</span>
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Database Cards (< md) */}
                <div className="md:hidden divide-y divide-slate-800/80">
                  {filteredDbs.map((db) => (
                <div key={db.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-bold text-white font-mono text-xs sm:text-sm truncate">{db.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                        {db.collation} · {db.tablesCount} tabel
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase shrink-0 ${
                      db.engine === 'mysql' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : db.engine === 'postgres'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {db.engine}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-sans">Kapasitas</span>
                      <span className="text-slate-200 font-bold">{db.sizeMb.toFixed(1)} MB</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-sans">Koneksi Aktif</span>
                      <span className="text-emerald-400 font-semibold">{db.activeConnections}/{db.maxConnections}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedDbForStudio(db.name);
                        setActiveSubTab('studio');
                        handleExecuteQuery();
                      }}
                      className="flex-1 py-1.5 px-2.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>SQL Studio</span>
                    </button>
                    <button
                      onClick={() => onTriggerBackup(db.name)}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1"
                      title="Backup database"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Backup</span>
                    </button>
                    <button
                      onClick={() => onDeleteDatabase(db.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Nama Database</th>
                    <th className="px-4 py-3">{t.databases.engine}</th>
                    <th className="px-4 py-3">{t.databases.hostCluster}</th>
                    <th className="px-4 py-3 text-right">{t.databases.size}</th>
                    <th className="px-4 py-3 text-right">{t.databases.tables}</th>
                    <th className="px-4 py-3">{t.databases.linkedSite}</th>
                    <th className="px-4 py-3">Koneksi Aktif</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredDbs.map((db) => (
                    <tr key={db.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white font-mono">
                        <div className="flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{db.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {db.collation}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase ${
                          db.engine === 'mysql' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : db.engine === 'postgres'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {db.engine}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                        {db.host}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums">
                        {db.sizeMb.toFixed(1)} MB
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums">
                        {db.tablesCount}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {db.linkedWebsiteDomain || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-slate-300 text-[11px]">
                        <span className="text-emerald-400 font-semibold">{db.activeConnections}</span> / {db.maxConnections}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedDbForStudio(db.name);
                              setActiveSubTab('studio');
                              handleExecuteQuery();
                            }}
                            title="Buka di SQL Studio"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onTriggerBackup(db.name)}
                            title="Backup database sekarang (.sql.gz)"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDatabase(db.id)}
                            title="Hapus database"
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
            </>
          )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Users & Remote Access Management */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Kontrol Keamanan Akses Jarak Jauh (Remote Grants):</span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Karena cluster database terpusat berada pada node terpisah (<code className="text-indigo-300 font-mono">10.240.0.12</code>), setiap pengguna database harus memiliki izin spesifik terhadap subnet VPC web server (<code className="text-indigo-300 font-mono">10.240.0.%</code>) agar aman dari serangan publik luar.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            {/* Mobile Users Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-800/80">
              {dbUsers.map((user) => (
                <div key={user.id} className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white font-mono flex items-center gap-1.5 text-xs sm:text-sm">
                        <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{user.username}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Host: <span className="text-slate-200">{user.allowedHost}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded text-[10px] font-mono">
                      {user.privileges}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="font-mono text-slate-300 truncate max-w-[200px]">DB: {user.databases.join(', ')}</span>
                    <button
                      onClick={() => onDeleteDbUser(user.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg"
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Users Table (>= md) */}
            <div className="hidden md:block overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Nama Pengguna (User)</th>
                    <th className="px-4 py-3">Host Whitelist Diizinkan</th>
                    <th className="px-4 py-3">Tingkat Hak Akses (Privileges)</th>
                    <th className="px-4 py-3">Basis Data Diizinkan</th>
                    <th className="px-4 py-3">Dibuat Pada</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {dbUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white font-mono flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{user.username}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                        {user.allowedHost}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[11px] font-mono">
                          {user.privileges}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                        {user.databases.join(', ')}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {user.createdAt}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onDeleteDbUser(user.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SQL Query Studio & Table Explorer */}
      {activeSubTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Database Selector & Table Explorer - 4 cols */}
          <div className="lg:col-span-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pilih Database Target:
              </label>
              <select
                value={selectedDbForStudio}
                onChange={(e) => {
                  setSelectedDbForStudio(e.target.value);
                  setTimeout(() => handleExecuteQuery(), 50);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                {databases.map((db) => (
                  <option key={db.id} value={db.name}>
                    {db.name} ({db.engine.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Preset Query Cepat</span>
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSqlQueryInput(`SELECT * FROM ${selectedDbForStudio.includes('wp') ? 'wp_posts' : selectedDbForStudio.includes('ecommerce') ? 'orders' : 'metrics'} LIMIT 25;`);
                    setTimeout(() => handleExecuteQuery(), 50);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-mono text-slate-300 hover:bg-slate-800 rounded transition-colors"
                >
                  ▶ SELECT * FROM utama LIMIT 25;
                </button>
                <button
                  onClick={() => {
                    setSqlQueryInput('SHOW TABLES;');
                    setTimeout(() => handleExecuteQuery(), 50);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-mono text-slate-300 hover:bg-slate-800 rounded transition-colors"
                >
                  ▶ SHOW TABLES;
                </button>
                <button
                  onClick={() => {
                    setSqlQueryInput("SHOW STATUS LIKE 'Threads_connected';");
                    setTimeout(() => handleExecuteQuery(), 50);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-mono text-slate-300 hover:bg-slate-800 rounded transition-colors"
                >
                  ▶ SHOW STATUS LIKE 'Threads_%';
                </button>
                <button
                  onClick={() => {
                    setSqlQueryInput('SHOW SLAVE STATUS\\G;');
                    setTimeout(() => handleExecuteQuery(), 50);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-mono text-slate-300 hover:bg-slate-800 rounded transition-colors"
                >
                  ▶ Cek Status Replikasi Cluster
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2">
              <span className="font-semibold text-slate-300">Cluster Node Info:</span>
              <div className="text-[11px] font-mono text-slate-400 space-y-1">
                <div>Host: 10.240.0.12 (Primary)</div>
                <div>Engine: InnoDB Buffer 16GB</div>
                <div>Isolation: READ-COMMITTED</div>
              </div>
            </div>
          </div>

          {/* Right panel: SQL Editor & Results - 8 cols */}
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 font-mono">
                  SQL Query Console ({selectedDbForStudio})
                </span>
                <button
                  onClick={handleExecuteQuery}
                  disabled={isExecutingQuery}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                  <span>{isExecutingQuery ? 'Mengeksekusi...' : t.databases.runQueryBtn}</span>
                </button>
              </div>

              <textarea
                value={sqlQueryInput}
                onChange={(e) => setSqlQueryInput(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Query Results */}
            {queryResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Query berhasil dijalankan: <span className="font-mono text-white tabular-nums">{queryResult.rowCount} baris ditemukan</span></span>
                  </div>
                  <div className="font-mono text-[11px] tabular-nums text-slate-400">
                    Durasi: <span className="text-emerald-400">{queryResult.executionTimeMs} ms</span>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                      <tr>
                        {queryResult.columns.map((col) => (
                          <th key={col} className="px-4 py-2 font-mono">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {queryResult.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-800/40">
                          {queryResult.columns.map((col) => (
                            <td key={col} className="px-4 py-2 text-slate-200">
                              {String(row[col] ?? 'NULL')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Performance & Slow Query Log */}
      {activeSubTab === 'perf' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="text-slate-400 mb-1">Buffer Pool Hit Rate</div>
              <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">99.64%</div>
              <div className="text-[11px] text-slate-500 mt-1">Reads from memory cache</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="text-slate-400 mb-1">Queries Per Detik (QPS)</div>
              <div className="text-xl font-bold text-white font-mono tabular-nums">3,840 QPS</div>
              <div className="text-[11px] text-slate-500 mt-1">Throughput rata-rata</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="text-slate-400 mb-1">Replication Lag</div>
              <div className="text-xl font-bold text-cyan-400 font-mono tabular-nums">0.00s</div>
              <div className="text-[11px] text-slate-500 mt-1">Master to Replica 1</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="text-slate-400 mb-1">Slow Query Threshold</div>
              <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">1.0s</div>
              <div className="text-[11px] text-slate-500 mt-1">long_query_time setting</div>
            </div>
          </div>

          {/* Slow Query Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Log Kueri Lambat (Slow Query Analysis)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Daftar query yang melebihi batas waktu eksekusi 1 detik untuk optimasi index.
                </p>
              </div>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Query SQL</th>
                  <th className="px-4 py-2.5">Durasi</th>
                  <th className="px-4 py-2.5">Rows Examined</th>
                  <th className="px-4 py-2.5">Client Host</th>
                  <th className="px-4 py-2.5 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-[11px]">
                <tr className="hover:bg-slate-800/30">
                  <td className="px-4 py-2.5 text-slate-200">
                    SELECT o.*, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.total &gt; 5000000;
                  </td>
                  <td className="px-4 py-2.5 text-amber-400 font-semibold tabular-nums">1.42s</td>
                  <td className="px-4 py-2.5 text-slate-300 tabular-nums">142,800</td>
                  <td className="px-4 py-2.5 text-slate-400">10.240.0.15</td>
                  <td className="px-4 py-2.5 text-right text-slate-500">05:12:40</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="px-4 py-2.5 text-slate-200">
                    SELECT post_title, post_content FROM wp_posts WHERE post_content LIKE '%transformasi%' ORDER BY post_date DESC;
                  </td>
                  <td className="px-4 py-2.5 text-amber-400 font-semibold tabular-nums">1.08s</td>
                  <td className="px-4 py-2.5 text-slate-300 tabular-nums">84,200</td>
                  <td className="px-4 py-2.5 text-slate-400">10.240.0.10</td>
                  <td className="px-4 py-2.5 text-right text-slate-500">04:48:15</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Database */}
      {isNewDbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateDatabase} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Buat Database Terpusat Baru</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Database</label>
              <input
                type="text"
                required
                placeholder="misal: db_layanan_baru"
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mesin Database</label>
              <select
                value={newDbEngine}
                onChange={(e) => setNewDbEngine(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="mysql">MySQL 8.4 Enterprise (Primary 10.240.0.12)</option>
                <option value="postgres">PostgreSQL 16 (10.240.0.14)</option>
                <option value="redis">Redis 7.2 Cache Cluster (10.240.0.18)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Collation</label>
              <input
                type="text"
                value={newDbCollation}
                onChange={(e) => setNewDbCollation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={autoCreateUser}
                onChange={(e) => setAutoCreateUser(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600"
              />
              <span>Sekaligus buat pengguna database & berikan hak akses remote VPC</span>
            </label>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewDbModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold"
              >
                Buat Database
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New Database User */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateUser} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Tambah Pengguna Database Baru</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Pengguna (Username)</label>
              <input
                type="text"
                required
                placeholder="u_nama_service"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Host Diizinkan (Whitelist)</label>
              <input
                type="text"
                value={newUserHost}
                onChange={(e) => setNewUserHost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tingkat Hak Akses</label>
              <select
                value={newUserPrivileges}
                onChange={(e) => setNewUserPrivileges(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL PRIVILEGES">ALL PRIVILEGES (Aplikasi Produksi)</option>
                <option value="READ_WRITE">READ & WRITE (SELECT, INSERT, UPDATE)</option>
                <option value="READ_ONLY">READ ONLY (Pelaporan / BI Analytics)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Database Yang Diberikan Akses</label>
              <select
                value={newUserDb}
                onChange={(e) => setNewUserDb(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="">Semua Database / Default</option>
                {databases.map((db) => (
                  <option key={db.id} value={db.name}>{db.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewUserModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold"
              >
                Tambah Pengguna
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
