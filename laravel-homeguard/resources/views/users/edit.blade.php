@extends('layouts.app')

@section('title', 'Ubah Profil Anggota')

@section('content')
<div class="container pb-5">
    <div class="mb-4">
        <a href="{{ route('users.index') }}" class="btn btn-sm btn-outline-light border-secondary rounded-3 d-inline-flex align-items-center gap-2 mb-3">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali ke Anggota</span>
        </a>
        <h1 class="h2 display-font mb-1 text-white">Ubah Profil Anggota</h1>
        <p class="text-muted text-sm">Perbarui kredensial atau hak akses untuk anggota tim AleraSight HomeGuard.</p>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card card-custom">
                <form action="{{ route('users.update', $user->id) }}" method="POST" class="needs-validation" novalidate>
                    @csrf
                    @method('PUT')
                    
                    <div class="row g-4">
                        <div class="col-md-6">
                            <label for="name" class="form-label text-white-50 fw-semibold">Nama Lengkap</label>
                            <input type="text" name="name" id="name" class="form-control form-control-custom @error('name') is-invalid @enderror" value="{{ old('name', $user->name) }}" required>
                            @error('name')
                                <div class="invalid-feedback text-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-md-6">
                            <label for="email" class="form-label text-white-50 fw-semibold">Alamat Email (Login)</label>
                            <input type="email" name="email" id="email" class="form-control form-control-custom @error('email') is-invalid @enderror" value="{{ old('email', $user->email) }}" required>
                            @error('email')
                                <div class="invalid-feedback text-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-md-6">
                            <label for="phone" class="form-label text-white-50 fw-semibold">Nomor Telepon</label>
                            <input type="text" name="phone" id="phone" class="form-control form-control-custom @error('phone') is-invalid @enderror" value="{{ old('phone', $user->phone) }}">
                            @error('phone')
                                <div class="invalid-feedback text-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-md-6">
                            <label for="role" class="form-label text-white-50 fw-semibold">Hak Akses / Role</label>
                            <select name="role" id="role" class="form-select form-control-custom @error('role') is-invalid @enderror" required>
                                <option value="operator" {{ old('role', $user->role) === 'operator' ? 'selected' : '' }}>Operator</option>
                                <option value="admin" {{ old('role', $user->role) === 'admin' ? 'selected' : '' }}>Administrator</option>
                            </select>
                            @error('role')
                                <div class="invalid-feedback text-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-12 border-top border-secondary border-opacity-10 mt-4 pt-4">
                            <h5 class="text-white mb-2 display-font">Ubah Kata Sandi (Opsional)</h5>
                            <p class="text-muted text-xs mb-3">Biarkan kosong jika Anda tidak ingin mengganti kata sandi anggota ini.</p>
                        </div>

                        <div class="col-md-6">
                            <label for="password" class="form-label text-white-50 fw-semibold">Kata Sandi Baru</label>
                            <input type="password" name="password" id="password" class="form-control form-control-custom @error('password') is-invalid @enderror" placeholder="Minimal 6 karakter">
                            @error('password')
                                <div class="invalid-feedback text-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-md-6">
                            <label for="password_confirmation" class="form-label text-white-50 fw-semibold">Konfirmasi Kata Sandi Baru</label>
                            <input type="password" name="password_confirmation" id="password_confirmation" class="form-control form-control-custom" placeholder="Ketik ulang kata sandi baru">
                        </div>

                        <div class="col-12 mt-4 pt-2 border-top border-secondary border-opacity-10 d-flex justify-content-end gap-3">
                            <a href="{{ route('users.index') }}" class="btn btn-custom btn-outline-light border-secondary">Batal</a>
                            <button type="submit" class="btn btn-custom btn-accent d-flex align-items-center gap-2">
                                <i data-lucide="check" class="w-4 h-4"></i>
                                <span>Simpan Perubahan</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-lg-4 mt-4 mt-lg-0">
            <div class="card card-custom h-100 bg-secondary bg-opacity-5">
                <div class="card-body">
                    <div class="p-3 rounded-4 bg-warning bg-opacity-10 text-warning d-inline-block mb-3">
                        <i data-lucide="alert-triangle" class="w-6 h-6"></i>
                    </div>
                    <h5 class="text-white mb-2 font-bold display-font">Perlindungan Akun</h5>
                    <p class="text-white-50 text-sm mb-4 leading-relaxed" style="font-size: 13px;">
                        Mempromosikan operator menjadi admin memberikan akses penuh terhadap konfigurasi model deteksi SHT20 dan YOLO.
                    </p>
                    <p class="text-white-50 text-sm leading-relaxed" style="font-size: 13px;">
                        Jika Anda mengedit profil Anda sendiri, mohon berhati-hati agar tidak menonaktifkan hak akses admin Anda sendiri secara tidak sengaja.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
