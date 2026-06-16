<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Announcement, Program, ProgramSession, Gallery, GalleryPhoto, OrganizationMember, SiteSetting, Contact};
use Illuminate\Http\{Request, JsonResponse};
use Illuminate\Support\Facades\{Cache, Storage};

class PublicApiController extends Controller
{
    // Cache TTL in seconds (5 minutes default)
    private const CACHE_TTL = 300;

    // ========================
    // HOME DATA
    // ========================
    public function home(): JsonResponse
    {
        $cacheKey = 'api:home';

        return response()->json([
            'success' => true,
            'data' => Cache::remember($cacheKey, self::CACHE_TTL, function () {
                $announcements = Announcement::published()
                    ->orderBy('is_pinned', 'desc')
                    ->orderBy('published_at', 'desc')
                    ->take(3)
                    ->get()
                    ->map(fn($a) => $this->formatAnnouncement($a));

                $programs = Program::where('is_active', true)
                    ->orderBy('order')
                    ->get()
                    ->map(fn($p) => $this->formatProgram($p));

                return [
                    'announcements' => $announcements,
                    'programs' => $programs,
                ];
            })
        ]);
    }

    // ========================
    // PROGRAMS
    // ========================
    public function programs(): JsonResponse
    {
        $cacheKey = 'api:programs';

        $programs = Cache::remember($cacheKey, self::CACHE_TTL, function () {
            return Program::orderBy('order')
                ->get()
                ->map(fn($p) => $this->formatProgram($p, true));
        });

        return response()->json([
            'success' => true,
            'data' => $programs,
            'count' => count($programs),
        ]);
    }

