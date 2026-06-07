<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Program, ProgramSession, Announcement, Gallery, GalleryPhoto, Contact, User, OrganizationMember, SiteSetting};
use Illuminate\Http\{Request, JsonResponse};
use Illuminate\Support\Facades\{Storage, File};

class AdminApiController extends Controller
{
    // ==========================================
    // PROGRAMS
    // ==========================================
    public function programs(): JsonResponse
    {
        $programs = Program::orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $programs]);
    }

    public function programStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'frequency' => 'required|in:monthly,yearly,once,irregular',
            'cover_image' => 'nullable|image|max:2048',
            'order' => 'nullable|integer',
        ]);

        // Handle is_active separately (FormData sends strings "true"/"false")
        $data['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN) ?: true;

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('programs', 'public');
            $data['cover_image'] = $path;
        }

        $data['slug'] = \Str::slug($request->name);

        $program = Program::create($data);

        return response()->json(['success' => true, 'data' => $program, 'message' => 'Program berhasil dibuat.']);
    }

    public function programUpdate(Request $request, int $id): JsonResponse
    {
        $program = Program::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'frequency' => 'required|in:monthly,yearly,once,irregular',
            'cover_image' => 'nullable|image|max:2048',
            'order' => 'nullable|integer',
        ]);

        // Handle is_active separately (FormData sends strings)
        $data['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        if (!array_key_exists('is_active', $data)) {
            $data['is_active'] = true;
        }

        if ($request->hasFile('cover_image')) {
            if ($program->cover_image && Storage::disk('public')->exists($program->cover_image)) {
                Storage::disk('public')->delete($program->cover_image);
            }
            $path = $request->file('cover_image')->store('programs', 'public');
            $data['cover_image'] = $path;
        }

        $data['slug'] = \Str::slug($request->name);

        $program->update($data);

        return response()->json(['success' => true, 'data' => $program, 'message' => 'Program berhasil diupdate.']);
    }

    public function programDestroy(int $id): JsonResponse
    {
        $program = Program::findOrFail($id);

        // Delete cover image
        if ($program->cover_image && Storage::disk('public')->exists($program->cover_image)) {
            Storage::disk('public')->delete($program->cover_image);
        }

        $program->delete();

        return response()->json(['success' => true, 'message' => 'Program berhasil dihapus.']);
    }

    // ==========================================
    // PROGRAM SESSIONS
    // ==========================================
    public function sessions(int $programId): JsonResponse
    {
        $program = Program::findOrFail($programId);
        $sessions = $program->sessions()->orderBy('held_at', 'desc')->get();

        return response()->json(['success' => true, 'data' => $sessions]);
    }

    public function sessionStore(Request $request, int $programId): JsonResponse
    {
        $program = Program::findOrFail($programId);

        $data = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'held_at' => 'required|date',
            'location' => 'nullable|string|max:150',
            'participants_count' => 'nullable|integer',
            'status' => 'nullable|in:upcoming,done,cancelled',
        ]);

        $session = $program->sessions()->create($data);

        // Create announcement if requested
        $announcementCreated = false;
        $createAnnouncement = $request->boolean('create_announcement');
        if ($createAnnouncement) {
            // Build content for announcement
            $sessionDate = \Carbon\Carbon::parse($session->held_at)->locale('id')->translatedFormat('d F Y');
            $sessionLocation = $session->location ?? 'lokasi belum ditentukan';

            // Content: use description if available, otherwise build from session details
            $announcementContent = $session->description
                ? $session->description
                : "Sesi {$session->title} telah dijadwalkan pada {$sessionDate} di {$sessionLocation}.";

            Announcement::create([
                'user_id' => auth()->id(),
                'session_id' => $session->id, // Link to the session
                'title' => $session->title,
                'slug' => \Str::slug($session->title) . '-' . time(),
                'content' => $announcementContent,
                'excerpt' => "Sesi {$session->title} - {$sessionDate}",
                'is_published' => true,
                'is_pinned' => false,
                'published_at' => now(),
            ]);
            $announcementCreated = true;
        }

        $message = $announcementCreated
            ? 'Sesi berhasil dibuat dan dipublikasikan sebagai pengumuman.'
            : 'Sesi berhasil dibuat.';

        return response()->json(['success' => true, 'data' => $session, 'message' => $message, 'announcement_created' => $announcementCreated]);
    }

    public function sessionUpdate(Request $request, int $programId, int $id): JsonResponse
    {
        $session = ProgramSession::where('program_id', $programId)->findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'held_at' => 'required|date',
            'location' => 'nullable|string|max:150',
            'participants_count' => 'nullable|integer',
            'status' => 'nullable|in:upcoming,done,cancelled',
        ]);

        $session->update($data);

        return response()->json(['success' => true, 'data' => $session, 'message' => 'Sesi berhasil diupdate.']);
    }

    public function sessionDestroy(int $programId, int $sessionId): JsonResponse
    {
        $session = ProgramSession::where('program_id', $programId)->findOrFail($sessionId);

        // Delete related announcement if exists (cascade will handle this via foreign key)
        // But let's also manually delete to be sure
        Announcement::where('session_id', $sessionId)->delete();

        $session->delete();

        return response()->json(['success' => true, 'message' => 'Sesi berhasil dihapus.']);
    }

    // ==========================================
    // ANNOUNCEMENTS
    // ==========================================
    public function announcements(): JsonResponse
    {
        $announcements = Announcement::orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $announcements]);
    }

    public function announcementStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:150',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:250',
            'published_at' => 'nullable|date',
        ]);

        // Handle boolean fields separately (FormData sends strings "true"/"false")
        $data['slug'] = \Str::slug($request->title) . '-' . time();
        $data['is_pinned'] = filter_var($request->input('is_pinned'), FILTER_VALIDATE_BOOLEAN) ?: false;
        $data['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN) ?: true;
        $data['published_at'] = $request->published_at ?? now();

        $announcement = Announcement::create($data);

        return response()->json(['success' => true, 'data' => $announcement, 'message' => 'Pengumuman berhasil dibuat.']);
    }

    public function announcementUpdate(Request $request, int $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string|max:150',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:250',
            'published_at' => 'nullable|date',
        ]);

        // Handle boolean fields separately (FormData sends strings "true"/"false")
        $data['is_pinned'] = filter_var($request->input('is_pinned'), FILTER_VALIDATE_BOOLEAN);
        $data['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN);

        $announcement->update($data);

        return response()->json(['success' => true, 'data' => $announcement, 'message' => 'Pengumuman berhasil diupdate.']);
    }

    public function announcementDestroy(int $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json(['success' => true, 'message' => 'Pengumuman berhasil dihapus.']);
    }

    // ==========================================
    // GALLERIES
    // ==========================================
    public function galleries(): JsonResponse
    {
        $galleries = Gallery::with('photos')->orderBy('created_at', 'desc')->get();

        return response()->json(['success' => true, 'data' => $galleries]);
    }

    public function galleryStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'event_date' => 'nullable|date',
        ]);

        // Handle is_published separately (FormData sends strings "true"/"false")
        $data['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN) ?: true;

        $gallery = Gallery::create($data);

        return response()->json(['success' => true, 'data' => $gallery, 'message' => 'Galeri berhasil dibuat.']);
    }

    public function galleryUpdate(Request $request, int $id): JsonResponse
    {
        $gallery = Gallery::findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
        ]);

        // Handle is_published separately (FormData sends strings "true"/"false")
        $data['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN) ?? $gallery->is_published;

        // Only update event_date if provided (not empty)
        $eventDate = $request->input('event_date');
        if ($eventDate !== null && $eventDate !== '') {
            $data['event_date'] = $eventDate;
        } else {
            // Keep existing event_date if no new value provided
            unset($data['event_date']);
        }

        $gallery->update($data);

        return response()->json(['success' => true, 'data' => $gallery, 'message' => 'Galeri berhasil diupdate.']);
    }

    public function galleryDestroy(int $id): JsonResponse
    {
        $gallery = Gallery::with('photos')->findOrFail($id);

        // Delete all photos
        foreach ($gallery->photos as $photo) {
            if (Storage::disk('public')->exists($photo->file_path)) {
                Storage::disk('public')->delete($photo->file_path);
            }
        }

        $gallery->delete();

        return response()->json(['success' => true, 'message' => 'Galeri berhasil dihapus.']);
    }

    public function galleryAddPhotos(Request $request, int $id): JsonResponse
    {
        $gallery = Gallery::findOrFail($id);

        $request->validate([
            'photos.*' => 'required|image|max:2048',
            'captions.*' => 'nullable|string|max:200',
        ]);

        $photos = [];
        $files = $request->file('photos');
        $captions = $request->input('captions', []);

        foreach ($files as $index => $file) {
            $path = $file->store('galleries', 'public');
            $photos[] = $gallery->photos()->create([
                'file_path' => $path,
                'caption' => $captions[$index] ?? null,
                'order' => $index,
            ]);
        }

        return response()->json(['success' => true, 'data' => $photos, 'message' => count($photos) . ' foto berhasil diupload.']);
    }

    public function galleryPhotos(int $id): JsonResponse
    {
        $gallery = Gallery::with('photos')->findOrFail($id);

        // Format photos with full URLs
        $photos = $gallery->photos->map(fn($p) => [
            'id' => $p->id,
            'file_path' => asset('storage/' . $p->file_path),
            'caption' => $p->caption,
            'order' => $p->order,
        ]);

        return response()->json(['success' => true, 'data' => $photos]);
    }

    public function galleryDeletePhoto(int $id): JsonResponse
    {
        $photo = GalleryPhoto::findOrFail($id);

        if (Storage::disk('public')->exists($photo->file_path)) {
            Storage::disk('public')->delete($photo->file_path);
        }

        $photo->delete();

        return response()->json(['success' => true, 'message' => 'Foto berhasil dihapus.']);
    }

    // ==========================================
    // CONTACTS
    // ==========================================
    public function contacts(): JsonResponse
    {
        $contacts = Contact::orderBy('created_at', 'desc')->get();

        return response()->json(['success' => true, 'data' => $contacts]);
    }

    public function markContactRead(int $id): JsonResponse
    {
        $contact = Contact::findOrFail($id);
        $contact->update(['is_read' => true]);

        return response()->json(['success' => true, 'message' => 'Pesan ditandai sudah dibaca.']);
    }

    public function contactDestroy(int $id): JsonResponse
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json(['success' => true, 'message' => 'Pesan berhasil dihapus.']);
    }

    // ==========================================
    // USERS
    // ==========================================
    public function users(): JsonResponse
    {
        $users = User::orderBy('created_at', 'desc')->get(['id', 'name', 'email', 'role', 'created_at']);

        return response()->json(['success' => true, 'data' => $users]);
    }

    public function userStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:admin,super_admin',
        ]);

        $data['password'] = bcrypt($data['password']);

        $user = User::create($data);

        return response()->json([
            'success' => true,
            'data' => $user->only(['id', 'name', 'email', 'role', 'created_at']),
            'message' => 'User berhasil dibuat.'
        ]);
    }

    public function userUpdate(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|min:8|confirmed',
            'role' => 'required|in:admin,super_admin',
        ]);

        if ($request->password) {
            $data['password'] = bcrypt($request->password);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'data' => $user->only(['id', 'name', 'email', 'role', 'created_at']),
            'message' => 'User berhasil diupdate.'
        ]);
    }

    public function userDestroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return response()->json(['success' => false, 'message' => 'Tidak bisa menghapus akun sendiri.'], 400);
        }

        $user->delete();

        return response()->json(['success' => true, 'message' => 'User berhasil dihapus.']);
    }

    // ==========================================
    // ORGANIZATION MEMBERS
    // ==========================================
    public function organizationMembers(): JsonResponse
    {
        $members = OrganizationMember::orderBy('order')->get();

        return response()->json(['success' => true, 'data' => $members]);
    }

    public function organizationMemberStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'position' => 'required|string|max:100',
            'photo' => 'nullable|image|max:2048',
            'order' => 'nullable|integer',
        ]);

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('members', 'public');
        }

        // Handle is_active separately (FormData sends strings "true"/"false")
        $data['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN) ?: true;

        $member = OrganizationMember::create($data);

        return response()->json(['success' => true, 'data' => $member, 'message' => 'Anggota berhasil ditambahkan.']);
    }

    public function organizationMemberUpdate(Request $request, int $id): JsonResponse
    {
        $member = OrganizationMember::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'position' => 'required|string|max:100',
            'photo' => 'nullable|image|max:2048',
            'order' => 'nullable|integer',
        ]);

        if ($request->hasFile('photo')) {
            if ($member->photo && Storage::disk('public')->exists($member->photo)) {
                Storage::disk('public')->delete($member->photo);
            }
            $data['photo'] = $request->file('photo')->store('members', 'public');
        }

        // Handle is_active separately (FormData sends strings "true"/"false")
        $data['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN) ?? $member->is_active;

        $member->update($data);

        return response()->json(['success' => true, 'data' => $member, 'message' => 'Anggota berhasil diupdate.']);
    }

    public function organizationMemberDestroy(int $id): JsonResponse
    {
        $member = OrganizationMember::findOrFail($id);

        if ($member->photo && Storage::disk('public')->exists($member->photo)) {
            Storage::disk('public')->delete($member->photo);
        }

        $member->delete();

        return response()->json(['success' => true, 'message' => 'Anggota berhasil dihapus.']);
    }

    // ==========================================
    // SETTINGS
    // ==========================================
    public function settings(): JsonResponse
    {
        $settings = SiteSetting::pluck('value', 'key');

        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function settingsUpdate(Request $request): JsonResponse
    {
        $settings = $request->validate([
            'site_name' => 'nullable|string|max:100',
            'site_tagline' => 'nullable|string|max:150',
            'address' => 'nullable|string|max:200',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'whatsapp' => 'nullable|string|max:20',
            'instagram' => 'nullable|string|max:100',
            'facebook' => 'nullable|string|max:100',
            'maps_embed' => 'nullable|string',
            'about_text' => 'nullable|string',
        ]);

        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'type' => 'text']
            );
        }

        return response()->json(['success' => true, 'message' => 'Pengaturan berhasil disimpan.']);
    }

    // ==========================================
    // DASHBOARD STATS
    // ==========================================
    public function dashboard(): JsonResponse
    {
        $stats = [
            'programs_count' => Program::count(),
            'announcements_count' => Announcement::count(),
            'galleries_count' => Gallery::withCount('photos')->count(),
            'contacts_unread' => Contact::where('is_read', false)->count(),
            'recent_contacts' => Contact::orderBy('created_at', 'desc')->limit(5)->get(),
            'recent_announcements' => Announcement::orderBy('published_at', 'desc')->limit(5)->get(),
            'recent_galleries' => Gallery::withCount('photos')->orderBy('created_at', 'desc')->limit(5)->get(),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }
}