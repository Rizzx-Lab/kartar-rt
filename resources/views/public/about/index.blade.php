@extends('layouts.app')

@section('title', 'Tentang Kami - Karang Taruna Armalo Eluf')

@section('content')

    <!-- Header -->
    <section class="relative bg-navy-900 py-24 overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 right-20 w-64 h-64 bg-gold-500 rounded-full blur-3xl"></div>
            <div class="absolute bottom-10 left-20 w-48 h-48 bg-navy-500 rounded-full blur-3xl"></div>
        </div>
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 40px 40px;"></div>
        <div class="relative max-w-6xl mx-auto px-6 text-center">
            <div class="inline-flex items-center gap-2 border border-gold-500 border-opacity-30 rounded-full px-4 py-1.5 mb-5">
                <svg class="w-3.5 h-3.5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
                </svg>
                <span class="text-gold-400 text-xs font-semibold uppercase tracking-wider">Mengenal Kami</span>
            </div>
            <h1 class="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Tentang Kami</h1>
            <div class="gold-line mx-auto"></div>
            <p class="text-gray-300 mt-4 max-w-xl mx-auto">Mengenal lebih dekat Karang Taruna Armalo Eluf dan perjalanannya</p>
        </div>
    </section>

    <!-- Siapa Kami + Visual -->
    <section class="py-20 bg-white overflow-hidden">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 items-start">

                <!-- Kolom Kiri -->
                <div class="space-y-10 fade-up">
                    @php
                    $left = [
                        ['title' => 'Kebersamaan', 'desc' => 'Kami percaya kekuatan terbesar ada pada kebersamaan dan gotong royong seluruh warga RT.'],
                        ['title' => 'Kepedulian',  'desc' => 'Setiap anggota terpanggil untuk peduli terhadap sesama dan lingkungan sekitarnya.'],
                        ['title' => 'Kreativitas', 'desc' => 'Kami mendorong setiap pemuda untuk berkarya dan berinovasi demi kemajuan bersama.'],
                    ];
                    @endphp
                    @foreach($left as $i => $item)
                        <div class="group flex flex-col">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-10 h-10 bg-gold-500 bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-all">
                                    <svg class="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        @if($i === 0)
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        @elseif($i === 1)
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                        @else
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                                        @endif
                                    </svg>
                                </div>
                                <h3 class="font-bold text-navy-800 group-hover:text-gold-500 transition-colors">{{ $item['title'] }}</h3>
                            </div>
                            <p class="text-gray-500 text-sm leading-relaxed" style="padding-left: 52px;">{{ $item['desc'] }}</p>
                            <div class="mt-2 flex items-center text-gold-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style="padding-left: 52px;">
                                Selengkapnya
                                <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </div>
                        </div>
                    @endforeach
                </div>

                <!-- Kolom Tengah: Logo -->
                <div class="flex justify-center items-start fade-up order-first md:order-none mb-8 md:mb-0">
                    <div class="relative w-full max-w-xs">
                        <div class="absolute -inset-3 rounded-2xl opacity-20" style="background: radial-gradient(circle, #C9A84C, transparent 70%);"></div>
                        <div class="absolute -inset-3 border border-gold-400 border-opacity-20 rounded-2xl"></div>
                        <div class="relative rounded-2xl overflow-hidden shadow-2xl">
                            <img src="{{ asset('images/logo.png') }}"
                                alt="Karang Taruna Armalo Eluf"
                                class="w-full object-contain bg-navy-900 p-8"
                                style="filter: drop-shadow(0 0 20px rgba(201,168,76,0.3));">
                            <div class="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent flex items-end p-5">
                                <a href="{{ route('programs.index') }}"
                                    class="bg-white text-navy-800 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold hover:bg-gold-50 transition-colors">
                                    Lihat Kegiatan
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                </a>
                            </div>
                        </div>
                        <div class="absolute -top-4 -right-4 bg-gold-500 text-navy-900 rounded-xl px-3 py-2 text-xs font-bold shadow-lg">
                            Aktif Sejak 2020
                        </div>
                        <div class="absolute -bottom-4 -left-4 bg-navy-800 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-lg border border-gold-500 border-opacity-30">
                            RT 06 Bersatu
                        </div>
                    </div>
                </div>

                <!-- Kolom Kanan -->
                <div class="space-y-10 fade-up">
                    @php
                    $right = [
                        ['title' => 'Program Rutin',  'desc' => 'Menjalankan program kerja bulanan dan tahunan yang bermanfaat bagi seluruh warga RT.'],
                        ['title' => 'Pemberdayaan',   'desc' => 'Memberdayakan pemuda RT menjadi generasi yang aktif, produktif, dan berdampak.'],
                        ['title' => 'Gotong Royong',  'desc' => 'Menjaga semangat gotong royong dan kebersamaan sebagai pondasi kekuatan komunitas RT.'],
                    ];
                    @endphp
                    @foreach($right as $i => $item)
                        <div class="group flex flex-col">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-10 h-10 bg-navy-800 bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-all">
                                    <svg class="w-5 h-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        @if($i === 0)
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        @elseif($i === 1)
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                        @else
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                                        @endif
                                    </svg>
                                </div>
                                <h3 class="font-bold text-navy-800 group-hover:text-gold-500 transition-colors">{{ $item['title'] }}</h3>
                            </div>
                            <p class="text-gray-500 text-sm leading-relaxed" style="padding-left: 52px;">{{ $item['desc'] }}</p>
                            <div class="mt-2 flex items-center text-gold-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style="padding-left: 52px;">
                                Selengkapnya
                                <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </div>
                        </div>
                    @endforeach
                </div>

            </div>
        </div>
    </section>

    <!-- Stats -->
    <section class="bg-navy-50 py-16">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                @foreach([
                    ['val' => '2+',  'label' => 'Program Kerja',  'icon' => 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'],
                    ['val' => '50+', 'label' => 'Anggota Aktif',  'icon' => 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'],
                    ['val' => '10+', 'label' => 'Kegiatan/Tahun', 'icon' => 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'],
                    ['val' => '2020','label' => 'Tahun Berdiri',  'icon' => 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'],
                ] as $i => $stat)
                    <div class="bg-white rounded-2xl p-6 text-center border border-gray-100 card-hover fade-up group" style="transition-delay: {{ $i * 100 }}ms">
                        <div class="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-navy-100 transition-colors">
                            <svg class="w-6 h-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $stat['icon'] }}"/>
                            </svg>
                        </div>
                        <div class="text-2xl md:text-3xl font-bold text-navy-800">{{ $stat['val'] }}</div>
                        <div class="gold-line mx-auto my-2"></div>
                        <div class="text-gray-500 text-xs md:text-sm">{{ $stat['label'] }}</div>
                    </div>
                @endforeach
            </div>
        </div>
    </section>

    <!-- Visi Misi -->
    <section class="bg-white py-20">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 fade-up">
                <div class="bg-navy-800 rounded-2xl p-8 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-gold-500 opacity-5 rounded-full -translate-y-8 translate-x-8"></div>
                    <div class="relative">
                        <div class="w-12 h-12 bg-gold-500 bg-opacity-20 rounded-xl flex items-center justify-center mb-5">
                            <svg class="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gold-400 mb-3">Visi</h3>
                        <p class="text-gray-300 leading-relaxed">Menjadi organisasi kepemudaan yang aktif, kreatif, dan bermanfaat bagi seluruh warga RT 06 RW 12.</p>
                    </div>
                </div>
                <div class="bg-navy-50 rounded-2xl p-8 border border-navy-100">
                    <div class="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center mb-5">
                        <svg class="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-navy-800 mb-4">Misi</h3>
                    <ul class="space-y-3">
                        @foreach(['Membangun kebersamaan antar warga RT', 'Menjalankan program kerja yang bermanfaat', 'Memberdayakan pemuda di lingkungan RT', 'Menjaga semangat gotong royong'] as $misi)
                            <li class="flex items-start gap-3 text-gray-600 text-sm">
                                <div class="w-5 h-5 rounded-full bg-gold-500 bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-3 h-3 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                {{ $misi }}
                            </li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Struktur Organisasi -->
    <section class="bg-navy-50 py-20">
        <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-14 fade-up">
                <span class="text-gold-500 text-sm font-semibold uppercase tracking-wider">Pengurus Kami</span>
                <h2 class="text-2xl md:text-3xl font-bold text-navy-800 mt-2 mb-3">Struktur Organisasi</h2>
                <div class="gold-line mx-auto"></div>
                <p class="text-gray-500 mt-4 text-sm md:text-base">Pengurus Karang Taruna Armalo Eluf periode aktif</p>
            </div>

            @if($members->count() > 0)
                @php
                    $col1 = $members->filter(fn($m, $i) => $i % 3 === 0)->values();
                    $col2 = $members->filter(fn($m, $i) => $i % 3 === 1)->values();
                    $col3 = $members->filter(fn($m, $i) => $i % 3 === 2)->values();
                @endphp

                <div class="flex flex-col lg:flex-row items-start gap-10 lg:gap-16 select-none">

                    <!-- Kiri: Photo Grid 3 Kolom Staggered -->
                    <div class="flex gap-3 flex-shrink-0 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto justify-center lg:justify-start">

                        <!-- Kolom 1 — rata atas -->
                        <div class="flex flex-col gap-3">
                            @foreach($col1 as $member)
                                <div class="org-photo overflow-hidden rounded-xl cursor-pointer flex-shrink-0 transition-all duration-300"
                                    data-id="{{ $member->id }}"
                                    style="width: 140px; height: 160px;">
                                    @if($member->photo)
                                        <img src="{{ Storage::url($member->photo) }}"
                                            alt="{{ $member->name }}"
                                            class="w-full h-full object-cover object-top transition-all duration-500"
                                            style="filter: grayscale(1) brightness(0.75)">
                                    @else
                                        <div class="w-full h-full bg-navy-800 flex items-center justify-center">
                                            <span class="text-3xl font-bold text-gold-400">{{ strtoupper(substr($member->name, 0, 1)) }}</span>
                                        </div>
                                    @endif
                                </div>
                            @endforeach
                        </div>

                        <!-- Kolom 2 — offset bawah jauh -->
                        <div class="flex flex-col gap-3" style="margin-top: 68px;">
                            @foreach($col2 as $member)
                                <div class="org-photo overflow-hidden rounded-xl cursor-pointer flex-shrink-0 transition-all duration-300"
                                    data-id="{{ $member->id }}"
                                    style="width: 156px; height: 176px;">
                                    @if($member->photo)
                                        <img src="{{ Storage::url($member->photo) }}"
                                            alt="{{ $member->name }}"
                                            class="w-full h-full object-cover object-top transition-all duration-500"
                                            style="filter: grayscale(1) brightness(0.75)">
                                    @else
                                        <div class="w-full h-full bg-navy-700 flex items-center justify-center">
                                            <span class="text-3xl font-bold text-gold-400">{{ strtoupper(substr($member->name, 0, 1)) }}</span>
                                        </div>
                                    @endif
                                </div>
                            @endforeach
                        </div>

                        <!-- Kolom 3 — offset bawah sedang -->
                        <div class="flex flex-col gap-3" style="margin-top: 32px;">
                            @foreach($col3 as $member)
                                <div class="org-photo overflow-hidden rounded-xl cursor-pointer flex-shrink-0 transition-all duration-300"
                                    data-id="{{ $member->id }}"
                                    style="width: 148px; height: 168px;">
                                    @if($member->photo)
                                        <img src="{{ Storage::url($member->photo) }}"
                                            alt="{{ $member->name }}"
                                            class="w-full h-full object-cover object-top transition-all duration-500"
                                            style="filter: grayscale(1) brightness(0.75)">
                                    @else
                                        <div class="w-full h-full bg-navy-600 flex items-center justify-center">
                                            <span class="text-3xl font-bold text-gold-400">{{ strtoupper(substr($member->name, 0, 1)) }}</span>
                                        </div>
                                    @endif
                                </div>
                            @endforeach
                        </div>

                    </div>

                    <!-- Kanan: Daftar Nama -->
                    <div class="flex-1 w-full">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-5 lg:gap-6 pt-0 lg:pt-4">
                            @foreach($members as $member)
                                <div class="org-row cursor-pointer transition-opacity duration-300"
                                    data-id="{{ $member->id }}">
                                    <div class="flex items-center gap-3">
                                        <div class="org-bar flex-shrink-0 rounded transition-all duration-300"
                                            style="width: 16px; height: 12px; background: #CBD5E1;"></div>
                                        <span class="org-name text-lg md:text-xl font-bold text-navy-800 leading-none tracking-tight transition-colors duration-300">
                                            {{ $member->name }}
                                        </span>
                                    </div>
                                    <p class="mt-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400" style="padding-left: 28px;">
                                        {{ $member->position }}
                                    </p>
                                    @if($member->description)
                                        <p class="mt-1 text-xs text-gray-400 leading-relaxed" style="padding-left: 28px;">
                                            {{ Str::limit($member->description, 70) }}
                                        </p>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>

                </div>

            @else
                <div class="text-center py-16 text-gray-400">
                    <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                    <p class="font-medium text-gray-500">Belum ada data pengurus.</p>
                    @auth
                        <a href="{{ route('admin.organization.create') }}" class="mt-3 inline-block text-gold-500 text-sm font-medium hover:underline">Tambah Pengurus →</a>
                    @endauth
                </div>
            @endif
        </div>

        <!-- JS Hover Interaktif -->
        <script>
        (function() {
            const photos = document.querySelectorAll('.org-photo');
            const rows   = document.querySelectorAll('.org-row');

            function setActive(id) {
                photos.forEach(el => {
                    const img = el.querySelector('img');
                    if (el.dataset.id === id) {
                        el.style.opacity = '1';
                        if (img) img.style.filter = 'grayscale(0) brightness(1)';
                    } else {
                        el.style.opacity = '0.45';
                        if (img) img.style.filter = 'grayscale(1) brightness(0.75)';
                    }
                });

                rows.forEach(el => {
                    const bar  = el.querySelector('.org-bar');
                    const name = el.querySelector('.org-name');
                    if (el.dataset.id === id) {
                        el.style.opacity = '1';
                        if (bar)  { bar.style.width = '22px'; bar.style.background = '#C9A84C'; }
                        if (name) name.style.color = '#C9A84C';
                    } else {
                        el.style.opacity = '0.4';
                        if (bar)  { bar.style.width = '16px'; bar.style.background = '#CBD5E1'; }
                        if (name) name.style.color = '#1B2B6B';
                    }
                });
            }

            function resetAll() {
                photos.forEach(el => {
                    el.style.opacity = '1';
                    const img = el.querySelector('img');
                    if (img) img.style.filter = 'grayscale(1) brightness(0.75)';
                });
                rows.forEach(el => {
                    el.style.opacity = '1';
                    const bar  = el.querySelector('.org-bar');
                    const name = el.querySelector('.org-name');
                    if (bar)  { bar.style.width = '16px'; bar.style.background = '#CBD5E1'; }
                    if (name) name.style.color = '#1B2B6B';
                });
            }

            photos.forEach(el => {
                el.addEventListener('mouseenter', () => setActive(el.dataset.id));
                el.addEventListener('mouseleave', resetAll);
            });

            rows.forEach(el => {
                el.addEventListener('mouseenter', () => setActive(el.dataset.id));
                el.addEventListener('mouseleave', resetAll);
            });
        })();
        </script>
    </section>

    <!-- CTA -->
    <section class="bg-navy-800 py-20">
        <div class="max-w-4xl mx-auto px-6 text-center fade-up">
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">Bergabunglah Bersama Kami</h2>
            <p class="text-gray-300 mb-8">Jadilah bagian dari keluarga besar Karang Taruna Armalo Eluf dan bersama-sama membangun RT yang lebih baik.</p>
            <a href="{{ route('contact.index') }}"
                class="inline-block bg-gold-500 text-navy-900 px-8 py-3.5 rounded-xl font-bold hover:bg-gold-400 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/30">
                Hubungi Kami
            </a>
        </div>
    </section>

@endsection