    public function program(string $slug): JsonResponse
    {
        $cacheKey = "api:program:{$slug}";

        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($slug) {
            $program = Program::where('slug', $slug)->firstOrFail();

            $sessions = $program->sessions()
                ->orderBy('held_at', 'desc')
                ->get()
                ->map(fn($s) => [
                    'id' => $s->id,
                    'title' => $s->title,
                    'description' => $s->description,
                    'held_at' => $s->held_at,
                    'location' => $s->location,
                    'participants_count' => $s->participant_count,
                    'photos_count' => $s->gallery?->photos->count() ?? 0,
                    'status' => $s->status,
                ]);

            return array_merge($this->formatProgram($program, true), [
                'sessions' => $sessions,
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // ========================
    // ANNOUNCEMENTS
    // ========================
    public function announcements(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $cacheKey = "api:announcements:{$page}:{$perPage}";

        // Use cache for first page only (most common)
        if ($page == 1 && $perPage <= 20) {
            $announcements = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($perPage) {
                return Announcement::published()
                    ->orderBy('is_pinned', 'desc')
                    ->orderBy('published_at', 'desc')
                    ->paginate($perPage);
            });
        } else {
            $announcements = Announcement::published()
                ->orderBy('is_pinned', 'desc')
                ->orderBy('published_at', 'desc')
                ->paginate($perPage);
        }

        return response()->json([
            'success' => true,
            'data' => $announcements->map(fn($a) => $this->formatAnnouncement($a)),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
            ],
        ]);
    }

    public function announcement(string $slug): JsonResponse
    {
        $cacheKey = "api:announcement:{$slug}";

        $announcement = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($slug) {
            return Announcement::published()
                ->where('slug', $slug)
                ->firstOrFail();
        });

        return response()->json([
            'success' => true,
            'data' => $this->formatAnnouncement($announcement, true),
        ]);
    }

    // ========================
    // GALLERIES
    // ========================
    public function recentPhotos(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 30);
        $cacheKey = "api:recent-photos:{$limit}";

        $photos = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($limit) {
            return GalleryPhoto::whereHas('gallery', fn($q) => $q->where('is_published', true))
                ->with(['gallery' => fn($q) => $q->select('id', 'title', 'created_at')])
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'src' => $p->file_path,
                    'alt' => $p->caption ?? 'Gallery photo',
                    'caption' => $p->caption,
                    'gallery' => $p->gallery ? [
                        'id' => $p->gallery->id,
                        'title' => $p->gallery->title,
                    ] : null,
                    'created_at' => $p->created_at,
                ]);
        });

        return response()->json([
            'success' => true,
            'data' => $photos,
            'count' => count($photos),
        ]);
    }

    public function archives(): JsonResponse
    {
        $cacheKey = 'api:archives';

        $archives = Cache::remember($cacheKey, self::CACHE_TTL, function () {
            return Gallery::where('is_published', true)
                ->with(['photos' => fn($q) => $q->orderBy('order')])
                ->orderBy('event_date', 'desc')
                ->get()
                ->groupBy(fn($g) => $g->event_date ? $g->event_date->format('Y-m-d') : $g->created_at->format('Y-m-d'))
                ->map(fn($galleriesInDate, $date) => [
                    'date' => $date,
                    'formatted_date' => \Carbon\Carbon::parse($date)->locale('id')->translatedFormat('d F Y'),
                    'title' => $galleriesInDate->first()->title,
                    'description' => $galleriesInDate->first()->description ?? 'Tidak ada deskripsi tersedia.',
                    'galleries_count' => $galleriesInDate->count(),
                    'photos' => $galleriesInDate->flatMap(fn($g) => $g->photos->take(6)->map(fn($p) => [
                        'id' => $p->id,
                        'src' => $p->file_path,
                        'alt' => $p->caption ?? 'Gallery photo',
                        'caption' => $p->caption,
                    ])),
                    'photos_count' => $galleriesInDate->flatMap->photos->count(),
                ])
                ->values();
        });

        return response()->json([
            'success' => true,
            'data' => $archives,
            'count' => count($archives),
        ]);
    }

    public function galleries(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 12);
        $page = $request->input('page', 1);
        $cacheKey = "api:galleries:{$page}:{$perPage}";

        // Cache first 3 pages only
        if ($page <= 3) {
            $galleries = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($perPage) {
                return Gallery::where('is_published', true)
                    ->with(['photos' => fn($q) => $q->limit(4)])
                    ->latest()
                    ->paginate($perPage);
            });
        } else {
            $galleries = Gallery::where('is_published', true)
                ->with(['photos' => fn($q) => $q->limit(4)])
                ->latest()
                ->paginate($perPage);
        }

        return response()->json([
            'success' => true,
            'data' => $galleries->map(fn($g) => [
                'id' => $g->id,
                'title' => $g->title,
                'description' => $g->description,
                'created_at' => $g->created_at,
                'photos' => $g->photos->map(fn($p) => [
                    'id' => $p->id,
                    'src' => $p->file_path,
                    'alt' => $p->caption ?? 'Gallery photo',
                ]),
            ]),
            'meta' => [
                'current_page' => $galleries->currentPage(),
                'last_page' => $galleries->lastPage(),
                'per_page' => $galleries->perPage(),
                'total' => $galleries->total(),
            ],
        ]);
    }

    public function gallery(int $id): JsonResponse
    {
        $cacheKey = "api:gallery:{$id}";

        $gallery = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($id) {
            return Gallery::where('is_published', true)
                ->with('photos')
                ->findOrFail($id);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $gallery->id,
                'title' => $gallery->title,
                'description' => $gallery->description,
                'created_at' => $gallery->created_at,
                'photos' => $gallery->photos->map(fn($p) => [
                    'id' => $p->id,
                    'src' => $p->file_path,
                    'alt' => $p->caption ?? 'Gallery photo',
                    'caption' => $p->caption,
                    'order' => $p->order,
                ]),
            ],
        ]);
    }

    // ========================
    // ABOUT / ORGANIZATION
    // ========================
    public function about(): JsonResponse
    {
        $cacheKey = 'api:about';

        // Data sudah sorted dari database, tidak perlu sort lagi di client
        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () {
            $settings = SiteSetting::pluck('value', 'key');
            $members = OrganizationMember::where('is_active', true)
                ->orderBy('order')
                ->get()
                ->map(fn($m) => [
                    'id' => $m->id,
                    'name' => $m->name,
                    'position' => $m->position,
                    'photo' => $m->photo,
                    'order' => $m->order,
                ]);

            return [
                'members' => $members,
                'organization_name' => $settings['about_title'] ?? 'Karang Taruna Armalo Eluf',
                'about_image' => $settings['about_image'] ?? null,
                'about_description' => $settings['about_description'] ?? null,
                'about_quote' => $settings['about_quote'] ?? null,
                'location' => $settings['address'] ?? 'RT 06 RW 12, Surabaya',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // ========================
    // CONTACT
    // ========================
    public function contactInfo(): JsonResponse
    {
        $cacheKey = 'api:contact-info';

        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () {
            $settings = SiteSetting::pluck('value', 'key');
            return [
                'address' => $settings['address'] ?? 'Jl. Manukan Lor 3F RT 06 RW 12, Surabaya',
                'phone' => $settings['phone'] ?? '08xxxxxxxxxx',
                'email' => $settings['email'] ?? null,
                'maps_embed' => $settings['maps_embed'] ?? null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // ========================
    // SETTINGS (Public)
    // ========================
    public function settings(): JsonResponse
    {
        $cacheKey = 'api:settings';

        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () {
            $settings = SiteSetting::pluck('value', 'key');
            return [
                'site_name' => $settings['site_name'] ?? 'Karang Taruna Armalo Eluf',
                'site_tagline' => $settings['site_tagline'] ?? 'Bersama Membangun Komunitas yang Lebih Baik',
                'about_text' => $settings['about_text'] ?? null,
                'address' => $settings['address'] ?? 'Jl. Manukan Lor 3F RT 06 RW 12, Surabaya',
                'phone' => $settings['phone'] ?? '08xxxxxxxxxx',
                'email' => $settings['email'] ?? null,
                'whatsapp' => $settings['whatsapp'] ?? null,
                'instagram' => $settings['instagram'] ?? null,
                'facebook' => $settings['facebook'] ?? null,
                'maps_embed' => $settings['maps_embed'] ?? null,
                'show_testimonials' => filter_var($settings['show_testimonials'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'testimonials_auto_scroll' => filter_var($settings['testimonials_auto_scroll'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'gallery_auto_scroll' => filter_var($settings['gallery_auto_scroll'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'gallery_scroll_speed' => (int) ($settings['gallery_scroll_speed'] ?? 30),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function submitContact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'nullable|email|max:100',
            'phone'   => 'nullable|string|max:20',
            'message' => 'required|string',
        ]);

        Contact::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dikirim! Kami akan segera menghubungi kamu.'
        ]);
    }

    // ========================
    // HELPERS
    // ========================
    private function formatAnnouncement($announcement, bool $full = false): array
    {
        $data = [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'slug' => $announcement->slug,
            'is_pinned' => $announcement->is_pinned,
            'published_at' => $announcement->published_at,
        ];

        if ($full) {
            $data['content'] = $announcement->content;
            $data['created_at'] = $announcement->created_at;
        } else {
            $data['excerpt'] = $announcement->excerpt ?? \Str::limit(strip_tags($announcement->content), 150);
        }

        return $data;
    }

    private function formatProgram($program, bool $withSessions = false): array
    {
        $data = [
            'id' => $program->id,
            'name' => $program->name,
            'slug' => $program->slug,
            'description' => $program->description,
            'frequency' => $program->frequency,
            'cover_image' => $program->cover_image,
            'order' => $program->order,
        ];

        return $data;
    }
}