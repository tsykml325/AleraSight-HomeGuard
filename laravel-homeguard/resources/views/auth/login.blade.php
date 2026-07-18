<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AleraSight HomeGuard - Masuk Aplikasi</title>
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #090d16;
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }

        .login-card {
            background-color: #101726;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 28px;
            padding: 48px;
            width: 100%;
            max-width: 480px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
        }

        .login-brand {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: 24px;
            letter-spacing: -0.02em;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 8px;
        }

        .login-brand i {
            color: #f43f5e;
        }

        .form-control-custom {
            background-color: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            color: #ffffff !important;
            padding: 14px 20px;
        }

        .form-control-custom:focus {
            background-color: rgba(255, 255, 255, 0.06);
            border-color: #3b82f6;
            box-shadow: none;
        }

        .btn-custom {
            border-radius: 14px;
            font-weight: 700;
            padding: 14px 20px;
            background-color: #f43f5e;
            color: white;
            border: none;
            width: 100%;
            transition: all 0.2s ease;
        }

        .btn-custom:hover {
            background-color: #e11d48;
        }
    </style>
</head>
<body>

    <div class="login-card">
        <div class="text-center mb-5">
            <div class="login-brand">
                <i data-lucide="shield-alert" class="w-8 h-8"></i>
                <span>ALERASIGHT</span>
            </div>
            <p class="text-secondary text-uppercase fw-bold text-xs" style="font-size: 11px; letter-spacing: 0.1em;">Smart Fire Monitoring Platform</p>
        </div>

        @if(session('error'))
            <div class="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-4 p-3 mb-4 text-center">
                {{ session('error') }}
            </div>
        @endif

        <form action="{{ route('login') }}" method="POST">
            @csrf
            
            <div class="mb-4">
                <label for="email" class="form-label text-white-50 small fw-semibold">Alamat Email</label>
                <input type="email" name="email" id="email" class="form-control form-control-custom" placeholder="admin@homeguard.com atau operator@homeguard.com" value="{{ old('email') }}" required autofocus>
                @error('email')
                    <div class="text-danger small mt-2 fw-semibold">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-5">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label for="password" class="form-label text-white-50 small fw-semibold m-0">Password Keamanan</label>
                </div>
                <input type="password" name="password" id="password" class="form-control form-control-custom" placeholder="Masukkan password Anda" required>
                @error('password')
                    <div class="text-danger small mt-2 fw-semibold">{{ $message }}</div>
                @enderror
            </div>

            <button type="submit" class="btn btn-custom mb-4">Masuk ke Sistem</button>
        </form>

        <div class="border-top border-secondary border-opacity-10 pt-4 text-center">
            <div class="text-white-50 small mb-2 fw-bold uppercase">Panduan Akun Demo:</div>
            <div class="p-3 rounded-4 bg-secondary bg-opacity-10 text-start" style="font-size: 11px;">
                <div class="d-flex justify-content-between mb-1">
                    <span class="text-info">Administrator:</span>
                    <span class="text-light fw-bold">admin@homeguard.com</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-warning">Operator:</span>
                    <span class="text-light fw-bold">operator@homeguard.com</span>
                </div>
                <div class="text-center text-white-50 border-top border-secondary border-opacity-10 pt-2">
                    Password Bawaan: <span class="text-success fw-bold">password123</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>
