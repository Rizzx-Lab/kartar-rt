@extends('layouts.admin')
@section('title', 'Edit Program - Admin')
@section('page-title', 'Edit Program Kerja')

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.programs.index') }}" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-navy-700 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Kembali
    </a>
    <h1 class="text-2xl font-bold text-navy-800 mt-2">Edit Program Kerja</h1>
</div>

<div class="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
    <form method="POST" action="{{ route('admin.programs.update', $program) }}" enctype="multipart/form-data" class="space-y-5">
        @csrf
        @method('PUT')

        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Nama Program <span class="text-red-400">*</span></label>
            <input type="text" name="name" value="{{ old('name', $program->name) }}" required
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
            @error('name')<p class="text-red-400 text-xs mt-1">{{ $message }}</p>@enderror
        </div>

        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Deskripsi</label>
            <textarea name="description" rows="4"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all resize-none">{{ old('description', $program->description) }}</textarea>
        </div>

        {{-- Cover Image — SATU input file saja --}}
        <div>
            <label class="block text-sm font-semibold text-navy-800 mb-1.5">Foto Cover</label>
            <div class="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:border-navy-300 transition-colors">

                {{-- Preview foto yang sudah ada atau yang baru dipilih --}}
                <div id="coverPreview" class="{{ $program->cover_image ? '' : 'hidden' }} relative h-48">
                    <img id="coverImg"
                        src="{{ $program->cover_image ? Storage::url($program->cover_image) : '' }}"
                        class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-navy-900 bg-opacity-50 flex items-center justify-center">
                        <label for="coverInput"
                            class="cursor-pointer bg-white text-navy-800 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors">
                            Ganti Foto
                        </label>
                    </div>
                </div>

                {{-- Area upload (tampil kalau belum ada foto) --}}
                <div id="uploadArea" class="{{ $program->cover_image ? 'hidden' : '' }} p-8 text-center">
                    <label for="coverInput" class="cursor-pointer">
                        <div class="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <svg class="w-6 h-6 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <p class="text-sm text-gray-500">Klik untuk upload foto cover</p>
                        <p class="text-xs text-gray-400 mt-1">JPG, PNG, max 2MB. Rasio 16:9 direkomendasikan.</p>
                    </label>
                </div>

                {{-- INI SATU-SATUNYA INPUT FILE --}}
                <input type="file"
                    name="cover_image"
                    accept="image/*"
                    class="hidden"
                    id="coverInput"
                    onchange="previewCover(this)">
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-navy-800 mb-1.5">Frekuensi <span class="text-red-400">*</span></label>
                <select name="frequency" required
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
                    <option value="monthly" {{ old('frequency', $program->frequency) === 'monthly' ? 'selected' : '' }}>Bulanan</option>
                    <option value="yearly"  {{ old('frequency', $program->frequency) === 'yearly'  ? 'selected' : '' }}>Tahunan</option>
                    <option value="once"    {{ old('frequency', $program->frequency) === 'once'    ? 'selected' : '' }}>Sekali</option>
                    <option value="irregular" {{ old('frequency', $program->frequency) === 'irregular' ? 'selected' : '' }}>Tidak Tentu</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-semibold text-navy-800 mb-1.5">Urutan Tampil</label>
                <input type="number" name="order" value="{{ old('order', $program->order) }}"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all">
            </div>
        </div>

        <div>
            <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" name="is_active" value="1"
                    {{ old('is_active', $program->is_active) ? 'checked' : '' }}
                    class="w-4 h-4 text-navy-700 rounded">
                <span class="text-sm font-medium text-gray-700">Program Aktif</span>
            </label>
        </div>

        <div class="flex gap-3 pt-2">
            <button type="submit"
                class="bg-navy-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors">
                Update
            </button>
            <a href="{{ route('admin.programs.index') }}"
                class="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                Batal
            </a>
        </div>

    </form>
</div>

<script>
function previewCover(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('coverImg').src = e.target.result;
            document.getElementById('coverPreview').classList.remove('hidden');
            document.getElementById('uploadArea').classList.add('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}
</script>
@endsection