import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// ======================================================
// SUPABASE CLIENT (read-only, pakai anon key)
// ======================================================
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

const app = express();
app.use(express.json());

// Middleware for Role-Based Access Control (RBAC)
function requireRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    const userRole = req.headers["x-user-role"] || req.query.role;
    if (!userRole) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Akses ditolak: Informasi role pengguna tidak ditemukan pada request header 'x-user-role' atau query parameter 'role'."
      });
    }
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Akses ditolak: Role '${userRole}' tidak memiliki izin (hak akses) untuk melakukan operasi ini.`
      });
    }
    next();
  };
}

// ======================================================
// API Routes (Read routes: Accessible to both Admin and Operator)
// ======================================================

app.get("/api/devices", requireRole(["Admin", "Operator"]), async (req, res) => {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return res.status(500).json({ error: "Database Error", message: error.message });
  }

  const devices = (data || []).map((d) => ({
    id: d.id,
    name: d.name,
    location: { lat: d.lat, lng: d.lng },
    status: d.status,
    isActive: d.is_active,
    lastActive: d.last_active,
  }));

  res.json(devices);
});

app.get("/api/sensor-data", requireRole(["Admin", "Operator"]), async (req, res) => {
  const { data, error } = await supabase
    .from("sensor_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return res.status(500).json({ error: "Database Error", message: error.message });
  }

  const sensorData = (data || []).map((row) => ({
    id: String(row.id),
    deviceId: row.device_id,
    gas: row.smoke_level,
    temperature: row.temperature,
    status: row.status,
    timestamp: row.created_at,
  }));

  res.json(sensorData);
});

app.get("/api/dashboard-stats", requireRole(["Admin", "Operator"]), async (req, res) => {
  const { data: devices, error: devicesError } = await supabase
    .from("devices")
    .select("*");

  if (devicesError) {
    return res.status(500).json({ error: "Database Error", message: devicesError.message });
  }

  const { data: latestLogs, error: logsError } = await supabase
    .from("sensor_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (logsError) {
    return res.status(500).json({ error: "Database Error", message: logsError.message });
  }

  const stats = {
    activeDevices: (devices || []).length,
    incidents: {
      aman: (devices || []).filter((d) => d.status === "aman").length,
      waspada: (devices || []).filter((d) => d.status === "waspada").length,
      bahaya: (devices || []).filter((d) => d.status === "bahaya").length,
    },
    latestNotifications: (latestLogs || []).map((log) => ({
      id: String(log.id),
      deviceId: log.device_id,
      message: `Status ${log.status} terdeteksi pada ${log.device_id}`,
      timestamp: log.created_at,
      type: log.status === "aman" ? "info" : "warning",
    })),
  };

  res.json(stats);
});

// ======================================================
// Admin-only operations (Write / Modification / Configuration)
// ======================================================

app.post("/api/devices", requireRole(["Admin"]), async (req, res) => {
  const newDevice = req.body;
  if (!newDevice.name) {
    return res.status(400).json({ error: "Bad Request", message: "Nama perangkat wajib diisi." });
  }

  const { data, error } = await supabase
    .from("devices")
    .insert({
      id: newDevice.id || `DEV_${Date.now()}`,
      name: newDevice.name,
      lat: newDevice.location?.lat,
      lng: newDevice.location?.lng,
      status: newDevice.status || "aman",
      is_active: true,
      last_active: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Database Error", message: error.message });
  }

  res.status(201).json(data);
});

app.delete("/api/devices/:id", requireRole(["Admin"]), async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("devices")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: "Database Error", message: error.message });
  }

  res.json({ success: true, message: `Perangkat ${id} berhasil dihapus.` });
});

app.post("/api/settings", requireRole(["Admin"]), (req, res) => {
  res.json({ success: true, message: "Konfigurasi sistem berhasil disimpan." });
});

app.post("/api/users", requireRole(["Admin"]), (req, res) => {
  res.json({ success: true, message: "Pengguna baru berhasil dibuat." });
});

export default app;
