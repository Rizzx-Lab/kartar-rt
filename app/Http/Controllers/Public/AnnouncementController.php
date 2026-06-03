<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Announcement;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::published()
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->paginate(10);
        return view('public.announcements.index', compact('announcements'));
    }

    public function show($slug)
    {
        $announcement = Announcement::published()
            ->where('slug', $slug)
            ->firstOrFail();
        return view('public.announcements.show', compact('announcement'));
    }
}