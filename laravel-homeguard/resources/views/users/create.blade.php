@extends('layouts.app')

@section('title', 'Daftar Anggota Baru')

@section('content')
<div class="container pb-5">
    <div class="mb-4">
        <a href="{{ route('users.index') }}" class="btn btn-sm btn-outline-light border-secondary rounded-3 d-inline-flex align-items-center gap-2 mb-3">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali ke Anggota</span>
        </a>
        <h1 class="h2 display-font mb-1 text-white">Daftar Anggota Baru</h1>
        <p class="text-muted text-sm">Daftarkan operator atau administrator baru untuk mengelola stasiun HomeGuard AleraSight.</p>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card card-custom">
                <form action="{{ route('users.store') }}" method="POST" class="needs-validation" novalidate>
                    @csrf
                    
                    <div class="row g-4">
                        <div class="col-md-6">
                            <label for="name" class="form-label text-white-50 fw-semibold">Nama Lengkap</label>
                            <input type="text" name="name" id="name" class="form-control form-control-custom @error('name') is-invalid @enderror" value="{{ old('name') }}" placeholder="Contoh: Budi Santoso" required>
                            @error('name')
                                <div class="invalid-feedback text-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-md-6">
                            <label for="email" class="form-label text-white-50 fw-semibold">Alamat Email (Login)</label>
                            <input type="email" name="email" id="email" class="form-control form-control-custom @error('email') is-invalid @enderror" value="{{ old('email') }}" placeholder="Contoh: budi@homeguard.com" required>
                            @error('email')
                                <div class="invalid-feedback text-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-md-6">
                            <label for="phone" class="form-label text-white-50 fw-semibold">Nomor Telepon (Telegram/WhatsApp)</label>
                            <input type="text" name="phone" id="phone" class="form-control form-control-custom @error('phone') is-invalid @enderror" value="{{ old('phone') }}" placeholder="Contoh: +628123456789">
                            @error('phone')
                                <div class="invalid-feedback text-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-md-6">
                            <label for="role" class="form-label text-white-50 fw-semibold">Hak Akses / Role</label>
                            <select name="role" id="role" class="form-select form-control-custom @error('role') is-invalid @enderror" required>
                                <option value="operator" {{ old('role') === 'operator' ? 'selected' : '' }}>Operator (Hanya Pelihat & Pemantau)</option>
                                <option value="admin" {{ old('role') === 'admin' ? 'selected' : '' }}>Administrator (Akses Penuh CRUD & Pengaturan)</option>
                            </select>
                            @error('role')
                                <div class="invalid-feedback text-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-md-6">
                            <label for="password" class="form-label text-white-50 fw-semibold">Kata Sandi</label>
                            <input type="password" name="password" id="password" class="form-control form-control-custom @error('password') is-invalid @enderror" placeholder="Minimal 6 karakter" required>
                            @error('password')
                                <div class="invalid-feedback text-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-md-6">
                            <label for="password_confirmation" class="form-label text-white-50 fw-semibold">Konfirmasi Kata Sandi</label>
                            <input type="password" name="password_confirmation" id="password_confirmation" class="form-control form-control-custom" placeholder="Ketik ulang kata sandi" required>
                        </div>

                        <div class="col-12 mt-4 pt-2 border-top border-secondary border-opacity-10 d-flex justify-content-end gap-3">
                            <a href="{{ route('users.index') }}" class="btn btn-custom btn-outline-light border-secondary">Batal</a>
                            <button type="submit" class="btn btn-custom btn-accent d-flex align-items-center gap-2">
                                <i data-lucide="check" class="w-4 h-4"></i>
                                <span>Simpan Anggota</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-lg-4 mt-4 mt-lg-0">
            <div class="card card-custom h-100 bg-secondary bg-opacity-5">
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <div class="p-3 rounded-4 bg-primary bg-opacity-10 text-primary d-inline-block mb-3">
                            <i data-lucide="info" class="w-6 h-6"></i>
                        </div>
                        <h5 class="text-white mb-2 font-bold display-font">Otorisasi Tim AleraSight</h5>
                        <p class="text-white-50 text-sm mb-4 leading-relaxed" style="font-size: 13px;">
                            Pastikan Anda mendaftarkan personil dengan role yang tepat.
                        </p>
                        <div class="space-y-3">
                            <div class="mb-3">
                                <span class="badge bg-danger bg-opacity-10 text-danger text-xs text-uppercase mb-1">Administrator</span>
                                <p class="text-muted text-xs mb-0" style="font-size: 11px;">Mempunyai otorisasi penuh untuk menambah, mengedit, dan menghapus perangkat IoT, mendaftarkan akun tim baru, mengaktifkan simulasi, serta merubah parameter kalibrasi AI.</p>
                            </div>
                            <div>
                                <span class="badge bg-primary bg-opacity-10 text-primary text-xs text-uppercase mb-1">Operator</span>
                                <p class="text-muted text-xs mb-0" style="font-size: 11px;">Hanya berwenang untuk mengamati status stasiun sensor real-time, mendeteksi kebakaran dari panel GIS, mendownload file laporan CSV, dan memonitor data raw log.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
