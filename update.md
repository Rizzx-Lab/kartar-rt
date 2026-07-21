# Feature: Featured Video Upload (Kartar Gallery)

## Overview
A standalone "featured video" feature for the Gallery page. Admin can upload one video at a time, which displays publicly for 7 days then is automatically and permanently deleted (no archiving). Storage via Cloudinary (already integrated in this project). See full spec below.

## Feature Specification
- Access: Admin only
- Storage: Cloudinary (existing integration, see `app/Traits/UploadsToCloudinary.php`)
- Accepted formats: mp4, mov (mov auto-transcoded to mp4/H.264 on upload)
- Max duration: 3 minutes (180 seconds)
- Max file size: 50MB
- Resolution: downscaled to max 720p on upload, quality:auto, to conserve Cloudinary free-tier credits
- Orientation: portrait recommended; landscape allowed but should show a warning in the admin UI (no hard rejection)
- Title: required text field on upload
- Replace behavior: uploading a new video immediately deletes the previous one (Cloudinary asset + DB record) — only one featured video active at a time
- Lifecycle: auto-delete permanently (Cloudinary + DB) after 7 days via scheduled job — no archiving
- Data model: standalone table `gallery_videos`, NOT linked to any gallery/album (no gallery_id)
- Table fields: id, uploaded_by (FK users), title, video_url, public_id, thumbnail_url, duration, file_size, is_portrait, expires_at, timestamps

## Public Display Requirements
- Desktop: gallery "Foto Terbaru" section becomes a 3-column layout when a featured video is active — center column shows the pinned (non-scrolling) portrait video; left and right columns show photos auto-scrolling continuously
- Mobile: featured video pinned full-width at the top; photos scroll in a single column below it
- If no featured video is currently active, the layout reverts to the current normal photo grid (no special layout)

## Task Breakdown (execute in order, one prompt per task)
- [x] Task 1: Backend — Database & Model (migration `gallery_videos`, Eloquent model `GalleryVideo`)
- [x] Task 2: Backend — Upload & Cloudinary Logic (extend `UploadsToCloudinary` trait: validation, transcode to 720p mp4, orientation detection, delete-previous-on-new-upload logic)
- [x] Task 3: Backend — API Endpoints (admin upload/delete endpoint, public endpoint to fetch current active featured video)
- [x] Task 4: Backend — Scheduled Job (Laravel scheduled command to auto-delete expired videos from Cloudinary + DB after 7 days)
- [x] Task 5: Frontend — Admin Upload UI (upload form with title field, file picker, validation feedback, landscape warning)
- [x] Task 6: Frontend — Public Display (desktop 3-column pinned-video layout with scrolling side columns; mobile pinned-top layout with scrolling photos below)

## Progress Log
(Each subsequent prompt/session MUST update this section after completing its task — mark the checkbox above as done, and add a dated entry below describing what was implemented, any files changed, any deviations from spec, and any issues/decisions the next session needs to know about.)

- **2026-07-20 — Task 1: Backend — Database & Model — COMPLETE**
  - Files created:
    - `database/migrations/2026_07_20_000001_create_gallery_videos_table.php` — migration with all spec columns, FK on `uploaded_by` → `users.id` (cascade delete), index on `expires_at`
    - `app/Models/GalleryVideo.php` — Eloquent model with `$fillable`, datetime/boolean casts, `uploader()` belongsTo relationship, `scopeActive()` scope
  - No deviations from spec. Followed existing project conventions (anonymous class migrations, `foreignId()`, `$casts` array, minimal model style matching `Gallery.php`/`GalleryPhoto.php`).
  - Migration ran successfully (`php artisan migrate` — nothing else pending).
  - Note for Task 2: The `expires_at` column is stored as a `timestamp` (not `datetime` cast to date) — the model casts it as `'datetime'`, so Carbon instance is returned. The scheduled job (Task 4) will query `expires_at < now()` and delete from both Cloudinary and DB.

