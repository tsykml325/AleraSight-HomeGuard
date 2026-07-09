import React, { useState } from 'react';
import { useAppState, AlarmCase } from '../context/StateContext';
import { ShieldAlert, CheckCircle2, UserCheck, Clock, AlertTriangle, Info, Shield, Plus, Filter, FileSpreadsheet, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate, cn } from '../lib/utils';

export function AlarmManagement() {
  const { alarms, acknowledgeAlarm, resolveAlarm, assignAlarm, triggerAlarmManually, devices, users, addAuditLog, currentUser } = useAppState();
  
  React.useEffect(() => {
    addAuditLog("VIEW_ALARMS", "alarm", "Membuka halaman pemantauan alarm");
  }, [addAuditLog]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmCase | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Form states for manual alert triggering
  const [manualDevice, setManualDevice] = useState(devices[0]?.id || '');
  const [manualSeverity, setManualSeverity] = useState<'critical' | 'warning'>('warning');

  const handleAcknowledge = (id: string) => {
    acknowledgeAlarm(id);
    addAuditLog("ACKNOWLEDGE_ALARM", "alarm", `Merespon dan melakukan Acknowledged pada alarm aktif dengan ID ${id}`);
  };

  // Filter computations
  const filteredAlarms = alarms.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchSeverity = filterSeverity === 'all' || a.severity === filterSeverity;
    return matchStatus && matchSeverity;
  });

  const stats = {
    total: alarms.length,
    active: alarms.filter(a => a.status === 'active').length,
    acknowledged: alarms.filter(a => a.status === 'acknowledged').length,
    resolved: alarms.filter(a => a.status === 'resolved').length,
    critical: alarms.filter(a => a.severity === 'critical').length,
    warning: alarms.filter(a => a.severity === 'warning').length,
  };

  const handleAssignSubmit = (officer: string) => {
    if (selectedAlarm) {
      assignAlarm(selectedAlarm.id, officer);
      addAuditLog("ASSIGN_ALARM", "alarm", `Menugaskan petugas "${officer}" untuk menangani alarm dengan ID ${selectedAlarm.id}`);
      setIsAssignOpen(false);
      setSelectedAlarm(null);
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAlarm) {
      resolveAlarm(selectedAlarm.id, resolutionNotes);
      addAuditLog("RESOLVE_ALARM", "alarm", `Menyelesaikan penanganan alarm ID ${selectedAlarm.id} dengan catatan penanganan: "${resolutionNotes}"`);
      setSelectedAlarm(null);
      setResolutionNotes('');
    }
  };

  const triggerManualAlert = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlarmManually(manualDevice, manualSeverity);
    addAuditLog("TRIGGER_ALARM", "alarm", `Memisukan alarm simulasi baru secara manual untuk perangkat ${manualDevice} dengan tingkat severity ${manualSeverity}`);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Total Alarm Terdeteksi</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Shield className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-slate-900 italic tracking-tight">{stats.total}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Insiden terekam</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-red-500">Alarm Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 animate-pulse"><ShieldAlert className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-slate-900 italic tracking-tight text-red-600">{stats.active}</h4>
            <p className="text-[10px] text-red-400 font-bold uppercase mt-1">Butuh Respon Segera</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-500">Sedang Ditangani</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><UserCheck className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-slate-900 italic tracking-tight text-amber-600">{stats.acknowledged}</h4>
            <p className="text-[10px] text-amber-400 font-bold uppercase mt-1">Petugas telah di lokasi</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500">Selesai Diatasi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-slate-900 italic tracking-tight text-emerald-600">{stats.resolved}</h4>
            <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1">Kondisi aman terverifikasi</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 italic">Filter Status:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {(['all', 'active', 'acknowledged', 'resolved'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all",
                  filterStatus === st 
                    ? "bg-blue-900 text-white shadow-md shadow-blue-950/20" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200/60"
                )}
              >
                {st === 'all' ? 'SEMUA' : st === 'active' ? 'AKTIF' : st === 'acknowledged' ? 'DITANGANI' : 'SELESAI'}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          <div className="flex items-center gap-1.5">
            {(['all', 'critical', 'warning', 'info'] as const).map(sv => (
              <button
                key={sv}
                onClick={() => setFilterSeverity(sv)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all",
                  filterSeverity === sv
                    ? "bg-red-600 text-white shadow-md shadow-red-950/20"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200/60"
                )}
              >
                {sv === 'all' ? 'SEMUA SEVERITY' : sv === 'critical' ? 'CRITICAL' : sv === 'warning' ? 'WARNING' : 'INFO'}
              </button>
            ))}
          </div>
        </div>

        {currentUser?.role !== 'Operator' && (
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black italic tracking-tighter uppercase transition-all shadow-lg shadow-red-900/10 active:scale-95 self-end md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Picukan Alarm Simulasi
          </button>
        )}
      </div>

      {/* Main Alarms List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
                <th className="px-8 py-5">Severity & ID</th>
                <th className="px-8 py-5">Perangkat / Lokasi</th>
                <th className="px-8 py-5">Waktu Kejadian</th>
                <th className="px-8 py-5">Nilai Sensor</th>
                <th className="px-8 py-5">Petugas Penjawab</th>
                <th className="px-8 py-5">Status Respon</th>
                <th className="px-8 py-5 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredAlarms.map((alm) => (
                  <motion.tr 
                    layout
                    key={alm.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-blue-50/20 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full shrink-0 animate-pulse",
                          alm.severity === 'critical' ? 'bg-red-600' :
                          alm.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        )}></div>
                        <div>
                          <span className="font-mono text-xs font-black text-slate-800">{alm.id}</span>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{alm.severity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-black text-slate-800 text-sm tracking-tight uppercase italic">{alm.deviceName}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{alm.locationName || 'Sektor Utama'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-600 text-xs font-bold italic">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(alm.timestamp)}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">GAS</span>
                          <p className="text-xs font-black text-slate-700 italic">{alm.gasValue} ppm</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">SUHU</span>
                          <p className="text-xs font-black text-slate-700 italic">{alm.tempValue}°C</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {alm.assignedTo ? (
                        <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black italic text-[10px]">
                            {alm.assignedTo.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{alm.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black tracking-widest text-slate-400 italic">BELUM DITUGASKAN</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider italic leading-none inline-block",
                        alm.status === 'active' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                        alm.status === 'acknowledged' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      )}>
                        {alm.status === 'active' ? 'AKTIF' : alm.status === 'acknowledged' ? 'DITANGANI' : 'SELESAI'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {alm.status === 'active' && (
                          <button 
                            onClick={() => handleAcknowledge(alm.id)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider italic rounded-xl transition-all"
                          >
                            Respon
                          </button>
                        )}
                        {alm.status !== 'resolved' && (
                          <button 
                            onClick={() => {
                              setSelectedAlarm(alm);
                              setIsAssignOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white text-[10px] font-black uppercase tracking-wider italic rounded-xl transition-all"
                          >
                            Tugaskan
                          </button>
                        )}
                        {alm.status !== 'resolved' && (
                          <button 
                            onClick={() => {
                              setSelectedAlarm(alm);
                              setResolutionNotes('');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider italic rounded-xl transition-all"
                          >
                            Selesaikan
                          </button>
                        )}
                        {alm.status === 'resolved' && (
                          <span className="text-[10px] font-black text-slate-400 italic">SELESAI DIATASI</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredAlarms.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 font-black italic uppercase tracking-wider">
                    Tidak ada alarm aktif sesuai kriteria pemfilteran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual triggering modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-md w-full rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl"
          >
            <div className="bg-red-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-black italic text-lg uppercase tracking-tight leading-none">Picukan Alarm Simulasi</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-white/60 hover:text-white font-bold">X</button>
            </div>
            <form onSubmit={triggerManualAlert} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">PILIH PERANGKAT RECEPTOR</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 text-xs font-bold uppercase tracking-wide"
                  value={manualDevice}
                  onChange={(e) => setManualDevice(e.target.value)}
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">TINGKAT SEVERITY</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setManualSeverity('warning')}
                    className={cn(
                      "p-4 rounded-2xl text-xs font-black uppercase tracking-wider italic border text-center transition-all",
                      manualSeverity === 'warning' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    )}
                  >
                    Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualSeverity('critical')}
                    className={cn(
                      "p-4 rounded-2xl text-xs font-black uppercase tracking-wider italic border text-center transition-all",
                      manualSeverity === 'critical' ? 'bg-red-500/10 border-red-500 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    )}
                  >
                    Critical
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-black italic uppercase tracking-wider rounded-2xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black italic uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-red-900/10"
                >
                  Picukan Insiden
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {isAssignOpen && selectedAlarm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-md w-full rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl"
          >
            <div className="bg-blue-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="w-6 h-6" />
                <h3 className="font-black italic text-lg uppercase tracking-tight leading-none">Tugaskan Petugas Penyelamat</h3>
              </div>
              <button onClick={() => setIsAssignOpen(false)} className="text-white/60 hover:text-white font-bold">X</button>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                Pilih petugas operator atau penanggap darurat AleraSight untuk dikirimkan guna meninjau insiden di <span className="text-red-600 font-extrabold">{selectedAlarm.deviceName}</span>.
              </p>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleAssignSubmit(u.name)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-500/30 border border-slate-200 rounded-2xl text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-black italic text-xs flex items-center justify-center shrink-0">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-black text-slate-800 uppercase italic text-sm group-hover:text-blue-900">{u.name}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{u.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">KIRIMKAN →</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Selesaikan (Resolve) Alarm Modal */}
      {selectedAlarm && !isAssignOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-md w-full rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl"
          >
            <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="font-black italic text-lg uppercase tracking-tight leading-none">Selesaikan Isu Alarm</h3>
              </div>
              <button onClick={() => setSelectedAlarm(null)} className="text-white/60 hover:text-white font-bold">X</button>
            </div>
            <form onSubmit={handleResolveSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">CATATAN DAN LAPORAN TINDAKAN</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Masukkan penyebab alarm terpicu, tindakan mitigasi yang telah dilakukan, & status aman saat ini..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 text-xs font-semibold"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedAlarm(null)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-black italic uppercase tracking-wider rounded-2xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black italic uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-950/10"
                >
                  Selesaikan Isu
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
