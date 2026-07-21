<?php

namespace App\Jobs;

use App\Models\GalleryVideo;
use App\Traits\UploadsToCloudinary;
use Cloudinary\Cloudinary;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Polls Cloudinary for the completion of an async eager transformation on a
 * featured video upload.
 *
 * Design constraints (queue runs via cron as `php artisan queue:work --once
 * --timeout=30`):
 *   - ONE Cloudinary API call per job execution.
 *   - If the transformation is not yet done, release back to the queue with a
 *     60-second delay so the next cron tick picks it up.
 *   - $tries = 10 gives ~10 minutes of total retry window.
 *   - $timeout = 25 keeps execution safely under the 30-second cron limit.
 */
class ProcessFeaturedVideoUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, UploadsToCloudinary;

    /**
     * The number of times the job may be attempted.
     * 10 attempts × 60-second release delay ≈ 10 minutes of total polling window.
     */
    public int $tries = 10;

    /**
     * The number of seconds after which the job times out.
     * Must be < the queue worker's --timeout (30 s) to avoid being killed mid-run.
     */
    public int $timeout = 25;

    public function __construct(
        public int $galleryVideoId,
        public string $publicId,
    ) {}

    public function handle(): void
    {
        $video = GalleryVideo::find($this->galleryVideoId);

        // If the record was deleted (e.g. manually removed by admin before
        // processing finished), abort silently.
        if (!$video || $video->status === 'active') {
            Log::info('ProcessFeaturedVideoUpload: record gone or already active, skipping', [
                'gallery_video_id' => $this->galleryVideoId,
            ]);
            return;
        }

        Log::info('ProcessFeaturedVideoUpload: checking transformation status', [
            'gallery_video_id' => $this->galleryVideoId,
            'public_id'        => $this->publicId,
            'attempt'          => $this->attempts(),
        ]);

        $cloudinary = new Cloudinary(config('services.cloudinary.url'));

        try {
            $resource = $cloudinary->adminApi()->asset($this->publicId, [
                'resource_type' => 'video',
            ]);
        } catch (\Throwable $e) {
            // If the resource isn't found yet, Cloudinary may still be processing.
            // Re-queue for the next cron tick.
            if ($this->isNotFoundError($e)) {
                Log::info('ProcessFeaturedVideoUpload: resource not yet available, re-queuing', [
                    'gallery_video_id' => $this->galleryVideoId,
                    'attempt'          => $this->attempts(),
                ]);
                $this->release(60);
                return;
            }

            // Non-recoverable error — fail the record.
            $this->failRecord($video, 'Cloudinary API error: ' . $e->getMessage());
            return;
        }

        // Cloudinary Admin API returns eager transformations in the 'derived' array
        // (NOT the 'eager' key — that key exists only in the upload API response).
        // Each derived entry has 'transformation' and 'secure_url'.
        $derived = $resource['derived'] ?? [];

        // Find the variant matching our w_720 transformation.
        $transformed = null;
        foreach ($derived as $variant) {
            if (isset($variant['transformation']) && str_contains($variant['transformation'], 'w_720')) {
                $transformed = $variant;
                break;
            }
        }

        if (!$transformed) {
            // No eager transformation applied yet — still processing.
            Log::info('ProcessFeaturedVideoUpload: eager variant not yet ready, re-queuing', [
                'gallery_video_id' => $this->galleryVideoId,
                'attempt'          => $this->attempts(),
            ]);
            $this->release(60);
            return;
        }

        // Transformation is complete — update the DB record.
        $secureUrl       = $transformed['secure_url'] ?? $video->pending_video_url;
        $thumbnailUrl    = $this->buildVideoThumbnailUrl($secureUrl);
        $width           = (int) ($resource['width']    ?? 0);
        $height          = (int) ($resource['height']   ?? 0);

        $video->update([
            'video_url'      => $secureUrl,
            'pending_video_url' => null,
            'thumbnail_url'  => $thumbnailUrl,
            'duration'       => (int) ($resource['duration'] ?? $video->duration),
            'file_size'      => (int) ($resource['bytes']    ?? $video->file_size),
            'is_portrait'    => $height > $width,
            'status'         => 'active',
        ]);

        Log::info('ProcessFeaturedVideoUpload: transformation complete, video activated', [
            'gallery_video_id' => $this->galleryVideoId,
            'video_url'        => $secureUrl,
        ]);
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        $video = GalleryVideo::find($this->galleryVideoId);

        if ($video) {
            $this->failRecord($video, 'Max retries reached: ' . $exception->getMessage());
        }

        Log::error('ProcessFeaturedVideoUpload: job permanently failed', [
            'gallery_video_id' => $this->galleryVideoId,
            'public_id'        => $this->publicId,
            'exception'        => $exception->getMessage(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function failRecord(GalleryVideo $video, string $reason): void
    {
        // Attempt to clean up the Cloudinary asset so it doesn't orphan.
        try {
            $cloudinary = new Cloudinary(config('services.cloudinary.url'));
            $cloudinary->uploadApi()->destroy($this->publicId, ['resource_type' => 'video']);
        } catch (\Throwable $e) {
            Log::warning('ProcessFeaturedVideoUpload: failed to delete Cloudinary asset on record failure', [
                'public_id' => $this->publicId,
                'error'    => $e->getMessage(),
            ]);
        }

        $video->update(['status' => 'failed']);

        Log::error('ProcessFeaturedVideoUpload: record marked as failed', [
            'gallery_video_id' => $this->galleryVideoId,
            'reason'          => $reason,
        ]);
    }

    /**
     * Returns true if the exception indicates the Cloudinary resource was not found.
     * Cloudinary returns a 404 (or 400) when the resource doesn't exist yet.
     */
    private function isNotFoundError(\Throwable $e): bool
    {
        // The PHP SDK wraps HTTP errors; code "404" appears in the message or code.
        $msg = strtolower($e->getMessage());
        return str_contains($msg, '404') || str_contains($msg, 'not found') || str_contains($msg, 'resource not found');
    }
}
