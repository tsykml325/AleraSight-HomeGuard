<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AleraSight HomeGuard - @yield('title')</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts: Space Grotesk & Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <style>
        :root {
            --font-sans: 'Inter', sans-serif;
            --font-display: 'Space Grotesk', sans-serif;
            --font-mono: 'Fira Code', monospace;
            --color-bg: #090d16;
            --color-surface: #101726;
            --color-surface-hover: #192235;
            --color-accent: #f43f5e;
            --color-primary: #3b82f6;
        }

        body {
            font-family: var(--font-sans);
            background-color: var(--color-bg);
            color: #f1f5f9;
            overflow-x: hidden;
            letter-spacing: -0.01em;
        }

        h1, h2, h3, h4, h5, .display-font {
            font-family: var(--font-display);
            font-weight: 700;
        }

        .code-font {
            font-family: var(--font-mono);
        }

        /* Sidebar Styling */
        .sidebar {
            background-color: var(--color-surface);
            border-right: 1px solid rgba(255, 255, 255, 0.05);
            min-height: 100vh;
            width: 280px;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 100;
            transition: all 0.3s ease;
        }

        .sidebar-brand {
            padding: 24px;
            font-size: 20px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.02em;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sidebar-brand i {
            color: var(--color-accent);
        }

        .nav-menu {
            padding: 16px;
        }

        .nav-item-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            color: #94a3b8;
            font-weight: 600;
            font-size: 14px;
            border-radius: 12px;
            text-decoration: none;
            margin-bottom: 4px;
            transition: all 0.2s ease;
        }

        .nav-item-link:hover, .nav-item-link.active {
            color: #ffffff;
            background-color: var(--color-surface-hover);
        }

        .nav-item-link.active i {
            color: var(--color-accent);
        }

        /* Main Content wrapper */
        .main-wrapper {
            margin-left: 280px;
            padding: 40px;
            min-height: 100vh;
            transition: all 0.3s ease;
        }

        /* Card stylings */
        .card-custom {
            background-color: var(--color-surface);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
        }

        /* Inputs */
        .form-control-custom {
            background-color: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            color: #ffffff !important;
            padding: 12px 16px;
        }

        .form-control-custom:focus {
            background-color: rgba(255, 255, 255, 0.05);
            border-color: var(--color-primary);
            box-shadow: none;
        }

        /* Buttons */
        .btn-custom {
            border-radius: 12px;
            font-weight: 700;
            padding: 10px 20px;
            transition: all 0.2s ease;
        }

        .btn-accent {
            background-color: var(--color-accent);
            color: white;
            border: none;
        }

        .btn-accent:hover {
            background-color: #e11d48;
        }

        /* Top Bar Profile info */
        .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
        }

        @media (max-width: 991.98px) {
            .sidebar {
                transform: translateX(-100%);
            }
            .sidebar.show {
                transform: translateX(0);
            }
            .main-wrapper {
                margin-left: 0;
                padding: 20px;
            }
        }
    </style>
</head>
<body>

    <!-- Sidebar Navigation -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
            <i data-lucide="shield-alert" class="w-6 h-6"></i>
            <span>ALERASIGHT</span>
        </div>
        
        <div class="nav-menu">
            <a href="{{ route('dashboard') }}" class="nav-item-link {{ Request::routeIs('dashboard') ? 'active' : '' }}">
                <i data-lucide="layout-dashboard"></i>
                <span>Dashboard</span>
            </a>
            
            <a href="{{ route('devices.index') }}" class="nav-item-link {{ Request::routeIs('devices.*') ? 'active' : '' }}">
                <i data-lucide="cpu"></i>
                <span>Data Perangkat</span>
            </a>
            
            <a href="{{ route('fire-detections.index') }}" class="nav-item-link {{ Request::routeIs('fire-detections.*') ? 'active' : '' }}">
                <i data-lucide="flame"></i>
                <span>Raw Data Deteksi</span>
            </a>
            
            <a href="{{ route('reports.index') }}" class="nav-item-link {{ Request::routeIs('reports.*') ? 'active' : '' }}">
                <i data-lucide="file-text"></i>
                <span>Laporan & Log</span>
            </a>

            @if(Auth::user()->isAdmin())
            <a href="{{ route('settings.index') }}" class="nav-item-link {{ Request::routeIs('settings.*') ? 'active' : '' }}">
                <i data-lucide="settings"></i>
                <span>Pengaturan AI</span>
            </a>
            <a href="{{ route('users.index') }}" class="nav-item-link {{ Request::routeIs('users.*') ? 'active' : '' }}">
                <i data-lucide="users"></i>
                <span>Kelola Anggota</span>
            </a>
            @endif

            <hr class="my-4 border-secondary opacity-25">

            <div class="px-3 py-2 text-xs text-secondary text-uppercase fw-bold">Hak Akses</div>
            <div class="nav-item-link text-white-50">
                <i data-lucide="user-check" class="text-success"></i>
                <span>{{ strtoupper(Auth::user()->role) }}</span>
            </div>

            <form action="{{ route('logout') }}" method="POST" class="mt-4">
                @csrf
                <button type="submit" class="nav-item-link text-danger bg-transparent border-0 w-full text-start">
                    <i data-lucide="log-out"></i>
                    <span>Keluar Aplikasi</span>
                </button>
            </form>
        </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-wrapper">
        <!-- Top bar layout -->
        <div class="topbar">
            <div>
                <button class="btn d-lg-none text-white border-0" id="sidebarToggle">
                    <i data-lucide="menu"></i>
                </button>
            </div>
            <div class="d-flex align-items-center gap-3">
                <div class="text-end d-none d-sm-block">
                    <div class="fw-bold">{{ Auth::user()->name }}</div>
                    <div class="text-muted text-uppercase text-xs" style="font-size: 11px;">{{ Auth::user()->role }}</div>
                </div>
                <div class="p-2 bg-secondary bg-opacity-20 rounded-circle text-white">
                    <i data-lucide="user" class="w-5 h-5"></i>
                </div>
            </div>
        </div>

        <!-- Success and Error Flash alerts -->
        @if(session('success'))
            <div class="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-4 p-3 mb-4 d-flex align-items-center gap-2">
                <i data-lucide="check-circle" class="w-5 h-5"></i>
                <span>{{ session('success') }}</span>
            </div>
        @endif

        @if(session('error'))
            <div class="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-4 p-3 mb-4 d-flex align-items-center gap-2">
                <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                <span>{{ session('error') }}</span>
            </div>
        @endif

        <!-- Main yield block -->
        @yield('content')
    </div>

    <!-- Bootstrap & Lucide Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Initialize Lucide Icons
        lucide.createIcons();

        // Responsive Sidebar Toggle
        const toggleBtn = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
        }
    </script>
    @yield('scripts')
</body>
</html>
