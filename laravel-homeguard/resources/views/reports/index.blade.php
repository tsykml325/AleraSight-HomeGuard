@extends('layouts.app')

@section('title', 'Laporan & Log Audit Kebakaran')

@section('content')
<div class="row g-4 align-items-center mb-5">
    <div class="col-sm-6">
        <h1 class="display-5 text-white mb-1">Laporan & Analisis</h1>
        <p class="text-secondary m-0">Rekapitulasi riwayat penanganan alarm, durasi kebakaran, dan validasi Telegram.</p>
    </div>
</div>

<!-- Laporan Analytics summary blocks -->
<div class="row g-4 mb-5">
    <div class="col-md-4">
        <div class="card-custom">
            <p class="text-secondary text-uppercase small fw-bold mb-1">Total Alarm Terdeteksi</p>
            <h3 class="display-font text-white mb-0">{{ $totalAlarms }} Kejadian</h3>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card-custom">
            <p class="text-secondary text-uppercase small fw-bold mb-1">Rerata Confidence AI Vision</p>
            <h3 class="display-font text-info mb-0">{{ number_format($avgConfidence, 2) }}%</h3>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card-custom">
            <p class="text-secondary text-uppercase small fw-bold mb-1">Total Durasi Alarm Aktif</p>
            <h3 class="display-font text-warning mb-0">{{ number_format($totalDuration) }} detik</h3>
        </div>
    </div>
</div>

<div class="card-custom">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="text-white m-0">Riwayat Kejadian Komprehensif</h4>
        <button onclick="window.print()" class="btn btn-sm btn-outline-secondary border-secondary border-opacity-20 text-white d-inline-flex align-items-center gap-1.5 py-1.5 px-3 rounded-pill" style="font-size: 12px;">
            <i data-lucide="printer" class="w-4 h-4"></i>
            <span>Cetak Laporan</span>
        </button>
    </div>

    <div class="table-responsive">
        <table class="table table-dark table-hover border-secondary border-opacity-10 align-middle m-0">
            <thead>
                <tr class="text-secondary" style="font-size: 12px;">
                    <th class="border-secondary border-opacity-10 py-3">WAKTU DETEKSI</th>
                    <th class="border-secondary border-opacity-10 py-3">NAMA PERANGKAT</th>
                    <th class="border-secondary border-opacity-10 py-3">STATUS API</th>
                    <th class="border-secondary border-opacity-10 py-3">CONFIDENCE AI</th>
                    <th class="border-secondary border-opacity-10 py-3 text-center">SNAPSHOT</th>
                    <th class="border-secondary border-opacity-10 py-3 text-center">SUMBER ALARM</th>
                    <th class="border-secondary border-opacity-10 py-3 text-center">DURASI ALARM</th>
                    <th class="border-secondary border-opacity-10 py-3">NOTIFIKASI TELEGRAM</th>
                </tr>
            </thead>
            <tbody style="font-size: 13px;">
                @forelse($reports as $rep)
                <tr>
                    <td class="border-secondary border-opacity-10 py-3 text-secondary code-font">
                        {{ $rep->created_at->format('d/m/Y H:i:s') }}
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 fw-bold text-light">
                        {{ $rep->device->name }}
                    </td>
                    <td class="border-secondary border-opacity-10 py-3">
                        @if($rep->status === 'Api Terdeteksi')
                            <span class="badge bg-danger text-white py-1 px-2 rounded">Api Terdeteksi</span>
                        @elseif($rep->status === 'Potensi Api')
                            <span class="badge bg-warning text-dark py-1 px-2 rounded">Potensi Api</span>
                        @else
                            <span class="badge bg-success text-white py-1 px-2 rounded">Aman</span>
                        @endif
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 code-font fw-bold text-info">
                        {{ number_format($rep->confidence_score, 2) }}%
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 text-center">
                        @if($rep->snapshot_url)
                            <a href="{{ $rep->snapshot_url }}" target="_blank" class="d-inline-block rounded-2 overflow-hidden border border-secondary border-opacity-10" style="width: 44px; height: 32px;">
                                <img src="{{ $rep->snapshot_url }}" style="width: 100%; height: 100%; object-fit: cover;">
                            </a>
                        @else
                            <span class="text-secondary small">N/A</span>
                        @endif
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 text-center">
                        <span class="badge bg-secondary bg-opacity-15 text-light text-uppercase font-mono" style="font-size: 10px;">
                            {{ str_replace('_', ' ', $rep->alarm_source) }}
                        </span>
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 text-center code-font">
                        {{ $rep->alarm_duration }} dtk
                    </td>
                    <td class="border-secondary border-opacity-10 py-3">
                        @if($rep->telegram_notified_at)
                            <span class="text-success code-font">
                                <i data-lucide="check" class="w-4 h-4 me-1 align-middle text-success"></i>
                                Dispatch ({{ $rep->telegram_notified_at->format('H:i:s') }})
                            </span>
                        @else
                            <span class="text-white-50">Terkirim Otomatis</span>
                        @endif
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="8" class="text-center py-5 border-secondary border-opacity-10">
                        <span class="text-secondary">Belum ada riwayat alarm terdaftar.</span>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
