import { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { 
  Activity, Flame, Cpu, Bell, Camera, Send, 
  MapPin, ShieldAlert, Wifi, CheckCircle, AlertTriangle, 
  Sparkles, RefreshCw, Layers, ShieldCheck, Video, RefreshCcw
} from 'lucide-react';
import { cn } from '../lib/utils';

export function AIPrediction() {
  const { 
    raspiOnline, setRaspiOnline,
    visionFireDetected, setVisionFireDetected,
    activeDeviceId, devices, addAuditLog
  } = useAppState();

  const activeDevice = devices.find(d => d.id === activeDeviceId) || devices[0];

  // Fluctuating CPU usage simulation
  const [simulatedCpu, setSimulatedCpu] = useState(21.5);
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedCpu(prev => {
        const flux = (Math.random() * 0.8 - 0.4);
        return Math.max(18.0, Math.min(25.0, Number((prev + flux).toFixed(1))));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Raspi Uptime Ticker
  const [uptimeSeconds, setUptimeSeconds] = useState(1528); // Starts at 00:25:28 (1528 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Live simulation controls directly inside page for a superior prototype experience
  const handleToggleFire = (isFire: boolean) => {
    setVisionFireDetected(isFire);
    addAuditLog(
      isFire ? "AI_FIRE_DETECTED" : "AI_FIRE_RESOLVED", 
      isFire ? "alarm" : "system", 
      `Sistem CNN mendeteksi status ${isFire ? 'API' : 'NORMAL (Bukan Api)'} pada perangkat ${activeDevice.name}`
    );
  };

  return (
    <div className="space-y-6 pb-12 text-zinc-100 bg-[#0f0f11] p-6 sm:p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl font-sans">
      
      {/* Interactive Simulation Command Center */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Simulator Integrasi AI Fire Risk</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500">Gunakan pintasan ini untuk menguji kondisi darurat vs aman secara interaktif.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleToggleFire(false)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all flex items-center gap-1.5 border",
              !visionFireDetected 
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-md shadow-emerald-950/20" 
                : "bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700 hover:text-zinc-200"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            Set Aman (Bukan Api)
          </button>
          <button
            onClick={() => handleToggleFire(true)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all flex items-center gap-1.5 border",
              visionFireDetected 
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-md shadow-rose-950/20 animate-pulse" 
                : "bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700 hover:text-zinc-200"
            )}
          >
            <Flame className="w-4 h-4" />
            Picu Deteksi Api (Bahaya)
          </button>
          <button
            onClick={() => setRaspiOnline(!raspiOnline)}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all flex items-center gap-1.5 border",
              raspiOnline 
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                : "bg-zinc-800 text-zinc-500 border-transparent"
            )}
            title="Toggle status online Raspberry Pi"
          >
            <Cpu className="w-4 h-4" />
            Pi: {raspiOnline ? 'ONLINE' : 'OFFLINE'}
          </button>
        </div>
      </div>

      {/* Top Counters Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Status CNN */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-[110px] shadow-lg">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-black tracking-widest uppercase">Status CNN</span>
            <Activity className={cn("w-4 h-4", visionFireDetected ? "text-rose-500 animate-pulse" : "text-emerald-500")} />
          </div>
          <div className="mt-2">
            <h2 className={cn(
              "text-2xl font-black italic tracking-tight leading-none uppercase",
              visionFireDetected ? "text-rose-500 animate-pulse" : "text-emerald-500"
            )}>
              {visionFireDetected ? "Api" : "Bukan api"}
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 mt-1.5 uppercase font-mono">
              Confidence: {visionFireDetected ? "97.3%" : "88.4%"}
            </p>
          </div>
        </div>

        {/* Card 2: Api hari ini */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-[110px] shadow-lg">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-black tracking-widest uppercase">Api hari ini</span>
            <Flame className={cn("w-4 h-4", visionFireDetected ? "text-rose-500 animate-bounce" : "text-zinc-600")} />
          </div>
          <div className="mt-2">
            <h2 className={cn(
              "text-2xl font-black italic tracking-tight leading-none font-mono",
              visionFireDetected ? "text-rose-500" : "text-zinc-300"
            )}>
              {visionFireDetected ? "1" : "0"}
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 mt-1.5 uppercase font-mono">
              Terakhir: {visionFireDetected ? "12:21:03" : "—"}
            </p>
          </div>
        </div>

        {/* Card 3: CPU Raspi */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-[110px] shadow-lg">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-black tracking-widest uppercase">CPU Raspi</span>
            <Cpu className={cn("w-4 h-4 text-zinc-400", raspiOnline && "animate-spin-slow")} />
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black italic tracking-tight leading-none font-mono text-zinc-200">
              {raspiOnline ? `${simulatedCpu}%` : "0.0%"}
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 mt-1.5 uppercase font-mono">
              Uptime: {raspiOnline ? formatUptime(uptimeSeconds) : "00:00:00"}
            </p>
          </div>
        </div>

        {/* Card 4: Notifikasi */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-[110px] shadow-lg">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-black tracking-widest uppercase">Notifikasi</span>
            <Bell className={cn("w-4 h-4", visionFireDetected ? "text-emerald-400 animate-bounce" : "text-zinc-600")} />
          </div>
          <div className="mt-2">
            <h2 className={cn(
              "text-2xl font-black italic tracking-tight leading-none font-mono",
              visionFireDetected ? "text-emerald-400" : "text-zinc-500"
            )}>
              {visionFireDetected ? "1" : "0"}
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 mt-1.5 uppercase font-mono">
              {visionFireDetected ? "Telegram terkirim" : "Telegram standby"}
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Live CCTV Feed and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Live CCTV - CNN System */}
        <div className="lg:col-span-3 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Live CCTV — Sistem CNN</h3>
          
          <div className="relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-inner flex flex-col justify-between p-4 text-white">
            
            {/* Scanline overlay for raw tech look */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-40"></div>

            {/* Live Indicator Dot */}
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1.5 rounded-lg border border-white/5">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  raspiOnline ? "bg-red-500 animate-ping" : "bg-zinc-600"
                )}></span>
                <span className="text-[9px] font-black tracking-wider uppercase font-mono">
                  {raspiOnline ? "● Live" : "Offline"}
                </span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 bg-black/60 px-2 py-1 rounded">
                YOLOv8n-Fire
              </span>
            </div>

            {/* Central icon backdrop */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="p-5 rounded-full bg-zinc-900/50 border border-zinc-800/60 flex items-center justify-center">
                <Camera className="w-10 h-10 text-zinc-700" />
              </div>
              {visionFireDetected && (
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 animate-pulse bg-rose-950/40 border border-rose-900/50 px-3 py-1 rounded-full">
                  ⚠️ BAHAYA: Api Terdeteksi
                </span>
              )}
            </div>

            {/* Bottom Info Badges inside feed */}
            <div className="relative z-10 flex justify-between items-end">
              <span className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider font-mono",
                visionFireDetected ? "bg-rose-500 text-white" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              )}>
                {visionFireDetected ? "Api" : "Bukan api"}
              </span>
              
              <span className="bg-black/80 border border-zinc-800 px-2 py-1 rounded text-[9px] font-mono text-zinc-400">
                {visionFireDetected ? "97.3%" : "88.4%"}
              </span>
            </div>

          </div>

          <p className="text-[11px] font-mono text-zinc-500 text-left">
            192.168.0.100/stream2 — praproses CLAHE aktif
          </p>
        </div>

        {/* CNN System Status List */}
        <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase mb-4">Status Sistem CNN</h3>
          
          <div className="flex-1 divide-y divide-zinc-800/70 flex flex-col justify-between">
            
            <div className="flex justify-between items-center py-2.5">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Deteksi</span>
              <span className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider font-mono",
                visionFireDetected ? "bg-rose-950 text-rose-400 border border-rose-900" : "bg-emerald-950 text-emerald-400 border border-emerald-900"
              )}>
                {visionFireDetected ? "Api" : "Bukan api"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Confidence</span>
              <span className="text-[11px] font-extrabold text-zinc-200 font-mono">
                {visionFireDetected ? "97.3%" : "88.4%"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Deteksi terakhir</span>
              <span className="text-[11px] font-extrabold text-zinc-200 font-mono">
                {visionFireDetected ? "12:21:03" : "12:21:03"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Telegram</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono",
                visionFireDetected ? "bg-blue-950 text-blue-400 border border-blue-900" : "text-zinc-500"
              )}>
                {visionFireDetected ? "Terkirim (1x)" : "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Kamera</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono",
                raspiOnline ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-rose-950 text-rose-400 border border-rose-900"
              )}>
                {raspiOnline ? "Online" : "Offline"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">GPS</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono bg-emerald-950 text-emerald-400 border border-emerald-900">
                Terhubung
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Koordinat</span>
              <span className="text-[11px] font-bold text-zinc-300 font-mono">
                {activeDevice.location ? `${activeDevice.location.lat.toFixed(4)}, ${activeDevice.location.lng.toFixed(4)}` : "-6.8922, 107.6181"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-zinc-800">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Lokasi</span>
              <span className="text-[11px] font-extrabold text-zinc-200">
                {activeDevice.name.includes("Server") ? "Ruangan Server" : activeDevice.name.includes("Kantin") ? "Ruangan Kantin" : "Ruangan Tamu"}
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Detection Logs Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Riwayat Deteksi Terbaru</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <th className="py-3 px-4 font-mono">Waktu</th>
                <th className="py-3 px-4">Sistem</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 font-mono">Confidence</th>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4">Notifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs font-medium text-zinc-300">
              
              {/* Dynamic live simulation row if active */}
              {visionFireDetected && (
                <tr className="bg-rose-500/5 font-bold text-rose-200">
                  <td className="py-3.5 px-4 font-mono">12:21:03</td>
                  <td className="py-3.5 px-4">CNN/CCTV</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black text-[9px] uppercase tracking-wider">
                      Api
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">97.3%</td>
                  <td className="py-3.5 px-4">Ruangan Tamu</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20 font-black text-[9px] uppercase tracking-wider">
                      Terkirim
                    </span>
                  </td>
                </tr>
              )}

              {/* Static Simulated Log 1 */}
              <tr className={cn(visionFireDetected ? "opacity-75" : "font-semibold")}>
                <td className="py-3.5 px-4 font-mono">12:15:44</td>
                <td className="py-3.5 px-4">IoT</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black text-[9px] uppercase tracking-wider">
                    Alarm
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono">—</td>
                <td className="py-3.5 px-4">Ruangan Dapur</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20 font-black text-[9px] uppercase tracking-wider">
                    Terkirim
                  </span>
                </td>
              </tr>

              {/* Log 2 */}
              <tr className="opacity-70">
                <td className="py-3.5 px-4 font-mono">11:45:22</td>
                <td className="py-3.5 px-4">CNN/CCTV</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] uppercase tracking-wider">
                    Normal
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono">88.1%</td>
                <td className="py-3.5 px-4">Ruangan Tamu</td>
                <td className="py-3.5 px-4 text-zinc-500 font-mono">—</td>
              </tr>

              {/* Log 3 */}
              <tr className="opacity-70">
                <td className="py-3.5 px-4 font-mono">10:30:11</td>
                <td className="py-3.5 px-4">CNN/CCTV</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] uppercase tracking-wider">
                    Normal
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono">92.4%</td>
                <td className="py-3.5 px-4">Ruangan Tamu</td>
                <td className="py-3.5 px-4 text-zinc-500 font-mono">—</td>
              </tr>

              {/* Log 4 */}
              <tr className="opacity-70">
                <td className="py-3.5 px-4 font-mono">09:15:44</td>
                <td className="py-3.5 px-4">IoT</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] uppercase tracking-wider">
                    Normal
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono">—</td>
                <td className="py-3.5 px-4">Ruangan Dapur</td>
                <td className="py-3.5 px-4 text-zinc-500 font-mono">—</td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
