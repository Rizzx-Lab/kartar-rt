<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessFeaturedVideoUpload;
use App\Traits\UploadsToCloudinary;
use App\Models\{Program, ProgramSession, Announcement, Gallery, GalleryPhoto, GalleryVideo, Contact, User, OrganizationMember, SiteSetting};
use Illuminate\Http\{Request, JsonResponse};
use Illuminate\Support\Facades\{Storage, File, Cache, Log, Http};

class AdminApiController extends Controller
{
    use UploadsToCloudinary;

    // ==========================================
    // CACHE INVALIDATION HELPERS
    // ==========================================

    /**
     * Invalidate all announcement-related caches.
     * Must cover every per_page value used across the frontend:
     *   - per_page=6   (home page)
     *   - per_page=10  (api.ts default)
     *   - per_page=20  (pengumuman page)
     * plus the per-program/program-list cache.
     */
    private function invalidateAnnouncementCaches(?string $slug = null): void
    {
        // All paginated announcement list keys
        foreach ([6, 10, 20] as $perPage) {
            Cache::forget("api:announcements:1:{$perPage}");
        }
        // Individual announcement cache (if slug provided)
        if ($slug) {
            Cache::forget("api:announcement:{$slug}");
        }
        // Home page embeds announcements
        Cache::forget('api:home');
    }

    /**
     * Invalidate all gallery-related caches.
     * Must cover:
     *   - recent-photos with limit=30 (galeri page)
     *   - archives
     *   - paginated galleries (page 1-3 at perPage=12)
     *   - individual gallery cache
     */
    private function invalidateGalleryCaches(?int $galleryId = null): void
    {
        Cache::forget('api:recent-photos:30');
        Cache::forget('api:archives');
        foreach ([6, 12] as $perPage) {
            foreach (range(1, 3) as $page) {
                Cache::forget("api:galleries:{$page}:{$perPage}");
            }
        }
        if ($galleryId) {
            Cache::forget("api:gallery:{$galleryId}");
        }
    }

    /**
     * Invalidate all program-related caches.
     */
    private function invalidateProgramCaches(?string $slug = null): void
    {
        Cache::forget('api:programs');
        if ($slug) {
            Cache::forget("api:program:{$slug}");
        }
    }

    /**
     * Trigger on-demand ISR revalidation on the Next.js frontend.
     * Called server-to-server from Laravel after each successful mutation.
     * The REVALIDATE_SECRET lives only in server-side env vars — never exposed to browsers.
     */
    private function triggerFrontendRevalidation(array $paths = [], array $tags = []): void
    {
        $frontendUrl = config('app.frontend_url');
        $secret = config('app.revalidate_secret');

        if (!$frontendUrl || !$secret) {
            Log::warning('Frontend revalidation skipped: FRONTEND_URL or REVALIDATE_SECRET not configured.');
            return;
        }

        Log::info('Frontend revalidation triggered', [
            'frontend_url' => $frontendUrl,
            'paths' => $paths,
            'tags' => $tags,
        ]);

        try {
            Http::withHeaders([
                'Authorization' => "Bearer {$secret}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$frontendUrl}/api/revalidate", [
                'paths' => $paths,
                'tags' => $tags,
            ]);
        } catch (\Exception $e) {
            // Log but don't fail — the ISR fallback (revalidate=60) will handle stale data
            Log::error('Frontend revalidation failed: ' . $e->getMessage());
        }
    }

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

        // Invalidate public program caches
        $this->invalidateProgramCaches();

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/kegiatan'], ['programs']);

        return response()->json(['success' => true, 'data' => $program, 'message' => 'Program berhasil dibuat.']);
    }

    public function programUpdate(Request $request, int $id): JsonResponse
    {
        $program = Program::findOrFail($id);

        // Capture old slug before update so we can invalidate both
        $oldSlug = $program->slug;

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

        // Invalidate public program caches (both old and new slug in case slug changed)
        $this->invalidateProgramCaches($oldSlug);
        if ($oldSlug !== $program->slug) {
            $this->invalidateProgramCaches($program->slug);
        }

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/kegiatan'], ['programs']);

        return response()->json(['success' => true, 'data' => $program, 'message' => 'Program berhasil diupdate.']);
    }

