import { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, AlertTriangle, Flame, Thermometer, Wind, Bell, 
  Search, Shield, Plus, Clock, Database, CheckCircle2, User, HelpCircle, ArrowRight,
  Wifi, Zap, CloudSun, Calendar, Cpu, Camera
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { formatDate, cn } from '../lib/utils';
import { useAppState } from '../context/StateContext';

export function Dashboard() {
  const { 
    devices, alarms, sensorData, notifications, setCurrentPage,
    simulatedGas, simulatedTemp, simulatedHum, esp32Online, mqttConnected,
    telegramBotActive, settings, currentUser, raspiOnline, visionFireDetected
  } = useAppState();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeframe, setTimeframe] = useState<number>(12);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hrs = currentTime.getHours();
    if (hrs < 11) return 'Selamat Pagi';
    if (hrs < 15) return 'Selamat Siang';
    if (hrs < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Calculate live statistics
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.isActive).length;
  const offlineDevices = totalDevices - onlineDevices;
  const activeAlarmCount = alarms.filter(a => a.status !== 'resolved').length;
  const criticalAlarmCount = alarms.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;

  const summaryCards = [
    { 
      label: 'TOTAL PERANGKAT IoT', 
      value: totalDevices, 
      desc: `${onlineDevices} Online / ${offlineDevices} Offline`, 
      icon: Activity, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      trend: '+0% vs jam lalu',
      trendType: 'neutral',
      strokeColor: '#2563eb',
      fillColor: '#dbeafe',
      sparklineData: [{value: 3}, {value: 3}, {value: 4}, {value: 4}, {value: totalDevices}]
    },
    { 
      label: 'STATUS DARURAT (ALARM)', 
      value: activeAlarmCount, 
      desc: `${criticalAlarmCount} Kritis aktif`, 
      icon: Flame, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      trend: activeAlarmCount > 0 ? '+100% vs kemarin' : '0% vs jam lalu',
      trendType: activeAlarmCount > 0 ? 'up' : 'neutral',
      strokeColor: '#dc2626',
      fillColor: '#fee2e2',
      sparklineData: [{value: 0}, {value: 0}, {value: 1}, {value: 0}, {value: activeAlarmCount}]
    },
    { 
      label: 'KONDISI AMAN LINGKUNGAN', 
      value: devices.filter(d => d.status === 'aman').length, 
      desc: 'Sektor berstatus normal', 
      icon: ShieldCheck, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      trend: '+12% vs kemarin',
      trendType: 'up',
      strokeColor: '#059669',
      fillColor: '#d1fae5',
      sparklineData: [{value: 2}, {value: 3}, {value: 2}, {value: 3}, {value: devices.filter(d => d.status === 'aman').length}]
    },
    { 
      label: 'PERANGKAT WASPADA', 
      value: devices.filter(d => d.status === 'waspada').length, 
      desc: 'Butuh peninjauan gas', 
      icon: AlertTriangle, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50',
      trend: '-25% vs jam lalu',
      trendType: 'down',
      strokeColor: '#f97316',
      fillColor: '#ffedd5',
      sparklineData: [{value: 1}, {value: 2}, {value: 1}, {value: 0}, {value: devices.filter(d => d.status === 'waspada').length}]
    },
  ];

  // Map sensorData into chart format based on selected timeframe zoom level
  const chartData = sensorData.slice(-timeframe).map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    gas: d.gas,
    temp: d.temperature
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md text-[10px] font-semibold space-y-2">
          <p className="font-mono text-slate-400 border-b border-slate-800 pb-1.5 uppercase font-black tracking-wider">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-slate-300 font-extrabold uppercase">LEVEL GAS:</span>
              </div>
              <span className="font-mono font-black italic text-blue-400">{payload[0].value} ppm</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-slate-300 font-extrabold uppercase">SUHU RUANG:</span>
              </div>
              <span className="font-mono font-black italic text-red-400">{payload[1]?.value ?? 0}°C</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Enterprise Welcome Board with Glassmorphism */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2.5 text-blue-400 text-xs font-black tracking-widest uppercase">
            <Shield className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>AleraSight Client Portal Enterprise</span>
          </div>
          <h2 className="text-3xl font-black italic tracking-tight uppercase leading-none">
            {getGreeting()}, {currentUser ? currentUser.name : "Tasya Kamila"}
          </h2>
          <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-xl">
            Sistem informasi monitoring detektor kebakaran berbasis IoT terintegrasi Telegram dan MQTT berjalan dengan optimal. Seluruh parameter pengawasan terekam.
          </p>
        </div>

        {/* Real-time Clock Dashboard */}
        <div className="shrink-0 relative z-10 px-6 py-4 bg-white/5 border border-white/10 rounded-[1.75rem] text-right font-semibold">
          <div className="flex items-center gap-2 text-slate-400 justify-end text-[10px] font-black uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Waktu Server UTC+7</span>
          </div>
          <p className="text-3xl font-black font-mono italic tracking-tighter text-blue-200 mt-1">{formattedTime}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{formattedDate}</p>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg shadow-slate-100 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">{card.label}</span>
              <div className={cn(card.bg, "w-10 h-10 rounded-xl flex items-center justify-center")}>
                <card.icon className={cn("w-5 h-5", card.color)} />
              </div>
            </div>
            <div className="mt-6 flex justify-between items-end">
              <div>
                <h4 className={cn("text-4xl font-black italic tracking-tighter leading-none", card.label.includes('ALARM') && activeAlarmCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-900')}>{card.value}</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">{card.desc}</p>
              </div>

              {/* Trend indicator badge */}
              <div className={cn(
                "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider leading-none shrink-0",
                card.trendType === 'up' ? 'bg-rose-50 text-rose-700' :
                card.trendType === 'down' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
              )}>
                {card.trend}
              </div>
            </div>

            {/* Sparkline mini-chart */}
            <div className="h-10 mt-5 w-full opacity-70 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.sparklineData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <defs>
                    <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={card.strokeColor} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={card.strokeColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={card.strokeColor} 
                    strokeWidth={2} 
                    fill={`url(#spark-${i})`} 
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Real-time Environment Values Indicator Panel */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <div>
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest italic">Pemantauan Sensor Real-time (Active Node)</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Nilai sensor dari simpul receptor aktif saat ini</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-blue-600 italic bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Device: {settings.mqttTopic}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Wind className="w-5 h-5" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 block uppercase">Gas MQ-2</span>
              <p className="text-xl font-black text-slate-900 italic font-mono">{simulatedGas} ppm</p>
              <span className="text-[8px] font-bold text-slate-400">Batas Bahaya: {settings.gasThreshold} ppm</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><Thermometer className="w-5 h-5" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 block uppercase">Suhu SHT20</span>
              <p className="text-xl font-black text-slate-900 italic font-mono">{simulatedTemp}°C</p>
              <span className="text-[8px] font-bold text-slate-400">Batas Bahaya: {settings.tempThreshold}°C</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><CloudSun className="w-5 h-5" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 block uppercase">Kelembapan SHT20</span>
              <p className="text-xl font-black text-slate-900 italic font-mono">{simulatedHum}% RH</p>
              <span className="text-[8px] font-bold text-slate-400">Normal Range: 40% - 70%</span>
            </div>
          </div>

          <div 
            onClick={() => setCurrentPage("ai")}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center gap-4 cursor-pointer transition-colors group"
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
              !raspiOnline ? "bg-red-50 text-red-600" :
              visionFireDetected ? "bg-red-600 text-white animate-pulse" : "bg-teal-50 text-teal-600 group-hover:bg-teal-100"
            )}>
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 block uppercase">CCTV AI Vision (Pi 5)</span>
              <p className={cn(
                "text-xs font-black italic uppercase",
                !raspiOnline ? "text-red-500" :
                visionFireDetected ? "text-red-600 font-extrabold animate-bounce mt-1" : "text-slate-900 font-mono text-sm mt-1"
              )}>
                {!raspiOnline ? "OFFLINE (LOST)" : visionFireDetected ? "🔥 ADA API (FIRE)" : "TIDAK ADA API"}
              </p>
              <span className="text-[8px] font-bold text-slate-400 block uppercase group-hover:text-teal-600 transition-colors">
                {raspiOnline ? "✓ YOLOv8 Active" : "Periksa Daya"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main telemetry charts */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Grafik Sinyal Telemetri Real-time</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pembacaan sensor gas MQ-2 (ppm) & Suhu (°C) yang disalurkan</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Zoom timeframe selector buttons */}
              <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                {[
                  { label: '10 DATA', value: 10 },
                  { label: '30 DATA', value: 30 },
                  { label: 'SEMUA', value: 50 },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTimeframe(item.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all",
                      timeframe === item.value 
                        ? "bg-white text-blue-600 shadow-sm italic font-extrabold" 
                        : "text-slate-400 hover:text-slate-800"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span className="text-[9px] font-black uppercase text-slate-400">Gas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <span className="text-[9px] font-black uppercase text-slate-400">Temp</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="gas" name="Gas Level (ppm)" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorGas)" />
                <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#dc2626" strokeWidth={4} fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Feed Notification Feed Panel */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Security & Alert Feed</h3>
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mt-1 flex items-center gap-2 leading-none">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                Aliran Log Sinyal Sistem
              </p>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4 hover:shadow-md transition-shadow group">
                  <div className={cn(
                    "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white",
                    notif.type === 'alert' ? 'bg-red-600' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-600'
                  )}>
                    {notif.type === 'alert' ? <Flame className="w-5 h-5 animate-pulse" /> : 
                     notif.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-900 transition-colors uppercase italic">{notif.message}</p>
                    <span className="text-[9px] text-slate-400 font-semibold block mt-1">{formatDate(notif.timestamp)}</span>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-black italic uppercase tracking-widest">
                  Tidak ada pesan keamanan baru.
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setCurrentPage('audit')}
            className="w-full mt-6 py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black italic uppercase tracking-widest rounded-2xl shadow-md flex items-center justify-center gap-2"
          >
            <span>Tinjau Riwayat Audit Log</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Network Infrastructure Health Center Widget */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Status Infrastruktur & Gateway IoT</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status konektivitas terdistribusi & gateway telekomunikasi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className={cn("w-5 h-5", esp32Online ? "text-emerald-500" : "text-red-500")} />
              <div>
                <span className="text-[10px] font-black text-slate-400 block uppercase leading-none">ESP32 Client</span>
                <span className="text-xs font-extrabold text-slate-700 uppercase italic">{esp32Online ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
            </div>
            <span className={cn("w-2 h-2 rounded-full", esp32Online ? "bg-emerald-500" : "bg-red-500")}></span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className={cn("w-5 h-5", mqttConnected ? "text-blue-500" : "text-red-500")} />
              <div>
                <span className="text-[10px] font-black text-slate-400 block uppercase leading-none">MQTT Gateway</span>
                <span className="text-xs font-extrabold text-slate-700 uppercase italic">{mqttConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
              </div>
            </div>
            <span className={cn("w-2 h-2 rounded-full", mqttConnected ? "bg-emerald-500" : "bg-red-500")}></span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className={cn("w-5 h-5", telegramBotActive ? "text-indigo-500" : "text-red-500")} />
              <div>
                <span className="text-[10px] font-black text-slate-400 block uppercase leading-none">Telegram Bot</span>
                <span className="text-xs font-extrabold text-slate-700 uppercase italic">{telegramBotActive ? 'READY' : 'OFFLINE'}</span>
              </div>
            </div>
            <span className={cn("w-2 h-2 rounded-full", telegramBotActive ? "bg-emerald-500" : "bg-red-500")}></span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="text-teal-500 w-5 h-5" />
              <div>
                <span className="text-[10px] font-black text-slate-400 block uppercase leading-none">Postgres Database</span>
                <span className="text-xs font-extrabold text-slate-700 uppercase italic">OPERATIONAL</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>

        </div>
      </div>
    </div>
  );
}
