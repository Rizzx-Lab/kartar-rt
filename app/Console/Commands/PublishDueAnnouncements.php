<?php

namespace App\Console\Commands;

use App\Models\Announcement;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Auto-publishes draft announcements whose published_at date has arrived.
 *
 * Run every minute via Laravel's scheduler (php artisan schedule:run).
 * For each due announcement:
 *   1. Flips is_published → true
 *   2. Invalidates all announcement caches
 *   3. Triggers Next.js on-demand ISR revalidation so the frontend updates
 *      without waiting for the 60-second ISR fallback.
 *
 * Usage (scheduled automatically):
 *   php artisan announcements:publish-due
 */
class PublishDueAnnouncements extends Command
{
    protected $signature = 'announcements:publish-due';
    protected $description = 'Publish all draft announcements whose published_at date has arrived';

    public function handle(): int
    {
        $this->info('Checking for due announcements...');

        // Find all draft announcements that are due (published_at <= now)
        $dueAnnouncements = Announcement::where('is_published', false)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->get();

        if ($dueAnnouncements->isEmpty()) {
            $this->info('No due announcements found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$dueAnnouncements->count()} announcement(s) to publish.");

        foreach ($dueAnnouncements as $announcement) {
            $this->publishAnnouncement($announcement);
        }

        $this->info('Done.');
        return Command::SUCCESS;
    }

    protected function publishAnnouncement(Announcement $announcement): void
    {
        // Flip to published
        $announcement->update(['is_published' => true]);

        $this->info("  ✓ Published: [ID {$announcement->id}] {$announcement->title}");

        Log::info('announcements:publish-due: published', [
            'id' => $announcement->id,
            'slug' => $announcement->slug,
            'title' => $announcement->title,
        ]);

        // Invalidate all announcement-related caches (same logic as AdminApiController)
        $this->invalidateAnnouncementCaches($announcement->slug);

        // Trigger on-demand ISR revalidation on the Next.js frontend
        $this->triggerFrontendRevalidation(['/pengumuman', '/'], ['announcements', 'home']);
    }

    /**
     * Invalidate all announcement-related caches.
     * Mirrors AdminApiController::invalidateAnnouncementCaches().
     */
    protected function invalidateAnnouncementCaches(?string $slug = null): void
    {
        foreach ([6, 10, 20] as $perPage) {
            Cache::forget("api:announcements:1:{$perPage}");
        }
        if ($slug) {
            Cache::forget("api:announcement:{$slug}");
        }
        Cache::forget('api:home');
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
}
