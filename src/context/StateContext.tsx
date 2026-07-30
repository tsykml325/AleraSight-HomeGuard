import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Device, User, SensorData, Notification, AppSettings } from '../types';

// Extend types for Enterprise Platform
export interface AlarmCase {
  id: string;
  deviceId: string;
  deviceName: string;
  locationName: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  gasValue: number;
  tempValue: number;
}

export interface MaintenanceRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'Kalibrasi' | 'Inspeksi' | 'Perbaikan';
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'overdue';
  technician: string;
  notes: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  category: 'auth' | 'device' | 'user' | 'settings' | 'alarm' | 'backup' | 'system';
  details: string;
  ip: string;
}

export interface TelegramLog {
  id: string;
  timestamp: string;
  chatId: string;
  message: string;
  status: 'success' | 'failed' | 'retrying';
  attempt: number;
}

export interface BackupItem {
  id: string;
  filename: string;
  timestamp: string;
  size: string;
  type: 'auto' | 'manual';
}

interface AppState {
  devices: Device[];
  users: User[];
  sensorData: SensorData[];
  notifications: Notification[];
  alarms: AlarmCase[];
  maintenance: MaintenanceRecord[];
  auditLogs: AuditLogEntry[];
  telegramLogs: TelegramLog[];
  backups: BackupItem[];
  settings: AppSettings & {
    mqttHost: string;
    mqttPort: number;
    mqttTopic: string;
    smtpServer: string;
    smtpPort: number;
    smtpUser: string;
    timezone: string;
    language: string;
    telegramChatId: string;
    autoBackup: boolean;
    autoBackupFrequency: 'daily' | 'weekly' | 'monthly';
  };
  // Simulator Controls
  simulatedGas: number;
  simulatedTemp: number;
  simulatedHum: number;
  simulatedBattery: number;
  simulatedSignal: number;
  esp32Online: boolean;
  mqttConnected: boolean;
  telegramBotActive: boolean;
  activeDeviceId: string;
  raspiOnline: boolean;
  visionFireDetected: boolean;

  // App UI Controls
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Actions
  addDevice: (device: Omit<Device, 'status' | 'lastActive'>) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  bulkDeleteDevices: (ids: string[]) => void;
  restartDevice: (id: string) => void;
  calibrateDevice: (id: string) => void;
  otaUpdateDevice: (id: string) => void;

  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string) => void;

  acknowledgeAlarm: (id: string) => void;
  resolveAlarm: (id: string, notes?: string) => void;
  assignAlarm: (id: string, officer: string) => void;
  triggerAlarmManually: (deviceId: string, severity: 'critical' | 'warning') => void;

  addMaintenanceSchedule: (record: Omit<MaintenanceRecord, 'id'>) => void;
  completeMaintenance: (id: string, notes: string) => void;

  addAuditLog: (action: string, category: AuditLogEntry['category'], details: string, actor?: { id: string; name: string }) => void;
  clearAuditLogs: () => void;

  triggerBackup: (type?: 'auto' | 'manual') => void;
  restoreBackup: (id: string) => void;
  deleteBackup: (id: string) => void;

  updateSettings: (newSettings: Partial<AppState['settings']>) => void;

  // Simulator setters
  setSimulatedGas: (val: number) => void;
  setSimulatedTemp: (val: number) => void;
  setSimulatedHum: (val: number) => void;
  setSimulatedBattery: (val: number) => void;
  setSimulatedSignal: (val: number) => void;
  setEsp32Online: (val: boolean) => void;
  setMqttConnected: (val: boolean) => void;
  setTelegramBotActive: (val: boolean) => void;
  setRaspiOnline: (val: boolean) => void;
  setVisionFireDetected: (val: boolean) => void;
  setActiveDeviceId: (val: string) => void;
  triggerMockTelegramMessage: (message: string) => void;

  // Batch triggers
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
}

