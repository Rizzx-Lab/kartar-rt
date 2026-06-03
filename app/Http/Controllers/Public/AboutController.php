<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\OrganizationMember;
use App\Models\SiteSetting;

class AboutController extends Controller
{
    public function index()
    {
        $members = OrganizationMember::where('is_active', true)->orderBy('order')->get();
        return view('public.about.index', compact('members'));
    }
}