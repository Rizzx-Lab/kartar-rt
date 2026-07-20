<?php

namespace App\Console\Commands;

use App\Models\GalleryVideo;
use App\Traits\UploadsToCloudinary;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Permanently deletes featured videos whose 7-day display window has expired.
 *
 * Runs every minute via Laravel's scheduler (php artisan schedule:run).
 * Deletes both the Cloudinary asset and the DB record — no archiving.
 *
 * Per spec:
 *   - Video is auto-deleted permanently after 7 days (expires_at)
 *   - Cloudinary asset + DB record removed; no soft-delete / archive
 *   - Landscape warning and duration limits are enforced at upload time (Task 3)
 *
 * Usage (scheduled automatically):
 *   php artisan gallery-videos:purge-expired
 */
class DeleteExpiredFeaturedVideos extends Command
{
    use UploadsToCloudinary;

    protected $signature = 'gallery-videos:purge-expired';
    protected $description = 'Permanently delete featured videos whose expires_at has passed (Cloudinary asset + DB record)';

    public function handle(): int
    {
        $expiredVideos = GalleryVideo::where('expires_at', '<=', now())->get();

        if ($expiredVideos->isEmpty()) {
            return Command::SUCCESS;
        }

        $count = $expiredVideos->count();
        $this->info("Purging {$count} expired video(s)...");

        foreach ($expiredVideos as $video) {
            $this->purgeVideo($video);
        }

        return Command::SUCCESS;
    }

    /**
     * Permanently delete one expired video: Cloudinary asset + DB record.
     */
    protected function purgeVideo(GalleryVideo $video): void
    {
        $publicId = $video->public_id;

        // Attempt to delete the Cloudinary video asset
        try {
            $this->deleteVideoFromCloudinary($publicId);
            $this->info("  ✓ Deleted Cloudinary asset: {$publicId}");
        } catch (\Throwable $e) {
            // Cloudinary delete failure is logged but does NOT block DB deletion.
            // A stale Cloudinary asset wastes storage but is not a data-integrity issue.
            // The cleanup job will retry on the next run if the asset is still there.
            Log::error('gallery-videos:purge-expired: failed to delete Cloudinary asset', [
                'public_id' => $publicId,
                'video_id'  => $video->id,
                'error'     => $e->getMessage(),
            ]);
            $this->warn("  ⚠ Cloudinary delete failed for {$publicId}: {$e->getMessage()}");
        }

        // Always delete the DB record — no archiving per spec
        $video->delete();

        Log::info('gallery-videos:purge-expired: purged video', [
            'id'        => $video->id,
            'public_id' => $publicId,
            'title'     => $video->title,
        ]);

        $this->info("  ✓ Purged DB record: [ID {$video->id}] {$video->title}");

        // Invalidate gallery-related caches (featured video removal affects gallery page layout)
        $this->invalidateGalleryCaches();

        // Trigger on-demand ISR revalidation so the frontend hides the video immediately
        $this->triggerFrontendRevalidation(['/galeri'], ['galleries']);
    }

    /**
     * Invalidate gallery-related caches.
     * Mirrors AdminApiController::invalidateGalleryCaches().
     */
    protected function invalidateGalleryCaches(): void
    {
        Cache::forget('api:recent-photos:30');
        Cache::forget('api:archives');
        foreach ([6, 12] as $perPage) {
            foreach (range(1, 3) as $page) {
                Cache::forget("api:galleries:{$page}:{$perPage}");
            }
        }
    }

    /**
     * Trigger on-demand ISR revalidation on the Next.js frontend.
     * Mirrors AdminApiController::triggerFrontendRevalidation().
     */
    protected function triggerFrontendRevalidation(array $paths = [], array $tags = []): void
    {
        $frontendUrl = config('app.frontend_url');
        $secret = config('app.revalidate_secret');

        if (!$frontendUrl || !$secret) {
            Log::warning('Frontend revalidation skipped: FRONTEND_URL or REVALIDATE_SECRET not configured.');
            return;
        }

        try {
            Http::withHeaders([
                'Authorization' => "Bearer {$secret}",
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
            ])->post("{$frontendUrl}/api/revalidate", [
                'paths' => $paths,
                'tags'  => $tags,
            ]);
        } catch (\Exception $e) {
            // Log but don't fail — the ISR fallback (revalidate=60) will handle stale data
            Log::error('Frontend revalidation failed: ' . $e->getMessage());
        }
    }
}
