@extends('layouts.app')

@section('title', 'Pengaturan Konfigurasi AI Vision')

@section('content')
<div class="row g-4 align-items-center mb-5">
    <div class="col-sm-6">
        <h1 class="display-5 text-white mb-1">Pengaturan AI Vision</h1>
        <p class="text-secondary m-0">Atur parameter inferensi model CNN, interval penangkapan gambar, dan resolusi kamera.</p>
    </div>
</div>

<div class="row g-4">
    <!-- Configuration Form -->
    <div class="col-lg-8">
        <div class="card-custom">
            <h4 class="text-white mb-4">Parameter Deteksi Cerdas</h4>
            
            <form action="{{ route('settings.update') }}" method="POST">
                @csrf
                
                <div class="mb-4">
                    <label for="ai_threshold" class="form-label text-white-50 small fw-bold">Ambang Batas Deteksi AI (Threshold %)</label>
                    <div class="input-group">
                        <input type="number" step="0.5" name="ai_threshold" id="ai_threshold" class="form-control form-control-custom code-font" value="{{ old('ai_threshold', $config['ai_threshold']) }}" required>
                        <span class="input-group-text bg-secondary bg-opacity-10 border-secondary border-opacity-10 text-white">%</span>
                    </div>
                    <div class="form-text text-secondary mt-2" style="font-size: 11px;">Model AI hanya akan memicu Alarm Kebakaran apabila tingkat keyakinan (Confidence Score) klasifikasi CNN berada di atas persentase ambang batas ini.</div>
                    @error('ai_threshold') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                </div>

                <div class="mb-4">
                    <label for="camera_resolution" class="form-label text-white-50 small fw-bold">Resolusi Stream Kamera CCTV</label>
                    <select name="camera_resolution" id="camera_resolution" class="form-select form-control-custom">
                        <option value="1280x720" {{ old('camera_resolution', $config['camera_resolution']) === '1280x720' ? 'selected' : '' }}>1280 x 720 (720p - Rekomendasi Edge Pi)</option>
                        <option value="1920x1080" {{ old('camera_resolution', $config['camera_resolution']) === '1920x1080' ? 'selected' : '' }}>1920 x 1080 (1080p - High Definition)</option>
                        <option value="2560x1440" {{ old('camera_resolution', $config['camera_resolution']) === '2560x1440' ? 'selected' : '' }}>2560 x 1440 (2K - Ultra Resolution)</option>
                    </select>
                    <div class="form-text text-secondary mt-2" style="font-size: 11px;">Resolusi yang lebih tinggi menghasilkan detail visual yang lebih tajam, namun membutuhkan bandwidth jaringan dan resource inferensi yang lebih besar.</div>
                    @error('camera_resolution') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                </div>

                <div class="mb-4">
                    <label for="snapshot_interval" class="form-label text-white-50 small fw-bold">Interval Snapshot Kamera (Detik)</label>
                    <div class="input-group">
                        <input type="number" name="snapshot_interval" id="snapshot_interval" class="form-control form-control-custom code-font" value="{{ old('snapshot_interval', $config['snapshot_interval']) }}" required>
                        <span class="input-group-text bg-secondary bg-opacity-10 border-secondary border-opacity-10 text-white">detik</span>
                    </div>
                    <div class="form-text text-secondary mt-2" style="font-size: 11px;">Jeda waktu antar penangkapan gambar (frame snapshot) untuk dievaluasi oleh sistem AI Vision di Edge computer.</div>
                    @error('snapshot_interval') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                </div>

                <div class="mb-5">
                    <label for="enable_ai_detection" class="form-label text-white-50 small fw-bold">Status Deteksi AI Vision</label>
                    <select name="enable_ai_detection" id="enable_ai_detection" class="form-select form-control-custom" required>
                        <option value="1" {{ old('enable_ai_detection', $config['enable_ai_detection']) ? 'selected' : '' }}>AKTIF - Jalankan Klasifikasi AI Real-Time</option>
                        <option value="0" {{ !old('enable_ai_detection', $config['enable_ai_detection']) ? 'selected' : '' }}>NON-AKTIF - Hanya gunakan pembacaan sensor fisik</option>
                    </select>
                    @error('enable_ai_detection') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                </div>

                <div class="border-top border-secondary border-opacity-10 pt-4 text-end">
                    <button type="submit" class="btn btn-custom btn-accent d-inline-flex align-items-center gap-2">
                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                        <span>Simpan Konfigurasi</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Informative sidebar card -->
    <div class="col-lg-4">
        <div class="card-custom h-100 flex-column d-flex justify-content-between">
            <div>
                <h5 class="text-white mb-3">Informasi Model Inferensi</h5>
                <div class="p-3 rounded-4 bg-secondary bg-opacity-10 mb-4" style="font-size: 12px;">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-secondary">Arsitektur Model:</span>
                        <span class="text-light fw-bold">CNN (YOLOv8-Nano)</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-secondary">Kelas Deteksi:</span>
                        <span class="text-light fw-bold">[Fire, Smoke, Normal]</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-secondary">Framework:</span>
                        <span class="text-light fw-bold">PyTorch / ONNX Runtime</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span class="text-secondary">Akselerasi HW:</span>
                        <span class="text-light fw-bold">Hailo-8 Edge NPU</span>
                    </div>
                </div>

                <h6 class="text-white mb-2">Saran Konfigurasi</h6>
                <p class="text-secondary small">Untuk meminimalkan false alarm akibat pantulan cahaya atau lampu oranye, direkomendasikan untuk mengatur <strong>Ambang Batas (Threshold) antara 80% hingga 88%</strong>.</p>
            </div>
        </div>
    </div>
</div>
@endsection
