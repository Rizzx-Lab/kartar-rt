<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramSession;

class ProgramController extends Controller
{
    public function index()
    {
        $programs = Program::where('is_active', true)->orderBy('order')->get();
        return view('public.programs.index', compact('programs'));
    }

    public function show($slug)
    {
        $program = Program::where('slug', $slug)->firstOrFail();
        $sessions = $program->sessions()->orderBy('held_at', 'desc')->get();
        return view('public.programs.show', compact('program', 'sessions'));
    }
}