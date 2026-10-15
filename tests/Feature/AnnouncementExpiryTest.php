<?php

namespace Tests\Feature;

use App\Console\Commands\PublishDueAnnouncements;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Tests for the announcement expiry lifecycle bug fix.
 *
 * Covers:
 *  (a) Admin create and update store expired_at in the database.
 *  (b) PublishDueAnnouncements unpublishes announcements whose expired_at is in
 *      the past, and leaves NULL or future ones untouched.
 *  (c) The public scopePublished() scope hides an expired announcement.
 */
class AnnouncementExpiryTest extends TestCase
{
    use RefreshDatabase;

    /** Helper: create an admin user. */
    protected function makeAdmin(): User
    {
        return User::create([
            'name'     => 'Test Admin',
            'email'    => 'admin@test.local',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);
    }

    /** Helper: build a minimal published Announcement in the database directly. */
    protected function makeAnnouncement(array $overrides = []): Announcement
    {
        $admin = User::first() ?? $this->makeAdmin();

        return Announcement::create(array_merge([
            'user_id'      => $admin->id,
            'title'        => 'Test Announcement',
            'slug'         => 'test-announcement-' . uniqid(),
            'content'      => 'Body text.',
            'excerpt'      => 'Short excerpt.',
            'is_pinned'    => false,
            'is_published' => true,
            'published_at' => now()->subHour(),
            'expired_at'   => null,
        ], $overrides));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // (a) Admin API: create and update store expired_at
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @test
     * Posting expired_at via the admin create endpoint should persist the
     * value in the expired_at database column, not drop it.
     */
    public function admin_store_saves_expired_at_to_database(): void
    {
        $admin   = $this->makeAdmin();
        $expiry  = Carbon::tomorrow()->addDays(3)->toDateString(); // future date

        $response = $this->actingAs($admin, 'sanctum')->post('/api/v1/admin/announcements', [
            'title'        => 'Expiry Store Test',
            'content'      => 'Content body.',
            'published_at' => Carbon::today()->toDateString(),
            'expired_at'   => $expiry,
        ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('announcements', [
            'title' => 'Expiry Store Test',
        ]);

        $announcement = Announcement::where('title', 'Expiry Store Test')->first();
        $this->assertNotNull($announcement->expired_at, 'expired_at should be stored, not NULL');
        $this->assertEquals(
            $expiry,
            $announcement->expired_at->toDateString(),
            'Stored expired_at date should match the submitted value'
        );
    }

    /**
     * @test
     * Posting expired_at via the admin update endpoint should persist the
     * value in the expired_at database column.
     */
    public function admin_update_saves_expired_at_to_database(): void
    {
        $admin        = $this->makeAdmin();
        $announcement = $this->makeAnnouncement(['expired_at' => null]);
        $expiry       = Carbon::tomorrow()->addDays(5)->toDateString();

        $response = $this->actingAs($admin, 'sanctum')->post(
            "/api/v1/admin/announcements/{$announcement->id}",
            [
                '_method'      => 'PUT',
                'title'        => $announcement->title,
                'content'      => $announcement->content,
                'published_at' => Carbon::today()->toDateString(),
                'expired_at'   => $expiry,
            ]
        );

        $response->assertStatus(200)->assertJson(['success' => true]);

        $announcement->refresh();
        $this->assertNotNull($announcement->expired_at, 'expired_at should be updated, not NULL');
        $this->assertEquals(
            $expiry,
            $announcement->expired_at->toDateString(),
            'Updated expired_at date should match the submitted value'
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // (b) PublishDueAnnouncements unpublishes expired, leaves others alone
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @test
     * The command should flip is_published to false for announcements whose
     * expired_at is in the past, and leave NULL or future expired_at untouched.
     */
    public function command_unpublishes_expired_announcement_and_leaves_others(): void
    {
        $this->makeAdmin();

        // Past expiry → should be unpublished
        $expired = $this->makeAnnouncement([
            'expired_at' => now()->subHour(),
        ]);

        // NULL expiry → should remain published
        $noExpiry = $this->makeAnnouncement([
            'slug'       => 'no-expiry-' . uniqid(),
            'expired_at' => null,
        ]);

        // Future expiry → should remain published
        $futureExpiry = $this->makeAnnouncement([
            'slug'       => 'future-expiry-' . uniqid(),
            'expired_at' => now()->addDays(7),
        ]);

        // Suppress HTTP calls from triggerFrontendRevalidation
        config([
            'app.frontend_url'      => null,
            'app.revalidate_secret' => null,
        ]);

        Artisan::call('announcements:publish-due');

        $expired->refresh();
        $noExpiry->refresh();
        $futureExpiry->refresh();

        $this->assertFalse((bool) $expired->is_published, 'Expired announcement should be unpublished');
        $this->assertTrue((bool) $noExpiry->is_published, 'NULL-expiry announcement should stay published');
        $this->assertTrue((bool) $futureExpiry->is_published, 'Future-expiry announcement should stay published');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // (c) scopePublished hides expired announcements
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @test
     * An announcement with expired_at in the past should be excluded from the
     * scopePublished() query even when is_published is true.
     */
    public function scope_published_hides_announcement_with_past_expired_at(): void
    {
        $this->makeAdmin();

        $expired = $this->makeAnnouncement([
            'is_published' => true,
            'expired_at'   => now()->subMinute(),
        ]);

        $visible = $this->makeAnnouncement([
            'slug'         => 'visible-' . uniqid(),
            'is_published' => true,
            'expired_at'   => null,
        ]);

        $results = Announcement::published()->pluck('id')->toArray();

        $this->assertNotContains($expired->id, $results, 'Expired announcement should be hidden by scopePublished');
        $this->assertContains($visible->id, $results, 'Non-expired announcement should be visible via scopePublished');
    }
}
