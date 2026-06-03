@extends('layouts.app')

@section('title', 'Kegiatan - Karang Taruna Armalo Eluf')

@section('content')

    <section class="relative bg-navy-900 py-24 overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 right-20 w-64 h-64 bg-gold-500 rounded-full blur-3xl"></div>
        </div>
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 40px 40px;"></div>
        <div class="relative max-w-6xl mx-auto px-6 text-center">
            <span class="text-gold-400 text-sm font-semibold uppercase tracking-wider">Yang Kami Jalankan</span>
            <h1 class="text-4xl font-bold text-white mt-3 mb-4">Program Kerja</h1>
            <div class="gold-line mx-auto"></div>
            <p class="text-gray-300 mt-4 max-w-xl mx-auto">Kegiatan rutin yang kami jalankan untuk mempererat kebersamaan warga RT</p>
        </div>
    </section>

    <section class="bg-white py-20">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @forelse($programs as $program)
                    <div class="group relative rounded-2xl overflow-hidden card-hover fade-up h-80">
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

                        <div class="absolute top-4 right-4">
                            <span class="text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm
                                {{ $program->is_active ? 'bg-green-500 bg-opacity-80 text-white' : 'bg-red-500 bg-opacity-80 text-white' }}">
                                {{ $program->is_active ? 'Aktif' : 'Nonaktif' }}
                            </span>
                        </div>

                        <div class="absolute top-4 left-4">
                            <span class="text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm
                                {{ $program->frequency === 'monthly' ? 'bg-blue-500 bg-opacity-80 text-white' : 'bg-gold-500 bg-opacity-90 text-navy-900' }}">
                                {{ $program->frequency === 'monthly' ? 'Bulanan' : ($program->frequency === 'yearly' ? 'Tahunan' : 'Insidental') }}
                            </span>
                        </div>

                        <div class="absolute bottom-0 left-0 right-0 p-6">
                            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
                                {{ $program->name }}
                            </h3>
                            <p class="text-gray-300 text-sm leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                {{ Str::limit($program->description, 100) }}
                            </p>
                            <a href="{{ route('programs.show', $program->slug) }}"
                                class="inline-flex items-center gap-1.5 text-gold-400 text-sm font-semibold hover:text-gold-300 transition-colors">
                                Lihat Detail
                                <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                @empty
                    <div class="col-span-3 text-center py-20 text-gray-400">
                        <p class="font-medium text-gray-500">Belum ada program kerja.</p>
                    </div>
                @endforelse
            </div>
        </div>
    </section>

@endsection