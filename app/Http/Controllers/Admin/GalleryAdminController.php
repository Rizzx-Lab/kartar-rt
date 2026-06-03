<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\GalleryPhoto;
use App\Models\ProgramSession;
use Illuminate\Http\Request;

class GalleryAdminController extends Controller
{
    public function index()
    {
        $galleries = Gallery::with('cover')->latest()->paginate(10);
        return view('admin.galleries.index', compact('galleries'));
    }

    public function create()
    {
        $sessions = ProgramSession::with('program')->orderBy('held_at', 'desc')->get();
        return view('admin.galleries.create', compact('sessions'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'              => 'required|string|max:150',
            'description'        => 'nullable|string',
            'program_session_id' => 'nullable|exists:program_sessions,id',
            'photos'             => 'nullable|array',
            'photos.*'           => 'image|max:2048',
        ]);

        $gallery = Gallery::create([
            'title'              => $request->title,
            'description'        => $request->description,
            'program_session_id' => $request->program_session_id,
            'is_published'       => $request->boolean('is_published'),
        ]);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $i => $photo) {
                $path = $photo->store('galleries', 'public');
                $galleryPhoto = GalleryPhoto::create([
                    'gallery_id' => $gallery->id,
                    'file_path'  => $path,
                    'order'      => $i,
                ]);

                if ($i === 0) {
                    $gallery->update(['cover_photo_id' => $galleryPhoto->id]);
                }
            }
        }

        return redirect()->route('admin.galleries.index')->with('success', 'Galeri berhasil ditambahkan!');
    }

    public function edit(Gallery $gallery)
    {
        $sessions = ProgramSession::with('program')->orderBy('held_at', 'desc')->get();
        return view('admin.galleries.edit', compact('gallery', 'sessions'));
    }

    public function update(Request $request, Gallery $gallery)
    {
        $request->validate([
            'title'              => 'required|string|max:150',
            'description'        => 'nullable|string',
            'program_session_id' => 'nullable|exists:program_sessions,id',
            'photos'             => 'nullable|array',
            'photos.*'           => 'image|max:2048',
        ]);

        $gallery->update([
            'title'              => $request->title,
            'description'        => $request->description,
            'program_session_id' => $request->program_session_id,
            'is_published'       => $request->boolean('is_published'),
        ]);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $i => $photo) {
                $path = $photo->store('galleries', 'public');
                GalleryPhoto::create([
                    'gallery_id' => $gallery->id,
                    'file_path'  => $path,
                    'order'      => $gallery->photos()->count() + $i,
                ]);
            }
        }

        return redirect()->route('admin.galleries.index')->with('success', 'Galeri berhasil diupdate!');
    }

    public function destroy(Gallery $gallery)
    {
        $gallery->delete();
        return redirect()->route('admin.galleries.index')->with('success', 'Galeri berhasil dihapus!');
    }
}