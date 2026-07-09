import { useState, useEffect, useRef } from 'react';
import { Search, Cpu, Users, Map, Database, FileText, Settings, Bell, Shield, Sliders, Play, Brain, RefreshCw, Terminal } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { cn } from '../lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const { setCurrentPage, devices, users, alarms, settings } = useAppState();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const navigationCommands = [
    { id: 'dashboard', label: 'Buka Dashboard Utama', desc: 'Metrik telemetri & status real-time', page: 'dashboard', icon: Sliders },
    { id: 'devices', label: 'Manajemen Perangkat', desc: 'CRUD, kalibrasi, & pembaruan OTA', page: 'devices', icon: Cpu },
    { id: 'users', label: 'Manajemen Pengguna', desc: 'Pengaturan peran, hak akses, & aktivitas', page: 'users', icon: Users },
    { id: 'gis', label: 'GIS Peta Geografis', desc: 'Peta pemantauan interaktif & sensor', page: 'gis', icon: Map },
    { id: 'raw', label: 'Tabel Raw Data', desc: 'Log telemetri terperinci & ekspor data', page: 'raw', icon: Database },
    { id: 'reports', label: 'Laporan Analitis', desc: 'Laporan harian, mingguan, & cetak PDF', page: 'reports', icon: FileText },
    { id: 'alarms', label: 'Manajemen Alarm', desc: 'Respon insiden, severity, & penugasan', page: 'alarms', icon: Shield },
    { id: 'maintenance', label: 'Jadwal Pemeliharaan', desc: 'Inspeksi berkala & riwayat kalibrasi', page: 'maintenance', icon: RefreshCw },
    { id: 'analytics', label: 'Analitik Lanjutan', desc: 'Tren kejadian & analisis respon waktu', page: 'analytics', icon: Brain },
    { id: 'iot-monitor', label: 'IoT & ESP32 Monitor', desc: 'Metrik sinyal, paket data, & heartbeat', page: 'iot-monitor', icon: Terminal },
    { id: 'telegram-monitor', label: 'Telegram Bot Monitor', desc: 'Status API, log pengiriman, & integrasi', page: 'telegram-monitor', icon: Bell },
    { id: 'ai-prediction', label: 'Prediksi Risiko AI', desc: 'Skor probabilistik ancaman kebakaran', page: 'ai-prediction', icon: Brain },
    { id: 'backup', label: 'Backup & Restore', desc: 'Manajemen titik cadangan basis data', page: 'backup', icon: Database },
    { id: 'settings', label: 'Pengaturan Sistem', desc: 'Ambang batas sensor & token Telegram', page: 'settings', icon: Settings },
  ];

  const filteredNavs = navigationCommands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  const matchedDevices = devices.filter(d => 
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.id.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const matchedUsers = users.filter(u => 
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const handleCommand = (page: string) => {
    setCurrentPage(page);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-4 shrink-0">
          <Search className="w-6 h-6 text-blue-400 animate-pulse" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Cari menu, perangkat, pengguna, atau pintasan..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 font-bold tracking-wide italic text-lg focus:outline-none focus:ring-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-mono uppercase tracking-wider"
          >
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Navigation Commands */}
          {filteredNavs.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 italic mb-3">Sistem Navigasi Cepat</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredNavs.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleCommand(cmd.page)}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/30 border border-transparent transition-all text-left group"
                  >
                    <div className="p-2.5 bg-white/5 rounded-xl text-blue-400 group-hover:scale-110 group-hover:text-white transition-all">
                      <cmd.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-white text-sm tracking-tight italic uppercase group-hover:text-blue-200 transition-colors">{cmd.label}</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-bold tracking-wide">{cmd.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Devices Matched */}
          {query.length > 0 && matchedDevices.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 italic mb-3">Hasil Pencarian Perangkat ({matchedDevices.length})</p>
              <div className="space-y-2">
                {matchedDevices.map((dev) => (
                  <button
                    key={dev.id}
                    onClick={() => handleCommand('devices')}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-transparent hover:border-white/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
                        dev.status === 'bahaya' ? 'bg-red-500/20 text-red-400' :
                        dev.status === 'waspada' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
                      )}>
                        {dev.id.substring(0, 5)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm uppercase italic">{dev.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold tracking-widest mt-0.5">STATUS: {dev.status.toUpperCase()}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Akses Perangkat →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users Matched */}
          {query.length > 0 && matchedUsers.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 italic mb-3">Hasil Pencarian Pengguna ({matchedUsers.length})</p>
              <div className="space-y-2">
                {matchedUsers.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => handleCommand('users')}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-transparent hover:border-white/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black italic">
                        {usr.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm uppercase italic">{usr.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{usr.email} • <span className="text-blue-400 font-extrabold">{usr.role}</span></p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-sans">Akses Pengguna →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNavs.length === 0 && matchedDevices.length === 0 && matchedUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 font-black italic tracking-widest uppercase">Pencarian Tidak Ditemukan</p>
              <p className="text-xs text-slate-600 mt-2 font-semibold">Gunakan kata kunci pencarian yang berbeda untuk menelusuri data sistem.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 font-bold shrink-0">
          <span>Tekan <kbd className="bg-slate-800 text-white px-1 py-0.5 rounded font-mono">↑↓</kbd> untuk memilih, <kbd className="bg-slate-800 text-white px-1 py-0.5 rounded font-mono">Enter</kbd> untuk membuka</span>
          <span>AleraSight HomeGuard Enterprise Client</span>
        </div>
      </div>
    </div>
  );
}
