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
        <div class="card-custom d-flex justify-content-between align-items-center border-danger border-opacity-10">
            <div>
                <p class="text-secondary text-uppercase small fw-bold mb-1">Status Kebakaran</p>
                <h3 class="display-font {{ $activeFires > 0 ? 'text-danger animate-pulse' : 'text-success' }} mb-0">
                    {{ $activeFires > 0 ? $activeFires . ' Titik Api' : 'Aman' }}
                </h3>
            </div>
            <div class="p-3 rounded-4 {{ $activeFires > 0 ? 'bg-danger text-danger' : 'bg-success bg-opacity-10 text-success' }}">
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
                    <img src="https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=600&auto=format&fit=crop&q=60" alt="Snapshot AI Vision" class="w-100 h-100 object-fit-cover opacity-75">
                    
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
                            <span class="rounded-circle bg-success d-inline-block" style="width: 6px; height: 6px;"></span>
                            CCTV LIVE FEED
                        </span>
                    </div>

                    <div class="position-absolute bottom-3 start-3 end-3 d-flex justify-content-between text-white-50 code-font" style="font-size: 9px;">
                        <span>CAM_02 (DAPUR UTAMA)</span>
                        <span>CONF: {{ $activeFires > 0 ? '98.42%' : '12.15%' }}</span>
                    </div>
                </div>

                <!-- Fire Status & Score Matrix -->
                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <div class="p-3 rounded-4 bg-secondary bg-opacity-10 text-center">
                            <p class="text-secondary small fw-bold mb-1 uppercase text-xs" style="font-size: 10px;">Status Api</p>
                            @if($activeFires > 0)
                                <span class="badge bg-danger text-white py-1.5 px-3 rounded-3 fw-bold uppercase animate-pulse">API TERDETEKSI</span>
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
<script>
    document.addEventListener("DOMContentLoaded", function () {
        // Center of Indonesia / South Jakarta coordinates for demo matching seeder
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
            var snapshotText = 'Safe Zone';
            
            if (device.status === 'bahaya') {
                color = '#f43f5e'; // Red
                statusText = 'Api Terdeteksi';
                score = '98.42%';
                snapshotText = 'Active Fire Flame';
            } else if (device.status === 'waspada') {
                color = '#f59e0b'; // Amber
                statusText = 'Potensi Api';
                score = '64.20%';
                snapshotText = 'Heat Signatures Detected';
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
    });
</script>
@endsection
