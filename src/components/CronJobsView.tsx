import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Play, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  RotateCw, 
  Sparkles, 
  X, 
  Calendar,
  Layers
} from 'lucide-react';
import { Language } from '../types';

interface CronJobItem {
  id: string;
  name: string;
  schedule: string;
  command: string;
  description: string;
  status: 'active' | 'paused';
  lastRun: string;
  nextRun: string;
}

interface CronJobsViewProps {
  currentLang: Language;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const CronJobsView: React.FC<CronJobsViewProps> = ({ currentLang, onShowToast }) => {
  const [cronJobs, setCronJobs] = useState<CronJobItem[]>([
    {
      id: 'cron-1',
      name: 'Backup Database Terpusat Harian',
      schedule: '0 2 * * *',
      command: 'bash /var/www/html/siakad/backup-db.sh > /dev/null 2>&1',
      description: 'Menyimpan dump SQL seluruh basis data klien ke NVMe & S3 setiap pukul 02:00 dini hari',
      status: 'active',
      lastRun: 'Hari ini, 02:00:03',
      nextRun: 'Besok, 02:00:00'
    },
    {
      id: 'cron-2',
      name: 'Pembaruan Sertifikat SSL Let\'s Encrypt',
      schedule: '0 3 * * 1',
      command: 'certbot renew --quiet && systemctl reload nginx',
      description: 'Pengecekan dan pembaruan otomatis sertifikat SSL Let\'s Encrypt setiap hari Senin pukul 03:00',
      status: 'active',
      lastRun: 'Senin lalu, 03:00:15',
      nextRun: 'Senin depan, 03:00:00'
    },
    {
      id: 'cron-3',
      name: 'Rotasi & Pembersihan Log Nginx',
      schedule: '0 0 1 * *',
      command: 'logrotate -f /etc/logrotate.d/nginx',
      description: 'Mengompres log akses lama dan mencegah disk NVMe penuh setiap awal bulan',
      status: 'active',
      lastRun: '1 Sep 2026, 00:00:01',
      nextRun: '1 Okt 2026, 00:00:00'
    },
    {
      id: 'cron-4',
      name: 'Cloudflared Watchdog & Auto-Heal',
      schedule: '*/5 * * * *',
      command: 'systemctl is-active --quiet cloudflared || systemctl restart cloudflared',
      description: 'Memastikan zero-trust tunnel selalu aktif melayani rute website setiap 5 menit',
      status: 'active',
      lastRun: '4 menit lalu',
      nextRun: 'Dalam 1 menit'
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newSchedule, setNewSchedule] = useState<string>('0 0 * * *');
  const [newCommand, setNewCommand] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  const handleRunNow = (job: CronJobItem) => {
    setRunningJobId(job.id);
    setTimeout(() => {
      setRunningJobId(null);
      if (onShowToast) onShowToast(`Tugas cron "${job.name}" sukses dieksekusi (Exit Code: 0).`, 'success');
    }, 1200);
  };

  const handleToggleStatus = (id: string) => {
    setCronJobs(prev => prev.map(job => {
      if (job.id === id) {
        const nextStatus = job.status === 'active' ? 'paused' : 'active';
        if (onShowToast) onShowToast(`Status tugas diubah menjadi: ${nextStatus === 'active' ? 'Aktif' : 'Dijeda'}`, 'info');
        return { ...job, status: nextStatus };
      }
      return job;
    }));
  };

  const handleDeleteJob = (id: string) => {
    setCronJobs(prev => prev.filter(j => j.id !== id));
    if (onShowToast) onShowToast('Tugas cron berhasil dihapus dari crontab.', 'info');
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCommand.trim()) return;

    const newJob: CronJobItem = {
      id: `cron-${Date.now()}`,
      name: newName.trim(),
      schedule: newSchedule.trim(),
      command: newCommand.trim(),
      description: newDesc.trim() || 'Tugas terjadwal kustom',
      status: 'active',
      lastRun: 'Belum pernah',
      nextRun: 'Sesuai jadwal crontab'
    };

    setCronJobs(prev => [newJob, ...prev]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewCommand('');
    setNewDesc('');
    if (onShowToast) onShowToast('Tugas cron baru berhasil ditambahkan ke crontab server.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Otomasi &amp; Pemeliharaan</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-400 font-mono">Crontab Engine</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Manajemen Cron Jobs &amp; Penjadwal Tugas</span>
            <Clock className="w-5 h-5 text-sky-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Jadwalkan eksekusi skrip otomatis, pembaruan SSL, rotasi log, backup terjadwal, dan pemeliharaan server secara mandiri.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Tambah Tugas Cron</span>
        </button>
      </div>

      {/* Cron List Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Daftar Tugas Crontab Sistem ({cronJobs.length} Aktif)</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">crond: active (running)</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {cronJobs.map((job) => (
            <div key={job.id} className="p-4 hover:bg-slate-800/30 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggleStatus(job.id)}
                    className={`w-2.5 h-2.5 rounded-full ${
                      job.status === 'active' ? 'bg-emerald-400 ring-2 ring-emerald-500/20' : 'bg-slate-600'
                    }`}
                    title={job.status === 'active' ? 'Klik untuk menjeda' : 'Klik untuk mengaktifkan'}
                  />
                  <h4 className="text-xs font-bold text-white">{job.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-sky-300 border border-slate-800 font-semibold">
                    {job.schedule}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunNow(job)}
                    disabled={runningJobId === job.id}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors active:scale-95"
                  >
                    <Play className={`w-3 h-3 text-emerald-400 ${runningJobId === job.id ? 'animate-spin' : ''}`} />
                    <span>{runningJobId === job.id ? 'Menjalankan...' : 'Jalankan Sekarang'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Hapus Tugas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                {job.description}
              </p>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{job.command}</span>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono pt-1">
                <span>Terakhir: <strong className="text-slate-400">{job.lastRun}</strong></span>
                <span>Berikutnya: <strong className="text-sky-400">{job.nextRun}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Cron Job */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddJob} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-semibold text-white">Tambah Tugas Terjadwal (Cron Job)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Tugas Terjadwal <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: Sinkronisasi Transaksi Harian"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Format Jadwal (Cron Expression) <span className="text-sky-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="* * * * *"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
                <select
                  onChange={(e) => setNewSchedule(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-300"
                >
                  <option value="0 0 * * *">Harian (00:00)</option>
                  <option value="0 * * * *">Setiap Jam</option>
                  <option value="*/5 * * * *">Tiap 5 Menit</option>
                  <option value="0 0 * * 0">Mingguan</option>
                  <option value="0 0 1 * *">Bulanan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Perintah Eksekusi Bash (Command) <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: php /home/user/public_html/artisan schedule:run"
                value={newCommand}
                onChange={(e) => setNewCommand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deskripsi
              </label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Penjelasan fungsi tugas..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs text-white bg-sky-600 hover:bg-sky-500 rounded-lg font-semibold shadow-sm"
              >
                Simpan ke Crontab
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
