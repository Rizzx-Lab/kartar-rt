@extends('layouts.admin')
@section('title', 'Tambah Pengurus - Admin')
@section('page-title', 'Tambah Pengurus')

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.organization.index') }}" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-navy-700 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
    </a>
    <h1 class="text-2xl font-bold text-navy-800 mt-2">Tambah Pengurus</h1>
</div>

<div class="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
    <form method="POST" action="{{ route('admin.organization.store') }}" enctype="multipart/form-data" class="space-y-5">
        @csrf

        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-navy-800 mb-1.5">Nama Lengkap <span class="text-red-400">*</span></label>
                <input type="text" name="name" value="{{ old('name') }}" required
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                    placeholder="contoh: Ahmad Fauzi">
                @error('name')<p class="text-red-400 text-xs mt-1">{{ $message }}</p>@enderror
            </div>
            <div>
                <label class="block text-sm font-semibold text-navy-800 mb-1.5">Jabatan <span class="text-red-400">*</span></label>
                <input type="text" name="position" value="{{ old('position') }}" required
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                    placeholder="contoh: Ketua">
                @error('position')<p class="text-red-400 text-xs mt-1">{{ $message }}</p>@enderror
            </div>
        </div>

        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Deskripsi <span class="text-gray-400 font-normal">(opsional)</span></label>
            <textarea name="description" rows="3"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all resize-none"
                placeholder="Tugas atau peran singkat...">{{ old('description') }}</textarea>
        </div>

        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Foto <span class="text-gray-400 font-normal">(opsional)</span></label>
            <div class="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:border-navy-300 transition-colors">
                <div id="photoPreview" class="hidden relative h-48">
                    <img id="photoImg" src="" class="w-full h-full object-cover object-top">
                    <div class="absolute inset-0 bg-navy-900 bg-opacity-40 flex items-center justify-center">
                        <label for="photoInput" class="cursor-pointer bg-white text-navy-800 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100">Ganti Foto</label>
                    </div>
                </div>
                <div id="uploadArea" class="p-8 text-center">
                    <input type="file" name="photo" accept="image/*" class="hidden" id="photoInput" onchange="previewPhoto(this)">
                    <label for="photoInput" class="cursor-pointer">
                        <div class="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <svg class="w-6 h-6 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                        </div>
                        <p class="text-sm text-gray-500">Klik untuk upload foto pengurus</p>
                        <p class="text-xs text-gray-400 mt-1">JPG, PNG, max 2MB. Foto wajah direkomendasikan.</p>
                    </label>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-navy-800 mb-1.5">Urutan Tampil</label>
                <input type="number" name="order" value="{{ old('order', 0) }}"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                    placeholder="0 = paling atas">
                <p class="text-gray-400 text-xs mt-1">Angka kecil tampil lebih dulu</p>
            </div>
            <div class="flex items-end pb-3">
                <label class="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" name="is_active" value="1" {{ old('is_active', true) ? 'checked' : '' }} class="w-4 h-4 text-navy-700 rounded">
                    <span class="text-sm font-medium text-gray-700">Tampilkan di website</span>
                </label>
            </div>
        </div>

        <div class="flex gap-3 pt-2">
            <button type="submit" class="bg-navy-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">Simpan</button>
            <a href="{{ route('admin.organization.index') }}" class="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Batal</a>
        </div>
    </form>
</div>

<script>
function previewPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('photoImg').src = e.target.result;
            document.getElementById('photoPreview').classList.remove('hidden');
            document.getElementById('uploadArea').classList.add('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}
</script>
@endsection