@extends('layouts.app')

@section('title', 'Galeri - Karang Taruna Armalo Eluf')

@section('content')

    <section class="relative bg-navy-900 py-24 overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 right-20 w-64 h-64 bg-gold-500 rounded-full blur-3xl"></div>
        </div>
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 40px 40px;"></div>
        <div class="relative max-w-6xl mx-auto px-6 text-center">
            <span class="text-gold-400 text-sm font-semibold uppercase tracking-wider">Dokumentasi</span>
            <h1 class="text-4xl font-bold text-white mt-3 mb-4">Galeri Foto</h1>
            <div class="gold-line mx-auto"></div>
            <p class="text-gray-300 mt-4 max-w-xl mx-auto">Momen-momen berharga dari kegiatan Karang Taruna Armalo Eluf</p>
        </div>
    </section>

    <section class="bg-white py-20">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @forelse($galleries as $gallery)
                    <a href="{{ route('gallery.show', $gallery->id) }}"
                        class="group bg-white border border-gray-100 rounded-2xl overflow-hidden card-hover fade-up">
                        <div class="h-52 bg-navy-50 overflow-hidden relative">
                            @if($gallery->cover)
                                <img src="{{ Storage::url($gallery->cover->file_path) }}"
                                    alt="{{ $gallery->title }}"
                                    class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                            @else
                                <div class="w-full h-full flex items-center justify-center">
                                    <svg class="w-12 h-12 text-navy-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                </div>
                            @endif
                            <div class="absolute inset-0 bg-navy-900 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                <span class="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">Lihat Album</span>
                            </div>
                        </div>
                        <div class="p-5">
                            <h3 class="font-bold text-navy-800 group-hover:text-gold-500 transition-colors">{{ $gallery->title }}</h3>
                            @if($gallery->description)
                                <p class="text-gray-500 text-sm mt-1">{{ Str::limit($gallery->description, 70) }}</p>
                            @endif
                            <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <span class="text-xs text-gray-400">{{ $gallery->photos->count() ?? 0 }} foto</span>
                                <span class="text-xs font-semibold text-navy-700 group-hover:text-gold-500 transition-colors">Lihat →</span>
                            </div>
                        </div>
                    </a>
                @empty
                    <div class="col-span-3 text-center py-20 text-gray-400">
                        <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <p class="font-medium text-gray-500">Belum ada album galeri.</p>
                    </div>
                @endforelse
            </div>
            <div class="mt-10">{{ $galleries->links() }}</div>
        </div>
    </section>

@endsection