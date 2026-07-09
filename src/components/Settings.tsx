import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Save, Send, Shield, Smartphone, Globe, Mail, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const { settings, updateSettings, currentUser, addAuditLog } = useAppState();

  const [form, setForm] = useState({
    telegramToken: settings.telegramToken,
    telegramChatId: settings.telegramChatId,
    gasThreshold: settings.gasThreshold,
    tempThreshold: settings.tempThreshold,
    updateInterval: settings.updateInterval,
    mqttHost: settings.mqttHost,
    mqttPort: settings.mqttPort,
    mqttTopic: settings.mqttTopic,
    smtpServer: settings.smtpServer,
    smtpPort: settings.smtpPort,
    smtpUser: settings.smtpUser,
    timezone: settings.timezone,
    language: settings.language
  });

  const [savedStatus, setSavedStatus] = useState(false);

  if (currentUser?.role === 'Operator') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white border border-slate-200 rounded-[2.5rem] text-center space-y-4 shadow-xl shadow-slate-200/50 mt-12">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="font-black italic text-lg uppercase tracking-tight text-slate-800">Akses Ditolak</h3>
        <p className="text-slate-500 text-xs font-bold leading-relaxed">
          Anda masuk sebagai <span className="text-rose-600 uppercase">Operator</span>. Halaman pengaturan parameter sistem ini hanya dapat diakses oleh Administrator utama.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    addAuditLog("UPDATE_SETTINGS", "settings", "Memperbarui konfigurasi parameter sensitif sistem (threshold, Telegram, MQTT)");
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Toast confirmation */}
      {savedStatus && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-lg font-black italic uppercase text-xs tracking-wider animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>Pengaturan Parameter Sistem Berhasil Diperbarui & Disinkronkan!</span>
        </div>
      )}

      {/* Threshold and parameters config */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="bg-red-600 p-3 rounded-xl text-white shadow-md shadow-red-950/10">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight leading-none">Threshold & Parametrik</h3>
            <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest mt-1">Batas Peringatan Bahaya Kebakaran</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">Ambang Batas Gas (ppm)</label>
            <div className="relative">
              <input 
                type="number" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-600/10 text-lg font-black italic tracking-tighter"
                value={form.gasThreshold}
                onChange={(e) => setForm({ ...form, gasThreshold: parseInt(e.target.value) || 0 })}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black italic text-slate-300 text-xs">PPM</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">Ambang Batas Suhu (°C)</label>
            <div className="relative">
              <input 
                type="number" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-600/10 text-lg font-black italic tracking-tighter"
                value={form.tempThreshold}
                onChange={(e) => setForm({ ...form, tempThreshold: parseInt(e.target.value) || 0 })}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black italic text-slate-300 text-xs">CELSIUS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram config */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="bg-blue-600 p-3 rounded-xl text-white shadow-md shadow-blue-950/10">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight leading-none">Konfigurasi Telegram Bot</h3>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">API Integrasi Notifikasi Alert Instan</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">BOT API ACCESS TOKEN</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold"
              value={form.telegramToken}
              onChange={(e) => setForm({ ...form, telegramToken: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">CHAT ATAU CHANNEL ID</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold font-mono"
              value={form.telegramChatId}
              onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* MQTT gateway configuration */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight leading-none">MQTT IoT Broker Gateway</h3>
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Pengaturan Protokol Transmisi Data ESP32</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">BROKER IP / HOST</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4"
              value={form.mqttHost}
              onChange={(e) => setForm({ ...form, mqttHost: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">BROKER PORT</label>
            <input 
              type="number" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4"
              value={form.mqttPort}
              onChange={(e) => setForm({ ...form, mqttPort: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">TELEMETRY TOPIC</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 font-mono"
              value={form.mqttTopic}
              onChange={(e) => setForm({ ...form, mqttTopic: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* SMTP gateway & regional settings */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-md">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight leading-none">Lokalisasi & SMTP Server</h3>
            <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Bahasa, Zona Waktu, & Pengiriman Surel</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">ZONA WAKTU (TIMEZONE)</label>
            <select 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none text-xs font-bold"
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            >
              <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
              <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
              <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">SMTP SENDER USER</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 text-xs font-semibold"
              value={form.smtpUser}
              onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end pt-4">
        <button 
          type="submit"
          className="flex items-center gap-3 px-10 py-5 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all shadow-md active:scale-95"
        >
          <Save className="w-4 h-4" />
          Simpan Semua Parameter
        </button>
      </div>

    </form>
  );
}
