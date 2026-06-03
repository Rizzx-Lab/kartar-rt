@extends('layouts.admin')
@section('title', 'Edit Album - Admin')
@section('page-title', 'Edit Album Galeri')

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.galleries.index') }}" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-navy-700 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
    </a>
    <h1 class="text-2xl font-bold text-navy-800 mt-2">Edit Album: {{ $gallery->title }}</h1>
</div>

<div class="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
    <form method="POST" action="{{ route('admin.galleries.update', $gallery) }}" enctype="multipart/form-data" class="space-y-5">
        @csrf @method('PUT')
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Judul Album <span class="text-red-400">*</span></label>
            <input type="text" name="title" value="{{ old('title', $gallery->title) }}" required
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Deskripsi</label>
            <textarea name="description" rows="3"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all resize-none">{{ old('description', $gallery->description) }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Sesi Kegiatan <span class="text-gray-400 font-normal">(opsional)</span></label>
            <select name="program_session_id" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                <option value="">-- Tidak terkait sesi tertentu --</option>
                @foreach($sessions as $session)
                    <option value="{{ $session->id }}" {{ old('program_session_id', $gallery->program_session_id) == $session->id ? 'selected' : '' }}>
                        {{ $session->program->name }} — {{ $session->title }} ({{ $session->held_at->format('d M Y') }})
                    </option>
                @endforeach
            </select>
        </div>
        @if($gallery->photos->count() > 0)
            <div>
                <label class="block text-sm font-semibold text-navy-800 mb-2">Foto Saat Ini ({{ $gallery->photos->count() }} foto)</label>
                <div class="grid grid-cols-5 gap-2">
                    @foreach($gallery->photos as $photo)
                        <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img src="{{ Storage::url($photo->file_path) }}" class="w-full h-full object-cover">
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Tambah Foto Baru</label>
            <div class="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-navy-300 transition-colors">
                <input type="file" name="photos[]" multiple accept="image/*" class="hidden" id="photoInput" onchange="previewPhotos(this)">
                <label for="photoInput" class="cursor-pointer text-sm text-gray-500 hover:text-navy-700 transition-colors">
                    Klik untuk tambah foto baru
                </label>
                <div id="photoPreview" class="grid grid-cols-4 gap-2 mt-3 hidden"></div>
            </div>
        </div>
        <div>
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_published" value="1" {{ old('is_published', $gallery->is_published) ? 'checked' : '' }} class="w-4 h-4 text-navy-700 rounded">
                <span class="text-sm font-medium text-gray-700">Publish album ini</span>
            </label>
        </div>
        <div class="flex gap-3 pt-2">
            <button type="submit" class="bg-navy-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">Update</button>
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