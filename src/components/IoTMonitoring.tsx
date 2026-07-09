import { useAppState } from '../context/StateContext';
import { Cpu, Wifi, Signal, RefreshCw, Layers, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

export function IoTMonitoring() {
  const { 
    devices, simulatedBattery, simulatedSignal, esp32Online, mqttConnected,
    activeDeviceId, sensorData 
  } = useAppState();

  const activeDevice = devices.find(d => d.id === activeDeviceId) || devices[0];

  // Simulated live signal logs over time
  const networkHistory = sensorData.slice(-15).map((log, i) => ({
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rssi: Math.max(-95, Math.min(-30, simulatedSignal + (Math.floor(Math.random() * 8) - 4))),
    latency: Math.floor(Math.random() * 45) + 15,
    packetLoss: Math.random() > 0.95 ? Math.floor(Math.random() * 5) + 1 : 0
  }));

  const stats = [
    { label: "WIFI SSID", value: "AleraSight_Secure_IoT", icon: Wifi, color: "text-blue-600" },
    { label: "IP ADDRESS", value: "192.168.100.145", icon: Cpu, color: "text-slate-600" },
    { label: "MAC ADDRESS", value: "30:AE:A4:07:0F:8C", icon: Layers, color: "text-teal-600" },
    { label: "MQTT PORT", value: "1883 (TCP)", icon: Zap, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Device Health Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">MCU STATUS (ESP32)</span>
            <span className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              esp32Online ? "bg-emerald-500" : "bg-red-500"
            )}></span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h4 className={cn("text-3xl font-black italic tracking-tight uppercase", esp32Online ? "text-emerald-600" : "text-red-500")}>
              {esp32Online ? "ONLINE" : "OFFLINE"}
            </h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Koneksi Broker MQTT</span>
            <span className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              mqttConnected ? "bg-emerald-500" : "bg-red-500"
            )}></span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h4 className={cn("text-3xl font-black italic tracking-tight uppercase", mqttConnected ? "text-blue-600" : "text-red-500")}>
              {mqttConnected ? "CONNECTED" : "DISCONNECTED"}
            </h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Kekuatan Sinyal WiFi</span>
            <Signal className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black italic tracking-tight text-slate-900">{simulatedSignal} dBm</h4>
            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Excellent Connection</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Sisa Baterai (Backup)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black italic tracking-tight text-slate-900">{simulatedBattery}%</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Mengisi Daya USB</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Signal RSSI Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Kestabilan Sinyal WiFi (RSSI)</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoring sinyal desibel-miliwatt (dBm) waktu nyata</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkHistory}>
                <defs>
                  <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
                <YAxis domain={[-100, -20]} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip />
                <Area type="monotone" dataKey="rssi" name="Kekuatan Sinyal (dBm)" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSignal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnostic properties */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight mb-2">Informasi Jaringan</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Detail perutean IP & identitas perangkat keras</p>
          </div>
          <div className="space-y-4">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/55 transition-colors">
                <div className="flex items-center gap-3">
                  <s.icon className={cn("w-5 h-5", s.color)} />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{s.label}</span>
                </div>
                <span className="text-xs font-extrabold text-slate-800 font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Latency monitor */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Keterlambatan Transmisi (Latency)</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Kecepatan transmisi ping paket data (Milidetik)</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkHistory}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip />
                <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Packet Loss */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Kehilangan Paket (Packet Loss)</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Jumlah kegagalan kiriman paket dari total transfer</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkHistory}>
                <defs>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip />
                <Area type="monotone" dataKey="packetLoss" name="Packet Loss (%)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorLoss)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