const StateContext = createContext<AppState | undefined>(undefined);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const currentUserRef = React.useRef<User | null>(null);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // 1. Core Databases
  const [devices, setDevices] = useState<Device[]>([]);

  // ========== Fetch devices dari Supabase (perangkat + lokasi GPS terbaru) ==========
  // Menggantikan fetch ke "http://localhost:3000/api/devices" yang hanya bekerja
  // di komputer lokal saat development, dan selalu gagal setelah di-deploy ke Vercel
  // (karena localhost merujuk ke device milik pengunjung website, bukan server kita).
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    };

    const fetchDevices = async () => {
      try {
        // 1. Ambil daftar perangkat
        const resPerangkat = await fetch(
          `${SUPABASE_URL}/rest/v1/perangkat?select=id,nama_perangkat,lokasi_ruangan`,
          { headers }
        );
        if (!resPerangkat.ok) throw new Error(`Perangkat status ${resPerangkat.status}`);
        const perangkatList = await resPerangkat.json();

        // 2. Ambil deteksi terbaru untuk SEMUA perangkat (cukup ambil beberapa ratus baris terbaru,
        //    lalu ambil satu paling baru per perangkat_id di sisi JS)
        const resDeteksi = await fetch(
          `${SUPABASE_URL}/rest/v1/deteksi_cv?select=perangkat_id,hasil,confidence,latitude,longitude,waktu_deteksi&order=waktu_deteksi.desc&limit=200`,
          { headers }
        );
        if (!resDeteksi.ok) throw new Error(`Deteksi status ${resDeteksi.status}`);
        const deteksiList = await resDeteksi.json();

        // Ambil deteksi TERBARU per perangkat_id
        const latestByDevice: Record<string, any> = {};
        for (const row of deteksiList) {
          if (!latestByDevice[row.perangkat_id]) {
            latestByDevice[row.perangkat_id] = row;
          }
        }

        const mapped: Device[] = perangkatList.map((p: any) => {
          const latest = latestByDevice[p.id];
          const status: 'aman' | 'waspada' | 'bahaya' =
            latest?.hasil === 'API' ? 'bahaya' : 'aman';

          return {
            id: p.id,
            name: p.nama_perangkat,
            location: {
              // Pakai koordinat dari deteksi terbaru (GPS asli).
              // Fallback ke koordinat default kalau belum pernah ada deteksi sama sekali.
              lat: latest?.latitude ?? -6.8922,
              lng: latest?.longitude ?? 107.6181,
            },
            status,
            isActive: true,
            lastActive: latest?.waktu_deteksi || new Date().toISOString(),
          } as Device;
        });

        setDevices(mapped);
      } catch (err) {
        console.error('[SUPABASE] Gagal ambil data devices:', err);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 7000); // refresh tiap 7 detik
    return () => clearInterval(interval);
  }, []);

  // ========== Fetch status CCTV/Raspi terbaru dari Supabase ==========
  // Menggantikan nilai dummy raspiOnline & visionFireDetected dengan data asli
  // dari tabel deteksi_cv. Sebelumnya kedua nilai ini murni dikontrol manual
  // lewat panel "Simulator IoT", sehingga tidak pernah sinkron dengan CCTV asli.
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    };

    const fetchStatusCCTV = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/deteksi_cv?select=hasil,waktu_deteksi&order=waktu_deteksi.desc&limit=1`,
          { headers }
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();

        if (data && data.length > 0) {
          const lastDetection = new Date(data[0].waktu_deteksi);
          const diffMinutes = (Date.now() - lastDetection.getTime()) / 60000;

          // Anggap Raspi offline kalau data terakhir lebih dari 2 menit lalu.
          // Sesuaikan angka ini dengan seberapa sering Raspi normalnya mengirim data.
          setRaspiOnline(diffMinutes < 2);
          setVisionFireDetected(data[0].hasil === 'API');
        } else {
          setRaspiOnline(false);
        }
      } catch (err) {
        console.error('[SUPABASE] Gagal ambil status CCTV:', err);
        setRaspiOnline(false);
      }
    };

    fetchStatusCCTV();
    const interval = setInterval(fetchStatusCCTV, 5000); // polling tiap 5 detik
    return () => clearInterval(interval);
  }, []);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('alerasight_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading users from localStorage:", e);
      }
    }
    return [
      { id: "USR-001", name: "Tasya Kamila", email: "tasyakamila601@gmail.com", role: "Admin" },
      { id: "USR-002", name: "Budi Santoso", email: "budi.santoso@alerasight.id", role: "Operator" },
      { id: "USR-003", name: "Andi Wijaya", email: "andi.wijaya@alerasight.id", role: "Operator" },
      { id: "USR-004", name: "Siti Rahma", email: "siti.rahma@alerasight.id", role: "Operator" },
    ];
  });

  useEffect(() => {
    localStorage.setItem('alerasight_users', JSON.stringify(users));
  }, [users]);

  const [settings, setSettings] = useState<AppState['settings']>({
    telegramToken: "7102948283:AAH_8wL-e8P9Q-zE2g3-v2y8",
    telegramChatId: "-1002049284931",
    gasThreshold: 300,
    tempThreshold: 45,
    updateInterval: 5,
    mqttHost: "broker.emqx.io",
    mqttPort: 1883,
    mqttTopic: "alerasight/homeguard/telemetry",
    smtpServer: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "notifications@alerasight.id",
    timezone: "Asia/Jakarta",
    language: "id",
    autoBackup: true,
    autoBackupFrequency: "weekly"
  });

  // Simulator values
  const [activeDeviceId, setActiveDeviceId] = useState("DEV-001");
  const [simulatedGas, setSimulatedGas] = useState(120);
  const [simulatedTemp, setSimulatedTemp] = useState(28);
  const [simulatedHum, setSimulatedHum] = useState(60);
  const [simulatedBattery, setSimulatedBattery] = useState(98);
  const [simulatedSignal, setSimulatedSignal] = useState(-65); // dBm
  const [esp32Online, setEsp32Online] = useState(true);
  const [mqttConnected, setMqttConnected] = useState(true);
  const [telegramBotActive, setTelegramBotActive] = useState(true);
  const [raspiOnline, setRaspiOnline] = useState(true);
  const [visionFireDetected, setVisionFireDetected] = useState(false);

  // Time-series sensor logs
  const [sensorData, setSensorData] = useState<SensorData[]>(() => {
    // Generate initial logs for past 30 periods
    return Array.from({ length: 30 }, (_, i) => {
      const ts = new Date(Date.now() - (30 - i) * 10000).toISOString();
      return {
        id: `LOG-${100 + i}`,
        deviceId: "DEV-001",
        gas: 100 + Math.floor(Math.random() * 40),
        temperature: 24 + Math.floor(Math.random() * 5),
        status: "aman" as const,
        timestamp: ts
      };
    });
  });

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "NOT-001", deviceId: "DEV-003", message: "Kenaikan gas terdeteksi (245 ppm) di Gedung C", timestamp: new Date(Date.now() - 120000).toISOString(), type: "warning" },
    { id: "NOT-002", deviceId: "DEV-005", message: "Perangkat Gedung E Offline - Gangguan Sinyal", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "info" },
    { id: "NOT-003", deviceId: "DEV-001", message: "Sistem AleraSight Online & Berjalan Lancar", timestamp: new Date(Date.now() - 86400000).toISOString(), type: "info" },
  ]);

  // Alarms
  const [alarms, setAlarms] = useState<AlarmCase[]>([
    { id: "ALM-001", deviceId: "DEV-003", deviceName: "Gedung C - Gudang Kimia", locationName: "Lt. 1 Sektor Barat", timestamp: new Date(Date.now() - 120000).toISOString(), severity: "warning", status: "active", gasValue: 245, tempValue: 33, assignedTo: "Andi Wijaya" },
  ]);

  // Maintenance list
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([
    { id: "MNT-001", deviceId: "DEV-001", deviceName: "Gedung Utama - Ruang Server Lt. 3", type: "Kalibrasi", scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: "scheduled", technician: "Budi Santoso", notes: "Kalibrasi berkala sensor MQ-2" },
    { id: "MNT-002", deviceId: "DEV-003", deviceName: "Gedung C - Gudang Kimia", type: "Inspeksi", scheduledDate: new Date().toISOString(), status: "scheduled", technician: "Andi Wijaya", notes: "Inspeksi sensitivitas sensor gas" },
    { id: "MNT-003", deviceId: "DEV-005", deviceName: "Gedung E - Parkir Basement B2", type: "Perbaikan", scheduledDate: new Date(Date.now() - 86400000).toISOString(), status: "overdue", technician: "Siti Rahma", notes: "Ganti baterai cadangan & modem antena" }
  ]);

  // Telegram delivery log
  const [telegramLogs, setTelegramLogs] = useState<TelegramLog[]>([
    { id: "TEL-001", timestamp: new Date(Date.now() - 110000).toISOString(), chatId: "-1002049284931", message: "⚠️ [AleraSight Warning] Gedung C - Gudang Kimia mendeteksi Gas meningkat (245 ppm). Suhu 33°C. Status: WASPADA.", status: "success", attempt: 1 },
    { id: "TEL-002", timestamp: new Date(Date.now() - 7200000).toISOString(), chatId: "-1002049284931", message: "ℹ️ [AleraSight Info] Gedung E - Parkir Basement B2 Terputus.", status: "success", attempt: 1 },
  ]);

  // Backups
  const [backups, setBackups] = useState<BackupItem[]>([
    { id: "BKP-001", filename: "alerasight_backup_auto_20260708.sql", timestamp: new Date(Date.now() - 86400000).toISOString(), size: "1.24 MB", type: "auto" },
    { id: "BKP-002", filename: "alerasight_backup_manual_20260705.sql", timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), size: "1.18 MB", type: "manual" },
  ]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    { id: "AUD-001", timestamp: new Date().toISOString(), userId: "USR-001", userName: "Tasya Kamila", action: "LOGIN", category: "auth", details: "Berhasil login ke sistem melalui web portal", ip: "192.168.1.10" },
    { id: "AUD-002", timestamp: new Date(Date.now() - 120000).toISOString(), userId: "SYS", userName: "Sistem IoT", action: "ALARM_TRIGGER", category: "alarm", details: "Gas level Gedung C melebihi 200 ppm (Waspada)", ip: "127.0.0.1" },
  ]);

  // Audit Logger Helper
  const addAuditLog = useCallback((action: string, category: AuditLogEntry['category'], details: string, actor?: { id: string; name: string }) => {
    const activeUser = actor || currentUserRef.current;
    const newLog: AuditLogEntry = {
      id: `AUD-${Math.floor(Math.random() * 100000)}`,
      timestamp: new Date().toISOString(),
      userId: activeUser ? activeUser.id : "SYS",
      userName: activeUser ? activeUser.name : "Sistem IoT",
      action,
      category,
      details,
      ip: "192.168.1." + Math.floor(Math.random() * 254 + 1)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  // 2. Real-time Simulator Tick Link
  useEffect(() => {
    if (!esp32Online) return;

    const interval = setInterval(() => {
      // Simulate small fluctuations
      const fluxGas = Math.floor(Math.random() * 6) - 3;
      const fluxTemp = Math.floor(Math.random() * 2) - 1;
      const fluxHum = Math.floor(Math.random() * 4) - 2;

      setSimulatedGas(prev => {
        const newVal = Math.max(20, prev + fluxGas);
        return newVal;
      });
      setSimulatedTemp(prev => {
        const newVal = Math.max(15, prev + fluxTemp);
        return newVal;
      });
      setSimulatedHum(prev => {
        const newVal = Math.min(100, Math.max(5, prev + fluxHum));
        return newVal;
      });

      // Update active device list details
      setDevices(prev => prev.map(d => {
        if (d.id === activeDeviceId) {
          // Determine status based on thresholds
          let status: 'aman' | 'waspada' | 'bahaya' = 'aman';
          if (simulatedGas >= settings.gasThreshold || simulatedTemp >= settings.tempThreshold) {
            status = 'bahaya';
          } else if (simulatedGas >= (settings.gasThreshold * 0.6) || simulatedTemp >= (settings.tempThreshold * 0.8)) {
            status = 'waspada';
          }

          // If status changes, trigger alarms/notifications
          if (status !== d.status) {
            // Trigger side effects
            if (status !== 'aman') {
              triggerAlarmManually(d.id, status === 'bahaya' ? 'critical' : 'warning');
            }
          }

          return {
            ...d,
            status,
            lastActive: new Date().toISOString()
          };
        }
        return d;
      }));

    }, 3500);

    return () => clearInterval(interval);
  }, [esp32Online, activeDeviceId, simulatedGas, simulatedTemp, simulatedHum, settings.gasThreshold, settings.tempThreshold]);

  // Feed simulated parameters into telemetry charts
  useEffect(() => {
    const timer = setInterval(() => {
      if (!esp32Online) return;

      const newRecord: SensorData = {
        id: `LOG-${Date.now()}`,
        deviceId: activeDeviceId,
        gas: simulatedGas,
        temperature: simulatedTemp,
        timestamp: new Date().toISOString(),
        status: simulatedGas >= settings.gasThreshold || simulatedTemp >= settings.tempThreshold ? "bahaya" :
                simulatedGas >= (settings.gasThreshold * 0.6) || simulatedTemp >= (settings.tempThreshold * 0.8) ? "waspada" : "aman"
      };

      setSensorData(prev => {
        const updated = [...prev, newRecord];
        if (updated.length > 50) updated.shift(); // keep 50 max
        return updated;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [simulatedGas, simulatedTemp, activeDeviceId, esp32Online]);

  // Triggering custom mock telegram dispatch
  const triggerMockTelegramMessage = useCallback((message: string) => {
    if (!telegramBotActive) return;
    const newLog: TelegramLog = {
      id: `TEL-${Math.floor(Math.random() * 100000)}`,
      timestamp: new Date().toISOString(),
      chatId: settings.telegramChatId,
      message,
      status: "success",
      attempt: 1
    };
    setTelegramLogs(prev => [newLog, ...prev]);
  }, [telegramBotActive, settings.telegramChatId]);

  // Alarms and alerts triggers
  const triggerAlarmManually = useCallback((deviceId: string, severity: 'critical' | 'warning') => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    // Check if there is already an active alarm for this device to prevent spam
    const existing = alarms.find(a => a.deviceId === deviceId && a.status !== 'resolved');
    if (existing) return;

    const alarmId = `ALM-${Math.floor(Math.random() * 10000)}`;
    const newAlarm: AlarmCase = {
      id: alarmId,
      deviceId,
      deviceName: device.name,
      locationName: "Sektor Pemantauan Utama",
      timestamp: new Date().toISOString(),
      severity,
      status: "active",
      gasValue: simulatedGas,
      tempValue: simulatedTemp
    };

    setAlarms(prev => [newAlarm, ...prev]);

    // Add alert notification
    const newNotif: Notification = {
      id: `NOT-${Math.floor(Math.random() * 10000)}`,
      deviceId,
      message: `🚨 ALARM DIPICU: ${device.name} mendeteksi kondisi ${severity === 'critical' ? 'BAHAYA' : 'WASPADA'}.`,
      timestamp: new Date().toISOString(),
      type: severity === 'critical' ? 'alert' : 'warning'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Send Telegram
    triggerMockTelegramMessage(`🚨 [AleraSight HomeGuard] \n\nPerangkat: ${device.name} (${deviceId}) \nStatus: ${severity.toUpperCase()} \nGas: ${simulatedGas} ppm \nSuhu: ${simulatedTemp}°C \nWaktu: ${new Date().toLocaleTimeString()} \n\nTindakan segera diperlukan!`);

    // Audit log
    addAuditLog("ALARM_TRIGGERED", "alarm", `Alarm dipicu otomatis pada perangkat ${device.name} (${severity})`);

  }, [devices, alarms, simulatedGas, simulatedTemp, triggerMockTelegramMessage, addAuditLog]);

  // CRUD & Operations Implementations

  // 1. Devices Actions
  const addDevice = useCallback((devInput: Omit<Device, 'status' | 'lastActive'>) => {
    const dev: Device = {
      ...devInput,
      status: 'aman',
      lastActive: new Date().toISOString()
    };
    setDevices(prev => [...prev, dev]);
    addAuditLog("CREATE_DEVICE", "device", `Berhasil mendaftarkan perangkat baru: ${dev.name} (${dev.id})`);
  }, [addAuditLog]);

  const updateDevice = useCallback((id: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    addAuditLog("UPDATE_DEVICE", "device", `Memperbarui konfigurasi perangkat ID: ${id}`);
  }, [addAuditLog]);

  const deleteDevice = useCallback((id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    addAuditLog("DELETE_DEVICE", "device", `Menghapus perangkat dari sistem ID: ${id}`);
  }, [addAuditLog]);

  const bulkDeleteDevices = useCallback((ids: string[]) => {
    setDevices(prev => prev.filter(d => !ids.includes(d.id)));
    addAuditLog("BULK_DELETE_DEVICES", "device", `Menghapus massal ${ids.length} perangkat`);
  }, [addAuditLog]);

  const restartDevice = useCallback((id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, lastActive: new Date().toISOString() } : d));
    addAuditLog("RESTART_DEVICE", "device", `Mengirim perintah reboot ke perangkat ID: ${id}`);
  }, [addAuditLog]);

  const calibrateDevice = useCallback((id: string) => {
    addAuditLog("CALIBRATE_DEVICE", "device", `Melakukan kalibrasi sensor gas & suhu jarak jauh pada perangkat ID: ${id}`);
  }, [addAuditLog]);

  const otaUpdateDevice = useCallback((id: string) => {
    addAuditLog("OTA_UPDATE", "device", `Memulai instalasi pembaruan firmware (FOTA v2.4.1) pada perangkat ID: ${id}`);
  }, [addAuditLog]);

  // 2. Users Actions
  const addUser = useCallback((userInput: Omit<User, 'id'>) => {
    const usr: User = {
      ...userInput,
      id: `USR-${Math.floor(Math.random() * 1000)}`
    };
    setUsers(prev => [...prev, usr]);
    addAuditLog("CREATE_USER", "user", `Mendaftarkan pengguna baru: ${usr.name} (${usr.role})`);
  }, [addAuditLog]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    addAuditLog("UPDATE_USER", "user", `Memperbarui detail profil pengguna ID: ${id}`);
  }, [addAuditLog]);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog("DELETE_USER", "user", `Menghapus akses pengguna ID: ${id}`);
  }, [addAuditLog]);

  const resetUserPassword = useCallback((id: string) => {
    addAuditLog("RESET_PASSWORD", "user", `Mengirim link reset sandi aman untuk pengguna ID: ${id}`);
  }, [addAuditLog]);

  // 3. Alarms actions
  const acknowledgeAlarm = useCallback((id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
    addAuditLog("ALARM_ACKNOWLEDGE", "alarm", `Petugas menyetujui / mengkonfirmasi penanganan alarm ID: ${id}`);
  }, [addAuditLog]);

  const resolveAlarm = useCallback((id: string, notes?: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    addAuditLog("ALARM_RESOLVED", "alarm", `Alarm dinyatakan selesai diatasi: ID ${id}. Catatan: ${notes || 'Kondisi kembali normal'}`);
  }, [addAuditLog]);

  const assignAlarm = useCallback((id: string, officer: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, assignedTo: officer } : a));
    addAuditLog("ALARM_ASSIGN", "alarm", `Menugaskan petugas "${officer}" untuk meninjau alarm ID: ${id}`);
  }, [addAuditLog]);

  // 4. Maintenance Actions
  const addMaintenanceSchedule = useCallback((recordInput: Omit<MaintenanceRecord, 'id'>) => {
    const record: MaintenanceRecord = {
      ...recordInput,
      id: `MNT-${Math.floor(Math.random() * 10000)}`
    };
    setMaintenance(prev => [record, ...prev]);
    addAuditLog("CREATE_MAINTENANCE", "system", `Menjadwalkan ${record.type} perangkat ${record.deviceName}`);
  }, [addAuditLog]);

  const completeMaintenance = useCallback((id: string, notes: string) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: 'completed', notes } : m));
    addAuditLog("COMPLETE_MAINTENANCE", "system", `Menyelesaikan tiket pemeliharaan ID: ${id}`);
  }, [addAuditLog]);

  // 5. Backups Actions
  const triggerBackup = useCallback((type: 'auto' | 'manual' = 'manual') => {
    const filename = `alerasight_backup_${type}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${Math.floor(Math.random() * 1000)}.sql`;
    const newBkp: BackupItem = {
      id: `BKP-${Math.floor(Math.random() * 10000)}`,
      filename,
      timestamp: new Date().toISOString(),
      size: (Math.random() * 0.2 + 1.1).toFixed(2) + " MB",
      type
    };
    setBackups(prev => [newBkp, ...prev]);
    addAuditLog("DATABASE_BACKUP", "backup", `Sistem melakukan backup basis data PostgreSQL: ${filename}`);
  }, [addAuditLog]);

  const restoreBackup = useCallback((id: string) => {
    const bkp = backups.find(b => b.id === id);
    if (!bkp) return;
    addAuditLog("DATABASE_RESTORE", "backup", `Memulihkan basis data ke titik waktu cadangan: ${bkp.filename}`);
  }, [backups, addAuditLog]);

  const deleteBackup = useCallback((id: string) => {
    setBackups(prev => prev.filter(b => b.id !== id));
    addAuditLog("DATABASE_BACKUP_DELETE", "backup", `Menghapus file cadangan basis data ID: ${id}`);
  }, [addAuditLog]);

  // 6. Settings Updates
  const updateSettings = useCallback((newSettings: Partial<AppState['settings']>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog("SETTINGS_UPDATE", "settings", `Memperbarui preferensi sistem & ambang batas (thresholds)`);
  }, [addAuditLog]);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
    addAuditLog("CLEAR_AUDIT_LOGS", "settings", `Membersihkan seluruh riwayat audit log sistem`);
  }, [addAuditLog]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications([]);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <StateContext.Provider value={{
      devices, users, sensorData, notifications, alarms, maintenance, auditLogs, telegramLogs, backups, settings,
      simulatedGas, simulatedTemp, simulatedHum, simulatedBattery, simulatedSignal, esp32Online, mqttConnected, telegramBotActive, activeDeviceId,
      raspiOnline, visionFireDetected,
      currentPage, setCurrentPage, isDarkMode, setIsDarkMode, searchTerm, setSearchTerm, currentUser, setCurrentUser,
      addDevice, updateDevice, deleteDevice, bulkDeleteDevices, restartDevice, calibrateDevice, otaUpdateDevice,
      addUser, updateUser, deleteUser, resetUserPassword,
      acknowledgeAlarm, resolveAlarm, assignAlarm, triggerAlarmManually,
      addMaintenanceSchedule, completeMaintenance,
      addAuditLog, clearAuditLogs,
      triggerBackup, restoreBackup, deleteBackup,
      updateSettings,
      setSimulatedGas, setSimulatedTemp, setSimulatedHum, setSimulatedBattery, setSimulatedSignal,
      setEsp32Online, setMqttConnected, setTelegramBotActive, setRaspiOnline, setVisionFireDetected, setActiveDeviceId, triggerMockTelegramMessage,
      markAllNotificationsRead, deleteNotification
    }}>
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) throw new Error("useAppState must be used within StateProvider");
  return context;
}
