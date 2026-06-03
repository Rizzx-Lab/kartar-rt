@extends('layouts.app')

@section('title', 'Beranda - Karang Taruna Armalo Eluf')

@section('content')

    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center overflow-hidden bg-navy-900">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl"></div>
            <div class="absolute bottom-20 right-10 w-96 h-96 bg-navy-500 rounded-full blur-3xl"></div>
        </div>
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 40px 40px;"></div>

        <div class="relative max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
                <div class="inline-flex items-center gap-2 bg-navy-700 border border-gold-500 border-opacity-30 rounded-full px-4 py-1.5 mb-6">
                    <div class="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
                    <span class="text-gold-400 text-xs font-medium tracking-wider uppercase">Karang Taruna Aktif</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                    Bersama Membangun
                    <span class="text-gold-400"> Komunitas</span>
                    yang Lebih Baik
                </h1>
                <p class="text-gray-300 text-lg leading-relaxed mb-8">
                    Karang Taruna Armalo Eluf hadir untuk menyatukan pemuda, menjalankan program yang bermanfaat, dan mempererat kebersamaan warga RT.
                </p>
                <div class="flex flex-wrap gap-4">
                    <a href="{{ route('programs.index') }}"
                        class="bg-gold-500 text-navy-900 px-6 py-3 rounded-xl font-semibold hover:bg-gold-400 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/30">
                        Lihat Kegiatan
                    </a>
                    <a href="{{ route('about') }}"
                        class="border border-white border-opacity-30 text-white px-6 py-3 rounded-xl font-medium hover:border-gold-400 hover:text-gold-400 transition-all duration-300">
                        Tentang Kami
                    </a>
                </div>
            </div>

            <!-- Logo -->
            <div class="flex justify-center">
                <div class="relative">
                    <div class="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center relative">
                        <div class="absolute inset-0 rounded-full"
                            style="background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%);"></div>
                        <div class="absolute inset-0 rounded-full"
                            style="border: 1px solid rgba(201,168,76,0.2);"></div>
                        <div class="absolute inset-6 rounded-full"
                            style="border: 1px solid rgba(201,168,76,0.1);"></div>
                        <img src="{{ asset('images/logo.png') }}"
                            alt="Logo Karang Taruna Armalo Eluf"
                            class="w-full h-full object-contain relative z-10"
                            style="filter: drop-shadow(0 0 25px rgba(201,168,76,0.5)) drop-shadow(0 0 50px rgba(201,168,76,0.2));">
                    </div>
                    <div class="absolute -top-2 -right-2 bg-gold-500 text-navy-900 rounded-xl px-3 py-2 text-xs font-bold shadow-lg z-20">
                        Aktif Sejak 2020
                    </div>
                    <div class="absolute -bottom-2 -left-2 bg-white text-navy-800 rounded-xl px-3 py-2 text-xs font-bold shadow-lg z-20">
                        RT Bersatu
                    </div>
                </div>
            </div>
        </div>

        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span class="text-gray-400 text-xs">Scroll ke bawah</span>
            <div class="w-5 h-8 border-2 border-gray-500 rounded-full flex items-start justify-center p-1">
                <div class="w-1 h-2 bg-gold-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="bg-white py-12 md:py-16 border-b border-gray-100">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <div class="text-center fade-up">
                    <div class="text-2xl md:text-3xl font-bold text-navy-800">2+</div>
                    <div class="gold-line mx-auto my-2"></div>
                    <div class="text-gray-500 text-xs md:text-sm">Program Kerja</div>
                </div>
                <div class="text-center fade-up" style="transition-delay: 0.1s">
                    <div class="text-2xl md:text-3xl font-bold text-navy-800">50+</div>
                    <div class="gold-line mx-auto my-2"></div>
                    <div class="text-gray-500 text-xs md:text-sm">Anggota Aktif</div>
                </div>
                <div class="text-center fade-up" style="transition-delay: 0.2s">
                    <div class="text-2xl md:text-3xl font-bold text-navy-800">10+</div>
                    <div class="gold-line mx-auto my-2"></div>
                    <div class="text-gray-500 text-xs md:text-sm">Kegiatan Per Tahun</div>
                </div>
                <div class="text-center fade-up" style="transition-delay: 0.3s">
                    <div class="text-2xl md:text-3xl font-bold text-navy-800">1 RT</div>
                    <div class="gold-line mx-auto my-2"></div>
                    <div class="text-gray-500 text-xs md:text-sm">Satu Keluarga Besar</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Program Kerja -->
    <section class="bg-navy-50 py-16 md:py-20">
        <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-10 md:mb-14 fade-up">
                <span class="text-gold-500 text-sm font-semibold uppercase tracking-wider">Yang Kami Jalankan</span>
                <h2 class="text-2xl md:text-3xl font-bold text-navy-800 mt-2 mb-3">Program Kerja</h2>
                <div class="gold-line mx-auto"></div>
                <p class="text-gray-500 mt-4 max-w-xl mx-auto text-sm md:text-base">Kegiatan rutin yang kami jalankan untuk mempererat kebersamaan dan memberdayakan warga RT</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                @forelse($programs as $program)
                    <a href="{{ route('programs.show', $program->slug) }}"
                        class="group relative rounded-2xl overflow-hidden card-hover fade-up h-64 md:h-72 block">
                        @if($program->cover_image)
                            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                style="background-image: url('{{ Storage::url($program->cover_image) }}')"></div>
                        @else
                            <div class="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                                style="background: linear-gradient(135deg, #1B2B6B 0%, #111D4A 50%, #0a1128 100%);">
                                <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 25px 25px;"></div>
                            </div>
                        @endif
                        <div class="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent group-hover:via-navy-900/50 transition-all duration-300"></div>
                        <div class="absolute top-4 left-4">
                            <span class="text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm
                                {{ $program->frequency === 'monthly' ? 'bg-blue-500 bg-opacity-80 text-white' : 'bg-gold-500 bg-opacity-90 text-navy-900' }}">
                                {{ $program->frequency === 'monthly' ? 'Bulanan' : ($program->frequency === 'yearly' ? 'Tahunan' : 'Insidental') }}
                            </span>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                            <h3 class="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
                                {{ $program->name }}
                            </h3>
                            <p class="text-gray-300 text-sm leading-relaxed mb-3 md:mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden md:block">
                                {{ Str::limit($program->description, 90) }}
                            </p>
                            <div class="inline-flex items-center gap-1.5 text-gold-400 text-sm font-semibold">
                                Lihat Detail
                                <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </div>
                    </a>
                @empty
                    <div class="col-span-full text-center py-16 text-gray-400">
                        <p>Belum ada program kerja.</p>
                    </div>
                @endforelse
            </div>
        </div>
    </section>

    <!-- Pengumuman Terbaru -->
    <section class="bg-white py-16 md:py-20">
        <div class="max-w-6xl mx-auto px-6">
            <div class="flex items-end justify-between mb-10 md:mb-14">
                <div class="fade-up">
                    <span class="text-gold-500 text-sm font-semibold uppercase tracking-wider">Info Terkini</span>
                    <h2 class="text-2xl md:text-3xl font-bold text-navy-800 mt-2 mb-3">Pengumuman</h2>
                    <div class="gold-line"></div>
                </div>
                <a href="{{ route('announcements.index') }}"
                    class="text-navy-700 text-sm font-semibold hover:text-gold-500 transition-colors hidden md:block">
                    Lihat Semua →
                </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                @forelse($announcements as $announcement)
                    <div class="group bg-white border border-gray-100 rounded-2xl p-5 md:p-6 card-hover fade-up hover:border-gold-400 hover:border-opacity-50">
                        <div class="flex items-center gap-2 mb-4">
                            <span class="w-2 h-2 rounded-full flex-shrink-0
                                {{ $announcement->type === 'warning' ? 'bg-red-500' : ($announcement->type === 'event' ? 'bg-blue-500' : 'bg-gold-500') }}">
                            </span>
                            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {{ $announcement->type === 'warning' ? 'Peringatan' : ($announcement->type === 'event' ? 'Event' : 'Info') }}
                            </span>
                            @if($announcement->is_pinned)
                                <span class="ml-auto text-xs text-gold-500 font-medium flex-shrink-0">Disematkan</span>
                            @endif
                        </div>
                        <h3 class="font-bold text-navy-800 mb-2 group-hover:text-gold-500 transition-colors text-sm md:text-base">{{ $announcement->title }}</h3>
                        <p class="text-gray-500 text-sm leading-relaxed mb-4">{{ Str::limit(strip_tags($announcement->content), 90) }}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-400">{{ $announcement->published_at->format('d M Y') }}</span>
                            <a href="{{ route('announcements.show', $announcement->slug) }}"
                                class="text-xs font-semibold text-navy-700 hover:text-gold-500 transition-colors">
                                Baca →
                            </a>
                        </div>
                    </div>
                @empty
                    <div class="col-span-full text-center py-16 text-gray-400">
                        <p>Belum ada pengumuman.</p>
                    </div>
                @endforelse
            </div>

            <div class="text-center mt-8 md:hidden">
                <a href="{{ route('announcements.index') }}"
                    class="inline-block border border-navy-700 text-navy-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-800 hover:text-white transition-all">
                    Lihat Semua Pengumuman
                </a>
            </div>
        </div>
    </section>

    <!-- Testimoni Scrolling Columns -->
    <section class="bg-navy-50 py-16 md:py-20 overflow-hidden">
        <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-10 md:mb-14 fade-up">
                <div class="inline-block border border-navy-200 text-navy-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">Testimoni</div>
                <h2 class="text-2xl md:text-3xl font-bold text-navy-800 mb-3">Apa Kata Warga</h2>
                <div class="gold-line mx-auto"></div>
                <p class="text-gray-500 mt-4 max-w-xl mx-auto text-sm md:text-base">Pendapat warga RT tentang kegiatan dan program Karang Taruna Armalo Eluf</p>
            </div>
        </div>

        @php
        $col1 = [
            ['nama' => 'Ibu Sari',    'peran' => 'Warga RT 06',   'inisial' => 'S', 'bg' => 'bg-navy-800', 'tc' => 'text-gold-400', 'teks' => 'Program Kumpul Bocah sangat membantu anak-anak kami untuk bersosialisasi dan belajar bersama. Kegiatan yang sangat positif untuk lingkungan RT kita.'],
            ['nama' => 'Pak Budi',    'peran' => 'Ketua RT 06',   'inisial' => 'B', 'bg' => 'bg-gold-500', 'tc' => 'text-navy-900', 'teks' => 'Perayaan 17 Agustus tahun ini luar biasa! Karang Taruna Armalo Eluf berhasil menghadirkan suasana yang meriah dan menyatukan seluruh warga RT.'],
            ['nama' => 'Ibu Rini',    'peran' => 'Warga RT 06',   'inisial' => 'R', 'bg' => 'bg-navy-700', 'tc' => 'text-gold-400', 'teks' => 'Senang sekali ada organisasi pemuda yang aktif di RT kita. Semoga Karang Taruna Armalo Eluf terus berkembang dan membawa manfaat bagi semua warga.'],
        ];
        $col2 = [
            ['nama' => 'Pak Ahmad',   'peran' => 'Warga RT 06',   'inisial' => 'A', 'bg' => 'bg-navy-800', 'tc' => 'text-gold-400', 'teks' => 'Karang Taruna Armalo Eluf sangat aktif dalam membantu warga. Saya bangga dengan semangat para pemuda RT kita yang luar biasa.'],
            ['nama' => 'Ibu Dewi',    'peran' => 'Ibu PKK RT 06', 'inisial' => 'D', 'bg' => 'bg-gold-500', 'tc' => 'text-navy-900', 'teks' => 'Kolaborasi antara karang taruna dan ibu PKK sangat baik. Kegiatan bersama selalu sukses dan membawa kebahagiaan untuk seluruh warga RT.'],
            ['nama' => 'Pak Hendra',  'peran' => 'Sesepuh RT 06', 'inisial' => 'H', 'bg' => 'bg-navy-700', 'tc' => 'text-gold-400', 'teks' => 'Melihat pemuda RT ini aktif dan semangat membuat saya sangat bangga. Mereka adalah harapan dan masa depan lingkungan kita.'],
        ];
        $col3 = [
            ['nama' => 'Ibu Fitri',   'peran' => 'Warga RT 06',   'inisial' => 'F', 'bg' => 'bg-gold-500', 'tc' => 'text-navy-900', 'teks' => 'Program-program yang dijalankan karang taruna sangat bermanfaat untuk anak-anak dan remaja di lingkungan kita. Terus semangat dan berkarya!'],
            ['nama' => 'Pak Rizal',   'peran' => 'Warga RT 06',   'inisial' => 'R', 'bg' => 'bg-navy-800', 'tc' => 'text-gold-400', 'teks' => 'Organisasi yang solid dengan program kerja yang jelas. Karang Taruna Armalo Eluf patut dijadikan contoh bagi RT lainnya di sekitar kita.'],
            ['nama' => 'Ibu Yanti',   'peran' => 'Warga RT 06',   'inisial' => 'Y', 'bg' => 'bg-navy-700', 'tc' => 'text-gold-400', 'teks' => 'Lingkungan RT kita menjadi lebih hidup dengan adanya karang taruna yang aktif. Terima kasih atas dedikasi dan kerja keras kalian semua!'],
        ];
        @endphp

        <!-- Columns Container dengan mask gradient -->
        <div class="flex justify-center gap-5 px-6 overflow-hidden"
            style="max-height: 680px; -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent); mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);">

            <!-- Kolom 1 — semua layar -->
            <div class="flex-shrink-0 w-72 overflow-hidden">
                <div class="animate-scroll-up flex flex-col gap-5">
                    @foreach(array_merge($col1, $col1) as $item)
                        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-72">
                            <div class="flex items-center gap-0.5 mb-3">
                                @for($i = 0; $i < 5; $i++)
                                    <svg class="w-3.5 h-3.5 text-gold-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                @endfor
                            </div>
                            <svg class="w-6 h-6 text-gold-200 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                            <p class="text-gray-600 text-sm leading-relaxed mb-5">{{ $item['teks'] }}</p>
                            <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div class="w-9 h-9 rounded-full {{ $item['bg'] }} flex items-center justify-center {{ $item['tc'] }} font-bold text-xs flex-shrink-0">{{ $item['inisial'] }}</div>
                                <div>
                                    <p class="font-semibold text-navy-800 text-sm">{{ $item['nama'] }}</p>
                                    <p class="text-gray-400 text-xs">{{ $item['peran'] }}</p>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Kolom 2 — tablet ke atas -->
            <div class="hidden md:block flex-shrink-0 w-72 overflow-hidden">
                <div class="animate-scroll-up-slow flex flex-col gap-5">
                    @foreach(array_merge($col2, $col2) as $item)
                        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-72">
                            <div class="flex items-center gap-0.5 mb-3">
                                @for($i = 0; $i < 5; $i++)
                                    <svg class="w-3.5 h-3.5 text-gold-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                @endfor
                            </div>
                            <svg class="w-6 h-6 text-gold-200 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                            <p class="text-gray-600 text-sm leading-relaxed mb-5">{{ $item['teks'] }}</p>
                            <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div class="w-9 h-9 rounded-full {{ $item['bg'] }} flex items-center justify-center {{ $item['tc'] }} font-bold text-xs flex-shrink-0">{{ $item['inisial'] }}</div>
                                <div>
                                    <p class="font-semibold text-navy-800 text-sm">{{ $item['nama'] }}</p>
                                    <p class="text-gray-400 text-xs">{{ $item['peran'] }}</p>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Kolom 3 — desktop ke atas -->
            <div class="hidden lg:block flex-shrink-0 w-72 overflow-hidden">
                <div class="animate-scroll-up-medium flex flex-col gap-5">
                    @foreach(array_merge($col3, $col3) as $item)
                        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-72">
                            <div class="flex items-center gap-0.5 mb-3">
                                @for($i = 0; $i < 5; $i++)
                                    <svg class="w-3.5 h-3.5 text-gold-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                @endfor
                            </div>
                            <svg class="w-6 h-6 text-gold-200 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                            <p class="text-gray-600 text-sm leading-relaxed mb-5">{{ $item['teks'] }}</p>
                            <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div class="w-9 h-9 rounded-full {{ $item['bg'] }} flex items-center justify-center {{ $item['tc'] }} font-bold text-xs flex-shrink-0">{{ $item['inisial'] }}</div>
                                <div>
                                    <p class="font-semibold text-navy-800 text-sm">{{ $item['nama'] }}</p>
                                    <p class="text-gray-400 text-xs">{{ $item['peran'] }}</p>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

        </div>

        <!-- Banner Google Review -->
        <div class="max-w-6xl mx-auto px-6 mt-10 md:mt-14">
            <div class="bg-navy-800 rounded-2xl p-6 md:p-8">
                <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div class="flex flex-col md:flex-row items-center gap-4 md:gap-5 text-center md:text-left">
                        <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg mx-auto md:mx-0">
                            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-white font-bold text-base md:text-lg">Beri Ulasan di Google</p>
                            <p class="text-gray-300 text-sm mt-1">Pengalaman kamu sangat berarti bagi perkembangan Karang Taruna Armalo Eluf</p>
                            <div class="flex items-center gap-1 mt-2 justify-center md:justify-start">
                                @for($i = 0; $i < 5; $i++)
                                    <svg class="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                @endfor
                                <span class="text-gray-400 text-xs ml-1">Jadilah yang pertama memberi ulasan</span>
                            </div>
                        </div>
                    </div>
                    <a href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
                        target="_blank"
                        class="w-full md:w-auto flex-shrink-0 bg-gold-500 text-navy-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gold-400 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Tulis Ulasan
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-navy-800 py-16 md:py-20">
        <div class="max-w-4xl mx-auto px-6 text-center fade-up">
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">Punya Pertanyaan atau Saran?</h2>
            <p class="text-gray-300 mb-8 text-base md:text-lg">Kami terbuka untuk semua masukan dari warga RT. Hubungi kami kapan saja.</p>
            <a href="{{ route('contact.index') }}"
                class="inline-block bg-gold-500 text-navy-900 px-8 py-3.5 rounded-xl font-bold hover:bg-gold-400 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/30">
                Hubungi Kami
            </a>
        </div>
    </section>

@endsection