@extends('layouts.admin')
@section('title', 'Sesi Program - Admin')
@section('page-title', 'Sesi Program Kerja')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <a href="{{ route('admin.programs.index') }}" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-navy-700 transition-colors mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Kembali ke Program
        </a>
        <h1 class="text-2xl font-bold text-navy-800">Sesi: {{ $program->name }}</h1>
        <p class="text-gray-400 text-sm mt-1">Riwayat pertemuan program ini</p>
    </div>
    <a href="{{ route('admin.programs.sessions.create', $program) }}"
        class="bg-navy-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Sesi
    </a>
</div>

<div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Judul</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tanggal</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Lokasi</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Peserta</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
            @forelse($sessions as $session)
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-semibold text-navy-800">{{ $session->title }}</td>
                    <td class="px-6 py-4 text-gray-500">{{ $session->held_at->format('d M Y') }}</td>
                    <td class="px-6 py-4 text-gray-500">{{ $session->location ?? '-' }}</td>
                    <td class="px-6 py-4 text-gray-500">{{ $session->participant_count ?? '-' }}</td>
                    <td class="px-6 py-4">
                        <span class="text-xs font-medium px-2.5 py-1 rounded-full
                            {{ $session->status === 'upcoming' ? 'bg-blue-50 text-blue-600' : ($session->status === 'done' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500') }}">
                            {{ $session->status === 'upcoming' ? 'Akan Datang' : ($session->status === 'done' ? 'Selesai' : 'Dibatalkan') }}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <a href="{{ route('admin.sessions.edit', $session) }}" class="text-xs font-medium text-gold-500 hover:text-gold-600">Edit</a>
                            <form method="POST" action="{{ route('admin.sessions.destroy', $session) }}" onsubmit="return confirm('Yakin hapus sesi ini?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="text-xs font-medium text-red-400 hover:text-red-500">Hapus</button>
                            </form>
                        </div>
                    </td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-6 py-16 text-center text-gray-400 text-sm">Belum ada sesi.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection