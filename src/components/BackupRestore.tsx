import { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Database, Download, Upload, Trash2, ShieldCheck, RefreshCw, AlertTriangle, Calendar } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function BackupRestore() {
  const { backups, triggerBackup, restoreBackup, deleteBackup, settings, updateSettings, currentUser, addAuditLog } = useAppState();
  const [restoredId, setRestoredId] = useState<string | null>(null);

  if (currentUser?.role === 'Operator') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white border border-slate-200 rounded-[2.5rem] text-center space-y-4 shadow-xl shadow-slate-200/50 mt-12">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Database className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="font-black italic text-lg uppercase tracking-tight text-slate-800">Akses Ditolak</h3>
        <p className="text-slate-500 text-xs font-bold leading-relaxed">
          Anda masuk sebagai <span className="text-rose-600 uppercase">Operator</span>. Halaman backup & pemulihan pangkalan data sistem ini hanya dapat diakses oleh Administrator utama.
        </p>
      </div>
    );
  }

  const handleRestore = (id: string) => {
    restoreBackup(id);
    setRestoredId(id);
    setTimeout(() => setRestoredId(null), 3000);
  };

  const handleManualBackup = () => {
    triggerBackup('manual');
  };

  const handleAutoBackupToggle = () => {
    updateSettings({ autoBackup: !settings.autoBackup });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Backup configuration */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-inner"><Database className="w-5 h-5" /></div>
              <h3 className="font-black text-lg text-slate-950 italic uppercase tracking-tight leading-none">Konfigurasi Cadangan</h3>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-6">
              Lindungi data operasional & sensor dari kehilangan. Konfigurasikan backup terjadwal berkala langsung ke cloud storage.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">AUTO-BACKUP</span>
                  <span className="text-xs font-extrabold text-slate-700 italic uppercase">{settings.autoBackup ? 'AKTIF BERKALA' : 'NONAKTIF'}</span>
                </div>
                <button 
                  onClick={handleAutoBackupToggle}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic transition-all",
                    settings.autoBackup ? "bg-blue-900 text-white shadow-md" : "bg-slate-200 text-slate-500"
                  )}
                >
                  {settings.autoBackup ? "Matikan" : "Aktifkan"}
                </button>
              </div>

              {settings.autoBackup && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block italic">FREKUENSI PENYIMPANAN</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map(freq => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => updateSettings({ autoBackupFrequency: freq })}
                        className={cn(
                          "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider italic border text-center transition-all",
                          settings.autoBackupFrequency === freq ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        )}
                      >
                        {freq === 'daily' ? 'Harian' : freq === 'weekly' ? 'Mingguan' : 'Bulanan'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleManualBackup}
            className="w-full mt-6 py-4 bg-blue-900 hover:bg-blue-950 text-white text-[10px] font-black uppercase tracking-wider italic rounded-2xl transition-all shadow-md"
          >
            Buat Backup Manual Sekarang
          </button>
        </div>

        {/* Database state files list */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Titik Pemulihan PostgreSQL</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gunakan berkas cadangan di bawah untuk memulihkan database</p>
              </div>
              <span className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">SECURE CLOUD</span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {backups.map((bkp) => (
                <div key={bkp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-500 font-extrabold">{formatDate(bkp.timestamp)}</span>
                      <span className={cn(
                        "text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                        bkp.type === 'auto' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                      )}>
                        {bkp.type === 'auto' ? 'AUTOMATIC' : 'MANUAL'}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold font-mono text-slate-800 truncate">{bkp.filename}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Ukuran Data: {bkp.size}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleRestore(bkp.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all",
                        restoredId === bkp.id 
                          ? "bg-emerald-600 text-white" 
                          : "bg-blue-900 hover:bg-blue-950 text-white"
                      )}
                    >
                      {restoredId === bkp.id ? "RESTORED ✓" : "RESTORE"}
                    </button>
                    <button 
                      onClick={() => deleteBackup(bkp.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
