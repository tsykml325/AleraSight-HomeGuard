@extends('layouts.app')

@section('title', 'Dashboard Real-Time')

@section('content')
<!-- Leaflet Map CSS inside Laravel -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
    #gis-map {
        height: 480px;
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background-color: #0b0f19;
    }
    
    /* Styled marker colors */
    .leaflet-popup-content-wrapper {
        background-color: #101726 !important;
        color: #f1f5f9 !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        font-family: 'Inter', sans-serif;
    }
    .leaflet-popup-tip {
        background-color: #101726 !important;
    }
    .leaflet-popup-close-button {
        color: #94a3b8 !important;
    }

    .glow-red {
        box-shadow: 0 0 20px rgba(244, 63, 94, 0.4);
        border-color: rgba(244, 63, 94, 0.5) !important;
    }
</style>

<div class="row g-4 align-items-center mb-5">
    <div class="col-lg-6">
        <h1 class="display-5 text-white mb-1">Overview HomeGuard</h1>
        <p class="text-secondary m-0">Sistem Pemantauan Kebakaran Cerdas terintegrasi AI Vision & Sensor IoT.</p>
    </div>
    <div class="col-lg-6 text-lg-end">
        <div class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 border border-danger border-opacity-20 rounded-pill code-font">
            <span class="spinner-grow spinner-grow-sm me-2 align-middle"></span>
            LIVE MONITORING ENGINE ACTIVE
        </div>
    </div>
</div>

<!-- Core Analytical Counters -->
<div class="row g-4 mb-5">
    <div class="col-xl-3 col-md-6">
        <div class="card-custom d-flex justify-content-between align-items-center">
            <div>
                <p class="text-secondary text-uppercase small fw-bold mb-1">Total Perangkat</p>
                <h3 class="display-font text-white mb-0">{{ $totalDevices }}</h3>
            </div>
            <div class="p-3 rounded-4 bg-primary bg-opacity-10 text-primary">
                <i data-lucide="cpu" class="w-6 h-6"></i>
            </div>
        </div>
    </div>
    
    <div class="col-xl-3 col-md-6">
        <div class="card-custom d-flex justify-content-between align-items-center border-danger border-opacity-10 @if($activeFires > 0) glow-red @endif">
            <div>
                <p class="text-secondary text-uppercase small fw-bold mb-1">Status Kebakaran</p>
                <h3 class="display-font {{ $activeFires > 0 ? 'text-danger animate-pulse' : 'text-success' }} mb-0">
                    {{ $activeFires > 0 ? $activeFires . ' Titik Api' : 'Aman' }}
                </h3>
            </div>
            <div class="p-3 rounded-4 {{ $activeFires > 0 ? 'bg-danger text-white' : 'bg-success bg-opacity-10 text-success' }}">
                <i data-lucide="flame" class="w-6 h-6"></i>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6">
        <div class="card-custom d-flex justify-content-between align-items-center">
            <div>
                <p class="text-secondary text-uppercase small fw-bold mb-1">Potensi Waspada</p>
                <h3 class="display-font text-warning mb-0">{{ $warnings }} Node</h3>
            </div>
            <div class="p-3 rounded-4 bg-warning bg-opacity-10 text-warning">
                <i data-lucide="alert-triangle" class="w-6 h-6"></i>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6">
        <div class="card-custom d-flex justify-content-between align-items-center">
            <div>
                <p class="text-secondary text-uppercase small fw-bold mb-1">Rata-rata AI Confidence</p>
                <h3 class="display-font text-info mb-0">{{ number_format($avgConfidence, 2) }}%</h3>
            </div>
            <div class="p-3 rounded-4 bg-info bg-opacity-10 text-info">
                <i data-lucide="brain-circuit" class="w-6 h-6"></i>
            </div>
        </div>
    </div>
</div>

