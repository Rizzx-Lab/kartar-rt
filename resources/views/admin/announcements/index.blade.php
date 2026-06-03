@extends('layouts.admin')
@section('title', 'Pengumuman - Admin')
@section('page-title', 'Pengumuman')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-2xl font-bold text-navy-800">Pengumuman</h1>
        <p class="text-gray-400 text-sm mt-1">Kelola semua pengumuman dan informasi warga</p>
    </div>
    <a href="{{ route('admin.announcements.create') }}"
        class="bg-navy-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Pengumuman
    </a>
</div>

<div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Judul</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tipe</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tanggal</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
            @forelse($announcements as $announcement)
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            @if($announcement->is_pinned)
                                <div class="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0"></div>
                            @endif
                            <p class="font-semibold text-navy-800">{{ Str::limit($announcement->title, 45) }}</p>
                        </div>
                        <p class="text-gray-400 text-xs mt-0.5 ml-{{ $announcement->is_pinned ? '3.5' : '0' }}">{{ $announcement->user->name }}</p>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-xs font-medium px-2.5 py-1 rounded-full
                            {{ $announcement->type === 'warning' ? 'bg-red-50 text-red-500' : ($announcement->type === 'event' ? 'bg-blue-50 text-blue-600' : 'bg-gold-500 bg-opacity-10 text-gold-600') }}">
                            {{ $announcement->type === 'warning' ? 'Peringatan' : ($announcement->type === 'event' ? 'Event' : 'Info') }}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-xs font-medium px-2.5 py-1 rounded-full {{ $announcement->published_at ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500' }}">
                            {{ $announcement->published_at ? 'Published' : 'Draft' }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-gray-500">{{ $announcement->created_at->format('d M Y') }}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <a href="{{ route('admin.announcements.edit', $announcement) }}" class="text-xs font-medium text-gold-500 hover:text-gold-600">Edit</a>
                            <form method="POST" action="{{ route('admin.announcements.destroy', $announcement) }}" onsubmit="return confirm('Yakin hapus pengumuman ini?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="text-xs font-medium text-red-400 hover:text-red-500">Hapus</button>
                            </form>
                        </div>
                    </td>
                </tr>
            @empty
                <tr><td colspan="5" class="px-6 py-16 text-center text-gray-400 text-sm">Belum ada pengumuman.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="px-6 py-4 border-t border-gray-100">{{ $announcements->links() }}</div>
</div>
@endsection