@extends('layouts.admin')

@section('title', 'Dashboard - Admin Karang Taruna')
@section('page-title', 'Dashboard')

@section('content')

    <div class="mb-6">
        <h1 class="text-2xl font-bold text-navy-800">Selamat Datang, {{ auth()->user()->name }}</h1>
        <p class="text-gray-500 text-sm mt-1">Berikut ringkasan aktivitas website Karang Taruna Armalo Eluf</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div class="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
            <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
                <span class="text-xs text-gray-400">Total</span>
            </div>
            <div class="text-3xl font-bold text-navy-800">{{ $stats['programs'] }}</div>
            <div class="text-gray-500 text-sm mt-1">Program Kerja</div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
            <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 bg-gold-500 bg-opacity-10 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </div>
                <span class="text-xs text-gray-400">Total</span>
            </div>
            <div class="text-3xl font-bold text-navy-800">{{ $stats['announcements'] }}</div>
            <div class="text-gray-500 text-sm mt-1">Pengumuman</div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
            <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                </div>
                <span class="text-xs text-gray-400">Belum dibaca</span>
            </div>
            <div class="text-3xl font-bold text-navy-800">{{ $stats['contacts'] }}</div>
            <div class="text-gray-500 text-sm mt-1">Pesan Masuk</div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
            <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                </div>
                <span class="text-xs text-gray-400">Total</span>
            </div>
            <div class="text-3xl font-bold text-navy-800">{{ $stats['users'] }}</div>
            <div class="text-gray-500 text-sm mt-1">Total User</div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <a href="{{ route('admin.programs.create') }}" class="bg-navy-800 text-white rounded-xl p-4 text-center hover:bg-navy-700 transition-colors">
            <svg class="w-6 h-6 mx-auto mb-2 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="text-xs font-medium">Tambah Program</span>
        </a>
        <a href="{{ route('admin.announcements.create') }}" class="bg-navy-800 text-white rounded-xl p-4 text-center hover:bg-navy-700 transition-colors">
            <svg class="w-6 h-6 mx-auto mb-2 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="text-xs font-medium">Tambah Pengumuman</span>
        </a>
        <a href="{{ route('admin.galleries.create') }}" class="bg-navy-800 text-white rounded-xl p-4 text-center hover:bg-navy-700 transition-colors">
            <svg class="w-6 h-6 mx-auto mb-2 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="text-xs font-medium">Upload Galeri</span>
        </a>
        <a href="{{ route('admin.contacts.index') }}" class="bg-navy-800 text-white rounded-xl p-4 text-center hover:bg-navy-700 transition-colors">
            <svg class="w-6 h-6 mx-auto mb-2 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span class="text-xs font-medium">Cek Pesan</span>
        </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Pesan Terbaru -->
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 class="font-bold text-navy-800">Pesan Terbaru</h2>
                <a href="{{ route('admin.contacts.index') }}" class="text-xs text-gold-500 hover:text-gold-600 font-medium">Lihat Semua →</a>
            </div>
            <div class="divide-y divide-gray-50">
                @forelse($latestContacts as $contact)
                    <div class="px-6 py-4 flex items-start justify-between gap-3">
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center text-navy-700 font-bold text-xs flex-shrink-0">
                                {{ strtoupper(substr($contact->name, 0, 1)) }}
                            </div>
                            <div>
                                <p class="font-medium text-sm text-navy-800">{{ $contact->name }}</p>
                                <p class="text-gray-400 text-xs mt-0.5">{{ Str::limit($contact->message, 50) }}</p>
                                <p class="text-gray-300 text-xs mt-1">{{ $contact->created_at->diffForHumans() }}</p>
                            </div>
                        </div>
                        @if(!$contact->is_read)
                            <span class="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-1.5"></span>
                        @endif
                    </div>
                @empty
                    <div class="px-6 py-8 text-center text-gray-400 text-sm">Belum ada pesan masuk.</div>
                @endforelse
            </div>
        </div>

        <!-- Pengumuman Terbaru -->
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 class="font-bold text-navy-800">Pengumuman Terbaru</h2>
                <a href="{{ route('admin.announcements.index') }}" class="text-xs text-gold-500 hover:text-gold-600 font-medium">Lihat Semua →</a>
            </div>
            <div class="divide-y divide-gray-50">
                @forelse($latestAnnouncements as $announcement)
                    <div class="px-6 py-4">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="w-1.5 h-1.5 rounded-full {{ $announcement->type === 'warning' ? 'bg-red-500' : ($announcement->type === 'event' ? 'bg-blue-500' : 'bg-gold-500') }}"></span>
                            <p class="font-medium text-sm text-navy-800">{{ Str::limit($announcement->title, 45) }}</p>
                        </div>
                        <div class="flex items-center gap-2 ml-3.5">
                            <span class="text-xs text-gray-400">{{ $announcement->created_at->diffForHumans() }}</span>
                            @if($announcement->published_at)
                                <span class="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">Published</span>
                            @else
                                <span class="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Draft</span>
                            @endif
                        </div>
                    </div>
                @empty
                    <div class="px-6 py-8 text-center text-gray-400 text-sm">Belum ada pengumuman.</div>
                @endforelse
            </div>
        </div>

    </div>

@endsection