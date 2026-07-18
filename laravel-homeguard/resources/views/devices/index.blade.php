@extends('layouts.app')

@section('title', 'Data Master Perangkat')

@section('content')
<div class="row g-4 align-items-center mb-5">
    <div class="col-sm-6">
        <h1 class="display-5 text-white mb-1">Master Perangkat</h1>
        <p class="text-secondary m-0">Pengelolaan modul sensor, kamera CCTV, dan AI Edge computer.</p>
    </div>
    <div class="col-sm-6 text-sm-end">
        @if(Auth::user()->isAdmin())
            <a href="{{ route('devices.create') }}" class="btn btn-custom btn-accent d-inline-flex align-items-center gap-2">
                <i data-lucide="plus" class="w-5 h-5"></i>
                <span>Tambah Perangkat</span>
            </a>
        @else
            <button class="btn btn-custom btn-secondary bg-opacity-10 text-white-50 border-secondary border-opacity-15" disabled>
                <i data-lucide="lock" class="w-4 h-4 me-2"></i>Operator Mode (View Only)
            </button>
        @endif
    </div>
</div>

<div class="card-custom">
    <div class="table-responsive">
        <table class="table table-dark table-hover border-secondary border-opacity-10 align-middle m-0">
            <thead>
                <tr class="text-secondary" style="font-size: 12px;">
                    <th class="border-secondary border-opacity-10 py-3">NAMA PERANGKAT</th>
                    <th class="border-secondary border-opacity-10 py-3 text-center">TIPE</th>
                    <th class="border-secondary border-opacity-10 py-3 text-center">KAMERA</th>
                    <th class="border-secondary border-opacity-10 py-3 text-center">RASPBERRY PI</th>
                    <th class="border-secondary border-opacity-10 py-3 text-center">STATUS KAMERA</th>
                    <th class="border-secondary border-opacity-10 py-3 text-center">STATUS AI</th>
                    <th class="border-secondary border-opacity-10 py-3">VERSI MODEL AI</th>
                    <th class="border-secondary border-opacity-10 py-3">STATUS API</th>
                    <th class="border-secondary border-opacity-10 py-3 text-end">AKSI</th>
                </tr>
            </thead>
            <tbody style="font-size: 13px;">
                @foreach($devices as $device)
                <tr>
                    <td class="border-secondary border-opacity-10 py-3 fw-bold text-light">
                        <div class="d-flex align-items-center gap-2">
                            <div class="p-2 bg-secondary bg-opacity-10 rounded-3 text-info">
                                <i data-lucide="cpu" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <div class="text-white">{{ $device->name }}</div>
                                <div class="text-muted text-xs font-mono" style="font-size: 10px;">LAT: {{ number_format($device->location_lat, 4) }}, LNG: {{ number_format($device->location_lng, 4) }}</div>
                            </div>
                        </div>
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 text-center">
                        <span class="badge bg-secondary bg-opacity-15 text-light text-uppercase font-mono" style="font-size: 10px;">
                            {{ $device->type }}
                        </span>
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 text-center">
                        @if($device->has_camera)
                            <span class="text-success"><i data-lucide="check" class="w-5 h-5 mx-auto"></i></span>
                        @else
                            <span class="text-secondary"><i data-lucide="minus" class="w-5 h-5 mx-auto"></i></span>
                        @endif
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 text-center">
                        @if($device->has_raspi)
                            <span class="text-success"><i data-lucide="check" class="w-5 h-5 mx-auto"></i></span>
                        @else
                            <span class="text-secondary"><i data-lucide="minus" class="w-5 h-5 mx-auto"></i></span>
                        @endif
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 text-center">
                        @if($device->camera_status === 'online')
                            <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 py-1 px-2.5 rounded-pill font-mono" style="font-size: 10px;">ONLINE</span>
                        @elseif($device->camera_status === 'offline')
                            <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20 py-1 px-2.5 rounded-pill font-mono" style="font-size: 10px;">OFFLINE</span>
                        @else
                            <span class="text-secondary font-mono" style="font-size: 11px;">N/A</span>
                        @endif
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 text-center">
                        @if($device->ai_status === 'active')
                            <span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-20 py-1 px-2.5 rounded-pill font-mono" style="font-size: 10px;">ACTIVE</span>
                        @elseif($device->ai_status === 'inactive')
                            <span class="badge bg-secondary bg-opacity-15 text-light border border-secondary border-opacity-20 py-1 px-2.5 rounded-pill font-mono" style="font-size: 10px;">INACTIVE</span>
                        @else
                            <span class="text-secondary font-mono" style="font-size: 11px;">N/A</span>
                        @endif
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 code-font">
                        {{ $device->ai_model_version }}
                    </td>
                    <td class="border-secondary border-opacity-10 py-3">
                        @if($device->status === 'bahaya')
                            <span class="badge bg-danger text-white py-1.5 px-3 rounded-pill code-font uppercase">Bahaya</span>
                        @elseif($device->status === 'waspada')
                            <span class="badge bg-warning text-dark py-1.5 px-3 rounded-pill code-font uppercase">Waspada</span>
                        @else
                            <span class="badge bg-success text-white py-1.5 px-3 rounded-pill code-font uppercase">Aman</span>
                        @endif
                    </td>
                    <td class="border-secondary border-opacity-10 py-3 text-end">
                        @if(Auth::user()->isAdmin())
                            <div class="d-flex justify-content-end gap-2">
                                <a href="{{ route('devices.edit', $device->id) }}" class="btn btn-sm btn-outline-info py-1.5 px-2.5 rounded-3 d-inline-flex align-items-center gap-1">
                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                    <span>Edit</span>
                                </a>
                                <form action="{{ route('devices.destroy', $device->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus perangkat ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-outline-danger py-1.5 px-2.5 rounded-3 d-inline-flex align-items-center gap-1">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        <span>Hapus</span>
                                    </button>
                                </form>
                            </div>
                        @else
                            <span class="text-secondary text-xs italic">View-Only</span>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @if($devices->hasPages())
        <div class="mt-4 border-top border-secondary border-opacity-10 pt-4">
            {{ $devices->links() }}
        </div>
    @endif
</div>
@endsection
