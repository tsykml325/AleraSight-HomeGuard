import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Filter, Calendar, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { formatDate, cn } from '../lib/utils';

export function RawData() {
  const { sensorData, searchTerm, setSearchTerm, addAuditLog } = useAppState();
  
  useEffect(() => {
    addAuditLog("VIEW_RAW_DATA", "device", "Membuka tabel data mentah IoT");
  }, [addAuditLog]);
  const [sortField, setSortField] = useState<'timestamp' | 'gas' | 'temperature'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Advanced filters states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'aman' | 'waspada' | 'bahaya'>('all');
  const [minGas, setMinGas] = useState<number | ''>('');
  const [minTemp, setMinTemp] = useState<number | ''>('');

  // Sorting and filtering
  const processedData = useMemo(() => {
    let filtered = sensorData.filter(d => 
      d.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.status && d.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => (d.status || 'aman') === statusFilter);
    }

    if (minGas !== '') {
      filtered = filtered.filter(d => d.gas >= (minGas as number));
    }

    if (minTemp !== '') {
      filtered = filtered.filter(d => d.temperature >= (minTemp as number));
    }

    return filtered.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'timestamp') {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sensorData, searchTerm, sortField, sortOrder, statusFilter, minGas, minTemp]);

  // Paginated chunk
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;

  const handleSort = (field: 'timestamp' | 'gas' | 'temperature') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = ['ID LOG', 'DEVICE ID', 'NILAI GAS (ppm)', 'TEMPERATUR (C)', 'WAKTU', 'STATUS'];
    const rows = processedData.map(r => [
      r.id,
      r.deviceId,
      r.gas,
      r.temperature,
      r.timestamp,
      r.status || 'aman'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `alerasight_raw_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addAuditLog("EXPORT_RAW_DATA", "device", `Mengekspor ${processedData.length} baris data telemetri mentah ke file CSV`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search and control bar */}
      <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="CARI DEVICE ID, LOG ID ATAU STATUS..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold uppercase tracking-wider placeholder-slate-400 transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "flex items-center justify-center gap-2 px-4.5 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-wider italic transition-all",
                showAdvanced ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
              )}
            >
              <Filter className="w-4 h-4" />
              Filter Tingkat Lanjut
            </button>

            <button 
              onClick={exportCSV}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider italic transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Ekspor Data Telemetri
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Filter Status Bahaya</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['all', 'aman', 'waspada', 'bahaya'] as const).map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "py-2 rounded-xl text-[8px] font-black uppercase tracking-wider text-center border transition-all",
                      statusFilter === status 
                        ? "bg-blue-900 border-blue-900 text-white italic font-extrabold" 
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Batas Minimum Gas MQ-2 (ppm)</label>
              <input 
                type="number" 
                placeholder="cth: 150"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold uppercase tracking-wider"
                value={minGas}
                onChange={(e) => {
                  setMinGas(e.target.value === '' ? '' : Number(e.target.value));
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Suhu Minimum SHT20 (°C)</label>
              <input 
                type="number" 
                placeholder="cth: 30"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold uppercase tracking-wider"
                value={minTemp}
                onChange={(e) => {
                  setMinTemp(e.target.value === '' ? '' : Number(e.target.value));
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
                <th className="px-8 py-5">Index Log</th>
                <th className="px-8 py-5">Unit IoT Receptor</th>
                <th 
                  onClick={() => handleSort('gas')}
                  className="px-8 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Gas Value (ppm)</span>
                    <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('temperature')}
                  className="px-8 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Suhu (°C)</span>
                    <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('timestamp')}
                  className="px-8 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Waktu Log</span>
                    <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-8 py-5 font-mono text-[10px] font-bold text-slate-400">{row.id.substring(0, 12)}</td>
                  <td className="px-8 py-5 font-black text-slate-900 italic uppercase">{row.deviceId}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "font-mono font-black italic text-sm",
                      row.gas >= 300 ? "text-red-600" : row.gas >= 180 ? "text-amber-500" : "text-blue-700"
                    )}>
                      {row.gas} ppm
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "font-mono font-black italic text-sm",
                      row.temperature >= 45 ? "text-red-600" : row.temperature >= 35 ? "text-amber-500" : "text-blue-700"
                    )}>
                      {row.temperature}°C
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold italic">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(row.timestamp)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-xl text-[9px] font-black uppercase italic tracking-wider leading-none border shadow-sm inline-block",
                      row.status === 'aman' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      row.status === 'waspada' ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse" : "bg-red-50 text-red-700 border-red-100 animate-pulse"
                    )}>
                      {row.status || 'aman'}
                    </span>
                  </td>
                </tr>
              ))}
              {processedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 font-black italic uppercase tracking-wider">
                    Tidak ada logs database yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginated footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, processedData.length)} dari {processedData.length} baris log</span>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={cn(
                "p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all",
                currentPage === 1 && "opacity-40 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3">Halaman {currentPage} dari {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={cn(
                "p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all",
                currentPage === totalPages && "opacity-40 cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
