@extends('layouts.admin')
@section('title', 'Edit Sesi - Admin')
@section('page-title', 'Edit Sesi')

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.programs.sessions.index', $session->program) }}" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-navy-700 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
    </a>
    <h1 class="text-2xl font-bold text-navy-800 mt-2">Edit Sesi: {{ $session->title }}</h1>
</div>

<div class="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
    <form method="POST" action="{{ route('admin.sessions.update', $session) }}" class="space-y-5">
        @csrf @method('PUT')
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Judul Sesi <span class="text-red-400">*</span></label>
            <input type="text" name="title" value="{{ old('title', $session->title) }}" required
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-navy-800 mb-1.5">Tanggal & Jam <span class="text-red-400">*</span></label>
                <input type="datetime-local" name="held_at" value="{{ old('held_at', $session->held_at->format('Y-m-d\TH:i')) }}" required
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
            </div>
            <div>
                <label class="block text-sm font-semibold text-navy-800 mb-1.5">Jumlah Peserta</label>
                <input type="number" name="participant_count" value="{{ old('participant_count', $session->participant_count) }}"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
            </div>
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Lokasi</label>
            <input type="text" name="location" value="{{ old('location', $session->location) }}"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Catatan / Laporan</label>
            <textarea name="description" rows="4"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all resize-none">{{ old('description', $session->description) }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Status <span class="text-red-400">*</span></label>
            <select name="status" required class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                <option value="upcoming" {{ old('status', $session->status) === 'upcoming' ? 'selected' : '' }}>Akan Datang</option>
                <option value="done" {{ old('status', $session->status) === 'done' ? 'selected' : '' }}>Selesai</option>
                <option value="cancelled" {{ old('status', $session->status) === 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
            </select>
        </div>
        <div class="flex gap-3 pt-2">
            <button type="submit" class="bg-navy-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">Update</button>
            <a href="{{ route('admin.programs.sessions.index', $session->program) }}" class="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Batal</a>
        </div>
    </form>
</div>
@endsection