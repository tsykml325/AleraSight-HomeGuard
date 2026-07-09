import { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Clock, Shield, Search, Trash2, Filter, Download } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

export function AuditLogs() {
  const { auditLogs, clearAuditLogs, currentUser } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'auth' | 'device' | 'user' | 'settings' | 'alarm' | 'backup' | 'system'>('all');

  if (currentUser?.role === 'Operator') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white border border-slate-200 rounded-[2.5rem] text-center space-y-4 shadow-xl shadow-slate-200/50 mt-12">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="font-black italic text-lg uppercase tracking-tight text-slate-800">Akses Ditolak</h3>
        <p className="text-slate-500 text-xs font-bold leading-relaxed">
          Anda masuk sebagai <span className="text-rose-600 uppercase">Operator</span>. Halaman log audit aktivitas sistem ini hanya dapat diakses oleh Administrator utama.
        </p>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Waktu', 'Pengguna', 'Aksi', 'Kategori', 'Detail', 'Alamat IP'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.timestamp,
      log.userName,
      log.action,
      log.category,
      log.details,
      log.ip
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `alerasight_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="CARI RIWAYAT AUDIT..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold uppercase tracking-wider"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-wider italic transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
          
          <button 
            onClick={clearAuditLogs}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-wider italic transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Bersihkan Log
          </button>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'auth', 'device', 'user', 'settings', 'alarm', 'backup', 'system'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic border transition-all",
              selectedCategory === cat 
                ? "bg-slate-900 border-slate-900 text-white" 
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
            )}
          >
            {cat === 'all' ? 'SEMUA KATEGORI' : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
                <th className="px-8 py-5">Waktu Kejadian</th>
                <th className="px-8 py-5">Pengguna / IP</th>
                <th className="px-8 py-5">Kode Tindakan</th>
                <th className="px-8 py-5">Kategori</th>
                <th className="px-8 py-5">Keterangan Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/40 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold italic">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(log.timestamp)}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div>
                      <p className="font-black text-slate-800 text-xs uppercase italic">{log.userName}</p>
                      <p className="font-mono text-[9px] text-slate-400 font-bold tracking-widest mt-0.5">{log.ip}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs font-black text-blue-900 bg-blue-50 px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border",
                      log.category === 'auth' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                      log.category === 'device' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                      log.category === 'alarm' ? 'bg-red-50 border-red-100 text-red-700 animate-pulse' :
                      log.category === 'backup' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                      'bg-slate-100 border-slate-200 text-slate-600'
                    )}>
                      {log.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed max-w-md">{log.details}</p>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400 font-black italic uppercase tracking-wider">
                    Tidak ada aktivitas audit log yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