    public function programDestroy(int $id): JsonResponse
    {
        $program = Program::findOrFail($id);
        $slug = $program->slug; // Capture before deletion

        // Delete cover image
        if ($program->cover_image) {
            $this->deleteFromCloudinary($program->cover_image);
        }

        $program->delete();

        // Invalidate public program caches
        $this->invalidateProgramCaches($slug);

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/kegiatan'], ['programs']);

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
        $createdSlug = null;
        $createAnnouncement = $request->boolean('create_announcement');
        if ($createAnnouncement) {
            // Build content for announcement
            $sessionDate = \Carbon\Carbon::parse($session->held_at)->locale('id')->translatedFormat('d F Y');
            $sessionLocation = $session->location ?? 'lokasi belum ditentukan';

            // Use session description as announcement content if provided, otherwise build from session details
            $rawDescription = $session->description;
            Log::info('sessionStore: announcement creation - description check', [
                'session_id' => $session->id,
                'has_description' => !empty($rawDescription),
                'description_length' => $rawDescription ? strlen($rawDescription) : 0,
                'description_preview' => $rawDescription ? mb_substr($rawDescription, 0, 100) : null,
            ]);

            $announcementContent = $rawDescription
                ? $rawDescription
                : "Sesi {$session->title} telah dijadwalkan pada {$sessionDate} di {$sessionLocation}.";

            // Excerpt: build a short preview from the actual description (content), NOT from the title.
            // This gives list views a meaningful content preview without duplicating the title.
            // If description is empty, leave excerpt null — formatAnnouncement() will auto-generate
            // from content (which falls back to the location/time fallback string above).
            $announcementExcerpt = $rawDescription
                ? \Str::limit(strip_tags($rawDescription), 150)
                : null;

            $announcement = Announcement::create([
                'user_id' => auth()->id(),
                'session_id' => $session->id,
                'title' => $session->title,
                'slug' => \Str::slug($session->title) . '-' . time(),
                'content' => $announcementContent,
                'excerpt' => $announcementExcerpt,
                'is_published' => true,
                'is_pinned' => false,
                'published_at' => now(),
            ]);
            $createdSlug = $announcement->slug;
            $announcementCreated = true;

            // Invalidate announcement caches
            $this->invalidateAnnouncementCaches($createdSlug);
        }

        // Invalidate the parent program's cache (session list changed)
        $this->invalidateProgramCaches($program->slug);

        $message = $announcementCreated
            ? 'Sesi berhasil dibuat dan dipublikasikan sebagai pengumuman.'
            : 'Sesi berhasil dibuat.';

        // Trigger on-demand ISR revalidation on the Next.js frontend
        // Revalidate both programs AND announcements (if announcement was created)
        if ($announcementCreated) {
            $this->triggerFrontendRevalidation(['/kegiatan', '/'], ['programs', 'announcements', 'home']);
        } else {
            $this->triggerFrontendRevalidation(['/kegiatan'], ['programs']);
        }

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

        // Invalidate the parent program's cache (session list changed)
        $program = $session->program;
        if ($program) {
            $this->invalidateProgramCaches($program->slug);
        }

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/kegiatan'], ['programs']);

        return response()->json(['success' => true, 'data' => $session, 'message' => 'Sesi berhasil diupdate.']);
    }

