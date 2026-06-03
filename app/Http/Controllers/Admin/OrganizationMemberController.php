<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrganizationMemberController extends Controller
{
    public function index()
    {
        $members = OrganizationMember::orderBy('order')->get();
        return view('admin.organization.index', compact('members'));
    }

    public function create()
    {
        return view('admin.organization.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:100',
            'position'    => 'required|string|max:100',
            'description' => 'nullable|string',
            'order'       => 'nullable|integer',
            'photo'       => 'nullable|image|max:2048',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('organization', 'public');
        }

        OrganizationMember::create([
            'name'        => $request->name,
            'position'    => $request->position,
            'description' => $request->description,
            'photo'       => $photoPath,
            'order'       => $request->order ?? 0,
            'is_active'   => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.organization.index')->with('success', 'Anggota pengurus berhasil ditambahkan!');
    }

    public function edit(OrganizationMember $organization)
    {
        return view('admin.organization.edit', compact('organization'));
    }

    public function update(Request $request, OrganizationMember $organization)
    {
        $request->validate([
            'name'        => 'required|string|max:100',
            'position'    => 'required|string|max:100',
            'description' => 'nullable|string',
            'order'       => 'nullable|integer',
            'photo'       => 'nullable|image|max:2048',
        ]);

        $photoPath = $organization->photo;
        if ($request->hasFile('photo')) {
            if ($organization->photo) {
                Storage::disk('public')->delete($organization->photo);
            }
            $photoPath = $request->file('photo')->store('organization', 'public');
        }

        $organization->update([
            'name'        => $request->name,
            'position'    => $request->position,
            'description' => $request->description,
            'photo'       => $photoPath,
            'order'       => $request->order ?? 0,
            'is_active'   => $request->boolean('is_active'),
        ]);

        return redirect()->route('admin.organization.index')->with('success', 'Data pengurus berhasil diupdate!');
    }

    public function destroy(OrganizationMember $organization)
    {
        if ($organization->photo) {
            Storage::disk('public')->delete($organization->photo);
        }
        $organization->delete();
        return redirect()->route('admin.organization.index')->with('success', 'Pengurus berhasil dihapus!');
    }
}