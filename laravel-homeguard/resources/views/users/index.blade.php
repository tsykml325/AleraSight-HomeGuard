@extends('layouts.app')

@section('title', 'Kelola Anggota Tim')

@section('content')
<div class="container-fluid pb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h1 class="h2 display-font mb-1 text-white">Kelola Anggota Tim</h1>
            <p class="text-muted text-sm mb-0">Daftar pengguna dengan otorisasi Administrator atau Operator sistem AleraSight.</p>
        </div>
        <a href="{{ route('users.create') }}" class="btn btn-custom btn-accent d-flex align-items-center gap-2 shadow-sm">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            <span>Daftar Anggota Baru</span>
        </a>
    </div>

    <!-- Users Table Card -->
    <div class="card card-custom">
        <div class="table-responsive">
            <table class="table table-dark table-hover align-middle mb-0" style="--bs-table-bg: transparent; --bs-table-border-color: rgba(255, 255, 255, 0.05);">
                <thead>
                    <tr class="text-secondary uppercase text-xs font-bold" style="font-size: 11px; letter-spacing: 0.05em;">
                        <th class="py-3" style="width: 80px;">ID</th>
                        <th class="py-3">NAMA LENGKAP</th>
                        <th class="py-3">EMAIL</th>
                        <th class="py-3">TELEPON</th>
                        <th class="py-3" style="width: 150px;">ROLE / HAK AKSES</th>
                        <th class="py-3" style="width: 120px; text-align: right;">AKSI</th>
                    </tr>
                </thead>
                <tbody class="text-white-50">
                    @foreach($users as $user)
                    <tr>
                        <td class="py-3 code-font text-white fw-bold">USR{{ str_pad($user->id, 3, '0', STR_PAD_LEFT) }}</td>
                        <td class="py-3">
                            <div class="d-flex align-items-center gap-3">
                                <div class="p-2 rounded-circle bg-secondary bg-opacity-10 text-white flex-shrink-0">
                                    <i data-lucide="user" class="w-4 h-4"></i>
                                </div>
                                <div>
                                    <span class="text-white fw-semibold d-block">{{ $user->name }}</span>
                                    <span class="text-muted text-xs d-block" style="font-size: 11px;">Mendaftar: {{ $user->created_at->format('d M Y') }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-3">
                            <span class="code-font text-info">{{ $user->email }}</span>
                        </td>
                        <td class="py-3">
                            <span>{{ $user->phone ?? '-' }}</span>
                        </td>
                        <td class="py-3">
                            @if($user->isAdmin())
                            <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20 rounded-pill px-3 py-1.5 text-uppercase fw-bold text-xs">
                                <i data-lucide="shield" class="w-3.5 h-3.5 me-1 d-inline-block"></i> Admin
                            </span>
                            @else
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 rounded-pill px-3 py-1.5 text-uppercase fw-bold text-xs">
                                <i data-lucide="user-check" class="w-3.5 h-3.5 me-1 d-inline-block"></i> Operator
                            </span>
                            @endif
                        </td>
                        <td class="py-3 text-end">
                            <div class="d-flex justify-content-end gap-2">
                                <a href="{{ route('users.edit', $user->id) }}" class="btn btn-sm btn-outline-light border-secondary rounded-3 p-2" title="Edit Profil">
                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                </a>
                                @if(auth()->id() !== $user->id)
                                <form action="{{ route('users.destroy', $user->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus anggota tim ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-outline-danger border-danger border-opacity-25 rounded-3 p-2" title="Hapus Anggota">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