- **2026-07-20 — Task 2: Backend — Upload & Cloudinary Logic — COMPLETE**
  - File changed: `app/Traits/UploadsToCloudinary.php`
  - Prerequisite: `cloudinary/cloudinary_php` v3.1.3 was installed via `composer require` (it was missing from the project). The package was not in composer.json at all — the trait existed but would have failed at runtime.
  - Methods added to the trait:
    - `deleteVideoFromCloudinary(string $publicId)` — calls Cloudinary destroy with `resource_type: 'video'`; existing `deleteFromCloudinary()` only deletes images (no resource_type param).
    - `videoUploadRules(): array` — returns Laravel validation rules: `'video' => ['required', 'file', 'mimes:mp4,mov', 'max:51200']` (50 MB) and `'title' => ['required', 'string', 'max:150']`. Duration check (≤180s) must be done post-upload using `CloudinaryUploadResult.duration` — not possible via standard Laravel file validation alone.
    - `uploadVideoToCloudinary(UploadedFile $file, string $folder): array` — uploads with `resource_type: 'video'`, eager transformation `w_720,h_720,c_limit,q_auto,f_mp4` (synchronous, single variant). Returns `video_url`, `public_id`, `thumbnail_url`, `duration`, `file_size`, `is_portrait`, `width`, `height`.
    - `buildVideoThumbnailUrl(string $videoUrl): string` — builds a thumbnail URL by replacing the video extension with `.jpg` and appending `w_300,q_auto,f_jpg,fl_splice,fl_layer_apply` (extracts first video frame as JPEG). No separate Cloudinary API call needed.
    - `replaceFeaturedVideo(UploadedFile $file, string $title, int $userId): GalleryVideo` — wraps upload + DB create in a `DB::transaction()`. Step 1 (delete previous) is intentionally outside the tx so a Cloudinary delete failure doesn't block the upload. A failed post-upload delete is logged but non-fatal.
  - Important: `GalleryVideo::scopeActive()` is the method name; Laravel calls it as `GalleryVideo::active()`. Fixed a bug in first draft where I wrote `scopeActive()` directly.
  - Important: `Cloudinary\Asset\AssetType::VIDEO = 'video'` — the correct namespace is `Cloudinary\Asset` (not `Cloudinary\Asset\Descriptor`).
  - For Task 3 (API Endpoints): The controller method should call `$this->replaceFeaturedVideo($request->file('video'), $validated['title'], auth()->id())`. The `invalidateGalleryCaches()` helper exists in `AdminApiController`. Duration rejection (video > 180s) should be done after upload using `$galleryVideo->duration > 180` — throw a `ValidationException` if true and delete the just-uploaded Cloudinary asset as cleanup.

- **2026-07-20 — Task 3: Backend — API Endpoints — COMPLETE**
  - Files changed:
    - `app/Http/Controllers/Api/AdminApiController.php` — added `GalleryVideo` to the models import, added `featuredVideoStore()`, `featuredVideoDestroy()`, and `formatFeaturedVideo()` helper
    - `app/Http/Controllers/Api/PublicApiController.php` — added `GalleryVideo` to the models import, added `featuredVideo()` method
    - `routes/api.php` — added 3 routes (see below)
  - Routes added:
    - `POST api/v1/admin/featured-video` → `AdminApiController@featuredVideoStore` (auth + admin middleware)
    - `DELETE api/v1/admin/featured-video` → `AdminApiController@featuredVideoDestroy` (auth + admin middleware)
    - `GET api/v1/featured-video` → `PublicApiController@featuredVideo` (public, no auth)
  - `featuredVideoStore` behaviour: validates via `videoUploadRules()`, calls `replaceFeaturedVideo()` (which handles previous-video cleanup), checks `duration > 180` post-upload (deletes + throws `ValidationException` on overage), calls `invalidateGalleryCaches()`, triggers frontend revalidation for `/galeri`.
  - `featuredVideoDestroy` behaviour: looks up `GalleryVideo::active()`, returns 404 if none, deletes Cloudinary asset (logs failure but continues), deletes DB record, invalidates caches, triggers frontend revalidation.
  - `featuredVideo` (public): looks up `GalleryVideo::active()`, returns `{success: true, data: null}` if none active; otherwise returns formatted video object (no uploader detail needed publicly — kept minimal).
  - Deviation from spec: the public endpoint does NOT cache the result (the project's existing public endpoints use `Cache::remember` but the spec doesn't require it and caching would complicate invalidation — the frontend can handle it if needed).
  - For Task 4 (Scheduled Job): The artisan command needs to query `GalleryVideo::where('expires_at', '<=', now())->get()`, then for each: call `deleteVideoFromCloudinary($v->public_id)`, delete the DB record. The `invalidateGalleryCaches()` and `triggerFrontendRevalidation()` helpers are available on `AdminApiController` but the scheduled job is a standalone command — see how to replicate or call those helpers from a command context.

