import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, BarChart3, FileType, Printer, ShieldCheck, Clock, Layers } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { cn } from '../lib/utils';

export function Reports() {
  const { devices, alarms, sensorData, addAuditLog, currentUser } = useAppState();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [helpCenterText, setHelpCenterText] = useState('');
  const isOperator = currentUser?.role === 'Operator';

  useEffect(() => {
    addAuditLog("VIEW_REPORTS", "system", "Membuka halaman cetak laporan");
  }, [addAuditLog]);

  // Compute aggregate numbers from real data
  const totalAlarms = alarms.length;
  const activeAlarms = alarms.filter(a => a.status !== 'resolved').length;
  const avgGas = Math.round(sensorData.reduce((acc, curr) => acc + curr.gas, 0) / (sensorData.length || 1));
  const avgTemp = (sensorData.reduce((acc, curr) => acc + curr.temperature, 0) / (sensorData.length || 1)).toFixed(1);

  const archiveReports = [
    { id: 'REP-001', name: 'Laporan Harian - Deteksi IoT Terpadu', date: new Date().toISOString().slice(0, 10), size: '1.4 MB', type: 'daily' },
    { id: 'REP-002', name: 'Laporan Mingguan - Analisis Kebakaran Sektor C', date: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10), size: '8.2 MB', type: 'weekly' },
    { id: 'REP-003', name: 'Laporan Bulanan - Rekapitulasi Sensor MQ-2 & SHT20', date: new Date(Date.now() - 86400000 * 30).toISOString().slice(0, 10), size: '24.1 MB', type: 'monthly' },
    { id: 'REP-004', name: 'Laporan Tahunan - Strategi Mitigasi AleraSight 2026', date: '2026-01-01', size: '115.8 MB', type: 'yearly' },
  ];

  const filteredArchives = archiveReports.filter(rep => rep.type === reportType);

  const triggerPrint = () => {
    addAuditLog("PRINT_REPORT", "system", "Melakukan pencetakan dokumen laporan resmi");
    window.print();
  };

  const exportPDF = (filename: string) => {
    const content = `========================================
        ALERASIGHT HOMEGUARD SYSTEM REPORT
========================================
DOKUMEN REKAP: ${filename.toUpperCase()}
WAKTU EKSPOR  : ${new Date().toLocaleString('id-ID')}
STATUS SERVER : 100% ONLINE (ACTIVE NODE)
----------------------------------------

RINGKASAN METRIK TELEMETRI KESELURUHAN:
- Total Perangkat Terdaftar  : ${devices.length} Unit Receptor
- Total Kejadian Kebakaran   : ${totalAlarms} Alarm
- Sinyal Alarm Aktif         : ${activeAlarms} Pending
- Rata-rata Tingkat Gas      : ${avgGas} ppm (MQ-2)
- Rata-rata Suhu Lingkungan  : ${avgTemp}°C (SHT20)

----------------------------------------
Sistem Pemantauan Terpadu AleraSight HomeGuard
Laporan ini sah secara digital dan bersumber dari cloud database gateway.
========================================`;
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename.toLowerCase().replace(/ /g, '_')}_laporan.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog("EXPORT_REPORT", "system", `Mengekspor laporan aktivitas (${filename}) ke format PDF/TXT`);
  };

  const exportExcel = (filename: string) => {
    const headers = ['METRIK', 'NILAI KUALITAS', 'SATUAN UKUR', 'STATUS INTERPRESTASI'];
    const rows = [
      ['Total Unit IoT', devices.length, 'Node', 'Receptor Online'],
      ['Kumulatif Alarm', totalAlarms, 'Kejadian', 'Insiden Kebakaran'],
      ['Alarm Belum Tuntas', activeAlarms, 'Insiden', 'Butuh Respon Segera'],
      ['Konsentrasi Gas Rata-rata', avgGas, 'ppm', 'Udara MQ-2 Normal'],
      ['Suhu Rata-rata Lingkungan', avgTemp, 'Celcius', 'SHT20 Aman']
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename.toLowerCase().replace(/ /g, '_')}_ekspor_excel.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog("EXPORT_REPORT", "system", `Mengekspor laporan aktivitas (${filename}) ke format Excel/CSV`);
  };

  const handleDownload = (filename: string) => {
    const reportData = {
      title: filename,
      generatedAt: new Date().toISOString(),
      statistics: {
        totalDevices: devices.length,
        totalAlarms,
        activeAlarms,
        averageGasPpm: avgGas,
        averageTemperatureCelsius: avgTemp
      }
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `${filename.toLowerCase().replace(/ /g, '_')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog("EXPORT_REPORT", "system", `Mengekspor laporan arsip (${filename}) ke format JSON`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Printable summary section */}
      <div id="printable-report" className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">Laporan Kinerja Ekosistem IoT</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Dokumen Resmi Pemantauan AleraSight HomeGuard</p>
          </div>
          
          <button 
            onClick={triggerPrint}
            className="flex items-center gap-2.5 px-5 py-3 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider italic rounded-2xl shadow-md transition-all shrink-0"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan Resmi
          </button>
        </div>

        {/* Aggregated KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 block uppercase">TOTAL ALARM</span>
            <span className="text-xl font-black text-red-600 mt-1 block italic">{totalAlarms} Kejadian</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 block uppercase">ALARM AKTIF</span>
            <span className="text-xl font-black text-amber-500 mt-1 block italic">{activeAlarms} Pending</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 block uppercase">RATA GAS (MQ-2)</span>
            <span className="text-xl font-black text-slate-800 mt-1 block italic">{avgGas} ppm</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 block uppercase">RATA SUHU</span>
            <span className="text-xl font-black text-slate-800 mt-1 block italic">{avgTemp}°C</span>
          </div>
        </div>
      </div>

      {/* Reports Archives */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-black text-xl text-slate-900 italic uppercase tracking-tight">Arsip Ekspor Laporan</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Repository berkas digital sistem IoT AleraSight</p>
          </div>
          
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(type => (
              <button 
                key={type}
                onClick={() => setReportType(type)}
                className={cn(
                  "px-4 py-2 text-[9px] font-black uppercase italic tracking-wider rounded-xl transition-all shadow-none",
                  reportType === type ? 'bg-white shadow-md text-blue-900 font-extrabold' : 'text-slate-500'
                )}
              >
                {type === 'daily' ? 'Harian' : type === 'weekly' ? 'Mingguan' : type === 'monthly' ? 'Bulanan' : 'Tahunan'}
              </button>
            ))}
          </div>
        </div>

        {/* Files feed */}
        <div className="divide-y divide-slate-100">
          {filteredArchives.map((rep) => (
            <div key={rep.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase italic tracking-tight text-base">{rep.name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-semibold text-slate-400 uppercase">
                    <span>{rep.date}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-blue-600 font-extrabold">{rep.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button 
                  type="button"
                  onClick={() => exportPDF(rep.name)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-[9px] font-black uppercase tracking-wider italic rounded-xl transition-all shadow-sm"
                >
                  Ekspor PDF
                </button>
                <button 
                  type="button"
                  onClick={() => exportExcel(rep.name)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-[9px] font-black uppercase tracking-wider italic rounded-xl transition-all shadow-sm"
                >
                  Ekspor Excel (CSV)
                </button>
                <button 
                  type="button"
                  onClick={() => handleDownload(rep.name)}
                  className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white text-[9px] font-black uppercase tracking-wider italic rounded-xl transition-all shadow-sm"
                >
                  Ekspor JSON
                </button>
              </div>
            </div>
          ))}
          {filteredArchives.length === 0 && (
            <div className="text-center py-16 text-slate-400 font-black italic uppercase tracking-wider">
              Belum ada berkas arsip untuk kriteria terpilih.
            </div>
          )}
        </div>
      </div>
      {/* Kolom Pusat Bantuan / Catatan Tambahan */}
      <div className="pt-2">
        <label
          htmlFor="pusatBantuan"
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 print:hidden"
        >
          Pusat Bantuan / Catatan Tambahan
          {!isOperator && (
            <span className="text-slate-300 normal-case font-semibold"> — hanya bisa diisi oleh Operator</span>
          )}
        </label>

        {isOperator ? (
          <textarea
            id="pusatBantuan"
            value={helpCenterText}
            onChange={(e) => setHelpCenterText(e.target.value)}
            placeholder="Tulis catatan, kontak pusat bantuan, atau keterangan tambahan di sini sebelum mencetak laporan..."
            rows={3}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20 print:hidden"
          />
        ) : (
          <div className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-100 text-sm text-slate-500 font-medium whitespace-pre-wrap print:hidden">
            {helpCenterText.trim() || 'Belum ada catatan dari Operator.'}
          </div>
        )}

        {helpCenterText.trim() && (
          <div className="hidden print:block mt-2 p-4 rounded-2xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Pusat Bantuan / Catatan
            </span>
            {helpCenterText}
          </div>
        )}
      </div>
    </div>
  );
}
