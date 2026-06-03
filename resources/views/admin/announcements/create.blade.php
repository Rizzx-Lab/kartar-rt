@extends('layouts.admin')
@section('title', 'Tambah Pengumuman - Admin')
@section('page-title', 'Tambah Pengumuman')

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.announcements.index') }}" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-navy-700 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
    </a>
    <h1 class="text-2xl font-bold text-navy-800 mt-2">Tambah Pengumuman</h1>
</div>

<div class="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
    <form method="POST" action="{{ route('admin.announcements.store') }}" class="space-y-5">
        @csrf
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Judul <span class="text-red-400">*</span></label>
            <input type="text" name="title" value="{{ old('title') }}" required
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                placeholder="Judul pengumuman">
            @error('title')<p class="text-red-400 text-xs mt-1">{{ $message }}</p>@enderror
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Tipe <span class="text-red-400">*</span></label>
            <select name="type" required class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                <option value="info" {{ old('type') === 'info' ? 'selected' : '' }}>Info</option>
                <option value="warning" {{ old('type') === 'warning' ? 'selected' : '' }}>Peringatan</option>
                <option value="event" {{ old('type') === 'event' ? 'selected' : '' }}>Event</option>
            </select>
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Isi Pengumuman <span class="text-red-400">*</span></label>
            <textarea name="content" rows="6" required
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all resize-none"
                placeholder="Tulis isi pengumuman...">{{ old('content') }}</textarea>
            @error('content')<p class="text-red-400 text-xs mt-1">{{ $message }}</p>@enderror
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Berlaku Hingga <span class="text-gray-400 font-normal">(opsional)</span></label>
            <input type="datetime-local" name="expired_at" value="{{ old('expired_at') }}"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
            <p class="text-gray-400 text-xs mt-1">Kosongkan jika tidak ada batas waktu</p>
        </div>
        <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_pinned" value="1" {{ old('is_pinned') ? 'checked' : '' }} class="w-4 h-4 text-navy-700 rounded">
                <span class="text-sm font-medium text-gray-700">Sematkan pengumuman</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_published" value="1" {{ old('is_published') ? 'checked' : '' }} class="w-4 h-4 text-navy-700 rounded">
                <span class="text-sm font-medium text-gray-700">Publish sekarang</span>
            </label>
        </div>
        <div class="flex gap-3 pt-2">
            <button type="submit" class="bg-navy-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">Simpan</button>
            <a href="{{ route('admin.announcements.index') }}" class="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Batal</a>
        </div>
    </form>
</div>
@endsection