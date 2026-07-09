import { useState, useEffect, FormEvent } from 'react';
import { 
  LayoutDashboard, Cpu, Users, Map as MapIcon, Database, FileText, 
  Settings as SettingsIcon, Bell, Menu, X, LogOut, Flame, ShieldCheck, 
  AlertTriangle, ShieldAlert, Sparkles, Sliders, MessageSquare, Terminal, RefreshCw, Command, CloudLightning,
  Activity, Calendar, BarChart3, Wifi, Search, Clock
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from './context/StateContext';

// Import newly created and updated components
import { Dashboard } from './components/Dashboard';
import { DeviceManager } from './components/DeviceManager';
import { UserManager } from './components/UserManager';
import { MapView } from './components/MapView';
import { RawData } from './components/RawData';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { AlarmManagement } from './components/AlarmManagement';
import { Maintenance } from './components/Maintenance';
import { Analytics } from './components/Analytics';
import { IoTMonitoring } from './components/IoTMonitoring';
import { TelegramMonitoring } from './components/TelegramMonitoring';
import { AuditLogs } from './components/AuditLogs';
import { BackupRestore } from './components/BackupRestore';
import { AIPrediction } from './components/AIPrediction';
import { CommandPalette } from './components/CommandPalette';
import { IoTSimulator } from './components/IoTSimulator';
import { cn } from './lib/utils';
import { AleraSightLogo, LogoSymbol } from './components/Logo';

export default function App() {
  const { 
    currentPage, setCurrentPage, notifications, markAllNotificationsRead, deleteNotification,
    simulatedGas, simulatedTemp, alarms, devices, users, calibrateDevice, triggerAlarmManually, triggerBackup, mqttConnected, setMqttConnected,
    searchTerm, setSearchTerm, addUser, currentUser, setCurrentUser, addAuditLog
  } = useAppState();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Custom panels states
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Search state for header
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [isHeaderSearchFocused, setIsHeaderSearchFocused] = useState(false);

  const [headerTime, setHeaderTime] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setHeaderTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Route protection for Operator role
  useEffect(() => {
    if (currentUser?.role === 'Operator') {
      const adminOnlyPages = ['settings', 'backup', 'audit'];
      if (adminOnlyPages.includes(currentPage)) {
        setCurrentPage('dashboard');
      }
    }
  }, [currentPage, currentUser, setCurrentPage]);

  // Keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('feature-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isLoggedIn) {
    return (
      <Login 
        users={users}
        onRegister={addUser}
        onLogin={(user) => {
          setIsLoggedIn(true);
          setCurrentUser(user);
          addAuditLog("LOGIN", "auth", `Pengguna ${user.name} (${user.role}) berhasil masuk ke sistem`, user);
        }} 
      />
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'UTAMA' },
    { id: 'devices', label: 'Perangkat IoT', icon: Cpu, category: 'UTAMA' },
    { id: 'map', label: 'Peta GIS', icon: MapIcon, category: 'UTAMA' },
    
    { id: 'alarms', label: 'Alarm & Insiden', icon: Flame, category: 'OPERASIONAL', badge: alarms.filter(a => a.status !== 'resolved').length },
    { id: 'maintenance', label: 'Pemeliharaan', icon: Calendar, category: 'OPERASIONAL' },
    { id: 'analytics', label: 'Analisis Tren', icon: BarChart3, category: 'OPERASIONAL' },
    { id: 'iot', label: 'Diagnostik MCU', icon: Terminal, category: 'OPERASIONAL' },
    
    { id: 'prediction', label: 'AI Fire Risk', icon: Sparkles, category: 'INTELLIGENCE' },
    { id: 'telegram', label: 'Notifikasi Bot', icon: MessageSquare, category: 'INTELLIGENCE' },
    
    { id: 'raw', label: 'Raw Data Logs', icon: Database, category: 'ADMINISTRASI' },
    { id: 'reports', label: 'Cetak Laporan', icon: FileText, category: 'ADMINISTRASI' },
    { id: 'users', label: 'Kelola Anggota', icon: Users, category: 'ADMINISTRASI' },
    { id: 'audit', label: 'Audit Trail', icon: ShieldAlert, category: 'ADMINISTRASI' },
    { id: 'backup', label: 'Backup Restore', icon: CloudLightning, category: 'ADMINISTRASI' },
    { id: 'settings', label: 'Parameter SHT20', icon: SettingsIcon, category: 'ADMINISTRASI' },
  ];

  const categories = ['UTAMA', 'OPERASIONAL', 'INTELLIGENCE', 'ADMINISTRASI'];

  const unreadNotifCount = notifications.length;

  // Filter navigation items
  const matchedNavs = headerSearchQuery.trim() !== ''
    ? navItems.filter(item => 
        item.label.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(headerSearchQuery.toLowerCase())
      )
    : navItems.slice(0, 5); // Default recommendations when empty

  // Filter devices
  const matchedDevices = headerSearchQuery.trim() !== '' 
    ? devices.filter(d => 
        d.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(headerSearchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  // Filter users
  const matchedUsers = headerSearchQuery.trim() !== '' 
    ? users.filter(u => 
        u.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(headerSearchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const handleHeaderSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!headerSearchQuery.trim()) return;

    // 1. Try to match navigation pages
    const exactNavMatch = navItems.find(
      item => item.label.toLowerCase() === headerSearchQuery.toLowerCase()
    );
    const partialNavMatch = navItems.find(
      item => item.label.toLowerCase().includes(headerSearchQuery.toLowerCase())
    );
    const navMatch = exactNavMatch || partialNavMatch;

    if (navMatch) {
      setCurrentPage(navMatch.id);
      setHeaderSearchQuery('');
      setIsHeaderSearchFocused(false);
      return;
    }

    // 2. Try to match devices
    const deviceMatch = devices.find(
      d => d.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) || d.id.toLowerCase().includes(headerSearchQuery.toLowerCase())
    );
    if (deviceMatch) {
      setCurrentPage('devices');
      setSearchTerm(deviceMatch.id);
      setHeaderSearchQuery('');
      setIsHeaderSearchFocused(false);
      return;
    }

    // 3. Try to match users
    const userMatch = users.find(
      u => u.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(headerSearchQuery.toLowerCase())
    );
    if (userMatch) {
      setCurrentPage('users');
      setSearchTerm(userMatch.name);
      setHeaderSearchQuery('');
      setIsHeaderSearchFocused(false);
      return;
    }

    // 4. Default: set global search term and go to devices
    setSearchTerm(headerSearchQuery);
    setCurrentPage('devices');
    setHeaderSearchQuery('');
    setIsHeaderSearchFocused(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans antialiased text-slate-800">
      
      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Floating IoT Simulator panel drawer */}
      <IoTSimulator isOpen={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)} />

      {/* Sidebar navigation */}
      <aside 
        className={cn(
          "bg-slate-900 border-r border-slate-800 text-white transition-all duration-300 z-40 fixed lg:relative h-screen flex flex-col shrink-0 shadow-2xl",
          isSidebarOpen ? "w-72" : "w-20",
          !isSidebarOpen && isMobile ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-4 shrink-0 border-b border-slate-800 bg-slate-950/40">
          {isSidebarOpen ? (
            <AleraSightLogo showTagline={true} size={36} isDarkTheme={true} compactNav={true} className="w-full justify-start pl-1" />
          ) : (
            <LogoSymbol size={40} className="mx-auto text-blue-500 animate-pulse" />
          )}
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {categories.map(cat => {
            const items = navItems.filter(item => {
              if (item.category !== cat) return false;
              if (currentUser?.role === 'Operator') {
                const adminOnlyPages = ['settings', 'backup', 'audit'];
                if (adminOnlyPages.includes(item.id)) return false;
              }
              return true;
            });
            return (
              <div key={cat} className="space-y-1">
                {isSidebarOpen && (
                  <p className="text-[9px] font-black tracking-[0.25em] text-slate-500 px-4 uppercase mb-2 mt-3">{cat}</p>
                )}
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group relative font-bold text-xs uppercase tracking-wider",
                      currentPage === item.id 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-extrabold italic" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                        currentPage === item.id ? "text-white" : "text-blue-500"
                      )} />
                      {isSidebarOpen && <span>{item.label}</span>}
                    </div>

                    {/* Badge alert count */}
                    {isSidebarOpen && item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-md animate-bounce">
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip on collapsed sidebar */}
                    {!isSidebarOpen && (
                      <div className="absolute left-[calc(100%+12px)] px-3 py-2 bg-slate-950 text-white text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 uppercase tracking-widest shadow-xl border border-slate-800">
                        {item.label} {item.badge !== undefined && item.badge > 0 ? `(${item.badge})` : ''}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {/* User profile logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <button 
            onClick={() => {
              if (currentUser) {
                addAuditLog("LOGOUT", "auth", `Pengguna ${currentUser.name} (${currentUser.role}) keluar dari sistem`, currentUser);
              }
              setIsLoggedIn(false);
              setCurrentUser(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all group font-bold text-xs uppercase tracking-wider"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 group-hover:rotate-12 transition-transform text-red-500" />
            {isSidebarOpen && <span>Keluar Portal</span>}
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 shrink-0 px-4 sm:px-6 md:px-8 flex justify-between items-center relative z-30 shadow-sm box-border w-full overflow-hidden">
          {/* Left Group */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-blue-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex flex-col text-left justify-center">
              <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
                <span>ALERASIGHT</span>
                <span className="text-[7px]">/</span>
                <span>{navItems.find(n => n.id === currentPage)?.category || 'SISTEM'}</span>
              </div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-1.5 mt-1.5 leading-none">
                <span>{navItems.find(n => n.id === currentPage)?.label}</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              </h1>
            </div>
          </div>

          {/* Middle Group: Kolom Pencarian Fitur Inline */}
          <div className="relative flex-1 max-w-[140px] xs:max-w-[200px] sm:max-w-[260px] md:max-w-[320px] min-w-[80px] mx-2 sm:mx-4 md:mx-6 shrink">
              <form onSubmit={handleHeaderSearchSubmit} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="feature-search-input"
                  type="text"
                  placeholder="CARI FITUR..."
                  className="w-full pl-10 pr-4 sm:pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-wider text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm box-border"
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  onFocus={() => setIsHeaderSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsHeaderSearchFocused(false), 200);
                  }}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none">
                  <kbd className="bg-white border border-slate-200 text-[7px] font-bold px-1.5 py-0.5 rounded shadow-sm text-slate-400 font-mono">⌘K</kbd>
                </div>
              </form>

              {/* Dropdown Hasil Pencarian */}
              <AnimatePresence>
                {isHeaderSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
                  >
                    <div className="max-h-[26rem] overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                      {/* Navigation/Features */}
                      {matchedNavs.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3.5 mb-1.5 italic">
                            {headerSearchQuery.trim() !== '' ? 'Hasil Sistem Navigasi' : 'Rekomendasi Menu'}
                          </p>
                          <div className="space-y-0.5">
                            {matchedNavs.map((item) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onMouseDown={() => {
                                    setCurrentPage(item.id);
                                    setHeaderSearchQuery('');
                                    setIsHeaderSearchFocused(false);
                                  }}
                                  className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-all text-left group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-slate-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                      <h4 className="font-extrabold text-slate-900 text-[11px] uppercase italic tracking-tight">{item.label}</h4>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.category}</p>
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Buka →</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Devices Matched */}
                      {matchedDevices.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 px-3.5 mb-1.5 italic">Perangkat Terkait</p>
                          <div className="space-y-0.5">
                            {matchedDevices.map((dev) => (
                              <button
                                key={dev.id}
                                type="button"
                                onMouseDown={() => {
                                  setCurrentPage('devices');
                                  setSearchTerm(dev.id);
                                  setHeaderSearchQuery('');
                                  setIsHeaderSearchFocused(false);
                                }}
                                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-all text-left group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[9px] border",
                                    dev.status === 'aman' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                    dev.status === 'waspada' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-red-50 border-red-100 text-red-600 animate-pulse'
                                  )}>
                                    {dev.id.substring(0, 5)}
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-slate-900 text-[11px] uppercase italic tracking-tight leading-none">{dev.name}</h4>
                                    <span className="text-[8px] text-slate-400 font-mono font-bold">{dev.id}</span>
                                  </div>
                                </div>
                                <span className={cn(
                                  "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border leading-none",
                                  dev.status === 'aman' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                  dev.status === 'waspada' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                                )}>
                                  {dev.status}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Users Matched */}
                      {matchedUsers.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 px-3.5 mb-1.5 italic">Pengguna Terkait</p>
                          <div className="space-y-0.5">
                            {matchedUsers.map((usr) => (
                              <button
                                key={usr.id}
                                type="button"
                                onMouseDown={() => {
                                  setCurrentPage('users');
                                  setSearchTerm(usr.name);
                                  setHeaderSearchQuery('');
                                  setIsHeaderSearchFocused(false);
                                }}
                                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-all text-left group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black italic text-[10px] border border-blue-100">
                                    {usr.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-slate-900 text-[11px] uppercase italic tracking-tight leading-none">{usr.name}</h4>
                                    <span className="text-[8px] text-slate-400 font-mono font-bold block mt-0.5">{usr.email}</span>
                                  </div>
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 leading-none">
                                  {usr.role}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {matchedNavs.length === 0 && matchedDevices.length === 0 && matchedUsers.length === 0 && (
                        <div className="text-center py-6 px-4">
                          <p className="text-slate-400 text-[9px] font-black italic tracking-widest uppercase">Pencarian tidak ditemukan</p>
                          <p className="text-[8px] text-slate-500 mt-1 font-semibold">Coba gunakan kata kunci lain.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Group */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-5 shrink-0 pr-1 sm:pr-2">
              {/* Notification drop */}
              <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-blue-900 group"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white ring-4 ring-red-100 animate-pulse"></span>
                )}
              </button>

              {/* Real Notif feed overlay */}
              <AnimatePresence>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl p-4 z-50 text-xs font-semibold">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                      <span className="font-black uppercase text-[10px] tracking-wider text-slate-900">Notifikasi Masuk ({unreadNotifCount})</span>
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-[9px] font-black text-blue-600 hover:underline uppercase"
                      >
                        Mute Semua
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 relative group flex gap-3">
                          <span className={cn(
                            "w-2 h-2 rounded-full shrink-0 mt-1.5",
                            notif.type === 'alert' ? 'bg-red-600' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-600'
                          )}></span>
                          <div>
                            <p className="text-[10px] font-extrabold text-slate-800 leading-tight uppercase italic">{notif.message}</p>
                            <span className="text-[8px] text-slate-400 font-bold block mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <button 
                            onClick={() => deleteNotification(notif.id)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="text-center py-8 text-slate-400 font-black italic uppercase tracking-wider text-[9px]">Aman. Tidak ada anomali baru.</p>
                      )}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Clock inside Navbar */}
            <div className="hidden xl:flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 px-4 py-2.5 rounded-2xl text-slate-600 font-extrabold font-mono text-[10px] uppercase tracking-wider leading-none shadow-sm shrink-0">
              <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>{headerTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden xl:block"></div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-2xl transition-all border border-transparent hover:border-slate-100"
              >
                <div className="text-right hidden md:block leading-none">
                  <p className="text-xs font-black text-slate-900 tracking-tight uppercase italic leading-none">{currentUser?.name || 'Tasya Kamila'}</p>
                  <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-1 leading-none">{currentUser?.role || 'Senior Supervisor'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black italic text-sm shadow-sm shrink-0">
                  TK
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    {/* Invisible backdrop to close dropdown on outside click */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-5 z-50 text-xs font-semibold text-left"
                    >
                      {/* User Info Header */}
                      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-black italic shadow-md shadow-blue-950/10 shrink-0">
                          TK
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 text-sm uppercase italic tracking-tight">{currentUser?.name || 'Tasya Kamila'}</h4>
                          <p className="text-[10px] text-slate-400 font-bold block mt-0.5">{currentUser?.email || 'tasyakamila601@gmail.com'}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[8px] font-black uppercase tracking-wider rounded-md leading-none">
                            {currentUser?.role || 'Admin'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions Section */}
                      <div className="py-4 space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic mb-1">AKSI CEPAT SISTEM</p>
                        
                        <button 
                          type="button"
                          onClick={() => {
                            calibrateDevice("DEV-001");
                            alert("📡 Perintah Kalibrasi Sensor MQ-2 dikirim secara realtime ke mikrokontroler!");
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all text-left"
                        >
                          <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                            <Sliders className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase italic tracking-tight text-slate-900">Kalibrasi Sensor</p>
                            <span className="text-[8px] font-bold text-slate-400">Kalibrasi MQ-2 via MQTT</span>
                          </div>
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            triggerAlarmManually("DEV-001", "warning");
                            alert("🚨 Manual Warning Alarm dipicu untuk Sektor Utama!");
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all text-left"
                        >
                          <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
                            <Flame className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase italic tracking-tight text-slate-900">Picu Test Alarm</p>
                            <span className="text-[8px] font-bold text-slate-400">Simulasi Insiden Darurat</span>
                          </div>
                        </button>

                        {currentUser?.role !== 'Operator' && (
                          <button 
                            type="button"
                            onClick={() => {
                              triggerBackup("manual");
                              alert("💾 Backup PostgreSQL database berhasil diarsipkan!");
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all text-left"
                          >
                            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                              <Database className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase italic tracking-tight text-slate-900">Backup DB Postgres</p>
                              <span className="text-[8px] font-bold text-slate-400">Arsipkan Data ke SQL</span>
                            </div>
                          </button>
                        )}

                        <button 
                          type="button"
                          onClick={() => {
                            setMqttConnected(!mqttConnected);
                            alert(`📡 Status konektivitas broker MQTT dialihkan ke: ${!mqttConnected ? 'ONLINE' : 'OFFLINE'}`);
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all text-left"
                        >
                          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                            <RefreshCw className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase italic tracking-tight text-slate-900">Koneksi Broker MQTT</p>
                            <span className="text-[8px] font-bold text-slate-400">{mqttConnected ? 'Putuskan Broker' : 'Hubungkan Broker'}</span>
                          </div>
                        </button>
                      </div>

                      {/* Divider and Logout */}
                      <div className="pt-3 border-t border-slate-100">
                        <button 
                          type="button"
                          onClick={() => {
                            if (currentUser) {
                              addAuditLog("LOGOUT", "auth", `Pengguna ${currentUser.name} (${currentUser.role}) keluar dari sistem`, currentUser);
                            }
                            setIsProfileOpen(false);
                            setIsLoggedIn(false);
                            setCurrentUser(null);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black uppercase italic tracking-widest rounded-xl transition-all"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Keluar Portal
                        </button>
                      </div>

                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 relative scrollbar-thin scrollbar-thumb-slate-200">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "circOut" }}
              >
                {currentPage === 'dashboard' && <Dashboard />}
                {currentPage === 'devices' && <DeviceManager />}
                {currentPage === 'users' && <UserManager currentUser={currentUser} />}
                {currentPage === 'map' && <MapView />}
                {currentPage === 'raw' && <RawData />}
                {currentPage === 'reports' && <Reports />}
                {currentPage === 'settings' && <Settings />}
                
                {/* Advanced operational templates */}
                {currentPage === 'alarms' && <AlarmManagement />}
                {currentPage === 'maintenance' && <Maintenance />}
                {currentPage === 'analytics' && <Analytics />}
                {currentPage === 'iot' && <IoTMonitoring />}
                {currentPage === 'telegram' && <TelegramMonitoring />}
                {currentPage === 'audit' && <AuditLogs />}
                {currentPage === 'backup' && <BackupRestore />}
                {currentPage === 'prediction' && <AIPrediction />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Floating IoT Emulator Activator Trigger */}
        <button 
          onClick={() => setIsSimulatorOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-2xl transition-all border border-white/10 flex items-center gap-2.5 group hover:scale-105 active:scale-95"
          title="Open IoT Simulator Panel"
        >
          <Sliders className="w-5 h-5 text-blue-400 animate-spin-slow group-hover:rotate-45" />
          <span className="text-[10px] font-black uppercase tracking-wider italic">Simulator IoT</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </button>

      </main>
    </div>
  );
}
