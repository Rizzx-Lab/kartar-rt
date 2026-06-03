<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Karang Taruna Armalo Eluf')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: {
                            50:  '#EEF2FF',
                            100: '#E0E7FF',
                            200: '#C7D2FE',
                            500: '#3B4FA8',
                            600: '#2D3E8F',
                            700: '#1F2E76',
                            800: '#1B2B6B',
                            900: '#111D4A',
                        },
                        gold: {
                            300: '#E8CC7A',
                            400: '#D4B05A',
                            500: '#C9A84C',
                            600: '#B8903A',
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { scroll-behavior: smooth; }
        .nav-link {
            position: relative;
            padding-bottom: 2px;
        }
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: #C9A84C;
            transition: width 0.3s ease;
        }
        .nav-link:hover::after { width: 100%; }
        .nav-link.active::after { width: 100%; }
        .fade-up {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-up.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 40px rgba(27, 43, 107, 0.15);
        }
        .gold-line {
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #C9A84C, #E8CC7A);
            border-radius: 2px;
        }
        .navbar-scrolled {
            background: rgba(27, 43, 107, 0.97) !important;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        @keyframes scrollUp {
            0%   { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        .animate-scroll-up {
            animation: scrollUp 15s linear infinite;
        }
        .animate-scroll-up-slow {
            animation: scrollUp 19s linear infinite;
        }
        .animate-scroll-up-medium {
            animation: scrollUp 17s linear infinite;
        }
        .animate-scroll-up:hover,
        .animate-scroll-up-slow:hover,
        .animate-scroll-up-medium:hover {
            animation-play-state: paused;
        }
    </style>
</head>
<body class="bg-white text-gray-800 font-sans antialiased">

    <!-- Navbar -->
    <nav id="navbar" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-navy-800">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <!-- Logo -->
            <a href="{{ route('home') }}" class="flex items-center gap-3">
                <img src="{{ asset('images/logo.png') }}" alt="Logo" class="w-10 h-10 object-contain">
                <div>
                    <div class="text-white font-bold text-sm leading-tight">Karang Taruna</div>
                    <div class="text-gold-400 text-xs font-medium">Armalo Eluf</div>
                </div>
            </a>

            <!-- Menu Desktop -->
            <div class="hidden md:flex items-center gap-8">
                <a href="{{ route('home') }}" class="nav-link text-white text-sm font-medium hover:text-gold-400 transition-colors {{ request()->routeIs('home') ? 'active text-gold-400' : '' }}">Beranda</a>
                <a href="{{ route('about') }}" class="nav-link text-white text-sm font-medium hover:text-gold-400 transition-colors {{ request()->routeIs('about') ? 'active text-gold-400' : '' }}">Tentang Kami</a>
                <a href="{{ route('programs.index') }}" class="nav-link text-white text-sm font-medium hover:text-gold-400 transition-colors {{ request()->routeIs('programs*') ? 'active text-gold-400' : '' }}">Kegiatan</a>
                <a href="{{ route('announcements.index') }}" class="nav-link text-white text-sm font-medium hover:text-gold-400 transition-colors {{ request()->routeIs('announcements*') ? 'active text-gold-400' : '' }}">Pengumuman</a>
                <a href="{{ route('gallery.index') }}" class="nav-link text-white text-sm font-medium hover:text-gold-400 transition-colors {{ request()->routeIs('gallery*') ? 'active text-gold-400' : '' }}">Galeri</a>
                <a href="{{ route('contact.index') }}" class="nav-link text-white text-sm font-medium hover:text-gold-400 transition-colors {{ request()->routeIs('contact*') ? 'active text-gold-400' : '' }}">Kontak</a>
            </div>

            <!-- Mobile Menu Button -->
            <button id="menuBtn" class="md:hidden text-white p-1" onclick="toggleMenu()">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
            </button>
        </div>

        <!-- Mobile Menu -->
        <div id="mobileMenu" class="hidden md:hidden bg-navy-900 px-6 pb-4">
            <a href="{{ route('home') }}" class="block py-2 text-white text-sm hover:text-gold-400">Beranda</a>
            <a href="{{ route('about') }}" class="block py-2 text-white text-sm hover:text-gold-400">Tentang Kami</a>
            <a href="{{ route('programs.index') }}" class="block py-2 text-white text-sm hover:text-gold-400">Kegiatan</a>
            <a href="{{ route('announcements.index') }}" class="block py-2 text-white text-sm hover:text-gold-400">Pengumuman</a>
            <a href="{{ route('gallery.index') }}" class="block py-2 text-white text-sm hover:text-gold-400">Galeri</a>
            <a href="{{ route('contact.index') }}" class="block py-2 text-white text-sm hover:text-gold-400">Kontak</a>
            @auth
                <a href="{{ route('admin.dashboard') }}" class="block py-2 text-gold-400 text-sm font-medium">Dashboard Admin</a>
            @endauth
        </div>
    </nav>

    <!-- Flash Message -->
    @if(session('success'))
        <div class="fixed top-20 right-6 z-50 bg-white border-l-4 border-gold-500 shadow-lg px-5 py-4 rounded-lg max-w-sm" id="flashMsg">
            <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <p class="text-sm text-gray-700">{{ session('success') }}</p>
            </div>
        </div>
        <script>setTimeout(() => { document.getElementById('flashMsg')?.remove(); }, 4000);</script>
    @endif

    <!-- Content -->
    <main class="pt-[72px]">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-navy-900 text-white pt-16 pb-8">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-navy-700">

                <!-- Brand -->
                <div>
                    <div class="flex items-center gap-3 mb-4">
                        <img src="{{ asset('images/logo.png') }}" alt="Logo" class="w-10 h-10 object-contain">
                        <div>
                            <div class="text-white font-bold text-sm">Karang Taruna</div>
                            <div class="text-gold-400 text-xs">Armalo Eluf</div>
                        </div>
                    </div>
                    <p class="text-gray-400 text-sm leading-relaxed mb-4">Organisasi kepemudaan yang aktif, kreatif, dan bermanfaat bagi seluruh warga RT 06 RW 12.</p>
                    <div class="gold-line"></div>
                </div>

                <!-- Menu -->
                <div>
                    <h4 class="font-semibold text-gold-400 mb-4 text-sm uppercase tracking-wider">Menu</h4>
                    <ul class="space-y-2">
                        <li><a href="{{ route('home') }}" class="text-gray-400 text-sm hover:text-gold-400 transition-colors">Beranda</a></li>
                        <li><a href="{{ route('about') }}" class="text-gray-400 text-sm hover:text-gold-400 transition-colors">Tentang Kami</a></li>
                        <li><a href="{{ route('programs.index') }}" class="text-gray-400 text-sm hover:text-gold-400 transition-colors">Kegiatan</a></li>
                        <li><a href="{{ route('announcements.index') }}" class="text-gray-400 text-sm hover:text-gold-400 transition-colors">Pengumuman</a></li>
                        <li><a href="{{ route('gallery.index') }}" class="text-gray-400 text-sm hover:text-gold-400 transition-colors">Galeri</a></li>
                        <li><a href="{{ route('contact.index') }}" class="text-gray-400 text-sm hover:text-gold-400 transition-colors">Kontak</a></li>
                    </ul>
                </div>

                <!-- Kontak -->
                <div>
                    <h4 class="font-semibold text-gold-400 mb-4 text-sm uppercase tracking-wider">Kontak</h4>
                    <ul class="space-y-3">
                        <li class="flex items-start gap-2 text-gray-400 text-sm">
                            <svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            Jl. Manukan Lor 3F RT 06 RW 12, Surabaya
                        </li>
                        <li class="flex items-center gap-2 text-gray-400 text-sm">
                            <svg class="w-4 h-4 flex-shrink-0 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            08xxxxxxxxxx
                        </li>
                    </ul>

                    <!-- Google Maps embed -->
                    <div class="mt-4 rounded-xl overflow-hidden border border-navy-700">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.4!2d112.6677!3d-7.2575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sJl.+Manukan+Lor+3F+RT+06+RW+12+Surabaya!5e0!3m2!1sid!2sid!4v1"
                            width="100%"
                            height="150"
                            style="border:0; filter: invert(90%) hue-rotate(180deg);"
                            allowfullscreen=""
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>

            </div>

            <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <p class="text-gray-500 text-xs">&copy; {{ date('Y') }} Karang Taruna Armalo Eluf. Semua hak dilindungi.</p>
                @auth
                    <a href="{{ route('admin.dashboard') }}" class="text-xs text-gray-600 hover:text-gold-400 transition-colors">Panel Admin</a>
                @endauth
            </div>
        </div>
    </footer>

    <script>
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });

        function toggleMenu() {
            const menu = document.getElementById('mobileMenu');
            menu.classList.toggle('hidden');
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    </script>

</body>
</html>