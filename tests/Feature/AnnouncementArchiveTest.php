<?php

namespace Tests\Feature;

use App\Console\Commands\PublishDueAnnouncements;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Feature tests for announcement archive lifecycle:
 *  1. Derived status accessor for all states (active, scheduled, archived).
 *  2. Admin list endpoint appends status to each item.
 *  3. Manual archive endpoint sets fields, unpins, and rejects already archived items.
 *  4. Scheduled publish command does not re-publish hand-archived announcements.
 *  5. Scheduled command unpins pinned announcements upon expiry.
 *  6. Reactivate endpoint restores archived announcements with optional future expiry.
 *  7. Delete endpoint authorization (super_admin only) and requirement of archived status.
 */
class AnnouncementArchiveTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Fake all HTTP calls so frontend ISR revalidation never hits the network
        Http::fake([
            '*' => Http::response(['revalidated' => true], 200),
        ]);

        config([
            'app.frontend_url'      => 'https://frontend.test.local',
            'app.revalidate_secret' => 'test-secret-key',
        ]);
    }

    /** Helper: create a regular admin user. */
    protected function makeAdmin(): User
    {
        return User::create([
            'name'     => 'Test Admin',
            'email'    => 'admin_' . uniqid() . '@test.local',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);
    }

    /** Helper: create a super admin user. */
    protected function makeSuperAdmin(): User
    {
        return User::create([
            'name'     => 'Test Super Admin',
            'email'    => 'superadmin_' . uniqid() . '@test.local',
            'password' => Hash::make('password'),
            'role'     => 'super_admin',
        ]);
    }

    /** Helper: build an Announcement in the database with safe defaults (no Cloudinary). */
    protected function makeAnnouncement(array $overrides = []): Announcement
    {
        $admin = User::first() ?? $this->makeAdmin();

        return Announcement::create(array_merge([
            'user_id'         => $admin->id,
            'title'           => 'Test Announcement ' . uniqid(),
            'slug'            => 'test-announcement-' . uniqid(),
            'content'         => 'Test announcement body.',
            'excerpt'         => 'Test excerpt.',
            'is_pinned'       => false,
            'is_published'    => true,
            'published_at'    => now()->subHour(),
            'expired_at'      => null,
            'image_url'       => null,
            'image_public_id' => null,
        ], $overrides));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Status accessor for each case
    // ──────────────────────────────────────────────────────────────────────────

    #[Test]
    public function status_accessor_returns_correct_value_for_all_lifecycle_cases(): void
    {
        $this->makeAdmin();

        // Case 1: Active (published in past, is_published true, no expiry)
        $activeNoExpiry = $this->makeAnnouncement([
            'is_published' => true,
            'published_at' => now()->subDay(),
            'expired_at'   => null,
        ]);
        $this->assertSame('active', $activeNoExpiry->status);

        // Case 1b: Active (published in past, is_published true, future expiry)
        $activeFutureExpiry = $this->makeAnnouncement([
            'is_published' => true,
            'published_at' => now()->subDay(),
            'expired_at'   => now()->addDays(2),
        ]);
        $this->assertSame('active', $activeFutureExpiry->status);

        // Case 2: Scheduled (future published_at, is_published false)
        $scheduledFuture = $this->makeAnnouncement([
            'is_published' => false,
            'published_at' => now()->addDay(),
            'expired_at'   => null,
        ]);
        $this->assertSame('scheduled', $scheduledFuture->status);

        // Case 3: Scheduled (past published_at, unpublished, no expiry)
        $scheduledUnpublished = $this->makeAnnouncement([
            'is_published' => false,
            'published_at' => now()->subDay(),
            'expired_at'   => null,
        ]);
        $this->assertSame('scheduled', $scheduledUnpublished->status);

        // Case 4: Archived (past expired_at, is_published false)
        $archivedPastExpiry = $this->makeAnnouncement([
            'is_published' => false,
            'published_at' => now()->subDays(5),
            'expired_at'   => now()->subDay(),
        ]);
        $this->assertSame('archived', $archivedPastExpiry->status);

        // Case 5: Archived (is_published true but expired_at past)
        $archivedPublishedFlag = $this->makeAnnouncement([
            'is_published' => true,
            'published_at' => now()->subDays(5),
            'expired_at'   => now()->subMinute(),
        ]);
        $this->assertSame('archived', $archivedPublishedFlag->status);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Admin list returns status for each item
    // ──────────────────────────────────────────────────────────────────────────

    #[Test]
    public function admin_list_returns_status_for_each_item(): void
    {
        $admin = $this->makeAdmin();

        $active = $this->makeAnnouncement([
            'is_published' => true,
            'published_at' => now()->subHours(2),
            'expired_at'   => null,
        ]);

        $scheduled = $this->makeAnnouncement([
            'is_published' => false,
            'published_at' => now()->addDays(2),
            'expired_at'   => null,
        ]);

        $archived = $this->makeAnnouncement([
            'is_published' => false,
            'published_at' => now()->subDays(10),
            'expired_at'   => now()->subDay(),
        ]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/announcements');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $data = $response->json('data');
        $this->assertCount(3, $data);

        $statusById = collect($data)->pluck('status', 'id')->all();

        $this->assertSame('active', $statusById[$active->id]);
        $this->assertSame('scheduled', $statusById[$scheduled->id]);
        $this->assertSame('archived', $statusById[$archived->id]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Archive sets fields, unpins, and rejects already archived one
    // ──────────────────────────────────────────────────────────────────────────

    #[Test]
    public function archive_sets_fields_unpins_and_rejects_already_archived_announcement(): void
    {
        $admin = $this->makeAdmin();

        $announcement = $this->makeAnnouncement([
            'is_pinned'    => true,
            'is_published' => true,
            'published_at' => now()->subHours(3),
            'expired_at'   => null,
        ]);

        $this->assertSame('active', $announcement->status);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/announcements/{$announcement->id}/archive");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Pengumuman berhasil diarsipkan.',
                'data'    => [
                    'id'           => $announcement->id,
                    'status'       => 'archived',
                    'is_published' => false,
                    'is_pinned'    => false,
                ],
            ]);

        $announcement->refresh();
        $this->assertFalse((bool) $announcement->is_published);
        $this->assertFalse((bool) $announcement->is_pinned);
        $this->assertNotNull($announcement->expired_at);
        $this->assertTrue($announcement->expired_at->lte(now()));
        $this->assertSame('archived', $announcement->status);

        // Attempting to archive an already archived announcement returns 422
        $secondResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/announcements/{$announcement->id}/archive");

        $secondResponse->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Pengumuman sudah dalam status arsip.',
            ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Command does NOT re-publish an announcement archived by hand
    // ──────────────────────────────────────────────────────────────────────────

    #[Test]
    public function command_does_not_republish_an_announcement_archived_by_hand(): void
    {
        $this->makeAdmin();

        // Announcement published in past, but hand-archived (is_published = false, expired_at <= now())
        $archivedByHand = $this->makeAnnouncement([
            'is_published' => false,
            'published_at' => now()->subDays(2),
            'expired_at'   => now()->subHour(),
            'is_pinned'    => false,
        ]);

        $this->assertSame('archived', $archivedByHand->status);

        Artisan::call('announcements:publish-due');

        $archivedByHand->refresh();
        $this->assertFalse(
            (bool) $archivedByHand->is_published,
            'Hand-archived announcement must not be republished by publish-due scheduler'
        );
        $this->assertSame('archived', $archivedByHand->status);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. Command unpins a pinned announcement when it expires it
    // ──────────────────────────────────────────────────────────────────────────

    #[Test]
    public function command_unpins_a_pinned_announcement_when_it_expires(): void
    {
        $this->makeAdmin();

        $expiredPinned = $this->makeAnnouncement([
            'is_pinned'    => true,
            'is_published' => true,
            'published_at' => now()->subDays(3),
            'expired_at'   => now()->subMinute(),
        ]);

        $this->assertTrue((bool) $expiredPinned->is_pinned);
        $this->assertTrue((bool) $expiredPinned->is_published);

        Artisan::call('announcements:publish-due');

        $expiredPinned->refresh();
        $this->assertFalse((bool) $expiredPinned->is_published, 'Expired announcement must be unpublished');
        $this->assertFalse((bool) $expiredPinned->is_pinned, 'Expired announcement must be unpinned');
        $this->assertSame('archived', $expiredPinned->status);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 6. Reactivate works only from archived, sets fields, validates expiry
    // ──────────────────────────────────────────────────────────────────────────

    #[Test]
    public function reactivate_works_only_from_archived_and_validates_new_expiry(): void
    {
        $admin = $this->makeAdmin();

        // Active announcement cannot be reactivated
        $active = $this->makeAnnouncement([
            'is_published' => true,
            'published_at' => now()->subHour(),
            'expired_at'   => null,
        ]);

        $activeResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/announcements/{$active->id}/reactivate");

        $activeResponse->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Hanya pengumuman yang diarsipkan yang dapat diaktifkan kembali.',
            ]);

        // Archived announcement
        $archived = $this->makeAnnouncement([
            'is_pinned'    => true,
            'is_published' => false,
            'published_at' => now()->subDays(5),
            'expired_at'   => now()->subDay(),
        ]);
        $this->assertSame('archived', $archived->status);

        // Reject today's date for expired_at
        $todayResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/announcements/{$archived->id}/reactivate", [
                'expired_at' => Carbon::today()->toDateString(),
            ]);
        $todayResponse->assertStatus(422)
            ->assertJsonValidationErrors(['expired_at']);

        // Reject past date for expired_at
        $pastResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/announcements/{$archived->id}/reactivate", [
                'expired_at' => Carbon::yesterday()->toDateString(),
            ]);
        $pastResponse->assertStatus(422)
            ->assertJsonValidationErrors(['expired_at']);

        // Reactivate with valid future expiry
        $futureExpiry = Carbon::tomorrow()->addDays(7)->toDateString();
        $validResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/announcements/{$archived->id}/reactivate", [
                'expired_at' => $futureExpiry,
            ]);

        $validResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Pengumuman berhasil diaktifkan kembali.',
                'data'    => [
                    'id'           => $archived->id,
                    'status'       => 'active',
                    'is_published' => true,
                    'is_pinned'    => false,
                ],
            ]);

        $archived->refresh();
        $this->assertTrue((bool) $archived->is_published);
        $this->assertFalse((bool) $archived->is_pinned, 'Reactivated announcement must have is_pinned = false');
        $this->assertSame('active', $archived->status);
        $this->assertNotNull($archived->expired_at);
        $this->assertSame($futureExpiry, $archived->expired_at->toDateString());

        // Archive again, then reactivate with null expired_at
        $archived->update([
            'expired_at'   => now()->subMinute(),
            'is_published' => false,
        ]);
        $this->assertSame('archived', $archived->status);

        $nullExpiryResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/announcements/{$archived->id}/reactivate", [
                'expired_at' => null,
            ]);

        $nullExpiryResponse->assertStatus(200);

        $archived->refresh();
        $this->assertTrue((bool) $archived->is_published);
        $this->assertNull($archived->expired_at);
        $this->assertSame('active', $archived->status);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 7. Delete: admin gets 403; super_admin gets 422 if not archived, 200 if archived
    // ──────────────────────────────────────────────────────────────────────────

    #[Test]
    public function delete_requires_super_admin_and_archived_status(): void
    {
        $admin      = $this->makeAdmin();
        $superAdmin = $this->makeSuperAdmin();

        $active = $this->makeAnnouncement([
            'is_published' => true,
            'published_at' => now()->subHour(),
            'expired_at'   => null,
        ]);

        $archived = $this->makeAnnouncement([
            'is_published' => false,
            'published_at' => now()->subDays(7),
            'expired_at'   => now()->subDay(),
        ]);

        // Regular admin attempting to delete archived announcement receives 403
        $adminDeleteResponse = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/announcements/{$archived->id}");

        $adminDeleteResponse->assertStatus(403);
        $this->assertDatabaseHas('announcements', ['id' => $archived->id]);

        // Super admin attempting to delete active (non-archived) announcement receives 422
        $superDeleteActiveResponse = $this->actingAs($superAdmin, 'sanctum')
            ->deleteJson("/api/v1/admin/announcements/{$active->id}");

        $superDeleteActiveResponse->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Pengumuman harus diarsipkan terlebih dahulu sebelum dapat dihapus.',
            ]);
        $this->assertDatabaseHas('announcements', ['id' => $active->id]);

        // Super admin deleting archived announcement succeeds with 200
        $superDeleteArchivedResponse = $this->actingAs($superAdmin, 'sanctum')
            ->deleteJson("/api/v1/admin/announcements/{$archived->id}");

        $superDeleteArchivedResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Pengumuman berhasil dihapus.',
            ]);

        $this->assertDatabaseMissing('announcements', ['id' => $archived->id]);
    }
}
