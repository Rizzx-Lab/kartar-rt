@extends('layouts.admin')
@section('title', 'Galeri - Admin')
@section('page-title', 'Galeri')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-2xl font-bold text-navy-800">Galeri</h1>
        <p class="text-gray-400 text-sm mt-1">Kelola foto dan album kegiatan</p>
    </div>
    <a href="{{ route('admin.galleries.create') }}"
        class="bg-navy-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Album
    </a>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    @forelse($galleries as $gallery)
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover">
            <div class="h-44 bg-navy-50 overflow-hidden">
                @if($gallery->cover)
                    <img src="{{ Storage::url($gallery->cover->file_path) }}" alt="{{ $gallery->title }}" class="w-full h-full object-cover">
                @else
                    <div class="w-full h-full flex items-center justify-center">
                        <svg class="w-10 h-10 text-navy-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </div>
                @endif
            </div>
            <div class="p-5">
                <div class="flex items-center justify-between mb-1">
                    <h3 class="font-bold text-navy-800">{{ $gallery->title }}</h3>
                    <span class="text-xs px-2 py-0.5 rounded-full {{ $gallery->is_published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500' }}">
                        {{ $gallery->is_published ? 'Published' : 'Draft' }}
                    </span>
                </div>
                @if($gallery->description)
                    <p class="text-gray-400 text-xs mb-3">{{ Str::limit($gallery->description, 60) }}</p>
                @endif
                <div class="flex items-center gap-3 pt-3 border-t border-gray-100 mt-3">
                    <a href="{{ route('admin.galleries.edit', $gallery) }}" class="text-xs font-medium text-gold-500 hover:text-gold-600">Edit</a>
                    <form method="POST" action="{{ route('admin.galleries.destroy', $gallery) }}" onsubmit="return confirm('Yakin hapus album ini?')">
                        @csrf @method('DELETE')
                        <button type="submit" class="text-xs font-medium text-red-400 hover:text-red-500">Hapus</button>
                    </form>
                </div>
            </div>
        </div>
    @empty
        <div class="col-span-3 text-center py-20 text-gray-400 text-sm">Belum ada album galeri.</div>
    @endforelse
</div>
<div class="mt-6">{{ $galleries->links() }}</div>
@endsection