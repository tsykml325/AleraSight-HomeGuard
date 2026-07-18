@extends('layouts.app')

@section('title', 'Tambah Perangkat Baru')

@section('content')
<div class="row g-4 align-items-center mb-5">
    <div class="col-sm-6">
        <h1 class="display-5 text-white mb-1">Tambah Perangkat</h1>
        <p class="text-secondary m-0">Hubungkan simpul sensor IoT dan kamera pemantau baru ke dalam sistem.</p>
    </div>
    <div class="col-sm-6 text-sm-end">
        <a href="{{ route('devices.index') }}" class="btn btn-custom btn-outline-secondary border-secondary border-opacity-20 text-white d-inline-flex align-items-center gap-2">
            <i data-lucide="arrow-left" class="w-5 h-5"></i>
            <span>Kembali</span>
        </a>
    </div>
</div>

<div class="card-custom">
    <form action="{{ route('devices.store') }}" method="POST">
        @csrf
        
        <div class="row g-4">
            <!-- Left inputs panel -->
            <div class="col-md-6">
                <div class="mb-4">
                    <label for="name" class="form-label text-white-50 small fw-bold">Nama Perangkat / Node</label>
                    <input type="text" name="name" id="name" class="form-control form-control-custom" placeholder="Contoh: HomeGuard Node 05 - Rooftop" value="{{ old('name') }}" required>
                    @error('name') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                </div>

                <div class="mb-4">
                    <label for="type" class="form-label text-white-50 small fw-bold">Tipe Perangkat</label>
                    <select name="type" id="type" class="form-select form-control-custom" required>
                        <option value="sensor" {{ old('type') === 'sensor' ? 'selected' : '' }}>Sensor IoT Only</option>
                        <option value="camera" {{ old('type') === 'camera' ? 'selected' : '' }}>Kamera CCTV Only</option>
                        <option value="combo" {{ old('type') === 'combo' ? 'selected' : '' }}>Combo (Sensor + Kamera)</option>
                    </select>
                    @error('type') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <label for="has_camera" class="form-label text-white-50 small fw-bold">Ketersediaan Kamera</label>
                        <select name="has_camera" id="has_camera" class="form-select form-control-custom" required>
                            <option value="1" {{ old('has_camera') == '1' ? 'selected' : '' }}>Ya, Ada</option>
                            <option value="0" {{ old('has_camera') == '0' ? 'selected' : '' }}>Tidak Ada</option>
                        </select>
                    </div>
                    <div class="col-6">
                        <label for="has_raspi" class="form-label text-white-50 small fw-bold">Raspberry Pi (Edge CPU)</label>
                        <select name="has_raspi" id="has_raspi" class="form-select form-control-custom" required>
                            <option value="1" {{ old('has_raspi') == '1' ? 'selected' : '' }}>Ya, Ada</option>
                            <option value="0" {{ old('has_raspi') == '0' ? 'selected' : '' }}>Tidak Ada</option>
                        </select>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="ai_model_version" class="form-label text-white-50 small fw-bold">Versi Model Deteksi AI CNN</label>
                    <input type="text" name="ai_model_version" id="ai_model_version" class="form-control form-control-custom font-mono" placeholder="Contoh: YOLOv8n-Fire_v2.1" value="{{ old('ai_model_version', 'YOLOv8n-Fire_v2.1') }}" required>
                    @error('ai_model_version') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                </div>
            </div>

            <!-- Right inputs panel -->
            <div class="col-md-6">
                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <label for="camera_status" class="form-label text-white-50 small fw-bold">Status Kamera</label>
                        <select name="camera_status" id="camera_status" class="form-select form-control-custom" required>
                            <option value="online" {{ old('camera_status') === 'online' ? 'selected' : '' }}>ONLINE</option>
                            <option value="offline" {{ old('camera_status') === 'offline' ? 'selected' : '' }}>OFFLINE</option>
                            <option value="none" {{ old('camera_status') === 'none' ? 'selected' : '' }}>NONE (Tanpa Kamera)</option>
                        </select>
                    </div>
                    <div class="col-6">
                        <label for="ai_status" class="form-label text-white-50 small fw-bold">Status Deteksi AI</label>
                        <select name="ai_status" id="ai_status" class="form-select form-control-custom" required>
                            <option value="active" {{ old('ai_status') === 'active' ? 'selected' : '' }}>ACTIVE</option>
                            <option value="inactive" {{ old('ai_status') === 'inactive' ? 'selected' : '' }}>INACTIVE</option>
                            <option value="none" {{ old('ai_status') === 'none' ? 'selected' : '' }}>NONE (Tanpa AI)</option>
                        </select>
                    </div>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <label for="location_lat" class="form-label text-white-50 small fw-bold">Koordinat Garis Lintang (Latitude)</label>
                        <input type="number" step="0.000001" name="location_lat" id="location_lat" class="form-control form-control-custom font-mono" placeholder="Contoh: -6.2008" value="{{ old('location_lat', -6.2000) }}" required>
                        @error('location_lat') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                    </div>
                    <div class="col-6">
                        <label for="location_lng" class="form-label text-white-50 small fw-bold">Koordinat Garis Bujur (Longitude)</label>
                        <input type="number" step="0.000001" name="location_lng" id="location_lng" class="form-control form-control-custom font-mono" placeholder="Contoh: 106.8166" value="{{ old('location_lng', 106.8166) }}" required>
                        @error('location_lng') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                    </div>
                </div>

                <div class="mb-4">
                    <label for="status" class="form-label text-white-50 small fw-bold">Status Awal Api (IoT / API Status)</label>
                    <select name="status" id="status" class="form-select form-control-custom" required>
                        <option value="aman" {{ old('status') === 'aman' ? 'selected' : '' }}>AMAN (Tidak Terdeteksi)</option>
                        <option value="waspada" {{ old('status') === 'waspada' ? 'selected' : '' }}>WASPADA (Potensi Api)</option>
                        <option value="bahaya" {{ old('status') === 'bahaya' ? 'selected' : '' }}>BAHAYA (Api Terdeteksi)</option>
                    </select>
                    @error('status') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                </div>
            </div>
        </div>

        <div class="mt-5 border-top border-secondary border-opacity-10 pt-4 text-end">
            <button type="submit" class="btn btn-custom btn-accent d-inline-flex align-items-center gap-2">
                <i data-lucide="check-circle" class="w-5 h-5"></i>
                <span>Simpan Perangkat</span>
            </button>
        </div>
    </form>
</div>
@endsection
