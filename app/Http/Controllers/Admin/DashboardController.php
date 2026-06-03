<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Contact;
use App\Models\Program;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'programs'      => Program::count(),
            'announcements' => Announcement::count(),
            'contacts'      => Contact::where('is_read', false)->count(),
            'users'         => User::count(),
        ];

        $latestContacts      = Contact::latest()->take(5)->get();
        $latestAnnouncements = Announcement::latest()->take(5)->get();

        return view('admin.dashboard', compact('stats', 'latestContacts', 'latestAnnouncements'));
    }
}