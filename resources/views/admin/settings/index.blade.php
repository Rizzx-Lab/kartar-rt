@extends('layouts.admin')
@section('title', 'Pengaturan - Admin')
@section('page-title', 'Pengaturan Website')

@section('content')
<div class="mb-6">
    <h1 class="text-2xl font-bold text-navy-800">Pengaturan Website</h1>
    <p class="text-gray-400 text-sm mt-1">Kelola informasi dan identitas website</p>
</div>

<div class="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
    <form method="POST" action="{{ route('admin.settings.update') }}" class="space-y-6">
        @csrf @method('PATCH')

        <div>
            <h3 class="font-bold text-navy-800 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Identitas Website</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-navy-800 mb-1.5">Nama Website <span class="text-red-400">*</span></label>
                    <input type="text" name="site_name" value="{{ old('site_name', $settings['site_name']->value ?? '') }}" required
                        class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-navy-800 mb-1.5">Tagline</label>
                    <input type="text" name="site_tagline" value="{{ old('site_tagline', $settings['site_tagline']->value ?? '') }}"
                        class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                        placeholder="contoh: Bersatu, Bergerak, Bermanfaat">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-navy-800 mb-1.5">Nomor RT/RW</label>
                    <input type="text" name="rt_number" value="{{ old('rt_number', $settings['rt_number']->value ?? '') }}"
                        class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-navy-800 mb-1.5">Tentang Kami</label>
                    <textarea name="about_text" rows="4"
                        class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all resize-none">{{ old('about_text', $settings['about_text']->value ?? '') }}</textarea>
                </div>
            </div>
        </div>

        <div>
            <h3 class="font-bold text-navy-800 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Kontak</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-navy-800 mb-1.5">Alamat</label>
                    <input type="text" name="address" value="{{ old('address', $settings['address']->value ?? '') }}"
                        class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-navy-800 mb-1.5">No. HP Ketua</label>
                        <input type="text" name="phone_ketua" value="{{ old('phone_ketua', $settings['phone_ketua']->value ?? '') }}"
                            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-navy-800 mb-1.5">Email</label>
                        <input type="email" name="email_contact" value="{{ old('email_contact', $settings['email_contact']->value ?? '') }}"
                            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                    </div>
                </div>
            </div>
        </div>

        <div>
            <h3 class="font-bold text-navy-800 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Media Sosial</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-navy-800 mb-1.5">Instagram</label>
                    <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-navy-500">
                        <span class="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">@</span>
                        <input type="text" name="social_instagram" value="{{ old('social_instagram', $settings['social_instagram']->value ?? '') }}"
                            class="flex-1 px-4 py-3 text-sm focus:outline-none" placeholder="username">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-navy-800 mb-1.5">Facebook</label>
                    <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-navy-500">
                        <span class="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">fb.com/</span>
                        <input type="text" name="social_facebook" value="{{ old('social_facebook', $settings['social_facebook']->value ?? '') }}"
                            class="flex-1 px-4 py-3 text-sm focus:outline-none" placeholder="username">
                    </div>
                </div>
            </div>
        </div>

        <button type="submit" class="bg-navy-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">
            Simpan Pengaturan
        </button>
    </form>
</div>
@endsection