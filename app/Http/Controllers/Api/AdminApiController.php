<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\UploadsToCloudinary;
use App\Models\{Program, ProgramSession, Announcement, Gallery, GalleryPhoto, Contact, User, OrganizationMember, SiteSetting};
use Illuminate\Http\{Request, JsonResponse};
use Illuminate\Support\Facades\{Storage, File, Cache, Log};

class AdminApiController extends Controller
{
    use UploadsToCloudinary;

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
            $data['cover_image'] = $this->uploadToCloudinary($request->file('cover_image'), 'kartar/programs');
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
            if ($program->cover_image) {
                $this->deleteFromCloudinary($program->cover_image);
            }
            $data['cover_image'] = $this->uploadToCloudinary($request->file('cover_image'), 'kartar/programs');
        }

        $data['slug'] = \Str::slug($request->name);

        $program->update($data);

        return response()->json(['success' => true, 'data' => $program, 'message' => 'Program berhasil diupdate.']);
    }

    public function programDestroy(int $id): JsonResponse
    {
        $program = Program::findOrFail($id);

        // Delete cover image
        if ($program->cover_image) {
            $this->deleteFromCloudinary($program->cover_image);
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
            'image' => 'nullable|image|max:2048',
        ]);

        // Handle boolean fields separately (FormData sends strings "true"/"false")
        $data['slug'] = \Str::slug($request->title) . '-' . time();
        $data['is_pinned'] = filter_var($request->input('is_pinned'), FILTER_VALIDATE_BOOLEAN) ?: false;
        $data['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN) ?: true;
        $data['published_at'] = $request->published_at ?? now();

        // Handle image upload
        if ($request->hasFile('image')) {
            $result = $this->uploadToCloudinaryWithPublicId($request->file('image'), 'kartar/announcements');
            $data['image_url'] = $result['url'];
            $data['image_public_id'] = $result['public_id'];
        }

        // Set user_id from authenticated admin
        $data['user_id'] = auth()->id();

        $announcement = Announcement::create($data);

        // Invalidate public API caches
        Cache::forget('api:home');
        Cache::forget('api:announcements:1:10'); // First page common cache key
        Cache::forget('api:announcement:' . $announcement->slug);

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
            'image' => 'nullable|image|max:2048',
            'remove_image' => 'nullable|boolean',
        ]);

        // Handle boolean fields separately (FormData sends strings "true"/"false")
        $data['is_pinned'] = filter_var($request->input('is_pinned'), FILTER_VALIDATE_BOOLEAN);
        $data['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN);
        $removeImage = filter_var($request->input('remove_image'), FILTER_VALIDATE_BOOLEAN);

        // Handle new image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($announcement->image_public_id) {
                try {
                    $this->deleteFromCloudinary($announcement->image_public_id);
                } catch (\Exception $e) {
                    \Log::error('Failed to delete old announcement image: ' . $e->getMessage());
                }
            }
            $result = $this->uploadToCloudinaryWithPublicId($request->file('image'), 'kartar/announcements');
            $data['image_url'] = $result['url'];
            $data['image_public_id'] = $result['public_id'];
        }

        // Handle explicit image removal
        if ($removeImage && $announcement->image_public_id) {
            try {
                $this->deleteFromCloudinary($announcement->image_public_id);
            } catch (\Exception $e) {
                \Log::error('Failed to delete announcement image: ' . $e->getMessage());
            }
            $data['image_url'] = null;
            $data['image_public_id'] = null;
        }

        $announcement->update($data);

        // Invalidate public API caches
        Cache::forget('api:home');
        Cache::forget('api:announcements:1:10'); // First page common cache key
        Cache::forget('api:announcement:' . $announcement->slug);

        return response()->json(['success' => true, 'data' => $announcement, 'message' => 'Pengumuman berhasil diupdate.']);
    }

    public function announcementDestroy(int $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);
        $slug = $announcement->slug; // Capture before deletion

        // Delete image from Cloudinary if exists
        if ($announcement->image_public_id) {
            try {
                $this->deleteFromCloudinary($announcement->image_public_id);
            } catch (\Exception $e) {
                \Log::error('Failed to delete announcement image on destroy: ' . $e->getMessage());
                // Continue with deletion even if Cloudinary delete fails
            }
        }

        $announcement->delete();

        // Invalidate public API caches
        Cache::forget('api:home');
        Cache::forget('api:announcements:1:10'); // First page common cache key
        Cache::forget('api:announcement:' . $slug);

        return response()->json(['success' => true, 'message' => 'Pengumuman berhasil dihapus.']);
    }

    // ==========================================
    // GALLERIES
    // ==========================================
    public function galleries(): JsonResponse
    {
        // Load galleries with first photo only (for cover thumbnail)
        // This is much faster than loading all photos for all galleries
        $galleries = Gallery::with(['photos' => function($query) {
                $query->select('id', 'gallery_id', 'file_path', 'caption', 'order')
                      ->orderBy('order')
                      ->limit(1);
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($gallery) {
                return [
                    'id' => $gallery->id,
                    'title' => $gallery->title,
                    'description' => $gallery->description,
                    'is_published' => $gallery->is_published,
                    'event_date' => $gallery->event_date,
                    'created_at' => $gallery->created_at,
                    'photos_count' => $gallery->photos->count(),
                    // Only include first photo for cover, not all photos
                    'photos' => $gallery->photos->take(1)->map(fn($p) => [
                        'id' => $p->id,
                        'file_path' => $p->file_path,
                        'caption' => $p->caption,
                    ])->values()->all(),
                ];
            });

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
            if ($photo->file_path) {
                try {
                    $this->deleteFromCloudinary($photo->file_path);
                } catch (\Exception $e) {
                    \Log::error('Failed to delete gallery photo from Cloudinary: ' . $e->getMessage());
                    // Continue with other photos even if one fails
                }
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
            $path = $this->uploadToCloudinary($file, 'kartar/galleries');
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
            'file_path' => $p->file_path,
            'caption' => $p->caption,
            'order' => $p->order,
        ]);

        return response()->json(['success' => true, 'data' => $photos]);
    }

    public function galleryDeletePhoto(int $id): JsonResponse
    {
        $photo = GalleryPhoto::findOrFail($id);

        if ($photo->file_path) {
            try {
                $this->deleteFromCloudinary($photo->file_path);
            } catch (\Exception $e) {
                \Log::error('Failed to delete gallery photo from Cloudinary: ' . $e->getMessage());
                // Continue with deletion even if Cloudinary delete fails
            }
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
            $data['photo'] = $this->uploadToCloudinary($request->file('photo'), 'kartar/members');
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
            if ($member->photo) {
                try {
                    $this->deleteFromCloudinary($member->photo);
                } catch (\Exception $e) {
                    \Log::error('Failed to delete member photo from Cloudinary: ' . $e->getMessage());
                }
            }
            $data['photo'] = $this->uploadToCloudinary($request->file('photo'), 'kartar/members');
        }

        // Handle is_active separately (FormData sends strings "true"/"false")
        $data['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN) ?? $member->is_active;

        $member->update($data);

        return response()->json(['success' => true, 'data' => $member, 'message' => 'Anggota berhasil diupdate.']);
    }

    public function organizationMemberDestroy(int $id): JsonResponse
    {
        $member = OrganizationMember::findOrFail($id);

        if ($member->photo) {
            try {
                $this->deleteFromCloudinary($member->photo);
            } catch (\Exception $e) {
                \Log::error('Failed to delete member photo from Cloudinary: ' . $e->getMessage());
            }
        }

        $member->delete();

        return response()->json(['success' => true, 'message' => 'Anggota berhasil dihapus.']);
    }

    // ==========================================
    // SETTINGS
    // ==========================================
    public function settings(): JsonResponse
    {
        $settings = SiteSetting::pluck('value', 'key')->toArray();

        // Convert string values back to proper types
        if (isset($settings['show_testimonials'])) {
            $settings['show_testimonials'] = $settings['show_testimonials'] === '1' || $settings['show_testimonials'] === 'true';
        } else {
            $settings['show_testimonials'] = true; // Default true
        }

        if (isset($settings['gallery_auto_scroll'])) {
            $settings['gallery_auto_scroll'] = $settings['gallery_auto_scroll'] === '1' || $settings['gallery_auto_scroll'] === 'true';
        } else {
            $settings['gallery_auto_scroll'] = true; // Default true
        }

        if (isset($settings['gallery_scroll_speed'])) {
            $settings['gallery_scroll_speed'] = (int) $settings['gallery_scroll_speed'];
        } else {
            $settings['gallery_scroll_speed'] = 30; // Default 30 seconds
        }

        // Return full URL for image fields (Cloudinary URLs are already absolute)
        $settings['about_image'] = $settings['about_image'] ?? null;

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
            'about_image' => 'nullable|image|max:2048',
            'about_title' => 'nullable|string|max:150',
            'about_description' => 'nullable|string',
            'about_quote' => 'nullable|string|max:255',
            // Accept both boolean and string "true"/"false" for these fields
            'show_testimonials' => 'nullable',
            'gallery_auto_scroll' => 'nullable',
            'gallery_scroll_speed' => 'nullable|integer|min:10|max:60',
        ]);

        // Clear related caches
        Cache::forget('api:settings');
        Cache::forget('api:contact-info');
        Cache::forget('api:about');

        // Handle about_image upload
        if ($request->hasFile('about_image')) {
            // Delete old image if exists
            $oldSetting = SiteSetting::where('key', 'about_image')->first();
            if ($oldSetting && $oldSetting->value) {
                try {
                    $this->deleteFromCloudinary($oldSetting->value);
                } catch (\Exception $e) {
                    \Log::error('Failed to delete about_image from Cloudinary: ' . $e->getMessage());
                }
            }
            $aboutImageUrl = $this->uploadToCloudinary($request->file('about_image'), 'kartar/settings');
            SiteSetting::updateOrCreate(
                ['key' => 'about_image'],
                ['value' => $aboutImageUrl, 'type' => 'image']
            );
        }

        // Save other settings (except about_image which is handled separately)
        $textSettings = collect($settings)->except(['about_image']);
        foreach ($textSettings as $key => $value) {
            // Skip null values - don't save them
            if ($value === null || $value === '') {
                continue;
            }

            if ($key === 'show_testimonials' || $key === 'gallery_auto_scroll') {
                // Convert string to boolean for storage
                // Accept "true", "false", "1", "0", true, false
                if (is_string($value)) {
                    $value = in_array(strtolower($value), ['true', '1', 'yes'], true);
                }
                $value = $value ? '1' : '0';
            } elseif ($key === 'gallery_scroll_speed') {
                // Convert to integer
                $value = (int) $value;
            }
            // For other fields, keep as is

            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => is_string($value) ? $value : (string) $value, 'type' => 'text']
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