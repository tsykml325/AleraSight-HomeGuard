import React, { useState } from 'react';
import { useAppState, MaintenanceRecord } from '../context/StateContext';
import { RefreshCw, CheckSquare, AlertCircle, Calendar, Plus, User, FileText, CheckCircle } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Maintenance() {
  const { maintenance, addMaintenanceSchedule, completeMaintenance, devices, users } = useAppState();
  const [filterType, setFilterType] = useState<'all' | 'Kalibrasi' | 'Inspeksi' | 'Perbaikan'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [notes, setNotes] = useState('');

  // Form states
  const [deviceId, setDeviceId] = useState(devices[0]?.id || '');
  const [maintType, setMaintType] = useState<'Kalibrasi' | 'Inspeksi' | 'Perbaikan'>('Kalibrasi');
  const [technician, setTechnician] = useState(users[0]?.name || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const filteredRecords = maintenance.filter(m => filterType === 'all' || m.type === filterType);

  const stats = {
    total: maintenance.length,
    scheduled: maintenance.filter(m => m.status === 'scheduled').length,
    completed: maintenance.filter(m => m.status === 'completed').length,
    overdue: maintenance.filter(m => m.status === 'overdue').length,
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return;

    addMaintenanceSchedule({
      deviceId,
      deviceName: dev.name,
      type: maintType,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : new Date().toISOString(),
      status: 'scheduled',
      technician,
      notes: notesInput
    });

    setIsCreateOpen(false);
    // Reset inputs
    setScheduledDate('');
    setNotesInput('');
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecord) {
      completeMaintenance(selectedRecord.id, notes);
      setSelectedRecord(null);
      setNotes('');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Mini dashboard stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 block">Total Tiket Pemeliharaan</span>
            <h4 className="text-3xl font-black text-slate-950 mt-2 italic tracking-tight">{stats.total}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-inner"><RefreshCw className="w-5 h-5" /></div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-500 block">Jadwal Mendatang</span>
            <h4 className="text-3xl font-black text-blue-900 mt-2 italic tracking-tight">{stats.scheduled}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><Calendar className="w-5 h-5" /></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500 block">Telah Selesai</span>
            <h4 className="text-3xl font-black text-emerald-900 mt-2 italic tracking-tight">{stats.completed}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner"><CheckSquare className="w-5 h-5" /></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-red-500 block">Terlambat (Overdue)</span>
            <h4 className="text-3xl font-black text-red-600 mt-2 italic tracking-tight">{stats.overdue}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner animate-pulse"><AlertCircle className="w-5 h-5" /></div>
        </div>
      </div>

      {/* Toolbar controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 italic">Filter Jenis Tugas:</span>
          {(['all', 'Kalibrasi', 'Inspeksi', 'Perbaikan'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all",
                filterType === type 
                  ? "bg-blue-900 text-white shadow-md" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200/60"
              )}
            >
              {type === 'all' ? 'SEMUA' : type.toUpperCase()}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-2xl text-xs font-black italic tracking-tighter uppercase transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Jadwalkan Tugas Baru
        </button>
      </div>

      {/* Lists of Maintenance jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredRecords.map((m) => (
            <motion.div
              layout
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between overflow-hidden relative group hover:scale-[1.01] transition-transform"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider italic leading-none inline-block",
                    m.type === 'Kalibrasi' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                    m.type === 'Inspeksi' ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  )}>
                    {m.type}
                  </span>
                  
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest",
                    m.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    m.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700 animate-pulse'
                  )}>
                    {m.status === 'scheduled' ? 'TERJADWAL' : m.status === 'completed' ? 'SELESAI' : 'TERLAMBAT'}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-slate-800 text-base leading-snug uppercase tracking-tight italic group-hover:text-blue-900 transition-colors">{m.deviceName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">DEVICE ID: {m.deviceId}</p>
                </div>

                <div className="h-px bg-slate-100"></div>

                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Jadwal: <span className="font-extrabold italic">{formatDate(m.scheduledDate)}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Penanggung Jawab: <span className="font-extrabold text-slate-700">{m.technician}</span></span>
                  </div>
                  <div className="flex items-start gap-2 pt-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed italic text-slate-500">"{m.notes || 'Tidak ada catatan tambahan'}"</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                {m.status !== 'completed' ? (
                  <button 
                    onClick={() => {
                      setSelectedRecord(m);
                      setNotes('');
                    }}
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-[10px] font-black italic uppercase tracking-wider rounded-xl transition-all shadow-sm"
                  >
                    Tandai Selesai & Laporkan
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs uppercase italic py-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Tugas Telah Diselesaikan</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRecords.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 font-black italic uppercase tracking-wider">
            Tidak ada data pemeliharaan yang sesuai.
          </div>
        )}
      </div>

      {/* Create Maintenance Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-md w-full rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl"
          >
            <div className="bg-blue-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <h3 className="font-black italic text-lg uppercase tracking-tight leading-none">Jadwalkan Tugas Baru</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-white/60 hover:text-white font-bold">X</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">PILIH PERANGKAT</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold uppercase tracking-wide"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">JENIS TUGAS PEMELIHARAAN</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold uppercase tracking-wide"
                  value={maintType}
                  onChange={(e) => setMaintType(e.target.value as any)}
                >
                  <option value="Kalibrasi">Kalibrasi Sensor</option>
                  <option value="Inspeksi">Inspeksi Keamanan Berkala</option>
                  <option value="Perbaikan">Perbaikan Perangkat & Antena</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">TANGGAL JADWAL</label>
                  <input 
                    type="date"
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">TEKNISI PIC</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold uppercase tracking-wide"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">DESKRIPSI DAN INSTRUKSI</label>
                <textarea 
                  rows={3}
                  placeholder="Detail instruksi penugasan, instruksi kerja, toleransi toleransi..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                />
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
                  className="flex-1 py-4 bg-blue-900 hover:bg-blue-950 text-white text-[10px] font-black italic uppercase tracking-wider rounded-2xl transition-all shadow-md"
                >
                  Jadwalkan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Complete Ticket Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-md w-full rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl"
          >
            <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-6 h-6" />
                <h3 className="font-black italic text-lg uppercase tracking-tight leading-none">Selesaikan Tugas</h3>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-white/60 hover:text-white font-bold">X</button>
            </div>
            <form onSubmit={handleCompleteSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">LAPORAN PENYANGKUTAN DAN HASIL KERJA</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Detail hasil kalibrasi, sisa sisa baterai, status firmware, atau temuan lapangan penting..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 text-xs font-semibold"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-black italic uppercase tracking-wider rounded-2xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black italic uppercase tracking-wider rounded-2xl transition-all shadow-md"
                >
                  Selesaikan Tugas
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