- **2026-07-20 — Task 4: Backend — Scheduled Job — COMPLETE**
  - Files created/changed:
    - `app/Console/Commands/DeleteExpiredFeaturedVideos.php` — NEW command `gallery-videos:purge-expired`
    - `bootstrap/app.php` — added schedule registration for the new command (also has a duplicate schedule definition in `app/Console/Kernel.php` — see note below)
  - Command behaviour:
    - Queries `GalleryVideo::where('expires_at', '<=', now())`
    - For each expired video: attempts Cloudinary delete (logs + warns on failure, does NOT block), deletes DB record, calls `invalidateGalleryCaches()`, calls `triggerFrontendRevalidation(['/galeri'], ['galleries'])`
    - Returns `Command::SUCCESS` silently when no expired videos found (no output, exit 0)
  - Architecture decision: followed the existing `PublishDueAnnouncements` pattern — the command uses the `UploadsToCloudinary` trait (so `deleteVideoFromCloudinary()` is available), and inlines private `invalidateGalleryCaches()` + `triggerFrontendRevalidation()` helpers mirroring the controller. No controller injection needed.
  - Schedule: every minute, `withoutOverlapping()`, `runInBackground()` — identical pattern to `announcements:publish-due`. Confirmed via `php artisan schedule:list`.
  - Existing duplication note: `app/Console/Kernel.php` also has a `schedule()` method with the old definition (only `announcements:publish-due`). `bootstrap/app.php`'s `withSchedule()` is the Laravel 12 primary schedule source and takes precedence. For consistency, if you ever touch Kernel.php, keep it in sync — or better, remove the Kernel's `schedule()` entirely since Laravel 12 prefers `bootstrap/app.php`.
  - Dry-run verified: `php artisan gallery-videos:purge-expired` exits 0 with no output when DB is empty.
  - For Task 5 (Admin Upload UI): Frontend component needs to POST to `/api/v1/admin/featured-video` (multipart/form-data, fields: `video` + `title`) and DELETE to `/api/v1/admin/featured-video`. The `is_portrait` field returned in the response can be used to show/hide the landscape warning message in the admin UI. Also needs to call the public `GET /api/v1/featured-video` to check if a video is currently active before showing the upload form (vs. showing the active video).

