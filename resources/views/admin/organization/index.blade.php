@extends('layouts.admin')
@section('title', 'Struktur Organisasi - Admin')
@section('page-title', 'Struktur Organisasi')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-2xl font-bold text-navy-800">Struktur Organisasi</h1>
        <p class="text-gray-400 text-sm mt-1">Kelola pengurus Karang Taruna Armalo Eluf</p>
    </div>
    <a href="{{ route('admin.organization.create') }}"
        class="bg-navy-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Pengurus
    </a>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    @forelse($members as $member)
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover">
            <div class="h-48 bg-navy-50 overflow-hidden relative">
                @if($member->photo)
                    <img src="{{ Storage::url($member->photo) }}" alt="{{ $member->name }}" class="w-full h-full object-cover object-top">
                @else
                    <div class="w-full h-full flex items-center justify-center">
                        <div class="w-20 h-20 rounded-full bg-navy-800 flex items-center justify-center text-gold-400 font-bold text-2xl">
                            {{ strtoupper(substr($member->name, 0, 1)) }}
                        </div>
                    </div>
                @endif
                <div class="absolute top-3 right-3">
                    <span class="text-xs px-2 py-1 rounded-full {{ $member->is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500' }}">
                        {{ $member->is_active ? 'Aktif' : 'Nonaktif' }}
                    </span>
                </div>
            </div>
            <div class="p-5">
                <p class="font-bold text-navy-800">{{ $member->name }}</p>
                <p class="text-gold-500 text-sm font-medium mt-0.5">{{ $member->position }}</p>
                @if($member->description)
                    <p class="text-gray-400 text-xs mt-2">{{ Str::limit($member->description, 60) }}</p>
                @endif
                <div class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <a href="{{ route('admin.organization.edit', $member) }}" class="text-xs font-medium text-gold-500 hover:text-gold-600">Edit</a>
                    <form method="POST" action="{{ route('admin.organization.destroy', $member) }}" onsubmit="return confirm('Yakin hapus pengurus ini?')">
                        @csrf @method('DELETE')
                        <button type="submit" class="text-xs font-medium text-red-400 hover:text-red-500">Hapus</button>
                    </form>
                    <span class="text-xs text-gray-300 ml-auto">Urutan: {{ $member->order }}</span>
                </div>
            </div>
        </div>
    @empty
        <div class="col-span-3 text-center py-20 text-gray-400 text-sm">Belum ada data pengurus.</div>
    @endforelse
</div>
@endsection