<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = SiteSetting::all()->keyBy('key');
        return view('admin.settings.index', compact('settings'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'site_name'        => 'required|string|max:100',
            'site_tagline'     => 'nullable|string|max:200',
            'rt_number'        => 'nullable|string|max:50',
            'address'          => 'nullable|string',
            'phone_ketua'      => 'nullable|string|max:20',
            'email_contact'    => 'nullable|email',
            'social_instagram' => 'nullable|string|max:100',
            'social_facebook'  => 'nullable|string|max:100',
            'about_text'       => 'nullable|string',
        ]);

        foreach ($request->except('_token', '_method') as $key => $value) {
            SiteSetting::set($key, $value);
        }

        return back()->with('success', 'Pengaturan berhasil disimpan!');
    }
}