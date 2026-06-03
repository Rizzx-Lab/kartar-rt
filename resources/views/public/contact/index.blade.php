@extends('layouts.app')

@section('title', 'Kontak - Karang Taruna Armalo Eluf')

@section('content')

    <section class="relative bg-navy-900 py-24 overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 right-20 w-64 h-64 bg-gold-500 rounded-full blur-3xl"></div>
        </div>
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 40px 40px;"></div>
        <div class="relative max-w-6xl mx-auto px-6 text-center">
            <span class="text-gold-400 text-sm font-semibold uppercase tracking-wider">Hubungi Kami</span>
            <h1 class="text-4xl font-bold text-white mt-3 mb-4">Kontak</h1>
            <div class="gold-line mx-auto"></div>
            <p class="text-gray-300 mt-4 max-w-xl mx-auto">Kami terbuka untuk pertanyaan, saran, dan masukan dari seluruh warga RT</p>
        </div>
    </section>

    <section class="bg-white py-20">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-16">

                <!-- Info Kontak -->
                <div class="fade-up">
                    <span class="text-gold-500 text-sm font-semibold uppercase tracking-wider">Temukan Kami</span>
                    <h2 class="text-2xl font-bold text-navy-800 mt-2 mb-3">Informasi Kontak</h2>
                    <div class="gold-line mb-8"></div>

                    <div class="space-y-5 mb-8">
                        <div class="flex items-start gap-4">
                            <div class="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg class="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="font-semibold text-navy-800 mb-1">Alamat Sekretariat</p>
                                <p class="text-gray-500 text-sm leading-relaxed">Jl. Manukan Lor 3F RT 06 RW 12, Surabaya, Jawa Timur</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-4">
                            <div class="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg class="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="font-semibold text-navy-800 mb-1">Nomor HP Ketua</p>
                                <p class="text-gray-500 text-sm">08xxxxxxxxxx</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-4">
                            <div class="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg class="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="font-semibold text-navy-800 mb-1">Email</p>
                                <p class="text-gray-500 text-sm">info@kartar-rt.com</p>
                            </div>
                        </div>
                    </div>

                    <!-- Google Maps -->
                    <div class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <div class="bg-navy-800 px-4 py-3 flex items-center gap-2">
                            <svg class="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span class="text-white text-xs font-medium">Lokasi Sekretariat</span>
                        </div>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.4!2d112.6677!3d-7.2575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sJl.+Manukan+Lor+3F+Surabaya!5e0!3m2!1sid!2sid!4v1"
                            width="100%"
                            height="280"
                            style="border:0;"
                            allowfullscreen=""
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                        <div class="bg-gray-50 px-4 py-3">
                            <a href="https://maps.google.com/?q=Jl.+Manukan+Lor+3F+RT+06+RW+12+Surabaya"
                                target="_blank"
                                class="text-xs text-navy-700 font-semibold hover:text-gold-500 transition-colors flex items-center gap-1">
                                Buka di Google Maps
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <!-- Jam Aktif -->
                    <div class="mt-6 bg-navy-50 rounded-2xl p-6 border border-navy-100">
                        <h3 class="font-bold text-navy-800 mb-4 text-sm">Jam Aktif Sekretariat</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-500">Senin - Jumat</span>
                                <span class="font-medium text-navy-700">08.00 - 17.00</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Sabtu</span>
                                <span class="font-medium text-navy-700">08.00 - 14.00</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Minggu</span>
                                <span class="font-medium text-red-400">Tutup</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Kontak -->
                <div class="fade-up">
                    <span class="text-gold-500 text-sm font-semibold uppercase tracking-wider">Kirim Pesan</span>
                    <h2 class="text-2xl font-bold text-navy-800 mt-2 mb-3">Hubungi Kami</h2>
                    <div class="gold-line mb-8"></div>

                    @if(session('success'))
                        <div class="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl mb-6 flex items-start gap-3">
                            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <p class="text-sm">{{ session('success') }}</p>
                        </div>
                    @endif

                    <form method="POST" action="{{ route('contact.store') }}" class="space-y-5">
                        @csrf

                        <div>
                            <label class="block text-sm font-semibold text-navy-800 mb-2">Nama Lengkap <span class="text-red-400">*</span></label>
                            <input type="text" name="name" value="{{ old('name') }}" required
                                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                                placeholder="Nama lengkap kamu">
                            @error('name')
                                <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-navy-800 mb-2">No. HP <span class="text-gray-400 font-normal">(opsional)</span></label>
                            <input type="text" name="phone" value="{{ old('phone') }}"
                                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                                placeholder="08xxxxxxxxxx">
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-navy-800 mb-2">Pesan <span class="text-red-400">*</span></label>
                            <textarea name="message" rows="6" required
                                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all resize-none"
                                placeholder="Tulis pesan, pertanyaan, atau saran kamu...">{{ old('message') }}</textarea>
                            @error('message')
                                <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <button type="submit"
                            class="w-full bg-navy-800 text-white py-3.5 rounded-xl font-semibold hover:bg-navy-700 transition-all duration-300 hover:shadow-lg">
                            Kirim Pesan
                        </button>
                    </form>
                </div>

            </div>
        </div>
    </section>

@endsection