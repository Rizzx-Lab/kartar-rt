<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnnouncementAdminController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('user')->latest()->paginate(10);
        return view('admin.announcements.index', compact('announcements'));
    }

    public function create()
    {
        return view('admin.announcements.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'      => 'required|string|max:200',
            'content'    => 'required|string',
            'type'       => 'required|in:info,warning,event',
            'expired_at' => 'nullable|date',
        ]);

        Announcement::create([
            'user_id'      => auth()->id(),
            'title'        => $request->title,
            'slug'         => Str::slug($request->title) . '-' . time(),
            'content'      => $request->content,
            'type'         => $request->type,
            'is_pinned'    => $request->boolean('is_pinned'),
            'published_at' => $request->boolean('is_published') ? now() : null,
            'expired_at'   => $request->expired_at,
        ]);

        return redirect()->route('admin.announcements.index')->with('success', 'Pengumuman berhasil ditambahkan!');
    }

    public function edit(Announcement $announcement)
    {
        return view('admin.announcements.edit', compact('announcement'));
    }

    public function update(Request $request, Announcement $announcement)
    {
        $request->validate([
            'title'      => 'required|string|max:200',
            'content'    => 'required|string',
            'type'       => 'required|in:info,warning,event',
            'expired_at' => 'nullable|date',
        ]);

        $announcement->update([
            'title'        => $request->title,
            'slug'         => Str::slug($request->title) . '-' . $announcement->id,
            'content'      => $request->content,
            'type'         => $request->type,
            'is_pinned'    => $request->boolean('is_pinned'),
            'published_at' => $request->boolean('is_published') ? ($announcement->published_at ?? now()) : null,
            'expired_at'   => $request->expired_at,
        ]);

        return redirect()->route('admin.announcements.index')->with('success', 'Pengumuman berhasil diupdate!');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return redirect()->route('admin.announcements.index')->with('success', 'Pengumuman berhasil dihapus!');
    }
}