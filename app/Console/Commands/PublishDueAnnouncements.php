<?php

namespace App\Console\Commands;

use App\Models\Announcement;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Auto-publishes draft announcements whose published_at date has arrived,
 * and unpublishes published announcements whose expires_at date has passed.
 *
 * Run every minute via Laravel's scheduler (php artisan schedule:run).
 *
 * Publish flow (due announcements):
 *   1. Flips is_published → true
 *   2. Invalidates all announcement caches
 *   3. Triggers Next.js on-demand ISR revalidation so the frontend updates
 *      without waiting for the 60-second ISR fallback.
 *
 * Expire flow (expired announcements):
 *   1. Flips is_published → false
 *   2. Invalidates all announcement caches
 *   3. Triggers Next.js on-demand ISR revalidation so the frontend updates.
 *
 * Usage (scheduled automatically):
 *   php artisan announcements:publish-due
 */
class PublishDueAnnouncements extends Command
{
    protected $signature = 'announcements:publish-due';
    protected $description = 'Publish draft announcements whose published_at has arrived, and unpublish published announcements past their expires_at';

    public function handle(): int
    {
        $published = $this->handlePublish();
        $expired = $this->handleExpire();

        // Only output "Done." when there was actual work (or both were skipped silently via --quiet)
        if (!$this->option('quiet') && $published === 0 && $expired === 0) {
            $this->info('No announcements to publish or expire.');
        }

        return Command::SUCCESS;
    }

    /**
     * Find and publish draft announcements whose published_at has arrived.
     */
    protected function handlePublish(): int
    {
        $dueAnnouncements = Announcement::where('is_published', false)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->get();

        if ($dueAnnouncements->isEmpty()) {
            $this->info('No due announcements to publish.');
            return 0;
        }

        $count = $dueAnnouncements->count();
        $this->info("Publishing {$count} announcement(s)...");

        foreach ($dueAnnouncements as $announcement) {
            $this->publishAnnouncement($announcement);
        }

        return $count;
    }

    /**
     * Find and unpublish published announcements whose expires_at has passed.
     */
    protected function handleExpire(): int
    {
        $expiredAnnouncements = Announcement::where('is_published', true)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->get();

        if ($expiredAnnouncements->isEmpty()) {
            $this->info('No expired announcements to unpublish.');
            return 0;
        }

        $count = $expiredAnnouncements->count();
        $this->info("Unpublishing {$count} expired announcement(s)...");

        foreach ($expiredAnnouncements as $announcement) {
            $this->expireAnnouncement($announcement);
        }

        return $count;
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
     * Unpublish an expired announcement (flip is_published → false).
     */
    protected function expireAnnouncement(Announcement $announcement): void
    {
        $announcement->update(['is_published' => false]);

        $this->info("  ✓ Unpublished (expired): [ID {$announcement->id}] {$announcement->title}");

        Log::info('announcements:publish-due: expired', [
            'id' => $announcement->id,
            'slug' => $announcement->slug,
            'title' => $announcement->title,
        ]);

        // Invalidate all announcement-related caches
        $this->invalidateAnnouncementCaches($announcement->slug);

        // Trigger on-demand ISR revalidation so the frontend hides it immediately
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
