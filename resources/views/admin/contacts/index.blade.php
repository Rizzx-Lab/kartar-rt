@extends('layouts.admin')
@section('title', 'Pesan Masuk - Admin')
@section('page-title', 'Pesan Masuk')

@section('content')
<div class="mb-6">
    <h1 class="text-2xl font-bold text-navy-800">Pesan Masuk</h1>
    <p class="text-gray-400 text-sm mt-1">Pesan dari form kontak website</p>
</div>

<div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Pengirim</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Pesan</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tanggal</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
            @forelse($contacts as $contact)
                <tr class="hover:bg-gray-50 transition-colors {{ !$contact->is_read ? 'bg-navy-50' : '' }}">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-xs flex-shrink-0">
                                {{ strtoupper(substr($contact->name, 0, 1)) }}
                            </div>
                            <div>
                                <p class="font-semibold text-navy-800">{{ $contact->name }}</p>
                                @if($contact->phone)
                                    <p class="text-gray-400 text-xs">{{ $contact->phone }}</p>
                                @endif
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-500">{{ Str::limit($contact->message, 70) }}</td>
                    <td class="px-6 py-4 text-gray-400 text-xs">{{ $contact->created_at->format('d M Y, H:i') }}</td>
                    <td class="px-6 py-4">
                        <span class="text-xs font-medium px-2.5 py-1 rounded-full {{ $contact->is_read ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-500' }}">
                            {{ $contact->is_read ? 'Dibaca' : 'Baru' }}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            @if(!$contact->is_read)
                                <form method="POST" action="{{ route('admin.contacts.read', $contact) }}">
                                    @csrf @method('PATCH')
                                    <button type="submit" class="text-xs font-medium text-gold-500 hover:text-gold-600">Tandai Dibaca</button>
                                </form>
                            @endif
                            <form method="POST" action="{{ route('admin.contacts.destroy', $contact) }}" onsubmit="return confirm('Yakin hapus pesan ini?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="text-xs font-medium text-red-400 hover:text-red-500">Hapus</button>
                            </form>
                        </div>
                    </td>
                </tr>
            @empty
                <tr><td colspan="5" class="px-6 py-16 text-center text-gray-400 text-sm">Belum ada pesan masuk.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="px-6 py-4 border-t border-gray-100">{{ $contacts->links() }}</div>
</div>
@endsection