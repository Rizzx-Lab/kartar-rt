@extends('layouts.app')

@section('title', $program->name . ' - Karang Taruna Armalo Eluf')

@section('content')

    <section class="relative bg-navy-900 py-24 overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 right-20 w-64 h-64 bg-gold-500 rounded-full blur-3xl"></div>
        </div>
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 40px 40px;"></div>
        <div class="relative max-w-6xl mx-auto px-6">
            <a href="{{ route('programs.index') }}" class="inline-flex items-center gap-2 text-gold-400 text-sm hover:text-gold-300 mb-6 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Kembali ke Kegiatan
            </a>
            <span class="text-gold-400 text-sm font-semibold uppercase tracking-wider">Program Kerja</span>
            <h1 class="text-4xl font-bold text-white mt-2 mb-4">{{ $program->name }}</h1>
            <div class="flex items-center gap-3">
                <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-gold-500 bg-opacity-20 text-gold-400 border border-gold-500 border-opacity-30">
                    {{ $program->frequency === 'monthly' ? 'Bulanan' : ($program->frequency === 'yearly' ? 'Tahunan' : 'Insidental') }}
                </span>
                <span class="text-xs font-semibold px-3 py-1.5 rounded-full {{ $program->is_active ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400' }}">
                    {{ $program->is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
            </div>
        </div>
    </section>

    <section class="bg-white py-20">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">

                <div class="md:col-span-2">
                    <div class="fade-up">
                        <h2 class="text-xl font-bold text-navy-800 mb-2">Tentang Program</h2>
                        <div class="gold-line mb-5"></div>
                        <p class="text-gray-600 leading-relaxed">{{ $program->description }}</p>
                    </div>

                    <div class="mt-12 fade-up">
                        <h2 class="text-xl font-bold text-navy-800 mb-2">Riwayat Pertemuan</h2>
                        <div class="gold-line mb-6"></div>

                        @forelse($sessions as $session)
                            <div class="bg-white border border-gray-100 rounded-2xl p-6 mb-4 card-hover">
                                <div class="flex items-start justify-between gap-4">
                                    <div class="flex-1">
                                        <h3 class="font-bold text-navy-800 mb-2">{{ $session->title }}</h3>
                                        <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span class="flex items-center gap-1.5">
                                                <svg class="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                </svg>
                                                {{ $session->held_at->format('d F Y, H:i') }}
                                            </span>
                                            @if($session->location)
                                                <span class="flex items-center gap-1.5">
                                                    <svg class="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                    </svg>
                                                    {{ $session->location }}
                                                </span>
                                            @endif
                                            @if($session->participant_count)
                                                <span class="flex items-center gap-1.5">
                                                    <svg class="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    </svg>
                                                    {{ $session->participant_count }} peserta
                                                </span>
                                            @endif
                                        </div>
                                        @if($session->description)
                                            <p class="text-gray-500 text-sm mt-3 leading-relaxed">{{ $session->description }}</p>
                                        @endif
                                    </div>
                                    <span class="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-full font-medium
                                        {{ $session->status === 'upcoming' ? 'bg-blue-50 text-blue-600' : ($session->status === 'done' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500') }}">
                                        {{ $session->status === 'upcoming' ? 'Akan Datang' : ($session->status === 'done' ? 'Selesai' : 'Dibatalkan') }}
                                    </span>
                                </div>
                            </div>
                        @empty
                            <div class="text-center py-12 bg-gray-50 rounded-2xl text-gray-400">
                                <p class="font-medium">Belum ada riwayat pertemuan.</p>
                            </div>
                        @endforelse
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="fade-up">
                    <div class="bg-navy-800 rounded-2xl p-6 text-white sticky top-24">
                        <h3 class="font-bold text-gold-400 mb-5">Info Program</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between py-3 border-b border-navy-700">
                                <span class="text-gray-400 text-sm">Frekuensi</span>
                                <span class="font-medium text-sm">{{ $program->frequency === 'monthly' ? 'Setiap Bulan' : ($program->frequency === 'yearly' ? 'Setiap Tahun' : 'Insidental') }}</span>
                            </div>
                            <div class="flex items-center justify-between py-3 border-b border-navy-700">
                                <span class="text-gray-400 text-sm">Status</span>
                                <span class="font-medium text-sm {{ $program->is_active ? 'text-green-400' : 'text-red-400' }}">
                                    {{ $program->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                </span>
                            </div>
                            <div class="flex items-center justify-between py-3">
                                <span class="text-gray-400 text-sm">Total Pertemuan</span>
                                <span class="font-medium text-sm">{{ $sessions->count() }} kali</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>

@endsection