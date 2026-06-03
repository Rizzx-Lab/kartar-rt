<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Gallery;

class GalleryController extends Controller
{
    public function index()
    {
        $galleries = Gallery::where('is_published', true)
            ->with('cover')
            ->latest()
            ->paginate(12);
        return view('public.gallery.index', compact('galleries'));
    }

    public function show($id)
    {
        $gallery = Gallery::where('is_published', true)
            ->with('photos')
            ->findOrFail($id);
        return view('public.gallery.show', compact('gallery'));
    }
}