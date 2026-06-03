<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProgramAdminController extends Controller
{
    public function index()
    {
        $programs = Program::orderBy('order')->get();
        return view('admin.programs.index', compact('programs'));
    }

    public function create()
    {
        return view('admin.programs.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string',
            'frequency'   => 'required|in:monthly,yearly,once,irregular',
            'order'       => 'nullable|integer',
            'cover_image' => 'nullable|image|max:2048',
        ]);

        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('programs', 'public');
        }

        Program::create([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name),
            'description' => $request->description,
            'frequency'   => $request->frequency,
            'cover_image' => $coverPath,
            'is_active'   => $request->boolean('is_active', true),
            'order'       => $request->order ?? 0,
        ]);

        return redirect()->route('admin.programs.index')->with('success', 'Program kerja berhasil ditambahkan!');
    }

    public function edit(Program $program)
    {
        return view('admin.programs.edit', compact('program'));
    }

    public function update(Request $request, Program $program)
    {
        $request->validate([
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string',
            'frequency'   => 'required|in:monthly,yearly,once,irregular',
            'order'       => 'nullable|integer',
            'cover_image' => 'nullable|image|max:2048',
        ]);

        $coverPath = $program->cover_image;

        if ($request->hasFile('cover_image')) {
            if ($program->cover_image) {
                Storage::disk('public')->delete($program->cover_image);
            }
            $coverPath = $request->file('cover_image')->store('programs', 'public');
        }

        $program->update([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name),
            'description' => $request->description,
            'frequency'   => $request->frequency,
            'cover_image' => $coverPath,
            'is_active'   => $request->boolean('is_active'),
            'order'       => $request->order ?? 0,
        ]);

        return redirect()->route('admin.programs.index')->with('success', 'Program kerja berhasil diupdate!');
    }

    public function destroy(Program $program)
    {
        if ($program->cover_image) {
            Storage::disk('public')->delete($program->cover_image);
        }
        $program->delete();
        return redirect()->route('admin.programs.index')->with('success', 'Program kerja berhasil dihapus!');
    }
}