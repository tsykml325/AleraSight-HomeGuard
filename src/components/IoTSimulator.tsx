import { useAppState } from '../context/StateContext';
import { Sliders, Cpu, Wifi, Bell, ShieldAlert, Sparkles, RefreshCcw, Power, Eye, EyeOff, Camera, Video } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function IoTSimulator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    devices, activeDeviceId, setActiveDeviceId,
    simulatedGas, setSimulatedGas,
    simulatedTemp, setSimulatedTemp,
    simulatedHum, setSimulatedHum,
    simulatedBattery, setSimulatedBattery,
    simulatedSignal, setSimulatedSignal,
    esp32Online, setEsp32Online,
    mqttConnected, setMqttConnected,
    telegramBotActive, setTelegramBotActive,
    raspiOnline, setRaspiOnline,
    visionFireDetected, setVisionFireDetected,
    triggerAlarmManually, addAuditLog
  } = useAppState();

  const handleSimulateCritical = () => {
    setSimulatedGas(680);
    setSimulatedTemp(88);
    setSimulatedHum(18);
    setSimulatedSignal(-85);
    setSimulatedBattery(92);
    setEsp32Online(true);
    setMqttConnected(true);
    setTelegramBotActive(true);
    setRaspiOnline(true);
    setVisionFireDetected(true);
    
    // Explicitly force alarm
    triggerAlarmManually(activeDeviceId, 'critical');
    addAuditLog("SIMULATE_EMERGENCY", "alarm", `Simulator memicu kondisi BAHAYA kritis pada perangkat: ${activeDeviceId} & AI Vision CCTV mendeteksi kobaran api`);
  };

  const handleSimulateSafe = () => {
    setSimulatedGas(88);
    setSimulatedTemp(25);
    setSimulatedHum(62);
    setSimulatedSignal(-55);
    setSimulatedBattery(100);
    setEsp32Online(true);
    setMqttConnected(true);
    setTelegramBotActive(true);
    setRaspiOnline(true);
    setVisionFireDetected(false);
    
    addAuditLog("SIMULATE_SAFE", "system", `Simulator mengembalikan perangkat ${activeDeviceId} & AI Vision CCTV ke kondisi AMAN`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      ></div>

      {/* Slide drawer */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-white/10 h-full overflow-y-auto shadow-2xl p-8 text-white flex flex-col justify-between">
        
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
              <div>
                <h3 className="font-black italic text-lg uppercase tracking-tight leading-none text-white">IoT Hardware Simulator</h3>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">ESP32 & SENSOR MQ-2 EMULATOR</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              Tutup
            </button>
          </div>

          <p className="text-[11px] leading-relaxed font-semibold text-slate-400 italic bg-white/5 p-4 rounded-2xl border border-white/5">
            💡 Gunakan panel kontrol ini untuk mensimulasikan kondisi fisik sensor gas & suhu di lapangan. Perubahan nilai akan langsung memperbarui grafik, status GIS map, notifikasi Telegram, & prediksi risiko AI secara real-time.
          </p>

          {/* Device Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">PILIH TARGET PERANGKAT</label>
            <select 
              className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-xs font-bold uppercase text-white focus:outline-none focus:border-blue-500 transition-colors"
              value={activeDeviceId}
              onChange={(e) => setActiveDeviceId(e.target.value)}
            >
              {devices.map(d => (
                <option key={d.id} value={d.id} className="bg-slate-950">{d.name} ({d.id})</option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSimulateCritical}
              className="py-3 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase text-[10px] tracking-wider rounded-2xl transition-all shadow-lg shadow-red-950/20 active:scale-95"
            >
              🔥 Pemicu Bahaya (Kebakaran)
            </button>
            <button
              onClick={handleSimulateSafe}
              className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black italic uppercase text-[10px] tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-950/20 active:scale-95"
            >
              ✓ Set Aman (Reset)
            </button>
          </div>

          <div className="h-px bg-white/10"></div>

          {/* Sensors Sliders */}
          <div className="space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 italic">Simulasi Pembacaan Sensor</p>
            
            {/* Gas Slider */}
            <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>SENSOR GAS (MQ-2)</span>
                <span className={cn(
                  "font-mono italic",
                  simulatedGas >= 300 ? 'text-red-400' : simulatedGas >= 180 ? 'text-amber-400' : 'text-emerald-400'
                )}>{simulatedGas} ppm</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="800" 
                className="w-full accent-blue-500 cursor-pointer"
                value={simulatedGas}
                onChange={(e) => setSimulatedGas(Number(e.target.value))}
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                <span>20 ppm</span>
                <span>Ambang Batas: 300 ppm</span>
                <span>800 ppm</span>
              </div>
            </div>

            {/* Temp Slider */}
            <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>SUHU (SHT20)</span>
                <span className={cn(
                  "font-mono italic",
                  simulatedTemp >= 45 ? 'text-red-400' : simulatedTemp >= 35 ? 'text-amber-400' : 'text-emerald-400'
                )}>{simulatedTemp}°C</span>
              </div>
              <input 
                type="range" 
                min="15" 
                max="120" 
                className="w-full accent-blue-500 cursor-pointer"
                value={simulatedTemp}
                onChange={(e) => setSimulatedTemp(Number(e.target.value))}
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                <span>15°C</span>
                <span>Ambang Batas: 45°C</span>
                <span>120°C</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>KELEMBAPAN</span>
                <span className="font-mono text-blue-300 italic">{simulatedHum}% RH</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="100" 
                className="w-full accent-blue-500 cursor-pointer"
                value={simulatedHum}
                onChange={(e) => setSimulatedHum(Number(e.target.value))}
              />
            </div>

            {/* Network properties (Signal/Battery) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">BATTERY BACKUP</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  className="w-full accent-blue-500 cursor-pointer"
                  value={simulatedBattery}
                  onChange={(e) => setSimulatedBattery(Number(e.target.value))}
                />
                <span className="font-mono text-xs font-bold">{simulatedBattery}%</span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">WIFI SIGNAL (RSSI)</span>
                <input 
                  type="range" 
                  min="-110" 
                  max="-30" 
                  className="w-full accent-blue-500 cursor-pointer"
                  value={simulatedSignal}
                  onChange={(e) => setSimulatedSignal(Number(e.target.value))}
                />
                <span className="font-mono text-xs font-bold">{simulatedSignal} dBm</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10"></div>

          {/* Network Connection States */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 italic">Status Konektivitas Perangkat</p>
            
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Cpu className={cn("w-5 h-5", esp32Online ? "text-emerald-400 animate-pulse" : "text-red-400")} />
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block leading-none">ESP32 POWER</span>
                  <span className="text-[11px] font-extrabold italic uppercase">{esp32Online ? 'ONLINE (ON)' : 'OFFLINE (OFF)'}</span>
                </div>
              </div>
              <button 
                onClick={() => setEsp32Online(!esp32Online)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic transition-all",
                  esp32Online ? "bg-red-600 text-white" : "bg-white/10 text-white"
                )}
              >
                {esp32Online ? "Turn Off" : "Turn On"}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Wifi className={cn("w-5 h-5", mqttConnected ? "text-blue-400" : "text-red-400")} />
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block leading-none">MQTT CLIENT</span>
                  <span className="text-[11px] font-extrabold italic uppercase">{mqttConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </div>
              </div>
              <button 
                onClick={() => setMqttConnected(!mqttConnected)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic transition-all",
                  mqttConnected ? "bg-red-600 text-white" : "bg-white/10 text-white"
                )}
              >
                {mqttConnected ? "Disconnect" : "Connect"}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Bell className={cn("w-5 h-5", telegramBotActive ? "text-emerald-400" : "text-red-400")} />
                <div>
                  <span className="text-[10px] font-black text-slate-400 block leading-none">TELEGRAM BOT DISPATCHER</span>
                  <span className="text-[11px] font-extrabold italic uppercase">{telegramBotActive ? 'ACTIVE BOT' : 'OFFLINE BOT'}</span>
                </div>
              </div>
              <button 
                onClick={() => setTelegramBotActive(!telegramBotActive)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic transition-all",
                  telegramBotActive ? "bg-red-600 text-white" : "bg-white/10 text-white"
                )}
              >
                {telegramBotActive ? "Mute Bot" : "Unmute Bot"}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Video className={cn("w-5 h-5", raspiOnline ? "text-blue-400 animate-pulse" : "text-red-400")} />
                <div>
                  <span className="text-[10px] font-black text-slate-400 block leading-none">RASPBERRY PI 5 CO-PROCESSOR</span>
                  <span className="text-[11px] font-extrabold italic uppercase">{raspiOnline ? 'ACTIVE (ON)' : 'OFFLINE (OFF)'}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setRaspiOnline(!raspiOnline);
                  addAuditLog("TOGGLE_RASPI_POWER", "system", `Mengubah status daya Raspberry Pi 5 Co-Processor menjadi ${!raspiOnline ? "ON" : "OFF"}`);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic transition-all",
                  raspiOnline ? "bg-red-600 text-white" : "bg-white/10 text-white"
                )}
              >
                {raspiOnline ? "Shut Down" : "Power On"}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Camera className={cn("w-5 h-5", visionFireDetected ? "text-red-500 animate-bounce" : "text-emerald-400")} />
                <div>
                  <span className="text-[10px] font-black text-slate-400 block leading-none">AI VISION OBJECT CLASSIFIER</span>
                  <span className="text-[11px] font-extrabold italic uppercase">{visionFireDetected ? 'ADA API (FIRE)' : 'TIDAK ADA API (NORMAL)'}</span>
                </div>
              </div>
              <button 
                disabled={!raspiOnline}
                onClick={() => {
                  setVisionFireDetected(!visionFireDetected);
                  addAuditLog("TOGGLE_AI_VISION_FIRE", "alarm", `Menstimulasikan AI Vision CCTV mendeteksi: ${!visionFireDetected ? "ADA KOBARAN API (FIRE)" : "TIDAK ADA API (NORMAL)"}`);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic transition-all",
                  !raspiOnline ? "bg-slate-800 text-slate-600 cursor-not-allowed" :
                  visionFireDetected ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                )}
              >
                {visionFireDetected ? "Set Normal" : "Simulasi Api"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">
          ALERASIGHT HARDWARE EMULATION SUITE v2.4.1
        </div>

      </div>
    </div>
  );
}
