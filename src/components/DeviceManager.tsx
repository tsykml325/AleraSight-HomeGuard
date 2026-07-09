import { useState, FormEvent } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin, Activity, X, Power, PowerOff, RefreshCw, Cpu, Sparkles, CheckCircle } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { Device } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function DeviceManager() {
  const { 
    devices, addDevice, updateDevice, deleteDevice, bulkDeleteDevices,
    restartDevice, calibrateDevice, otaUpdateDevice,
    searchTerm, setSearchTerm, currentUser
  } = useAppState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const [form, setForm] = useState({
    id: '',
    name: '',
    lat: -6.2088,
    lng: 106.8456,
    isActive: true
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingDevice) {
      updateDevice(editingDevice.id, {
        name: form.name,
        location: { lat: form.lat, lng: form.lng },
        isActive: form.isActive
      });
      showNotification(`Perangkat ${form.name} berhasil diperbarui!`);
    } else {
      const devId = form.id || `DEV-${Math.floor(Math.random() * 1000)}`;
      addDevice({
        id: devId,
        name: form.name,
        location: { lat: form.lat, lng: form.lng },
        isActive: form.isActive
      });
      showNotification(`Perangkat baru ${form.name} berhasil didaftarkan!`);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({ id: '', name: '', lat: -6.2088, lng: 106.8456, isActive: true });
    setEditingDevice(null);
  };

  const handleEditClick = (dev: Device) => {
    setEditingDevice(dev);
    setForm({
      id: dev.id,
      name: dev.name,
      lat: dev.location.lat,
      lng: dev.location.lng,
      isActive: dev.isActive
    });
    setIsModalOpen(true);
  };

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleRestart = (id: string) => {
    restartDevice(id);
    showNotification(`Sinyal Reboot Terkirim ke Perangkat: ${id}`);
  };

  const handleCalibrate = (id: string) => {
    calibrateDevice(id);
    showNotification(`Sensibilitas Sensor Gas & Suhu Dikalibrasi pada Perangkat: ${id}`);
  };

  const handleOta = (id: string) => {
    otaUpdateDevice(id);
    showNotification(`Pemasangan OTA Firmware v2.4.1 dimulai pada: ${id}`);
  };

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredDevices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDevices.map(d => d.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    bulkDeleteDevices(selectedIds);
    showNotification(`${selectedIds.length} Perangkat Berhasil Dihapus Secara Massal`);
    setSelectedIds([]);
  };

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {actionMessage && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-lg font-black italic uppercase text-xs tracking-wider animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Control Actions Panel */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="CARI ID, NAMA, ATAU STATUS ALARM PERANGKAT..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold uppercase tracking-wider transition-all placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {currentUser?.role !== 'Operator' && selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all shadow-md active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Massal ({selectedIds.length})
            </button>
          )}

          {currentUser?.role !== 'Operator' && (
            <button 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Daftarkan Perangkat Baru
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
                {currentUser?.role !== 'Operator' && (
                  <th className="px-6 py-5 w-12 text-center">
                    <input 
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={filteredDevices.length > 0 && selectedIds.length === filteredDevices.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="px-6 py-5">Informasi Perangkat</th>
                <th className="px-6 py-5">Lokasi Geografis</th>
                <th className="px-6 py-5">Status Aktivitas</th>
                <th className="px-6 py-5">Kondisi Lingkungan</th>
                <th className="px-6 py-5 text-right">Kontrol Jarak Jauh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50/50 transition-colors group">
                  {currentUser?.role !== 'Operator' && (
                    <td className="px-6 py-5 text-center">
                      <input 
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.includes(device.id)}
                        onChange={() => handleSelectToggle(device.id)}
                      />
                    </td>
                  )}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border",
                        device.isActive ? "bg-blue-50 border-blue-100 text-blue-600 animate-pulse" : "bg-slate-100 border-slate-200 text-slate-400"
                      )}>
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase italic tracking-tight">{device.name}</h4>
                        <span className="text-[9px] text-blue-600 font-bold tracking-wider font-mono uppercase">{device.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold italic">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{device.location.lat.toFixed(5)}, {device.location.lng.toFixed(5)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase italic tracking-wider leading-none shadow-sm border inline-block",
                      device.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200"
                    )}>
                      {device.isActive ? 'ACTIVE' : 'STANDBY/OFF'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase italic tracking-wider leading-none shadow-sm border inline-block",
                      device.status === 'aman' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      device.status === 'waspada' ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-red-50 text-red-700 border-red-100 animate-pulse"
                    )}>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Reboot device */}
                      <button 
                        onClick={() => handleRestart(device.id)}
                        title="Reboot Perangkat"
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider italic text-slate-700"
                      >
                        Reboot
                      </button>

                      {/* Calibrate device */}
                      <button 
                        onClick={() => handleCalibrate(device.id)}
                        title="Kalibrasi Sensor"
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider italic text-slate-700"
                      >
                        Calibrate
                      </button>

                      {/* OTA Upgrade */}
                      <button 
                        onClick={() => handleOta(device.id)}
                        title="OTA Firmware Upgrade"
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider italic text-slate-700"
                      >
                        FOTA Upgrade
                      </button>

                      {/* Edit click */}
                      {currentUser?.role !== 'Operator' && (
                        <button 
                          onClick={() => handleEditClick(device)}
                          title="Edit Perangkat"
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete click */}
                      {currentUser?.role !== 'Operator' && (
                        <button 
                          onClick={() => deleteDevice(device.id)}
                          title="Hapus Perangkat"
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 font-black italic uppercase tracking-wider">
                    Tidak ada perangkat IoT yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200"
            >
              <div className="p-6 bg-slate-900 text-white relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="bg-red-600 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white shadow-lg shadow-red-950/10">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <h2 className="text-xl font-black italic uppercase tracking-tight leading-none">
                  {editingDevice ? 'Konfigurasi Perangkat IoT' : 'Registrasi Perangkat Baru'}
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">Sistem Pengawasan AleraSight HomeGuard</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {!editingDevice && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block font-black">ID UNIK PERANGKAT</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                      placeholder="Contoh: DEV-006 (Opsional)"
                      value={form.id}
                      onChange={(e) => setForm({...form, id: e.target.value.toUpperCase()})}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block font-black">Nama / Label Lokasi</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase"
                    placeholder="Contoh: Gedung D - Lt. 2 Koridor Barat"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block font-black">Garis Lintang (Lat)</label>
                    <input 
                      required
                      type="number" 
                      step="any"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                      value={form.lat}
                      onChange={(e) => setForm({...form, lat: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block font-black">Garis Bujur (Lng)</label>
                    <input 
                      required
                      type="number" 
                      step="any"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                      value={form.lng}
                      onChange={(e) => setForm({...form, lng: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-xs font-black italic uppercase tracking-wider text-slate-900 block leading-none font-black">Status Daya</span>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1">Aktifkan segera simpul transponder</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({...form, isActive: !form.isActive})}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors duration-300",
                      form.isActive ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                      form.isActive ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 border border-slate-200 text-slate-500 rounded-xl font-black italic uppercase tracking-wider text-[10px] hover:bg-slate-50 transition-all text-center"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 px-4 bg-slate-900 text-white rounded-xl font-black italic uppercase tracking-wider text-[10px] hover:bg-black transition-all text-center shadow-md"
                  >
                    {editingDevice ? 'Simpan' : 'Daftarkan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