    public function sessionDestroy(int $programId, int $sessionId): JsonResponse
    {
        $session = ProgramSession::where('program_id', $programId)->findOrFail($sessionId);

        // Invalidate the parent program's cache BEFORE deletion
        $program = $session->program;
        $programSlug = $program?->slug;

        // Delete related announcement if exists (cascade will handle this via foreign key)
        // But let's also manually delete to be sure
        Announcement::where('session_id', $sessionId)->delete();

        $session->delete();

        // Invalidate the parent program's cache and announcement caches
        if ($programSlug) {
            $this->invalidateProgramCaches($programSlug);
        }
        $this->invalidateAnnouncementCaches();

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/kegiatan', '/'], ['programs', 'announcements', 'home']);

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
        Log::info('announcementStore: START', ['user_id' => auth()->id()]);

        try {
            $data = $request->validate([
                'title' => 'required|string|max:150',
                'content' => 'required|string',
                'excerpt' => 'nullable|string|max:250',
                'published_at' => 'required|date|after_or_equal:today',
                'expires_at' => 'nullable|date|after:published_at|after_or_equal:today',
                'image' => 'nullable|image|max:2048',
            ]);

            Log::info('announcementStore: validation passed', ['data_keys' => array_keys($data)]);

            // Handle boolean fields separately (FormData sends strings "true"/"false")
            $data['slug'] = \Str::slug($request->title) . '-' . time();
            $data['is_pinned'] = filter_var($request->input('is_pinned'), FILTER_VALIDATE_BOOLEAN) ?: false;
            // is_published is determined automatically based on the date — see auto-scheduling logic below
            $data['published_at'] = $data['published_at']; // already validated as date

            // ─────────────────────────────────────────────────────────
            // AUTO-SCHEDULING LOGIC: determine status from Tanggal Terbit
            // ─────────────────────────────────────────────────────────
            $selectedDate = \Carbon\Carbon::parse($data['published_at'])->startOfDay();
            $today = \Carbon\Carbon::today();

            if ($selectedDate->isFuture()) {
                // Future date → always draft
                $data['is_published'] = false;
                Log::info('announcementStore: future date → Draft', [
                    'published_at' => $data['published_at'],
                ]);
            } else {
                // Today → immediately published
                $data['is_published'] = true;
                $data['published_at'] = now(); // use server's current timestamp
                Log::info('announcementStore: today → Published immediately', [
                    'published_at' => $data['published_at'],
                ]);
            }
            // Past dates are rejected by the validation rule above.

            // Handle expires_at: null if empty (no expiry), otherwise keep the validated date.
            // Empty string from FormData is coerced to null so the DB sees NULL not ''.
            $expiresAt = $request->input('expires_at');
            $data['expires_at'] = ($expiresAt !== null && $expiresAt !== '') ? $expiresAt : null;

            Log::info('announcementStore: processed fields', [
                'is_pinned' => $data['is_pinned'],
                'is_published' => $data['is_published'],
                'has_image' => $request->hasFile('image'),
            ]);

            // Handle image upload
            if ($request->hasFile('image')) {
                Log::info('announcementStore: uploading image to Cloudinary');
                $result = $this->uploadToCloudinaryWithPublicId($request->file('image'), 'kartar/announcements');
                $data['image_url'] = $result['url'];
                $data['image_public_id'] = $result['public_id'];
                Log::info('announcementStore: image uploaded', ['url' => $data['image_url']]);
            }

            // Auto-generate excerpt from content if the admin didn't provide one.
            // formatAnnouncement() also does this fallback, but setting it here keeps the DB
            // consistent so it survives any future caching layers.
            if (empty($data['excerpt'])) {
                $data['excerpt'] = \Str::limit(strip_tags($data['content']), 150);
            }

            // Set user_id from authenticated admin
            $data['user_id'] = auth()->id();
            Log::info('announcementStore: creating announcement', ['user_id' => $data['user_id']]);

            $announcement = Announcement::create($data);
            Log::info('announcementStore: created', ['id' => $announcement->id, 'slug' => $announcement->slug]);

            // Invalidate all announcement-related caches using the shared helper
            $this->invalidateAnnouncementCaches($announcement->slug);
            Log::info('announcementStore: caches invalidated');

            // Trigger on-demand ISR revalidation on the Next.js frontend
            Log::info('announcementStore: calling triggerFrontendRevalidation');
            $this->triggerFrontendRevalidation(['/pengumuman', '/'], ['announcements', 'home']);
            Log::info('announcementStore: DONE', ['id' => $announcement->id]);

            return response()->json(['success' => true, 'data' => $announcement, 'message' => 'Pengumuman berhasil dibuat.']);

        } catch (\Throwable $e) {
            Log::error('announcementStore: EXCEPTION', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e; // Re-throw so Laravel's exception handler also processes it
        }
    }

    public function announcementUpdate(Request $request, int $id): JsonResponse
    {
        Log::info('announcementUpdate: START', ['id' => $id, 'user_id' => auth()->id()]);

        try {
            $announcement = Announcement::findOrFail($id);
            Log::info('announcementUpdate: found announcement', ['slug' => $announcement->slug]);

            $data = $request->validate([
                'title' => 'required|string|max:150',
                'content' => 'required|string',
                'excerpt' => 'nullable|string|max:250',
                'published_at' => 'required|date|after_or_equal:today',
                'expires_at' => 'nullable|date|after:published_at|after_or_equal:today',
                'image' => 'nullable|image|max:2048',
                'remove_image' => 'nullable|boolean',
            ]);

            // Handle boolean fields separately (FormData sends strings "true"/"false")
            $data['is_pinned'] = filter_var($request->input('is_pinned'), FILTER_VALIDATE_BOOLEAN);
            $removeImage = filter_var($request->input('remove_image'), FILTER_VALIDATE_BOOLEAN);

            // ─────────────────────────────────────────────────────────
            // AUTO-SCHEDULING LOGIC: determine status from Tanggal Terbit
            // Same rules as create — admin cannot override via the dropdown.
            // ─────────────────────────────────────────────────────────
            $selectedDate = \Carbon\Carbon::parse($data['published_at'])->startOfDay();
            $today = \Carbon\Carbon::today();

            if ($selectedDate->isFuture()) {
                $data['is_published'] = false;
                Log::info('announcementUpdate: future date → Draft', [
                    'published_at' => $data['published_at'],
                ]);
            } else {
                $data['is_published'] = true;
                $data['published_at'] = now(); // use server's current timestamp
                Log::info('announcementUpdate: today → Published immediately', [
                    'published_at' => $data['published_at'],
                ]);
            }
            // Past dates are rejected by the validation rule above.

            // Handle expires_at: null if empty (no expiry), otherwise keep the validated date.
            $expiresAt = $request->input('expires_at');
            $data['expires_at'] = ($expiresAt !== null && $expiresAt !== '') ? $expiresAt : null;

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
                Log::info('announcementUpdate: uploading new image');
                $result = $this->uploadToCloudinaryWithPublicId($request->file('image'), 'kartar/announcements');
                $data['image_url'] = $result['url'];
                $data['image_public_id'] = $result['public_id'];
                Log::info('announcementUpdate: image uploaded', ['url' => $data['image_url']]);
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

            Log::info('announcementUpdate: updating', ['data_keys' => array_keys($data)]);
            $announcement->update($data);
            Log::info('announcementUpdate: updated', ['id' => $announcement->id]);

            // Invalidate all announcement-related caches using the shared helper
            $this->invalidateAnnouncementCaches($announcement->slug);
            Log::info('announcementUpdate: caches invalidated');

            // Trigger on-demand ISR revalidation on the Next.js frontend
            Log::info('announcementUpdate: calling triggerFrontendRevalidation');
            $this->triggerFrontendRevalidation(['/pengumuman', '/'], ['announcements', 'home']);
            Log::info('announcementUpdate: DONE');

            return response()->json(['success' => true, 'data' => $announcement, 'message' => 'Pengumuman berhasil diupdate.']);

        } catch (\Throwable $e) {
            Log::error('announcementUpdate: EXCEPTION', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw $e;
        }
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

        // Invalidate all announcement-related caches using the shared helper
        $this->invalidateAnnouncementCaches($slug);

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/pengumuman', '/'], ['announcements', 'home']);

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

        // Invalidate gallery-related caches
        $this->invalidateGalleryCaches($gallery->id);

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/galeri'], ['galleries']);

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

        // Invalidate gallery-related caches
        $this->invalidateGalleryCaches($gallery->id);

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/galeri'], ['galleries']);

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

        // Invalidate gallery-related caches
        $this->invalidateGalleryCaches($id);

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/galeri'], ['galleries']);

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

        // Invalidate gallery-related caches (photos changed, so recent-photos and archive lists changed)
        $this->invalidateGalleryCaches($gallery->id);

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/galeri'], ['galleries']);

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

        // Capture gallery id before deletion for cache invalidation
        $galleryId = $photo->gallery_id;

        if ($photo->file_path) {
            try {
                $this->deleteFromCloudinary($photo->file_path);
            } catch (\Exception $e) {
                \Log::error('Failed to delete gallery photo from Cloudinary: ' . $e->getMessage());
                // Continue with deletion even if Cloudinary delete fails
            }
        }

        $photo->delete();

        // Invalidate gallery-related caches
        if ($galleryId) {
            $this->invalidateGalleryCaches($galleryId);
        }

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/galeri'], ['galleries']);

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

        // Prevent deleting the last super_admin
        if ($user->role === 'super_admin') {
            $superAdminCount = User::where('role', 'super_admin')->count();
            if ($superAdminCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus super_admin terakhir. Minimal harus ada 1 super_admin.'
                ], 403);
            }
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

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/tentang-kami'], ['about']);

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

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/tentang-kami'], ['about']);

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

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/tentang-kami'], ['about']);

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
            // Use SiteSetting::set() to ensure cache is invalidated
            SiteSetting::set('about_image', $aboutImageUrl);
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

            // Use SiteSetting::set() to ensure cache is invalidated
            SiteSetting::set($key, is_string($value) ? $value : (string) $value);
        }

        // Trigger on-demand ISR revalidation on the Next.js frontend.
        // Settings affect home page, about page, contact page, and the gallery page
        // (gallery_auto_scroll and gallery_scroll_speed control the public gallery layout).
        $this->triggerFrontendRevalidation(
            ['/', '/tentang-kami', '/kontak', '/galeri'],
            ['home', 'about', 'contact', 'settings', 'galleries']
        );

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

    // ==========================================
    // FEATURED VIDEO
    // ==========================================

    /**
     * Upload / replace the featured video.
     *
     * The upload uses Cloudinary's async eager transformation (eager_async=true)
     * so large files (e.g. 43 MB) don't hit the synchronous processing ceiling.
     * The API returns immediately with status='processing'; the actual video URL
     * and duration become available once ProcessFeaturedVideoUpload polls
     * Cloudinary and the transformation completes (~seconds to a few minutes).
     *
     * Duration (> 180 s) is validated in ProcessFeaturedVideoUpload, not here —
     * if the uploaded video exceeds 3 minutes the job marks the record as
     * failed and cleans up the Cloudinary asset.
     *
     * Replacing an existing video deletes it from Cloudinary and DB before the
     * new record is created (handled inside replaceFeaturedVideoAsync).
     */
    public function featuredVideoStore(Request $request): JsonResponse
    {
        $validated = $request->validate($this->videoUploadRules());

        // Upload with async eager transformation, create processing record,
        // dispatch the polling job. Returns immediately.
        $galleryVideo = $this->replaceFeaturedVideoAsync(
            $request->file('video'),
            $validated['title'],
            auth()->id()
        );

        // Invalidate gallery-related caches (featured video may affect the gallery page layout)
        $this->invalidateGalleryCaches();

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/galeri'], ['galleries']);

        return response()->json([
            'success' => true,
            'data'    => $this->formatFeaturedVideo($galleryVideo),
            'message' => 'Video featured berhasil diupload. Processing...',
        ]);
    }

    /**
     * Delete the currently active or processing featured video (if any).
     *
     * Unlike the previous sync-era design, this targets whichever video exists
     * regardless of status — useful for cleaning up a processing video the admin regrets.
     */
    public function featuredVideoDestroy(): JsonResponse
    {
        // Find any video: active or still processing.
        $video = GalleryVideo::whereIn('status', ['active', 'processing'])->first();

        if (!$video) {
            return response()->json([
                'success' => false,
                'message'  => 'Tidak ada video featured yang aktif.',
            ], 404);
        }

        $publicId = $video->public_id;

        try {
            $this->deleteVideoFromCloudinary($publicId);
        } catch (\Throwable $e) {
            Log::error('featuredVideoDestroy: failed to delete Cloudinary asset', [
                'public_id' => $publicId,
                'error'     => $e->getMessage(),
            ]);
        }

        $video->delete();

        // Invalidate gallery-related caches
        $this->invalidateGalleryCaches();

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/galeri'], ['galleries']);

        return response()->json([
            'success' => true,
            'message'  => 'Video featured berhasil dihapus.',
        ]);
    }

    // ==========================================
    // HELPERS
    // ==========================================

    /**
     * Format a GalleryVideo model for API responses.
     */
    private function formatFeaturedVideo(GalleryVideo $video): array
    {
        return [
            'id'             => $video->id,
            'title'          => $video->title,
            'video_url'      => $video->status === 'active' ? $video->video_url : null,
            'thumbnail_url'  => $video->thumbnail_url,
            'duration'       => $video->duration,
            'file_size'      => $video->file_size,
            'is_portrait'   => $video->is_portrait,
            'status'        => $video->status,
            'expires_at'     => $video->expires_at->toIso8601String(),
            'created_at'    => $video->created_at->toIso8601String(),
            'uploader'      => $video->uploader ? [
                'id'   => $video->uploader->id,
                'name' => $video->uploader->name,
            ] : null,
        ];
    }
}