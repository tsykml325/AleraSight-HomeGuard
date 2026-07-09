import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { useAppState } from '../context/StateContext';
import { Brain, Flame, Clock, Zap, MapPin, AlertTriangle } from 'lucide-react';

export function Analytics() {
  const { sensorData, alarms, devices } = useAppState();

  // Create mock historical trend of incidents
  const weeklyTrendData = [
    { name: 'Senin', alarm: 2, normal: 18, respon: 12 },
    { name: 'Selasa', alarm: 4, normal: 16, respon: 8 },
    { name: 'Rabu', alarm: 1, normal: 19, respon: 15 },
    { name: 'Kamis', alarm: 5, normal: 15, respon: 7 },
    { name: 'Jumat', alarm: 2, normal: 18, respon: 10 },
    { name: 'Sabtu', alarm: 0, normal: 20, respon: 0 },
    { name: 'Minggu', alarm: 1, normal: 19, respon: 14 }
  ];

  // Device health radar metrics
  const radarData = [
    { subject: 'Sensitivitas MQ-2', A: 85, B: 90, fullMark: 100 },
    { subject: 'Sinyal (RSSI)', A: 90, B: 75, fullMark: 100 },
    { subject: 'Suhu SHT20', A: 98, B: 95, fullMark: 100 },
    { subject: 'Daya Baterai', A: 95, B: 85, fullMark: 100 },
    { subject: 'Kestabilan WiFi', A: 75, B: 90, fullMark: 100 },
    { subject: 'Responsivitas API', A: 92, B: 88, fullMark: 100 }
  ];

  // Distribution of alarm severities
  const severityDistribution = [
    { name: 'Critical (Bahaya)', value: alarms.filter(a => a.severity === 'critical').length || 1, color: '#dc2626' },
    { name: 'Warning (Waspada)', value: alarms.filter(a => a.severity === 'warning').length || 3, color: '#f59e0b' },
    { name: 'Info (Normal)', value: alarms.filter(a => a.severity === 'info').length || 8, color: '#3b82f6' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamic Grid Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-300">Response Speed</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-6">
            <h4 className="text-3xl font-black italic tracking-tighter text-blue-100">11.4 mnt</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Rata-rata waktu tanggap petugas</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Efisiensi Bot Telegram</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-6">
            <h4 className="text-3xl font-black italic tracking-tighter text-slate-900">99.2%</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Laju keberhasilan kiriman alert</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Titik Risiko Kebakaran</span>
            <MapPin className="w-5 h-5 text-red-500" />
          </div>
          <div className="mt-6">
            <h4 className="text-3xl font-black italic tracking-tighter text-slate-900">Gedung C</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Area paling aktif memicu waspada</p>
          </div>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend area chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Tren Frekuensi Alarm Mingguan</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Jumlah alarm vs. Kecepatan penanganan (menit)</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="colorAlarm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRespon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip />
                <Area type="monotone" dataKey="alarm" name="Jumlah Alarm" stroke="#dc2626" strokeWidth={4} fillOpacity={1} fill="url(#colorAlarm)" />
                <Area type="monotone" dataKey="respon" name="Waktu Respon (menit)" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRespon)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Pie Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Status Severity</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Distribusi keparahan insiden</p>
          </div>
          <div className="h-[220px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-3xl font-black text-slate-900 italic">{alarms.length}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">TOTAL ALARM</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {severityDistribution.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-slate-600 font-semibold">{entry.name}</span>
                </div>
                <span className="text-slate-900">{entry.value} Tiket</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Kesehatan Ekosistem IoT</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Matriks perbandingan target vs realisasi lapangan</p>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Target Performa" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />
                <Radar name="Realisasi Lapangan" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart - Response Time per Officer */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Performa Petugas Lapangan</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Kecepatan respon rata-rata per personil (menit)</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Budi S.', mnt: 9.4, color: '#3b82f6' },
                { name: 'Andi W.', mnt: 12.1, color: '#10b981' },
                { name: 'Siti R.', mnt: 8.5, color: '#f59e0b' },
                { name: 'Tasya K.', mnt: 6.8, color: '#ef4444' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip />
                <Bar dataKey="mnt" radius={[8, 8, 0, 0]}>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
