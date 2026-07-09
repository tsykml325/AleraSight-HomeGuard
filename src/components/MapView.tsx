import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useAppState } from '../context/StateContext';
import { Flame, ShieldCheck, AlertTriangle, Layers, MapPin, Search } from 'lucide-react';
import { cn } from '../lib/utils';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getMarkerIcon = (status: string) => {
  const color = status === 'aman' ? '#10b981' : status === 'waspada' ? '#f59e0b' : '#ef4444';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center;">
             <div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

function MapResizeTrigger() {
  const map = useMap();
  useEffect(() => {
    const intervals = [50, 150, 300, 600, 1000, 2000];
    const timers = intervals.map(delay => 
      setTimeout(() => {
        map.invalidateSize();
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [map]);
  return null;
}

// Map center update controller
function ChangeMapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export function MapView() {
  const { devices, settings } = useAppState();
  const [mapType, setMapType] = useState<'street' | 'satellite' | 'dark'>('dark');
  const [filterStatus, setFilterStatus] = useState<'all' | 'aman' | 'waspada' | 'bahaya'>('all');
  const [showRadius, setShowRadius] = useState(true);
  const [showSectors, setShowSectors] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.2088, 106.8456]);
  const [hoveredCoords, setHoveredCoords] = useState<[number, number] | null>(null);

  const tileUrls = {
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  };

  const filteredDevices = devices.filter(d => {
    return filterStatus === 'all' || d.status === filterStatus;
  });

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const matched = devices.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchSuggestions(matched);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, devices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = devices.find(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setMapCenter([found.location.lat, found.location.lng]);
      setSearchSuggestions([]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top filter indicators bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'SEMUA PERANGKAT', count: devices.length, color: 'bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50', act: 'all' },
          { label: 'STATUS AMAN', count: devices.filter(d => d.status === 'aman').length, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', act: 'aman' },
          { label: 'STATUS WASPADA', count: devices.filter(d => d.status === 'waspada').length, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', act: 'waspada' },
          { label: 'STATUS BAHAYA', count: devices.filter(d => d.status === 'bahaya').length, color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', act: 'bahaya' }
        ].map(item => (
          <button 
            key={item.label}
            onClick={() => setFilterStatus(item.act as any)}
            className={cn(
              "p-5 rounded-[1.5rem] border border-slate-200 flex items-center justify-between shadow-sm transition-all text-left",
              filterStatus === item.act ? "ring-4 ring-blue-900/15 border-blue-900 bg-white" : item.bg
            )}
          >
            <div className="space-y-1">
              <span className={cn("text-[9px] font-black tracking-widest uppercase leading-none block", filterStatus === item.act ? 'text-slate-900' : item.text)}>{item.label}</span>
              <span className="text-xl font-black text-slate-800 italic">{item.count} Node</span>
            </div>
            <div className={cn("w-3.5 h-3.5 rounded-full shadow-sm ring-4 ring-white", item.color)}></div>
          </button>
        ))}
      </div>

      {/* Control panel and Map Canvas */}
      <div className={cn(
        "bg-white border border-slate-200 overflow-hidden flex flex-col lg:flex-row transition-all duration-300",
        isFullscreen 
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-0" 
          : "rounded-[2.5rem] shadow-xl h-[700px]"
      )}>
        {/* Left side controller panels */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-100 p-6 flex flex-col justify-between shrink-0 bg-slate-50/50">
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-lg text-slate-900 italic uppercase tracking-tight">Peta GIS Profesional</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem informasi geografis mitigasi bahaya AleraSight</p>
            </div>



            {/* Map types switcher */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">TIPE DESAIN PETA</label>
              <div className="grid grid-cols-3 gap-2">
                {(['street', 'satellite', 'dark'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMapType(type)}
                    className={cn(
                      "py-2 rounded-xl text-[9px] font-black uppercase tracking-wider italic border text-center transition-all",
                      mapType === type ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                    )}
                  >
                    {type === 'street' ? 'Street' : type === 'satellite' ? 'Satellite' : 'Dark'}
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Control Panel */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">LAYER CONTROL (GIS)</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Radius Peringatan (300m)</span>
                  <input 
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    checked={showRadius}
                    onChange={() => setShowRadius(!showRadius)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Sektor Area Jaringan</span>
                  <input 
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    checked={showSectors}
                    onChange={() => setShowSectors(!showSectors)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Heatmap Kepadatan Suhu</span>
                  <input 
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    checked={showHeatmap}
                    onChange={() => setShowHeatmap(!showHeatmap)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coordinate monitor panel */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-white/5 space-y-1 mt-6 lg:mt-0 font-mono text-[10px] font-extrabold text-blue-300">
            <div className="flex items-center justify-between">
              <span>LATITUDE</span>
              <span>{mapCenter[0].toFixed(5)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>LONGITUDE</span>
              <span>{mapCenter[1].toFixed(5)}</span>
            </div>
            <div className="text-[8px] text-slate-500 text-center uppercase tracking-widest pt-2 border-t border-white/10 mt-2 font-sans font-bold">
              ALERASIGHT GIS GATEWAY v2.4
            </div>
          </div>
        </div>

        {/* Map Container Area */}
        <div className="flex-1 h-full relative">
          {/* Fullscreen control toggle */}
          <button 
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-4 right-4 z-[1000] bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all"
          >
            <span>{isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}</span>
          </button>

          {/* Floating Legend */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 border border-slate-200 shadow-2xl p-4 rounded-2xl backdrop-blur-md space-y-2.5 max-w-xs text-left">
            <p className="text-[8px] font-black tracking-widest text-slate-400 uppercase italic leading-none">LEGENDA MITIGASI</p>
            <div className="space-y-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm ring-2 ring-emerald-100"></span>
                <span>KONDISI AMAN (NORMAL)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-sm ring-2 ring-amber-100"></span>
                <span>ZONA WASPADA (PANAS)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white shadow-sm ring-2 ring-red-100 animate-pulse"></span>
                <span>ZONA KRITIS (KEBAKARAN)</span>
              </div>
            </div>
          </div>

          <MapContainer 
            key={`gis-map-${mapType}`}
            center={mapCenter} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
          >
            <MapResizeTrigger />
            <ChangeMapCenter center={mapCenter} />
            
            <TileLayer
              attribution='&copy; OpenStreetMap & Esri'
              url={tileUrls[mapType]}
            />

            {/* Custom Sector Area Overlay Layer */}
            {showSectors && (
              <Circle 
                center={[-6.2088, 106.8456]}
                radius={1200}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.03,
                  weight: 1,
                  dashArray: '4, 10'
                }}
              />
            )}

            {/* Custom Heatmap Layer */}
            {showHeatmap && devices.map((dev) => {
              const isWarm = dev.status !== 'aman';
              return (
                <Circle 
                  key={`heat-${dev.id}`}
                  center={[dev.location.lat, dev.location.lng]}
                  radius={450}
                  pathOptions={{
                    stroke: false,
                    fillColor: isWarm ? '#ef4444' : '#f59e0b',
                    fillOpacity: isWarm ? 0.22 : 0.08
                  }}
                />
              );
            })}

            {/* Render markers */}
            {filteredDevices.map((dev) => (
              <div key={dev.id}>
                <Marker 
                  position={[dev.location.lat, dev.location.lng]}
                  icon={getMarkerIcon(dev.status)}
                >
                  <Popup>
                    <div className="p-4 min-w-[220px]">
                      <h3 className="font-black text-slate-900 italic uppercase border-b border-slate-100 pb-2 mb-2 text-base">{dev.name}</h3>
                      
                      <div className="space-y-2 text-[10px] font-bold">
                        <div className="flex justify-between">
                          <span className="text-slate-400 uppercase">NODE ID</span>
                          <span className="font-mono text-slate-700">{dev.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 uppercase">STATUS</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-white",
                            dev.status === 'aman' ? 'bg-emerald-500' : dev.status === 'waspada' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                          )}>{dev.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 uppercase">GARIS LINTANG</span>
                          <span className="font-mono text-slate-700">{dev.location.lat.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 uppercase">GARIS BUJUR</span>
                          <span className="font-mono text-slate-700">{dev.location.lng.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Radius Circle Alarm display */}
                {showRadius && dev.status !== 'aman' && (
                  <Circle 
                    center={[dev.location.lat, dev.location.lng]}
                    radius={300} // meters radius
                    pathOptions={{
                      color: dev.status === 'waspada' ? '#f59e0b' : '#ef4444',
                      fillColor: dev.status === 'waspada' ? '#f59e0b' : '#ef4444',
                      fillOpacity: 0.15,
                      weight: 2,
                      dashArray: '5, 5'
                    }}
                  />
                )}
              </div>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
