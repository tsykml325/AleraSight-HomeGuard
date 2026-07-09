import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  let devices = [
    { id: "DEV001", name: "Gedung A - Lt 1", location: { lat: -6.2088, lng: 106.8456 }, status: "aman", isActive: true, lastActive: new Date().toISOString() },
    { id: "DEV002", name: "Gedung B - Kantin", location: { lat: -6.2100, lng: 106.8480 }, status: "waspada", isActive: false, lastActive: new Date().toISOString() },
    { id: "DEV003", name: "Gedung C - Gudang", location: { lat: -6.2120, lng: 106.8400 }, status: "aman", isActive: true, lastActive: new Date().toISOString() },
  ];

  let sensorData = Array.from({ length: 50 }, (_, i) => ({
    id: `LOG${i}`,
    deviceId: devices[Math.floor(Math.random() * devices.length)].id,
    gas: Math.floor(Math.random() * 400) + 100,
    temperature: Math.floor(Math.random() * 15) + 25,
    status: "aman",
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  }));

  // Middleware for Role-Based Access Control (RBAC)
  function requireRole(allowedRoles: string[]) {
    return (req: any, res: any, next: any) => {
      // Check for user role in headers or query parameters
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

  // API Routes
  // Read routes: Accessible to both Admin and Operator
  app.get("/api/devices", requireRole(["Admin", "Operator"]), (req, res) => {
    res.json(devices);
  });

  app.get("/api/sensor-data", requireRole(["Admin", "Operator"]), (req, res) => {
    res.json(sensorData);
  });

  app.get("/api/dashboard-stats", requireRole(["Admin", "Operator"]), (req, res) => {
    const stats = {
      activeDevices: devices.length,
      incidents: {
        aman: devices.filter(d => d.status === 'aman').length,
        waspada: devices.filter(d => d.status === 'waspada').length,
        bahaya: devices.filter(d => d.status === 'bahaya').length,
      },
      latestNotifications: [
        { id: "N1", deviceId: "DEV002", message: "Kenaikan suhu terdeteksi di Gedung B", timestamp: new Date().toISOString(), type: "warning" },
        { id: "N2", deviceId: "DEV001", message: "Sistem berjalan normal", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "info" },
      ]
    };
    res.json(stats);
  });

  // Admin-only operations (Write / Modification / Configuration)
  app.post("/api/devices", requireRole(["Admin"]), (req, res) => {
    const newDevice = req.body;
    if (!newDevice.name) {
      return res.status(400).json({ error: "Bad Request", message: "Nama perangkat wajib diisi." });
    }
    const created = { id: `DEV00${devices.length + 1}`, ...newDevice, isActive: true, lastActive: new Date().toISOString() };
    devices.push(created);
    res.status(201).json(created);
  });

  app.delete("/api/devices/:id", requireRole(["Admin"]), (req, res) => {
    const { id } = req.params;
    devices = devices.filter(d => d.id !== id);
    res.json({ success: true, message: `Perangkat ${id} berhasil dihapus.` });
  });

  app.post("/api/settings", requireRole(["Admin"]), (req, res) => {
    res.json({ success: true, message: "Konfigurasi sistem berhasil disimpan." });
  });

  app.post("/api/users", requireRole(["Admin"]), (req, res) => {
    res.json({ success: true, message: "Pengguna baru berhasil dibuat." });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
