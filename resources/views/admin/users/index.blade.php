@extends('layouts.admin')
@section('title', 'Kelola User - Admin')
@section('page-title', 'Kelola User')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-2xl font-bold text-navy-800">Kelola User</h1>
        <p class="text-gray-400 text-sm mt-1">Kelola akun dan role pengguna</p>
    </div>
    <a href="{{ route('admin.users.create') }}"
        class="bg-navy-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah User
    </a>
</div>

<div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nama</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Role</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Bergabung</th>
                <th class="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
            @forelse($users as $user)
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-gold-400 font-bold text-xs flex-shrink-0">
                                {{ strtoupper(substr($user->name, 0, 1)) }}
                            </div>
                            <p class="font-semibold text-navy-800">{{ $user->name }}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-500">{{ $user->email }}</td>
                    <td class="px-6 py-4">
                        <span class="text-xs font-medium px-2.5 py-1 rounded-full
                            {{ $user->role === 'super_admin' ? 'bg-purple-50 text-purple-600' : ($user->role === 'admin' ? 'bg-navy-50 text-navy-700' : 'bg-gray-100 text-gray-500') }}">
                            {{ $user->role === 'super_admin' ? 'Super Admin' : ($user->role === 'admin' ? 'Admin' : 'Member') }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-gray-400 text-xs">{{ $user->created_at->format('d M Y') }}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <a href="{{ route('admin.users.edit', $user) }}" class="text-xs font-medium text-gold-500 hover:text-gold-600">Edit</a>
                            @if($user->id !== auth()->id())
                                <form method="POST" action="{{ route('admin.users.destroy', $user) }}" onsubmit="return confirm('Yakin hapus user ini?')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="text-xs font-medium text-red-400 hover:text-red-500">Hapus</button>
                                </form>
                            @endif
                        </div>
                    </td>
                </tr>
            @empty
                <tr><td colspan="5" class="px-6 py-16 text-center text-gray-400 text-sm">Belum ada user.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="px-6 py-4 border-t border-gray-100">{{ $users->links() }}</div>
</div>
@endsection