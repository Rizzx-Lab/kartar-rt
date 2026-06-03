@extends('layouts.admin')
@section('title', 'Tambah Album - Admin')
@section('page-title', 'Tambah Album Galeri')

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.galleries.index') }}" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-navy-700 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
    </a>
    <h1 class="text-2xl font-bold text-navy-800 mt-2">Tambah Album Galeri</h1>
</div>

<div class="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
    <form method="POST" action="{{ route('admin.galleries.store') }}" enctype="multipart/form-data" class="space-y-5">
        @csrf
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Judul Album <span class="text-red-400">*</span></label>
            <input type="text" name="title" value="{{ old('title') }}" required
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                placeholder="contoh: Kumpul Bocah Juni 2025">
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Deskripsi</label>
            <textarea name="description" rows="3"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all resize-none"
                placeholder="Deskripsi album...">{{ old('description') }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Sesi Kegiatan <span class="text-gray-400 font-normal">(opsional)</span></label>
            <select name="program_session_id" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                <option value="">-- Tidak terkait sesi tertentu --</option>
                @foreach($sessions as $session)
                    <option value="{{ $session->id }}" {{ old('program_session_id') == $session->id ? 'selected' : '' }}>
                        {{ $session->program->name }} — {{ $session->title }} ({{ $session->held_at->format('d M Y') }})
                    </option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Upload Foto</label>
            <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-navy-300 transition-colors">
                <input type="file" name="photos[]" multiple accept="image/*" class="hidden" id="photoInput"
                    onchange="previewPhotos(this)">
                <label for="photoInput" class="cursor-pointer">
                    <svg class="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <p class="text-sm text-gray-500">Klik untuk pilih foto atau drag & drop</p>
                    <p class="text-xs text-gray-400 mt-1">Bisa pilih lebih dari satu. Maks 2MB per foto.</p>
                </label>
                <div id="photoPreview" class="grid grid-cols-4 gap-2 mt-4 hidden"></div>
            </div>
        </div>
        <div>
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_published" value="1" {{ old('is_published') ? 'checked' : '' }} class="w-4 h-4 text-navy-700 rounded">
                <span class="text-sm font-medium text-gray-700">Publish album ini</span>
            </label>
        </div>
        <div class="flex gap-3 pt-2">
            <button type="submit" class="bg-navy-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">Simpan</button>
            <a href="{{ route('admin.galleries.index') }}" class="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Batal</a>
        </div>
    </form>
</div>

<script>
function previewPhotos(input) {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';
    if (input.files.length > 0) {
        preview.classList.remove('hidden');
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                const div = document.createElement('div');
                div.className = 'aspect-square rounded-lg overflow-hidden bg-gray-100';
                div.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }
}
</script>
@endsection