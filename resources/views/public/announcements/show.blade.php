@extends('layouts.app')

@section('title', $announcement->title . ' - Karang Taruna Armalo Eluf')

@section('content')

    <section class="relative bg-navy-900 py-24 overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 right-20 w-64 h-64 bg-gold-500 rounded-full blur-3xl"></div>
        </div>
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 40px 40px;"></div>
        <div class="relative max-w-4xl mx-auto px-6">
            <a href="{{ route('announcements.index') }}" class="inline-flex items-center gap-2 text-gold-400 text-sm hover:text-gold-300 mb-6 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Kembali ke Pengumuman
            </a>
            <div class="flex items-center gap-2 mb-4 flex-wrap">
                <span class="text-xs font-semibold px-3 py-1.5 rounded-full
                    {{ $announcement->type === 'warning' ? 'bg-red-500 bg-opacity-20 text-red-400' : ($announcement->type === 'event' ? 'bg-blue-500 bg-opacity-20 text-blue-400' : 'bg-gold-500 bg-opacity-20 text-gold-400') }}">
                    {{ $announcement->type === 'warning' ? 'Peringatan' : ($announcement->type === 'event' ? 'Event' : 'Info') }}
                </span>
                @if($announcement->is_pinned)
                    <span class="text-xs font-medium text-gold-400 border border-gold-400 border-opacity-40 px-3 py-1.5 rounded-full">Disematkan</span>
                @endif
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ $announcement->title }}</h1>
            <div class="flex items-center gap-4 text-gray-400 text-sm">
                <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ $announcement->published_at->format('d F Y') }}
                </span>
                <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    {{ $announcement->user->name }}
                </span>
            </div>
        </div>
    </section>

    <section class="bg-white py-20">
        <div class="max-w-4xl mx-auto px-6">
            <div class="bg-white border border-gray-100 rounded-2xl p-8 md:p-12 fade-up shadow-sm">
                <div class="prose max-w-none text-gray-700 leading-relaxed text-base">
                    {!! nl2br(e($announcement->content)) !!}
                </div>

                @if($announcement->expired_at)
                    <div class="mt-8 bg-gold-500 bg-opacity-10 border border-gold-400 border-opacity-30 rounded-xl p-4">
                        <div class="flex items-center gap-3 text-sm text-gold-600">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Pengumuman ini berlaku hingga <strong>{{ $announcement->expired_at->format('d F Y') }}</strong>
                        </div>
                    </div>
                @endif
            </div>

            <div class="mt-8">
                <a href="{{ route('announcements.index') }}"
                    class="inline-flex items-center gap-2 text-navy-700 font-semibold hover:text-gold-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Kembali ke Pengumuman
                </a>
            </div>
        </div>
    </section>

@endsection