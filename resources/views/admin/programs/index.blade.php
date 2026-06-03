@extends('layouts.admin')
@section('title', 'Program Kerja - Admin')
@section('page-title', 'Program Kerja')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-2xl font-bold text-navy-800">Program Kerja</h1>
        <p class="text-gray-400 text-sm mt-1">Kelola semua program kerja Karang Taruna</p>
    </div>
    <a href="{{ route('admin.programs.create') }}"
        class="bg-navy-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Tambah Program
    </a>
</div>

<div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nama Program</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Frekuensi</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
            @forelse($programs as $program)
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                        <p class="font-semibold text-navy-800">{{ $program->name }}</p>
                        <p class="text-gray-400 text-xs mt-0.5">{{ Str::limit($program->description, 60) }}</p>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-xs font-medium px-2.5 py-1 rounded-full
                            {{ $program->frequency === 'monthly' ? 'bg-blue-50 text-blue-600' : 'bg-gold-500 bg-opacity-10 text-gold-600' }}">
                            {{ $program->frequency === 'monthly' ? 'Bulanan' : ($program->frequency === 'yearly' ? 'Tahunan' : 'Insidental') }}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-xs font-medium px-2.5 py-1 rounded-full
                            {{ $program->is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500' }}">
                            {{ $program->is_active ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <a href="{{ route('admin.programs.sessions.index', $program) }}"
                                class="text-xs font-medium text-blue-600 hover:text-blue-700">Sesi</a>
                            <a href="{{ route('admin.programs.edit', $program) }}"
                                class="text-xs font-medium text-gold-500 hover:text-gold-600">Edit</a>
                            <form method="POST" action="{{ route('admin.programs.destroy', $program) }}"
                                onsubmit="return confirm('Yakin hapus program ini?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="text-xs font-medium text-red-400 hover:text-red-500">Hapus</button>
                            </form>
                        </div>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="px-6 py-16 text-center text-gray-400 text-sm">Belum ada program kerja.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection