@extends('layouts.admin')
@section('title', 'Edit Pengumuman - Admin')
@section('page-title', 'Edit Pengumuman')

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.announcements.index') }}" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-navy-700 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
    </a>
    <h1 class="text-2xl font-bold text-navy-800 mt-2">Edit Pengumuman</h1>
</div>

<div class="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
    <form method="POST" action="{{ route('admin.announcements.update', $announcement) }}" class="space-y-5">
        @csrf @method('PUT')
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Judul <span class="text-red-400">*</span></label>
            <input type="text" name="title" value="{{ old('title', $announcement->title) }}" required
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Tipe <span class="text-red-400">*</span></label>
            <select name="type" required class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                <option value="info" {{ old('type', $announcement->type) === 'info' ? 'selected' : '' }}>Info</option>
                <option value="warning" {{ old('type', $announcement->type) === 'warning' ? 'selected' : '' }}>Peringatan</option>
                <option value="event" {{ old('type', $announcement->type) === 'event' ? 'selected' : '' }}>Event</option>
            </select>
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Isi Pengumuman <span class="text-red-400">*</span></label>
            <textarea name="content" rows="6" required
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all resize-none">{{ old('content', $announcement->content) }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Berlaku Hingga <span class="text-gray-400 font-normal">(opsional)</span></label>
            <input type="datetime-local" name="expired_at" value="{{ old('expired_at', $announcement->expired_at?->format('Y-m-d\TH:i')) }}"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
        </div>
        <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_pinned" value="1" {{ old('is_pinned', $announcement->is_pinned) ? 'checked' : '' }} class="w-4 h-4 text-navy-700 rounded">
                <span class="text-sm font-medium text-gray-700">Sematkan pengumuman</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_published" value="1" {{ old('is_published', $announcement->published_at ? true : false) ? 'checked' : '' }} class="w-4 h-4 text-navy-700 rounded">
                <span class="text-sm font-medium text-gray-700">Publish pengumuman</span>
            </label>
        </div>
        <div class="flex gap-3 pt-2">
            <button type="submit" class="bg-navy-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">Update</button>
            <a href="{{ route('admin.announcements.index') }}" class="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Batal</a>
        </div>
    </form>
</div>
@endsection