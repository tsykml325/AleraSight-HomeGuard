import { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { 
  Activity, Flame, Cpu, Bell, Camera, Send, 
  MapPin, ShieldAlert, Wifi, CheckCircle, AlertTriangle, 
  Sparkles, RefreshCw, Layers, ShieldCheck, Video, RefreshCcw
} from 'lucide-react';
import { cn } from '../lib/utils';

// ========== Konfigurasi dari Environment Variable (diisi di Vercel) ==========
// PENTING: Project ini pakai Vite — env var HARUS pakai prefix VITE_
// dan diakses lewat import.meta.env, bukan process.env
const CCTV_URL = import.meta.env.VITE_CCTV_URL || '';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

interface DeteksiRow {
  hasil: 'API' | 'BUKAN_API';
  confidence: number | null;
  latitude: number | null;
  longitude: number | null;
  waktu_deteksi: string;
}

export function AIPrediction() {
  const { 
    raspiOnline, setRaspiOnline,
    visionFireDetected, setVisionFireDetected,
    activeDeviceId, devices, addAuditLog
  } = useAppState();

  const activeDevice = devices.find(d => d.id === activeDeviceId) || devices[0];

  // ========== State untuk Snapshot CCTV Asli ==========
  const [imgSrc, setImgSrc] = useState(`${CCTV_URL}?_=${Date.now()}`);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!CCTV_URL) return;
    const interval = setInterval(() => {
      setImgSrc(`${CCTV_URL}?_=${Date.now()}`);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ========== State untuk Riwayat Deteksi Asli dari Supabase ==========
  // riwayat[0] adalah data TERBARU, dipakai juga untuk kartu status di atas
  const [riwayat, setRiwayat] = useState<DeteksiRow[]>([]);
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    const fetchRiwayat = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/deteksi_cv?select=hasil,confidence,latitude,longitude,waktu_deteksi&order=waktu_deteksi.desc&limit=10`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: DeteksiRow[] = await res.json();
        setRiwayat(data);
        if (data.length > 0) {
          setVisionFireDetected(data[0].hasil === 'API');
        }
        setBackendError(false);
      } catch (err) {
        console.error('[SUPABASE] Gagal ambil riwayat deteksi:', err);
        setBackendError(true);
      }
    };

    fetchRiwayat();
    const interval = setInterval(fetchRiwayat, 5000);
    return () => clearInterval(interval);
  }, [setVisionFireDetected]);

  const terbaru = riwayat[0] || null;

  const displayConfidence = terbaru?.confidence != null
    ? `${(terbaru.confidence * 100).toFixed(1)}%`
    : '—';

  const displayWaktu = terbaru?.waktu_deteksi
    ? new Date(terbaru.waktu_deteksi).toLocaleTimeString('id-ID')
    : '—';

  const displayKoordinat = terbaru?.latitude != null && terbaru?.longitude != null
    ? `${terbaru.latitude.toFixed(4)}, ${terbaru.longitude.toFixed(4)}`
    : (activeDevice.location ? `${activeDevice.location.lat.toFixed(4)}, ${activeDevice.location.lng.toFixed(4)}` : '-6.8922, 107.6181');

  // Hitung jumlah deteksi "API" hari ini dari riwayat yang sudah diambil
  const apiHariIni = riwayat.filter(r => {
    if (r.hasil !== 'API') return false;
    const tgl = new Date(r.waktu_deteksi);
    const sekarang = new Date();
    return tgl.toDateString() === sekarang.toDateString();
  }).length;

  // Fluctuating CPU usage simulation (tetap simulasi, karena tidak ada data CPU asli dikirim dari Raspi)
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

  // Raspi Uptime Ticker (tetap simulasi, karena tidak ada data uptime asli dikirim dari Raspi)
  const [uptimeSeconds, setUptimeSeconds] = useState(1528);
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

  return (
    <div className="space-y-6 pb-12 text-zinc-100 bg-[#0f0f11] p-6 sm:p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl font-sans">

      {backendError && (
        <div className="bg-amber-950/40 border border-amber-900/50 text-amber-400 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Gagal mengambil data terbaru dari Supabase — menampilkan data terakhir yang berhasil diambil.
        </div>
      )}

      {/* DEBUG SEMENTARA - hapus setelah masalah env var selesai */}
      <div className="bg-yellow-950/60 border-2 border-yellow-500 text-yellow-300 text-[10px] font-mono p-3 rounded-xl break-all">
        <p>DEBUG CCTV_URL: "{CCTV_URL}"</p>
        <p>DEBUG SUPABASE_URL: "{SUPABASE_URL}"</p>
        <p>DEBUG SUPABASE_ANON_KEY length: {SUPABASE_ANON_KEY.length}</p>
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
              Confidence: {displayConfidence}
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
              apiHariIni > 0 ? "text-rose-500" : "text-zinc-300"
            )}>
              {apiHariIni}
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 mt-1.5 uppercase font-mono">
              Terakhir: {displayWaktu}
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
              {apiHariIni}
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
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-40 z-10"></div>

            {/* Snapshot CCTV Asli - selalu dirender supaya bisa auto-pulih kalau sempat gagal */}
            {CCTV_URL && (
              <img
                src={imgSrc}
                alt="Snapshot CCTV"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImgError(true)}
                onLoad={() => setImgError(false)}
              />
            )}

            {(!CCTV_URL || imgError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-zinc-950">
                <div className="p-5 rounded-full bg-zinc-900/50 border border-zinc-800/60 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-zinc-700" />
                </div>
              </div>
            )}

            {/* Live Indicator Dot */}
            <div className="relative z-20 flex justify-between items-center">
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
                CNN-Fire
              </span>
            </div>

            {visionFireDetected && (
              <div className="relative z-20 flex flex-col items-center justify-center flex-1 pointer-events-none">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse bg-rose-950/40 border border-rose-900/50 px-3 py-1 rounded-full">
                  ⚠️ BAHAYA: Api Terdeteksi
                </span>
              </div>
            )}

            {/* Bottom Info Badges inside feed */}
            <div className="relative z-20 flex justify-between items-end">
              <span className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider font-mono",
                visionFireDetected ? "bg-rose-500 text-white" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              )}>
                {visionFireDetected ? "Api" : "Bukan api"}
              </span>
              
              <span className="bg-black/80 border border-zinc-800 px-2 py-1 rounded text-[9px] font-mono text-zinc-400">
                {displayConfidence}
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
                {displayConfidence}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Deteksi terakhir</span>
              <span className="text-[11px] font-extrabold text-zinc-200 font-mono">
                {displayWaktu}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Telegram</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono",
                visionFireDetected ? "bg-blue-950 text-blue-400 border border-blue-900" : "text-zinc-500"
              )}>
                {visionFireDetected ? "Terkirim" : "—"}
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
                {displayKoordinat}
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

      {/* Detection Logs Table - SEKARANG DARI DATA ASLI SUPABASE */}
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
                <th className="py-3 px-4">Koordinat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs font-medium text-zinc-300">
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 px-4 text-center text-zinc-500">
                    {SUPABASE_URL ? "Belum ada data deteksi" : "Supabase belum dikonfigurasi"}
                  </td>
                </tr>
              ) : (
                riwayat.map((row, idx) => (
                  <tr key={idx} className={cn(row.hasil === 'API' ? "bg-rose-500/5 font-bold text-rose-200" : "opacity-80")}>
                    <td className="py-3.5 px-4 font-mono">
                      {new Date(row.waktu_deteksi).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4">CNN/CCTV</td>
                    <td className="py-3.5 px-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded font-black text-[9px] uppercase tracking-wider",
                        row.hasil === 'API'
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      )}>
                        {row.hasil === 'API' ? 'Api' : 'Normal'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {row.confidence != null ? `${(row.confidence * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px]">
                      {row.latitude != null && row.longitude != null
                        ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