- **2026-07-20 — Task 5: Frontend — Admin Upload UI — COMPLETE**
  - Files changed:
    - `frontend/lib/admin-api.ts` — added `uploadFeaturedVideo(data: FormData)` and `deleteFeaturedVideo()` API functions
    - `frontend/app/admin/galleries/page.tsx` — added Featured Video section integrated at the top of the existing admin gallery page
  - Featured Video section (integrated into `AdminGalleriesPage`, not a separate page):
    - Header row with icon, title, subtitle, and "● Aktif" green badge when a video is active
    - Active video display: thumbnail, title, duration (formatted mm:ss), file size (MB), landscape warning badge (amber), expiry date, and a "Hapus" button
    - Upload form below: title input + video file picker (accept `video/mp4,video/quicktime`), landscape warning banner (amber, non-blocking), inline video preview (`<video controls>`), error message banner (red), submit button with spinner during upload, and a "Batal" reset button
  - Client-side validation (pre-submit, before upload):
    - File type check: rejects if not `video/mp4` or `video/quicktime`
    - File size check: rejects if > 50 MB
    - Orientation detection: reads `video.videoWidth / video.videoHeight` from `<video>` element on `loadedmetadata`; shows amber landscape warning but never blocks upload
    - Title: required, checked on submit
  - Backend error display: `uploadError` state is set from the API response `message`; displayed as a red inline banner (covers duration > 180s rejection and any backend validation errors)
  - Delete flow: `confirm()` dialog with warning text, DELETE call, clears `featuredVideo` state on success
  - Active video detection: uses a direct `fetch` to the public `GET /api/v1/featured-video` endpoint (no auth needed, returns `data: null` if none active)
  - `Next.js build: ✓` — no compilation errors
  - Deviation from spec: the admin UI is added to the existing "Galeri Foto" admin page rather than a dedicated `/admin/featured-video` route. This is more practical given the feature is gallery-related. The upload form is always visible regardless of whether a video is active (with a clear "Batal" reset).
  - Bug fixed post-delivery: `URL.createObjectURL()` blob URL lifecycle bug caused repeated `net::ERR_FILE_NOT_FOUND` browser errors while a video file was selected/previewing. Root cause: (a) `handleVideoSelect` called `URL.createObjectURL()` directly (not in a useEffect), creating a new blob URL on every re-render; (b) the `<video>` element's `onLoadedMetadata` handler revoked the URL via closure, killing the live blob before the browser finished loading it. Fix: moved blob URL creation into a `useEffect([selectedVideo])` that creates the URL once per file and revokes it in the cleanup function; removed `onLoadedMetadata` from the preview `<video>`; landscape detection uses a separate throwaway detector `<video>` element whose blob is revoked immediately after `loadedmetadata` fires (never stored in state).

- **2026-07-20 — Task 6: Frontend — Public Display — COMPLETE**
  - Files changed:
    - `frontend/lib/api.ts` — added `getFeaturedVideo()` API function and `FeaturedVideo` type
    - `frontend/components/ui/gallery-tabs.tsx` — added `featuredVideo` state, `useEffect` to fetch on mount, passed to `ImageGallery` as prop
    - `frontend/components/ui/image-gallery.tsx` — added `featuredVideo` prop to `ImageGalleryProps`, updated `AnimatedGalleryGrid` with conditional layout
  - Layout behaviour:
    - Desktop (when featured video active): 3 columns — left photo column (auto-scrolling), center pinned video (`<video controls muted playsInline loop>` with 9:16 aspect ratio, non-scrolling), right photo column (auto-scrolling, hidden `hidden lg:block` until large screens)
    - Mobile (when featured video active): 3-column grid collapses naturally via existing responsive classes — video column gets `shrink-0` and fixed 9:16 aspect, photo columns wrap to single column; effectively full-width pinned video at top with photos below
    - No featured video: reverts to existing 3-column scrolling photo grid (unchanged)
  - `getFeaturedVideo()` called in `GalleryTabs` `useEffect` — non-blocking, doesn't delay initial render; normal photo grid shows first, then video column appears when data resolves (no flicker/large CLS since photo grid layout is similar)
  - Video element: `controls muted playsInline loop preload="metadata"` — muted autoplay (browsers allow), explicit controls for user-initiated play/volume
  - `Next.js build: ✓` — no compilation errors
  - Deviation from spec: mobile layout uses natural CSS grid collapse rather than a separate pinned-top full-width block (the 9:16 portrait video in a flex column naturally takes full width and photos flow below). The result matches the spec visually without extra DOM complexity.
  - No manual QA/testing issues identified at this stage.

