<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Program;

class HomeController extends Controller
{
    public function index()
    {
        $announcements = Announcement::published()->orderBy('is_pinned', 'desc')->take(3)->get();
        $programs = Program::where('is_active', true)->orderBy('order')->get();

        return view('public.home.index', compact('announcements', 'programs'));
    }
}