@extends('layouts.app')

@section('title', 'Raw Data Deteksi Api')

@section('content')
<div class="row g-4 align-items-center mb-5">
    <div class="col-sm-6">
        <h1 class="display-5 text-white mb-1">Raw Data Deteksi</h1>
        <p class="text-secondary m-0">Riwayat mentah klasifikasi visual, confidence level, dan status mitigasi AI Vision.</p>
    </div>
</div>

<!-- Filter Panel -->
<div class="card-custom mb-5">
    <form action="{{ route('fire-detections.index') }}" method="GET" class="row g-3">
        <div class="col-md-3">
            <label for="device_id" class="form-label text-white-50 small fw-bold">Pilih Perangkat</label>
            <select name="device_id" id="device_id" class="form-select form-control-custom">
                <option value="">Semua Perangkat</option>
                @foreach($devices as $dev)
                    <option value="{{ $dev->id }}" {{ request('device_id') == $dev->id ? 'selected' : '' }}>{{ $dev->name }}</option>
                @endforeach
            </select>
        </div>

        <div class="col-md-3">
            <label for="status" class="form-label text-white-50 small fw-bold">Status Deteksi</label>
            <select name="status" id="status" class="form-select form-control-custom">
                <option value="">Semua Status</option>
                <option value="Tidak Terdeteksi" {{ request('status') === 'Tidak Terdeteksi' ? 'selected' : '' }}>Tidak Terdeteksi (Aman)</option>
                <option value="Potensi Api" {{ request('status') === 'Potensi Api' ? 'selected' : '' }}>Potensi Api</option>
                <option value="Api Terdeteksi" {{ request('status') === 'Api Terdeteksi' ? 'selected' : '' }}>Api Terdeteksi</option>
            </select>
        </div>

        <div class="col-md-3">
            <label for="alarm_source" class="form-label text-white-50 small fw-bold">Sumber Alarm</label>
            <select name="alarm_source" id="alarm_source" class="form-select form-control-custom">
                <option value="">Semua Sumber</option>
                <option value="sensor" {{ request('alarm_source') === 'sensor' ? 'selected' : '' }}>Sensor IoT Only</option>
                <option value="ai_vision" {{ request('alarm_source') === 'ai_vision' ? 'selected' : '' }}>AI Vision Only</option>
                <option value="combination" {{ request('alarm_source') === 'combination' ? 'selected' : '' }}>IoT + AI Vision (Kombinasi)</option>
            </select>
        </div>

        <div class="col-md-3 d-flex align-items-end">
            <button type="submit" class="btn btn-custom btn-accent w-100 d-flex align-items-center justify-content-center gap-2">
                <i data-lucide="filter" class="w-4 h-4"></i>
                <span>Terapkan Filter</span>
            </button>
        </div>
    </form>
</div>

<!-- Raw Logs List -->
<div class="row g-4">
    @forelse($logs as $log)
    <div class="col-xl-3 col-md-6">
        <div class="card-custom h-100 flex-column d-flex justify-content-between p-3">
            <div>
                <!-- Top Header Info -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="badge bg-secondary bg-opacity-20 text-white-50 code-font" style="font-size: 10px;">ID: #FL-{{ $log->id }}</span>
                    <span class="badge bg-dark text-light border border-secondary border-opacity-10 code-font" style="font-size: 10px;">{{ $log->ai_status }}</span>
                </div>

                <!-- Snapshot Image -->
                <div class="rounded-3 overflow-hidden mb-3 bg-black border border-secondary border-opacity-10" style="height: 140px;">
                    @if($log->snapshot_url)
                        <img src="{{ $log->snapshot_url }}" alt="Camera Snapshot" class="w-100 h-100 object-fit-cover">
                    @else
                        <div class="d-flex flex-column align-items-center justify-content-center h-100 text-secondary code-font text-center p-3" style="font-size: 11px;">
                            <i data-lucide="image-off" class="w-6 h-6 mb-1 text-muted"></i>
                            NO CAMERA SNAPSHOT
                        </div>
                    @endif
                </div>

                <h6 class="text-white fw-bold display-font mb-2 truncate-2">{{ $log->device->name }}</h6>

                <div class="space-y-2 text-[12px] font-bold" style="font-size: 11.5px;">
                    <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-1.5 mb-1.5">
                        <span class="text-secondary">Status Api:</span>
                        @if($log->status === 'Api Terdeteksi')
                            <span class="badge bg-danger text-white px-2 py-0.5 rounded text-xs">Api Terdeteksi</span>
                        @elseif($log->status === 'Potensi Api')
                            <span class="badge bg-warning text-dark px-2 py-0.5 rounded text-xs">Potensi Api</span>
                        @else
                            <span class="badge bg-success text-white px-2 py-0.5 rounded text-xs">Aman</span>
                        @endif
                    </div>

                    <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-1.5 mb-1.5">
                        <span class="text-secondary">Confidence Score:</span>
                        <span class="fw-bold code-font text-light">{{ number_format($log->confidence_score, 2) }}%</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-1.5 mb-1.5">
                        <span class="text-secondary">Sumber Alarm:</span>
                        <span class="text-white text-uppercase" style="font-size: 10px;">{{ str_replace('_', ' ', $log->alarm_source) }}</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-secondary">Durasi Alarm:</span>
                        <span class="text-white code-font">{{ $log->alarm_duration }} detik</span>
                    </div>
                </div>
            </div>

            <div class="border-top border-secondary border-opacity-10 pt-2 mt-3 text-secondary text-center code-font" style="font-size: 10px;">
                <i data-lucide="clock" class="w-3 h-3 me-1 align-middle"></i>
                {{ $log->created_at->format('d M Y, H:i:s') }}
            </div>
        </div>
    </div>
    @empty
    <div class="col-12 text-center py-5">
        <div class="p-5 rounded-4 bg-secondary bg-opacity-5">
            <i data-lucide="database-zap" class="w-12 h-12 text-muted mb-3"></i>
            <h5 class="text-white">Tidak ada data raw log deteksi</h5>
            <p class="text-secondary m-0">Sesuaikan filter atau simulasikan alarm deteksi baru.</p>
        </div>
    </div>
    @endforelse
</div>

@if($logs->hasPages())
    <div class="mt-5 d-flex justify-content-center">
        {{ $logs->links() }}
    </div>
@endif

@endsection