- **2026-07-21 — Bugfix: Cloudinary config not resolving after `php artisan config:cache`**
  - Symptom: ALL Cloudinary uploads (photos and video) failed in production with `Cloudinary\Exception\ConfigurationException: Invalid configuration, please set up your environment`.
  - Root cause: `UploadsToCloudinary.php` instantiated `new Cloudinary()` with no arguments in 4 places (upload, delete, video delete, video upload), relying on the Cloudinary PHP SDK's native `getenv('CLOUDINARY_URL')` auto-detection. This works when Laravel reads `.env` directly at runtime, but `php artisan config:cache` serialises the config — `.env` is no longer read at runtime, and `CLOUDINARY_URL` was never wired into Laravel's `config()` system, so `getenv()` returned empty in production.
  - Files changed:
    - `config/services.php` — added `'cloudinary' => ['url' => env('CLOUDINARY_URL')]`, following the same pattern as other third-party services in that file.
    - `app/Traits/UploadsToCloudinary.php` — replaced all 4 occurrences of `new Cloudinary()` with `new Cloudinary(config('services.cloudinary.url'))`:
      - `uploadToCloudinaryWithPublicId()`
      - `deleteFromCloudinary()`
      - `deleteVideoFromCloudinary()`
      - `uploadVideoToCloudinary()`
  - No other places in the codebase were found to instantiate `new Cloudinary()` or call `getenv()` for CLOUDINARY credentials — the trait is the only entry point.
  - `.env` is unchanged — `CLOUDINARY_URL` still lives there and is now correctly read through Laravel's config system.
  - **Deploy note:** After pulling this fix, `php artisan config:cache` must be re-run in production for the change to take effect (the new `services.cloudinary` key needs to be serialised into `bootstrap/cache/config.php`). If reverting, run `php artisan config:clear` first.

---

## Feature Complete ✅

All 6 tasks implemented. The Featured Video Upload feature is fully built.

### What was implemented
| Task | Description | Status |
|------|-------------|--------|
| 1 | DB migration + `GalleryVideo` Eloquent model | ✅ |
| 2 | `UploadsToCloudinary` trait extension (720p transcode, orientation detection, replace-on-upload) | ✅ |
| 3 | Admin + public API endpoints (`/admin/featured-video`, `/featured-video`) | ✅ |
| 4 | Scheduled command `gallery-videos:purge-expired` (runs every minute) | ✅ |
| 5 | Admin upload UI integrated into Galeri Foto page (validation, landscape warning, delete) | ✅ |
| 6 | Public gallery display (3-column desktop with pinned video, mobile pinned-top) | ✅ |

### Remaining manual QA/testing notes
- **Test video upload**: Upload a short MP4 (~5–30s, portrait) from the admin gallery page — verify it appears in the public gallery with the 3-column layout, then disappears from DB after 7 days when the scheduled job runs.
- **Test `.mov` upload**: Verify a `.mov` file is transcoded to H.264/MP4 on Cloudinary and returns an `mp4` URL.
- **Test duration rejection**: Upload a video longer than 3 minutes — verify the backend rejects it with the correct error message shown in the admin UI.
- **Test landscape warning**: Upload a landscape video — verify the amber warning appears in the admin UI but upload succeeds.
- **Test replace flow**: Upload a video, then upload a second one — verify the first is deleted from both Cloudinary and DB.
- **Test 7-day expiry**: Manually set a video's `expires_at` to a past date, then run `php artisan gallery-videos:purge-expired` — verify both the Cloudinary asset and DB record are deleted.
- **Test ISR revalidation**: After any of the above mutations, verify the public gallery page (`/galeri`) reflects the change within ~60 seconds (ISR fallback) or immediately (on-demand revalidation).
- **Cloudinary credentials**: Ensure `CLOUDINARY_URL` (or `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) is set in `.env` — without it, uploads and deletions will throw `ConfigurationException`.
  - For Task 6 (Public Display): The gallery page (`frontend/app/galeri/`) needs to call `GET /api/v1/featured-video` and conditionally apply the 3-column layout (desktop) or pinned-top layout (mobile) when `data !== null`. Check `frontend/components/ui/image-gallery.tsx` and `frontend/app/galeri/page.tsx` for where to integrate.
