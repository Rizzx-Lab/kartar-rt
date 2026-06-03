<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramSession;
use Illuminate\Http\Request;

class SessionAdminController extends Controller
{
    public function index(Program $program)
    {
        $sessions = $program->sessions()->orderBy('held_at', 'desc')->get();
        return view('admin.sessions.index', compact('program', 'sessions'));
    }

    public function create(Program $program)
    {
        return view('admin.sessions.create', compact('program'));
    }

    public function store(Request $request, Program $program)
    {
        $request->validate([
            'title'             => 'required|string|max:150',
            'held_at'           => 'required|date',
            'location'          => 'nullable|string|max:200',
            'description'       => 'nullable|string',
            'participant_count' => 'nullable|integer',
            'status'            => 'required|in:upcoming,done,cancelled',
        ]);

        $program->sessions()->create($request->only(
            'title', 'held_at', 'location', 'description', 'participant_count', 'status'
        ));

        return redirect()->route('admin.programs.sessions.index', $program)->with('success', 'Sesi berhasil ditambahkan!');
    }

    public function edit(ProgramSession $session)
    {
        return view('admin.sessions.edit', compact('session'));
    }

    public function update(Request $request, ProgramSession $session)
    {
        $request->validate([
            'title'             => 'required|string|max:150',
            'held_at'           => 'required|date',
            'location'          => 'nullable|string|max:200',
            'description'       => 'nullable|string',
            'participant_count' => 'nullable|integer',
            'status'            => 'required|in:upcoming,done,cancelled',
        ]);

        $session->update($request->only(
            'title', 'held_at', 'location', 'description', 'participant_count', 'status'
        ));

        return redirect()->route('admin.programs.sessions.index', $session->program)->with('success', 'Sesi berhasil diupdate!');
    }

    public function destroy(ProgramSession $session)
    {
        $program = $session->program;
        $session->delete();
        return redirect()->route('admin.programs.sessions.index', $program)->with('success', 'Sesi berhasil dihapus!');
    }
}