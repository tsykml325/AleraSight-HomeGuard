import { useAppState } from '../context/StateContext';
import { Brain, Flame, Activity, ShieldCheck, HelpCircle, Thermometer, Sparkles, TrendingUp, Compass, Camera, Cpu, Video, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

export function AIPrediction() {
  const { 
    simulatedGas, simulatedTemp, simulatedHum, 
    raspiOnline, visionFireDetected, setRaspiOnline, setVisionFireDetected,
    activeDeviceId, devices
  } = useAppState();

  const activeDevice = devices.find(d => d.id === activeDeviceId) || devices[0];

  // Simple risk heuristic (representing a neural network score)
  const tempRisk = Math.max(0, Math.min(100, ((simulatedTemp - 20) / 40) * 100));
  const gasRisk = Math.max(0, Math.min(100, (simulatedGas / 450) * 100));
  const humRisk = Math.max(0, Math.min(100, ((80 - simulatedHum) / 60) * 100));
  
  const rawRisk = (tempRisk * 0.4) + (gasRisk * 0.45) + (humRisk * 0.15);
  const riskScore = Math.max(5, Math.min(99, Math.round(rawRisk)));

  const riskLevel = riskScore >= 75 ? 'DANGER' : riskScore >= 40 ? 'WARNING' : 'SAFE';

  // AI predictions future logs
  const hourlyRiskTrend = [
    { hour: '10:00', score: 18 },
    { hour: '11:00', score: 20 },
    { hour: '12:00', score: 24 },
    { hour: '13:00', score: 35 },
    { hour: '14:00', score: Math.max(12, Math.round(riskScore - 10)) },
    { hour: '15:00 (Prediksi)', score: riskScore },
    { hour: '16:00 (Prediksi)', score: Math.min(98, Math.round(riskScore * 1.1)) },
    { hour: '17:00 (Prediksi)', score: Math.min(98, Math.round(riskScore * 0.9)) }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* CCTV AI Vision & Raspberry Pi 5 Edge Processor Monitoring */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">CCTV AI Vision & Edge Processor</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sistem Pengawasan Citra Deteksi Api Terintegrasi Raspberry Pi 5</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider italic border",
              raspiOnline ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
            )}>
              Co-Processor: {raspiOnline ? "ONLINE (PI 5)" : "OFFLINE"}
            </span>
            <span className={cn(
              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider italic border",
              !raspiOnline ? "bg-slate-50 text-slate-400 border-slate-200" :
              visionFireDetected ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-emerald-50 text-emerald-600 border-emerald-200"
            )}>
              Deteksi Api: {!raspiOnline ? "UNKNOWN" : visionFireDetected ? "TERDETEKSI API" : "TIDAK ADA API"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CCTV Live Viewport Frame */}
          <div className="lg:col-span-2 relative bg-slate-950 aspect-video rounded-3xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-6 text-white font-mono">
            
            {/* Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-45"></div>

            {/* Top Bar Watermark */}
            <div className="relative z-20 flex justify-between items-start text-[10px] tracking-wider text-slate-400">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", raspiOnline ? "bg-red-600 animate-ping" : "bg-slate-600")}></span>
                  <span className="font-bold text-white uppercase">{raspiOnline ? "• REC LIVE" : "• CONNECTION LOST"}</span>
                </div>
                <p>CAM-04 // {activeDevice.name.toUpperCase()}</p>
                <p>RESOLUSI: 1920x1080 @ 28 FPS</p>
              </div>
              <div className="text-right space-y-1">
                <p>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}</p>
                <p>LOCAL TIME: {new Date().toLocaleTimeString('id-ID')}</p>
                <p>MODEL: YOLOv8n-Fire_v2.1</p>
              </div>
            </div>

            {/* Live Camera View Graphic / State content */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!raspiOnline ? (
                <div className="text-center space-y-3 z-20">
                  <Video className="w-16 h-16 text-slate-700 mx-auto animate-pulse" />
                  <p className="text-sm font-black uppercase tracking-widest text-red-500 italic">CCTV SIGNAL LOST</p>
                  <p className="text-[10px] text-slate-500 uppercase max-w-xs mx-auto leading-relaxed">
                    Raspberry Pi 5 Co-Processor offline. Periksa suplai daya mikrokomputer dan koneksi lokal kamera.
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {/* Camera Room Blueprint Mock Background */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-slate-950/40 opacity-30"></div>
                  
                  {/* Bounding box detection simulation */}
                  {visionFireDetected ? (
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                      <div className="relative w-72 h-52 border-4 border-dashed border-red-500 rounded-2xl flex flex-col justify-between p-4 bg-red-950/20 shadow-2xl shadow-red-500/10">
                        {/* Box Reticle corners */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500 -mt-1 -ml-1"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500 -mt-1 -mr-1"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500 -ml-1 -mb-1"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500 -mr-1 -mb-1"></div>

                        {/* Label Badge */}
                        <div className="bg-red-600 text-white font-black uppercase tracking-widest text-[9px] px-2 py-1 rounded italic self-start -mt-8 -ml-4 flex items-center gap-1.5 shadow-lg">
                          <Flame className="w-3 h-3 animate-bounce" />
                          <span>API / FIRE DETECTED: 99.42%</span>
                        </div>

                        {/* Fire graphic effect placeholder */}
                        <div className="flex-1 flex items-center justify-center opacity-40">
                          <Flame className="w-24 h-24 text-red-500 animate-pulse" />
                        </div>

                        <div className="text-[10px] font-black text-red-400 uppercase tracking-widest text-center animate-pulse">
                          Suhu Ruang Berubah Tinggi / Terdeteksi Fluktuasi
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                      <div className="relative w-80 h-56 border-2 border-dashed border-emerald-500/40 rounded-2xl flex flex-col justify-between p-4 bg-emerald-950/5">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500/40 -mt-0.5 -ml-0.5"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500/40 -mt-0.5 -mr-0.5"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500/40 -ml-0.5 -mb-0.5"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500/40 -mr-0.5 -mb-0.5"></div>

                        <div className="bg-emerald-600/90 text-white font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded italic self-start -mt-7 -ml-4 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>NO FLAME / NORMAL ENVIRONMENT</span>
                        </div>

                        <div className="flex-1 flex items-center justify-center opacity-10">
                          <Camera className="w-20 h-20 text-emerald-400" />
                        </div>

                        <div className="text-[9px] text-emerald-400/80 uppercase tracking-wider text-center">
                          YOLOv8 Scan: Aman, tidak terdeteksi indikasi kobaran api
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Bar Watermark Info */}
            <div className="relative z-20 flex justify-between items-end text-[10px] text-slate-400">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Edge: Pi 5 8GB</span>
                <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> NPU: Hailo-8 AI @ 26 TOPS</span>
              </div>
              <div className="text-right">
                <span>LATENCY: {raspiOnline ? "12 ms" : "---"} // STATUS: {raspiOnline ? "STREAMING" : "OFFLINE"}</span>
              </div>
            </div>
          </div>

          {/* Operational Details Card */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-500" />
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider italic">Konfigurasi Co-Processor</h4>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Model Mikrokontroler:</span>
                  <span className="text-slate-800 font-extrabold uppercase text-right">Raspberry Pi 5 Model B</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Model Deteksi AI:</span>
                  <span className="text-slate-800 font-extrabold uppercase text-right">YOLOv8-Nano (Flames)</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Akselerasi Inferensi:</span>
                  <span className="text-slate-800 font-extrabold uppercase text-right text-teal-600">Hailo-8 M.2 Module</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Metode Analisis:</span>
                  <span className="text-slate-800 font-extrabold uppercase text-right">Computer Vision Object</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 text-xs leading-relaxed font-semibold text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-black uppercase italic text-[10px]">Pemberitahuan Redundansi</h5>
                  <p className="mt-0.5 text-slate-600">
                    Sistem Vision CCTV bertindak sebagai verifikator visual instan mendampingi sensor MQ-2 untuk menghilangkan false alarm fungsional.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick action switches */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase block italic">KONTROL SUPLAI DAYA PI 5</span>
                <button
                  onClick={() => setRaspiOnline(!raspiOnline)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic transition-all",
                    raspiOnline ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  )}
                >
                  {raspiOnline ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase block italic">SIMULASI ADANYA API</span>
                <button
                  disabled={!raspiOnline}
                  onClick={() => setVisionFireDetected(!visionFireDetected)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic transition-all",
                    !raspiOnline ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                    visionFireDetected ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                  )}
                >
                  {visionFireDetected ? "Matikan Api" : "Mulai Api"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk index circle meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="w-32 h-32 text-blue-400 animate-spin-slow" /></div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 italic">Indeks Risiko Kebakaran AI</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              Analisis probabilitas berbasis Neural Network LSTM memproses data sensor multi-variat secara real-time.
            </p>
          </div>

          <div className="flex items-center justify-center py-8 relative z-10">
            <div className="relative w-40 h-40 rounded-full border-4 border-white/5 flex flex-col items-center justify-center">
              <span className={cn(
                "text-6xl font-black italic tracking-tighter leading-none",
                riskLevel === 'DANGER' ? 'text-red-500' : riskLevel === 'WARNING' ? 'text-amber-500' : 'text-emerald-400'
              )}>
                {riskScore}%
              </span>
              <span className="text-[8px] font-black text-slate-400 tracking-[0.2em] uppercase mt-2">SKOR RISIKO</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame className={cn("w-5 h-5", riskLevel === 'DANGER' ? 'text-red-500' : riskLevel === 'WARNING' ? 'text-amber-500' : 'text-emerald-400')} />
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">STATUS PROBABILITAS</span>
                <span className={cn(
                  "text-xs font-black italic uppercase",
                  riskLevel === 'DANGER' ? 'text-red-500' : riskLevel === 'WARNING' ? 'text-amber-500' : 'text-emerald-400'
                )}>{riskLevel} LEVEL</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight mb-2">Rekomendasi Preskriptif AI</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Instruksi tindakan otomatis yang disarankan oleh sistem cerdas</p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-blue-900 uppercase italic">Status Lingkungan Operasional</h4>
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed mt-1">
                    {riskLevel === 'SAFE' && "Udara dalam ruangan stabil. Temperatur, kelembapan, & sensor gas MQ-2 tidak mengindikasikan polusi atau asap."}
                    {riskLevel === 'WARNING' && "Peringatan: Kenaikan kecil pada sensor gas MQ-2 / kenaikan suhu terdeteksi. Sistem menyarankan untuk mengaktifkan kipas sirkulasi / memeriksa ventilasi Gedung."}
                    {riskLevel === 'DANGER' && "BAHAYA: Kondisi kritis terdeteksi! Segera lakukan evakuasi, hubungi pemadam kebakaran, matikan jaringan listrik, & pastikan sprinkler air aktif di sektor ini."}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                <Compass className="w-6 h-6 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase italic">Panduan Kalibrasi Proaktif</h4>
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed mt-1">
                    Sensor MQ-2 di Gedung C beroperasi dalam kelembapan yang berfluktuasi ({simulatedHum}%). Disarankan melakukan autokalibrasi sensor jarak jauh dalam 48 jam ke depan guna meminimalkan false alarms.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100 mt-6">
            <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">PREDICTIVE STABILITY</span>
              <span className="text-sm font-extrabold text-emerald-600 italic mt-1 inline-block">SANGAT TINGGI</span>
            </div>
            <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">RISK ACCURACY</span>
              <span className="text-sm font-extrabold text-blue-600 italic mt-1 inline-block">98.4% ACCURATE</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Risk Prediction over time trend chart */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Tren Prediktif Skor Risiko</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Grafik peramalan 3 jam ke depan berdasarkan pola telemetri multi-sensor</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>ALERASIGHT FORECAST</span>
          </div>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyRiskTrend}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
              <Tooltip />
              <Area type="monotone" dataKey="score" name="Prediksi Skor Risiko (%)" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRisk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
