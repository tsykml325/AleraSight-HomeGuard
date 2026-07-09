import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Send, BellRing, Settings, RefreshCw, Radio, CheckCircle, ShieldAlert, Clock } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function TelegramMonitoring() {
  const { telegramLogs, telegramBotActive, setTelegramBotActive, settings, triggerMockTelegramMessage, currentUser, addAuditLog } = useAppState();
  const [customMsg, setCustomMsg] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    const senderName = currentUser ? currentUser.name : "Operator";
    triggerMockTelegramMessage(`✉️ [AleraSight Manual Test] \n\n${customMsg} \n\nPengirim: ${senderName}`);
    addAuditLog("SEND_TELEGRAM_SIMULATION", "settings", `Mengirim pesan uji coba ke Telegram: "${customMsg}"`);
    setCustomMsg('');
  };

  const successCount = telegramLogs.filter(log => log.status === 'success').length;
  const failureCount = telegramLogs.filter(log => log.status === 'failed').length;
  const totalCount = telegramLogs.length || 1;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);

  return (
    <div className="space-y-8 pb-12">
      {/* Bot Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Telegram Bot Status</span>
            <Radio className={cn("w-4 h-4 animate-pulse", telegramBotActive ? "text-emerald-500" : "text-red-500")} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <h4 className={cn("text-3xl font-black italic tracking-tight uppercase", telegramBotActive ? "text-emerald-600" : "text-red-500")}>
              {telegramBotActive ? "ACTIVE" : "INACTIVE"}
            </h4>
            {currentUser?.role === 'Admin' ? (
              <button 
                onClick={() => {
                  setTelegramBotActive(!telegramBotActive);
                  addAuditLog("TOGGLE_TELEGRAM_BOT", "settings", `Mengubah status fungsional Telegram Bot menjadi ${!telegramBotActive ? "Aktif" : "Nonaktif"}`);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic transition-all",
                  telegramBotActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                )}
              >
                {telegramBotActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
            ) : (
              <span className={cn(
                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic border",
                telegramBotActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
              )}>
                {telegramBotActive ? "AKTIF" : "NONAKTIF"}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Total Alert Terkirim</span>
            <BellRing className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black italic tracking-tight text-slate-900">{telegramLogs.length}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Notifikasi tersalurkan</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Tingkat Keberhasilan</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black italic tracking-tight text-emerald-600">{successRate}%</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Tanpa packet loss</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Target Chat / Channel ID</span>
            <Settings className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-black text-slate-800 font-mono select-all truncate">{settings.telegramChatId || "Empty"}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Telegram Secure Feed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sending test manual Telegram notification */}
        {currentUser?.role === 'Admin' ? (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Kirim Notifikasi Simulasi</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6">Uji fungsionalitas pengiriman pesan bot telegram</p>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block italic">PESAN PENGUJI</label>
                  <textarea 
                    rows={4}
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    placeholder="Ketik pesan simulasi yang ingin dikirimkan ke Telegram channel..."
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!telegramBotActive}
                  className={cn(
                    "w-full py-4 flex items-center justify-center gap-2 rounded-2xl text-[10px] font-black uppercase tracking-wider italic transition-all",
                    telegramBotActive 
                      ? "bg-blue-900 hover:bg-blue-950 text-white shadow-md" 
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                  Kirim Pesan Simulasi
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Send className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="font-black text-slate-800 italic uppercase text-sm">Simulasi Notifikasi</h3>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
              Hanya Administrator yang memiliki akses untuk mengirim pesan notifikasi uji coba ke grup Telegram.
            </p>
          </div>
        )}

        {/* Telegram delivery logs */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Log Transmisi Bot Telegram</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daftar riwayat penyaluran sinyal bahaya & waspada</p>
            </div>
            <span className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">LIVE DATA</span>
          </div>

          <div className="flex-1 space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {telegramLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-extrabold">{formatDate(log.timestamp)}</span>
                    <span className="font-mono text-[9px] bg-slate-200 px-1 rounded text-slate-600">{log.id}</span>
                  </div>
                  <pre className="text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed mt-1.5 font-semibold">
                    {log.message}
                  </pre>
                </div>
                <div className="shrink-0">
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest",
                    log.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                  )}>
                    {log.status === 'success' ? 'SUCCESS' : 'FAILED'}
                  </span>
                </div>
              </div>
            ))}
            {telegramLogs.length === 0 && (
              <div className="text-center py-16 text-slate-400 font-black italic uppercase tracking-widest">
                Belum ada log pengiriman pesan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
