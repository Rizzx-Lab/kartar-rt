@extends('layouts.app')

@section('title', $gallery->title . ' - Karang Taruna Armalo Eluf')

@section('content')

    <section class="relative bg-navy-900 py-24 overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 right-20 w-64 h-64 bg-gold-500 rounded-full blur-3xl"></div>
        </div>
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 40px 40px;"></div>
        <div class="relative max-w-6xl mx-auto px-6">
            <a href="{{ route('gallery.index') }}" class="inline-flex items-center gap-2 text-gold-400 text-sm hover:text-gold-300 mb-6 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Kembali ke Galeri
            </a>
            <span class="text-gold-400 text-sm font-semibold uppercase tracking-wider">Album Foto</span>
            <h1 class="text-4xl font-bold text-white mt-2 mb-2">{{ $gallery->title }}</h1>
            @if($gallery->description)
                <p class="text-gray-300 mt-2">{{ $gallery->description }}</p>
            @endif
            <p class="text-gray-400 text-sm mt-3">{{ $gallery->photos->count() }} foto</p>
        </div>
    </section>

    <section class="bg-white py-20">
        <div class="max-w-6xl mx-auto px-6">
            @if($gallery->photos->count() > 0)
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    @foreach($gallery->photos as $photo)
                        <div class="group relative bg-navy-50 rounded-xl overflow-hidden aspect-square cursor-pointer fade-up"
                             onclick="openLightbox('{{ Storage::url($photo->file_path) }}', '{{ $photo->caption }}')">
                            <img src="{{ Storage::url($photo->file_path) }}"
                                alt="{{ $photo->caption ?? $gallery->title }}"
                                class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                            <div class="absolute inset-0 bg-navy-900 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                                </svg>
                            </div>
                            @if($photo->caption)
                                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-900 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <p class="text-white text-xs">{{ $photo->caption }}</p>
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            @else
                <div class="text-center py-20 text-gray-400">
                    <p class="font-medium text-gray-500">Belum ada foto di album ini.</p>
                </div>
            @endif

            <div class="mt-10">
                <a href="{{ route('gallery.index') }}"
                    class="inline-flex items-center gap-2 text-navy-700 font-semibold hover:text-gold-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Kembali ke Galeri
                </a>
            </div>
        </div>
    </section>

    <!-- Lightbox -->
    <div id="lightbox" class="fixed inset-0 bg-black bg-opacity-95 z-50 hidden items-center justify-center p-4">
        <button onclick="closeLightbox()" class="absolute top-6 right-6 text-white hover:text-gold-400 transition-colors">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
        <div class="max-w-5xl w-full text-center">
            <img id="lightbox-img" src="" alt="" class="max-h-[80vh] max-w-full mx-auto rounded-xl shadow-2xl">
            <p id="lightbox-caption" class="text-gray-300 text-sm mt-4"></p>
        </div>
    </div>

    <script>
        function openLightbox(src, caption) {
            document.getElementById('lightbox-img').src = src;
            document.getElementById('lightbox-caption').textContent = caption || '';
            const lb = document.getElementById('lightbox');
            lb.classList.remove('hidden');
            lb.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
        function closeLightbox() {
            const lb = document.getElementById('lightbox');
            lb.classList.add('hidden');
            lb.classList.remove('flex');
            document.body.style.overflow = '';
        }
        document.getElementById('lightbox').addEventListener('click', function(e) {
            if (e.target === this) closeLightbox();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeLightbox();
        });
    </script>

@endsection