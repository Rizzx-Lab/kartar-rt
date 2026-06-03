@extends('layouts.app')

@section('title', 'Pengumuman - Karang Taruna Armalo Eluf')

@section('content')

    <section class="relative bg-navy-900 py-24 overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 right-20 w-64 h-64 bg-gold-500 rounded-full blur-3xl"></div>
        </div>
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 40px 40px;"></div>
        <div class="relative max-w-6xl mx-auto px-6 text-center">
            <span class="text-gold-400 text-sm font-semibold uppercase tracking-wider">Info Terkini</span>
            <h1 class="text-4xl font-bold text-white mt-3 mb-4">Pengumuman</h1>
            <div class="gold-line mx-auto"></div>
            <p class="text-gray-300 mt-4 max-w-xl mx-auto">Informasi dan pengumuman terbaru untuk warga RT</p>
        </div>
    </section>

    <section class="bg-white py-20">
        <div class="max-w-4xl mx-auto px-6">
            @forelse($announcements as $announcement)
                <div class="group bg-white border border-gray-100 rounded-2xl p-6 mb-4 card-hover fade-up hover:border-gold-400 hover:border-opacity-50">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center
                            {{ $announcement->type === 'warning' ? 'bg-red-50' : ($announcement->type === 'event' ? 'bg-blue-50' : 'bg-gold-500 bg-opacity-10') }}">
                            <div class="w-3 h-3 rounded-full
                                {{ $announcement->type === 'warning' ? 'bg-red-500' : ($announcement->type === 'event' ? 'bg-blue-500' : 'bg-gold-500') }}">
                            </div>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2 flex-wrap">
                                <span class="text-xs font-semibold px-2.5 py-1 rounded-full
                                    {{ $announcement->type === 'warning' ? 'bg-red-50 text-red-600' : ($announcement->type === 'event' ? 'bg-blue-50 text-blue-600' : 'bg-gold-500 bg-opacity-10 text-gold-600') }}">
                                    {{ $announcement->type === 'warning' ? 'Peringatan' : ($announcement->type === 'event' ? 'Event' : 'Info') }}
                                </span>
                                @if($announcement->is_pinned)
                                    <span class="text-xs font-medium text-gold-500 border border-gold-400 border-opacity-40 px-2 py-0.5 rounded-full">Disematkan</span>
                                @endif
                                <span class="text-xs text-gray-400 ml-auto">{{ $announcement->published_at->format('d F Y') }}</span>
                            </div>
                            <h3 class="font-bold text-navy-800 text-lg mb-2 group-hover:text-gold-500 transition-colors">{{ $announcement->title }}</h3>
                            <p class="text-gray-500 text-sm leading-relaxed mb-4">{{ Str::limit(strip_tags($announcement->content), 160) }}</p>
                            <a href="{{ route('announcements.show', $announcement->slug) }}"
                                class="inline-flex items-center gap-1 text-navy-700 text-sm font-semibold hover:text-gold-500 transition-colors">
                                Baca Selengkapnya
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            @empty
                <div class="text-center py-20 text-gray-400">
                    <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </div>
                    <p class="font-medium text-gray-500">Belum ada pengumuman.</p>
                </div>
            @endforelse

            <div class="mt-8">
                {{ $announcements->links() }}
            </div>
        </div>
    </section>

@endsection