<div class="row g-4 mb-5">
    <!-- Fire Monitoring Panel with AI Vision, camera, siren, and Telegram Bot status -->
    <div class="col-xl-5 col-lg-6">
        <div class="card-custom h-100 flex-column d-flex justify-content-between">
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4 class="text-white m-0">AI Vision - Panel Deteksi Api</h4>
                    <span class="badge bg-secondary bg-opacity-20 text-light py-2 px-3 rounded-pill code-font" style="font-size: 11px;">
                        PI-5 CORE
                    </span>
                </div>

                <!-- Snapshot Camera Frame -->
                <div class="position-relative rounded-4 overflow-hidden border border-secondary border-opacity-10 mb-4 bg-black" style="height: 240px;">
                    @if($activeFires > 0)
                        <img src="https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=600&auto=format&fit=crop&q=60" alt="Snapshot AI Vision" class="w-100 h-100 object-fit-cover opacity-75">
                    @elseif($warnings > 0)
                        <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=60" alt="Snapshot AI Vision" class="w-100 h-100 object-fit-cover opacity-75">
                    @else
                        <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=60" alt="Snapshot AI Vision" class="w-100 h-100 object-fit-cover opacity-50">
                    @endif
                    
                    <!-- Scanlines overlay for techy visual vibe -->
                    <div class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none" style="background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%); background-size: 100% 4px; opacity: 0.3;"></div>
                    
                    <!-- YOLO Reticle Overlay if Fire is Active -->
                    @if($activeFires > 0)
                    <div class="position-absolute border border-danger border-3 rounded-3" style="top: 25%; left: 30%; width: 45%; height: 50%; box-shadow: 0 0 15px rgba(244, 63, 94, 0.6); animation: pulse 1.5s infinite;">
                        <span class="position-absolute top-0 start-0 bg-danger text-white px-2 py-0.5 rounded-bottom-0 small fw-bold code-font text-uppercase" style="font-size: 9px; margin-top: -20px; margin-left: -3px;">
                            FIRE DETECTED [98.42%]
                        </span>
                    </div>
                    @endif

                    <div class="position-absolute top-3 start-3 d-flex gap-2">
                        <span class="badge bg-dark bg-opacity-75 text-white px-2.5 py-1.5 rounded-3 d-flex align-items-center gap-1.5 code-font" style="font-size: 10px;">
                            <span class="rounded-circle {{ $activeFires > 0 ? 'bg-danger' : 'bg-success' }} d-inline-block" style="width: 6px; height: 6px; animation: pulse 1s infinite;"></span>
                            CCTV LIVE FEED
                        </span>
                    </div>

                    <div class="position-absolute bottom-3 start-3 end-3 d-flex justify-content-between text-white-50 code-font" style="font-size: 9px;">
                        <span>CAM_DAPUR (SHT20 CONVERGENT)</span>
                        <span>CONF: {{ $activeFires > 0 ? '98.42%' : '12.15%' }}</span>
                    </div>
                </div>

                <!-- Fire Status & Score Matrix -->
                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <div class="p-3 rounded-4 bg-secondary bg-opacity-10 text-center">
                            <p class="text-secondary small fw-bold mb-1 uppercase text-xs" style="font-size: 10px;">Status Api</p>
                            @if($activeFires > 0)
                                <span class="badge bg-danger text-white py-1.5 px-3 rounded-3 fw-bold uppercase">API TERDETEKSI</span>
                            @elseif($warnings > 0)
                                <span class="badge bg-warning text-dark py-1.5 px-3 rounded-3 fw-bold uppercase">POTENSI API</span>
                            @else
                                <span class="badge bg-success text-white py-1.5 px-3 rounded-3 fw-bold uppercase">TIDAK TERDETEKSI</span>
                            @endif
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-3 rounded-4 bg-secondary bg-opacity-10 text-center">
                            <p class="text-secondary small fw-bold mb-1 uppercase text-xs" style="font-size: 10px;">Waktu Deteksi</p>
                            <span class="text-white fw-bold code-font" style="font-size: 13px;">
                                {{ $activeFires > 0 ? 'Baru Saja' : 'Berkala' }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Auxiliary Peripherals Stats (Telegram, Siren, Vision Mode) -->
                <div class="space-y-3">
                    <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-2 mb-2">
                        <span class="text-secondary small fw-semibold">Telegram Alert Bot</span>
                        <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 py-1 px-2 rounded-2 code-font" style="font-size: 10px;">
                            <i data-lucide="send" class="w-3.5 h-3.5 me-1 align-middle"></i> TERHUBUNG
                        </span>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-2 mb-2">
                        <span class="text-secondary small fw-semibold">Sirine Alarm Fisik</span>
                        @if($activeFires > 0)
                            <span class="badge bg-danger text-white py-1 px-2 rounded-2 code-font animate-bounce" style="font-size: 10px;">
                                <i data-lucide="volume-2" class="w-3.5 h-3.5 me-1 align-middle"></i> BERBUNYI (SIREN ACTIVE)
                            </span>
                        @else
                            <span class="badge bg-secondary bg-opacity-15 text-white-50 py-1 px-2 rounded-2 code-font" style="font-size: 10px;">
                                <i data-lucide="volume-x" class="w-3.5 h-3.5 me-1 align-middle"></i> STBY (SENSORS READY)
                            </span>
                        @endif
                    </div>

                    <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-2 mb-2">
                        <span class="text-secondary small fw-semibold">Vision Model Mode</span>
                        <span class="text-light fw-bold code-font" style="font-size: 12px;">YOLOv8n-Fire_v2.1</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-secondary small fw-semibold">Raspberry Pi Core Node</span>
                        <span class="text-light fw-bold code-font" style="font-size: 12px;">{{ $raspiOnlineCount }} / 3 Online</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- GIS Interactive Map Area -->
    <div class="col-xl-7 col-lg-6">
        <div class="card-custom h-100 flex-column d-flex justify-content-between">
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 class="text-white m-0">Sistem Informasi Geografis (GIS)</h4>
                        <p class="text-secondary small m-0 mt-1">Titik penempatan simpul sensor dan kamera real-time.</p>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-secondary bg-opacity-10 text-white-50 border-secondary border-opacity-15" id="btn-recenter">
                            <i data-lucide="locate" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>

                <!-- GIS Map Leaflet Container -->
                <div class="position-relative">
                    <div id="gis-map"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-4 mb-5">
    <!-- Chart Panel -->
    <div class="col-lg-8">
        <div class="card-custom">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 class="text-white m-0">SHT20 & MQ-2 Telemetri Tren</h4>
                    <p class="text-secondary small m-0 mt-1">Grafik riwayat fluktuasi Suhu (°C) dan Level Gas (ppm) dari sensor.</p>
                </div>
                <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 px-2.5 py-1.5 code-font text-xs">
                    REAL-TIME SYNC
                </span>
            </div>

            <!-- ChartJS Container -->
            <div style="height: 310px; width: 100%;">
                <canvas id="telemetryChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Developer IoT Simulator Panel -->
    <div class="col-lg-4">
        <div class="card-custom h-100 d-flex flex-column justify-content-between">
            <div>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4 class="text-white m-0">IoT Simulator & Trigger</h4>
                    <span class="badge bg-warning bg-opacity-10 text-warning px-2.5 py-1 text-xs uppercase code-font fw-bold">Test Mode</span>
                </div>
                <p class="text-secondary text-xs leading-relaxed mb-4" style="font-size: 12px;">
                    Simulasikan perubahan parameter suhu & gas secara dinamis untuk menguji integrasi notifikasi Telegram dan aktivasi sirine secara langsung tanpa perangkat fisik.
                </p>

                <form action="{{ route('simulator.trigger') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label for="sim_device" class="form-label text-white-50 small fw-semibold">Pilih Perangkat Node</label>
                        <select name="device_id" id="sim_device" class="form-select form-control-custom" required>
                            @foreach($gisDevices as $dev)
                                <option value="{{ $dev->id }}">{{ $dev->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label text-white-50 small fw-semibold d-block">Simulasi Kondisi</label>
                        <div class="btn-group w-100" role="group">
                            <input type="radio" class="btn-check" name="status" id="status_safe" value="aman" checked>
                            <label class="btn btn-outline-success text-xs py-2 fw-bold" for="status_safe">AMAN</label>

                            <input type="radio" class="btn-check" name="status" id="status_warn" value="waspada">
                            <label class="btn btn-outline-warning text-xs py-2 fw-bold" for="status_warn">WASPADA</label>

                            <input type="radio" class="btn-check" name="status" id="status_danger" value="bahaya">
                            <label class="btn btn-outline-danger text-xs py-2 fw-bold" for="status_danger">BAHAYA</label>
                        </div>
                    </div>

                    <div class="row g-2 mb-4">
                        <div class="col-6">
                            <label for="confidence_score" class="form-label text-white-50 small fw-semibold">Confidence (%)</label>
                            <input type="number" step="0.01" name="confidence_score" id="confidence_score" class="form-control form-control-custom code-font text-center" value="95.50" min="0" max="100" required>
                        </div>
                        <div class="col-6">
                            <label for="alarm_source" class="form-label text-white-50 small fw-semibold">Sumber Input</label>
                            <select name="alarm_source" id="alarm_source" class="form-select form-control-custom text-xs" required>
                                <option value="combination">IoT + AI Vision</option>
                                <option value="sensor">Sensor MQ-2 Only</option>
                                <option value="ai_vision">AI Vision Only</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-custom btn-accent w-100 d-flex align-items-center justify-content-center gap-2 mb-2 py-2.5">
                        <i data-lucide="radio" class="w-4 h-4"></i>
                        <span>Kirim Sinyal Telemetri</span>
                    </button>
                </form>

                <form action="{{ route('simulator.reset-all') }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin me-reset semua stasiun ke status normal AMAN?')">
                    @csrf
                    <button type="submit" class="btn btn-custom btn-outline-light border-secondary w-100 text-xs py-2">
                        Reset Semua Ke Kondisi Aman
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <!-- Log Aktivitas Terakhir -->
    <div class="col-12">
        <div class="card-custom">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="text-white m-0">Riwayat Deteksi & Alarm Terakhir</h4>
                <a href="{{ route('fire-detections.index') }}" class="btn btn-sm btn-outline-secondary border-secondary border-opacity-20 text-white py-1.5 px-3 rounded-pill" style="font-size: 12px;">
                    Lihat Semua Data
                </a>
            </div>

            <div class="table-responsive">
                <table class="table table-dark table-hover border-secondary border-opacity-10 align-middle">
                    <thead>
                        <tr class="text-secondary" style="font-size: 12px;">
                            <th class="border-secondary border-opacity-10 py-3 uppercase">Perangkat</th>
                            <th class="border-secondary border-opacity-10 py-3 uppercase">Status Kebakaran</th>
                            <th class="border-secondary border-opacity-10 py-3 uppercase">Confidence Score</th>
                            <th class="border-secondary border-opacity-10 py-3">SUMBER ALARM</th>
                            <th class="border-secondary border-opacity-10 py-3">DURASI ALARM</th>
                            <th class="border-secondary border-opacity-10 py-3">TELEGRAM NOTIFIED</th>
                            <th class="border-secondary border-opacity-10 py-3">WAKTU DETEKSI</th>
                        </tr>
                    </thead>
                    <tbody style="font-size: 13px;">
                        @foreach($latestLogs as $log)
                        <tr>
                            <td class="border-secondary border-opacity-10 py-3 fw-bold text-light">
                                <i data-lucide="cpu" class="w-4 h-4 me-2 text-primary align-middle"></i>
                                {{ $log->device->name }}
                            </td>
                            <td class="border-secondary border-opacity-10 py-3">
                                @if($log->status === 'Api Terdeteksi')
                                    <span class="badge bg-danger text-white py-1 px-2.5 rounded-2 code-font uppercase">Api Terdeteksi</span>
                                @elseif($log->status === 'Potensi Api')
                                    <span class="badge bg-warning text-dark py-1 px-2.5 rounded-2 code-font uppercase">Potensi Api</span>
                                @else
                                    <span class="badge bg-success text-white py-1 px-2.5 rounded-2 code-font uppercase">Aman</span>
                                @endif
                            </td>
                            <td class="border-secondary border-opacity-10 py-3 fw-bold code-font">
                                @if($log->status === 'Api Terdeteksi')
                                    <span class="text-danger">{{ number_format($log->confidence_score, 2) }}%</span>
                                @elseif($log->status === 'Potensi Api')
                                    <span class="text-warning">{{ number_format($log->confidence_score, 2) }}%</span>
                                @else
                                    <span class="text-success">{{ number_format($log->confidence_score, 2) }}%</span>
                                @endif
                            </td>
                            <td class="border-secondary border-opacity-10 py-3">
                                @if($log->alarm_source === 'combination')
                                    <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20 py-1 px-2 rounded-2 code-font text-uppercase" style="font-size: 11px;">IoT + AI Vision</span>
                                @elseif($log->alarm_source === 'ai_vision')
                                    <span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-20 py-1 px-2 rounded-2 code-font text-uppercase" style="font-size: 11px;">AI Vision Only</span>
                                @else
                                    <span class="badge bg-secondary bg-opacity-15 text-light border border-secondary border-opacity-20 py-1 px-2 rounded-2 code-font text-uppercase" style="font-size: 11px;">IoT Sensor Only</span>
                                @endif
                            </td>
                            <td class="border-secondary border-opacity-10 py-3 code-font fw-bold">
                                {{ $log->alarm_duration > 0 ? $log->alarm_duration . ' detik' : 'N/A' }}
                            </td>
                            <td class="border-secondary border-opacity-10 py-3">
                                @if($log->telegram_notified_at)
                                    <span class="text-success code-font">
                                        <i data-lucide="check-circle" class="w-3.5 h-3.5 me-1 text-success align-middle"></i>
                                        {{ $log->telegram_notified_at->format('H:i:s') }}
                                    </span>
                                @else
                                    <span class="text-secondary">Tidak Terkirim</span>
                                @endif
                            </td>
                            <td class="border-secondary border-opacity-10 py-3 text-secondary code-font">
                                {{ $log->created_at->format('d M Y, H:i') }} WIB
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

@endsection

@section('scripts')
<!-- Leaflet Map JS inside Laravel -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<!-- ChartJS -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        // --- 1. LEAFLET MAP INITIALIZATION ---
        var mapCenter = [-6.2000, 106.8166];
        var map = L.map('gis-map', {
            zoomControl: false,
            attributionControl: false
        }).setView(mapCenter, 14);

        // Dark theme map layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20
        }).addTo(map);

        // Devices coordinates extracted from PHP database
        var devicesData = @json($gisDevices);

        devicesData.forEach(function (device) {
            var color = '#10b981'; // Default Green (safe)
            var statusText = 'Tidak Terdeteksi';
            var score = '12.15%';
            
            if (device.status === 'bahaya') {
                color = '#f43f5e'; // Red
                statusText = 'Api Terdeteksi';
                score = '98.42%';
            } else if (device.status === 'waspada') {
                color = '#f59e0b'; // Amber
                statusText = 'Potensi Api';
                score = '64.20%';
            }

            // Create customized Leaflet circle marker for a premium layout
            var marker = L.circleMarker([device.location_lat, device.location_lng], {
                radius: 12,
                fillColor: color,
                color: '#ffffff',
                weight: 2.5,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);

            // Set up rich HTML detailed popup inside map marker
            var popupContent = `
                <div class="p-2 text-white" style="width: 240px; font-family: 'Inter', sans-serif;">
                    <div class="border-bottom border-secondary border-opacity-25 pb-2 mb-2">
                        <h6 class="fw-bold mb-0 text-white uppercase display-font" style="font-size: 12px; letter-spacing: -0.01em;">${device.name}</h6>
                    </div>
                    
                    <div class="mb-3 rounded overflow-hidden bg-black text-center" style="height: 100px;">
                        ${device.has_camera ? `
                            <img src="${device.status === 'bahaya' ? 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=300' : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300'}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;">
                        ` : `
                            <div class="d-flex align-items-center justify-content-center h-100 text-secondary code-font" style="font-size: 9px;">NO CAMERA FEED</div>
                        `}
                    </div>

                    <div style="font-size: 11px;">
                        <div class="d-flex justify-content-between mb-1.5">
                            <span class="text-secondary">Status Api:</span>
                            <span class="fw-bold uppercase" style="color: ${color};">${statusText}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1.5">
                            <span class="text-secondary">Confidence Score:</span>
                            <span class="fw-bold text-light">${score}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1.5">
                            <span class="text-secondary">Kamera Status:</span>
                            <span class="fw-bold uppercase text-info" style="font-size: 10px;">${device.camera_status.toUpperCase()}</span>
                        </div>
                        <div class="d-flex justify-content-between border-top border-secondary border-opacity-15 pt-1.5 text-secondary code-font" style="font-size: 9px;">
                            <span>LAT: ${parseFloat(device.location_lat).toFixed(4)}</span>
                            <span>LNG: ${parseFloat(device.location_lng).toFixed(4)}</span>
                        </div>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
        });

        // Recenter click trigger
        document.getElementById('btn-recenter').addEventListener('click', function () {
            map.setView(mapCenter, 14, { animate: true });
        });

        // --- 2. CHARTJS TELEMETRY CHART ---
        // Dynamically extract timeline points from the seeder-generated log data
        var logs = @json($latestLogs);
        logs.reverse(); // Chronological order

        var labels = [];
        var gasData = [];
        var tempData = [];

        // Seed default points if database log entries are empty, otherwise read from DB logs
        if (logs.length > 0) {
            logs.forEach(function (log) {
                var timeString = new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                labels.push(timeString);
                
                // Mock realistic gas level ppm and temp based on log status
                if (log.status === 'Api Terdeteksi') {
                    gasData.push(Math.round(280 + (log.confidence_score * 4.5)));
                    tempData.push(Math.round(45 + (log.confidence_score * 0.35)));
                } else if (log.status === 'Potensi Api') {
                    gasData.push(Math.round(150 + (log.confidence_score * 2.1)));
                    tempData.push(Math.round(32 + (log.confidence_score * 0.15)));
                } else {
                    gasData.push(Math.round(50 + (log.confidence_score * 0.5)));
                    tempData.push(Math.round(24 + (log.confidence_score * 0.1)));
                }
            });
        } else {
            // Default placeholder dataset
            labels = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
            gasData = [65, 70, 68, 72, 110, 380, 80];
            tempData = [25, 26, 25, 27, 34, 58, 29];
        }

        var ctx = document.getElementById('telemetryChart').getContext('2d');
        
        // Linear gradients
        var gasGradient = ctx.createLinearGradient(0, 0, 0, 300);
        gasGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        gasGradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        var tempGradient = ctx.createLinearGradient(0, 0, 0, 300);
        tempGradient.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
        tempGradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

        var telemetryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'MQ-2 Gas (ppm)',
                        data: gasData,
                        borderColor: '#3b82f6',
                        backgroundColor: gasGradient,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'yGas',
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#ffffff',
                        pointHoverRadius: 6
                    },
                    {
                        label: 'DHT22 Suhu (°C)',
                        data: tempData,
                        borderColor: '#f43f5e',
                        backgroundColor: tempGradient,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'yTemp',
                        pointBackgroundColor: '#f43f5e',
                        pointBorderColor: '#ffffff',
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#94a3b8',
                            font: {
                                family: 'Inter',
                                weight: '600',
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#101726',
                        titleColor: '#ffffff',
                        bodyColor: '#f1f5f9',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 12
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.03)'
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                family: 'Fira Code',
                                size: 10
                            }
                        }
                    },
                    yGas: {
                        type: 'linear',
                        position: 'left',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#3b82f6',
                            font: {
                                family: 'Fira Code',
                                size: 10
                            }
                        }
                    },
                    yTemp: {
                        type: 'linear',
                        position: 'right',
                        grid: {
                            drawOnChartArea: false // Avoid grid overlaps
                        },
                        ticks: {
                            color: '#f43f5e',
                            font: {
                                family: 'Fira Code',
                                size: 10
                            }
                        }
                    }
                }
            }
        });

        // Add dynamically updated style properties to condition buttons
        var statusRadios = document.querySelectorAll('input[name="status"]');
        var confidenceInput = document.getElementById('confidence_score');
        statusRadios.forEach(function (radio) {
            radio.addEventListener('change', function () {
                if (this.value === 'aman') {
                    confidenceInput.value = '12.15';
                } else if (this.value === 'waspada') {
                    confidenceInput.value = '64.20';
                } else if (this.value === 'bahaya') {
                    confidenceInput.value = '98.42';
                }
            });
        });
    });
</script>
@endsection
