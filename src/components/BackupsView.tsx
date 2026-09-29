import React, { useState } from 'react';
import { 
  Archive, 
  Download, 
  RotateCcw, 
  Plus, 
  HardDrive, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Database
} from 'lucide-react';
import { BackupRecord, CentralizedDatabase, Language } from '../types';

interface BackupsViewProps {
  backups: BackupRecord[];
  databases: CentralizedDatabase[];
  onTriggerBackup: (dbName: string) => void;
  onRestoreBackup: (backupId: string) => void;
  currentLang: Language;
}

export const BackupsView: React.FC<BackupsViewProps> = ({
  backups,
  databases,
  onTriggerBackup,
  onRestoreBackup,
  currentLang
}) => {
  const [selectedDbToBackup, setSelectedDbToBackup] = useState<string>(databases[0]?.name || '');
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);

  const handleStartBackup = () => {
    if (!selectedDbToBackup) return;
    setIsBackingUp(true);
    setTimeout(() => {
      onTriggerBackup(selectedDbToBackup);
      setIsBackingUp(false);
    }, 1200);
  };

  const handleDownloadDump = (filename: string) => {
    // Generate simulated SQL dump download
    const dummySql = `-- Cloud PRO Centralized DB Backup Dump\n-- Database: ${filename}\n-- Date: ${new Date().toISOString()}\nCREATE DATABASE IF NOT EXISTS demo;\nUSE demo;\n-- Dump completed.`;
    const blob = new Blob([dummySql], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Sistem Pemulihan</span>
            <span aria-hidden="true">/</span>
            <span className="text-indigo-400">Snapshot & Dump Database Terpusat</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Backup & Pemulihan Basis Data (Disaster Recovery)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Snapshot otomatis terenkripsi harian ke S3 Object Storage dan penyimpanan lokal NVMe RAID-10.
          </p>
        </div>

        {/* Manual Backup Trigger Form */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDbToBackup}
            onChange={(e) => setSelectedDbToBackup(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          >
            {databases.map(db => (
              <option key={db.id} value={db.name}>{db.name} ({db.engine.toUpperCase()})</option>
            ))}
          </select>

          <button
            onClick={handleStartBackup}
            disabled={isBackingUp}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{isBackingUp ? 'Membuat Dump...' : 'Backup Database Ini'}</span>
          </button>
        </div>
      </div>

      {/* Schedule Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-white">Jadwal Cron Otomatis</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono mt-2">
            Setiap Hari 02:00 WIB
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dijalankan pada jam rendah trafik untuk meminimalisir lock tabel.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-white">Target Penyimpanan</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono mt-2">
            S3 Bucket + NVMe Lokal
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Redundansi multi-region dengan kompresi gzip (rasio rata-rata 4:1).
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-white">Kebijakan Retensi</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono mt-2">
            30 Hari Snapshot Aktif
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Rotasi otomatis menghapus backup berusia lebih dari 30 hari.
          </p>
        </div>
      </div>

      {/* Backups Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Riwayat Berkas Backup Database Terpusat
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {backups.length} file arsip tersedia
          </span>
        </div>

        {/* Mobile View: Dedicated Adaptive Cards (< md) */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {backups.map((bak) => (
            <div key={bak.id} className="p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-white font-mono flex items-center gap-1.5 text-xs sm:text-sm truncate">
                    <Archive className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{bak.filename}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Target: <span className="text-indigo-300 font-semibold">{bak.dbName}</span> · {bak.createdAt}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                  bak.type === 'automated' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {bak.type === 'automated' ? 'Otomatis' : 'Manual'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-slate-300">
                <span>Ukuran: <strong className="text-white">{bak.sizeMb.toFixed(1)} MB</strong></span>
                <span className="text-slate-400">{bak.storageTarget}</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <button
                  onClick={() => handleDownloadDump(bak.filename)}
                  className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh (.sql.gz)</span>
                </button>
                <button
                  onClick={() => setRestoreConfirmId(bak.id)}
                  className="py-1.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  title="Pulihkan database"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-3">Nama Berkas Archive</th>
                <th className="px-4 py-3">Database Target</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Penyimpanan</th>
                <th className="px-4 py-3 text-right">Ukuran</th>
                <th className="px-4 py-3">Waktu Dibuat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {backups.map((bak) => (
                <tr key={bak.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white font-mono flex items-center gap-2">
                    <Archive className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{bak.filename}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-300">
                    {bak.dbName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      bak.type === 'automated' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {bak.type === 'automated' ? 'Otomatis' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                    {bak.storageTarget}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums">
                    {bak.sizeMb.toFixed(1)} MB
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">
                    {bak.createdAt}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleDownloadDump(bak.filename)}
                        title="Unduh file .sql.gz"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setRestoreConfirmId(bak.id)}
                        title="Pulihkan database dari snapshot ini"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      {restoreConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-semibold text-white">Konfirmasi Pemulihan Database</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin memulihkan database ke kondisi snapshot ini? Proses ini akan menimpa data yang ada saat ini dengan data backup.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRestoreConfirmId(null)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onRestoreBackup(restoreConfirmId);
                  setRestoreConfirmId(null);
                }}
                className="px-3.5 py-1.5 text-xs text-white bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold"
              >
                Ya, Pulihkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
