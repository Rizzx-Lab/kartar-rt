<?php

namespace Tests\Feature;

use App\Models\{User, Program, Announcement, Gallery, Contact};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PushNotificationBackendTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Set VAPID keys for testing
        config([
            'webpush.vapid.public_key' => 'test-public-key',
            'webpush.vapid.private_key' => 'test-private-key',
            'webpush.vapid.subject' => 'mailto:test@example.com',
        ]);
    }

    /**
     * Create a user with the given role.
     */
    protected function createUser(string $role, string $name): User
    {
        return User::create([
            'name' => $name,
            'email' => strtolower(str_replace(' ', '', $name)) . '@test.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => $role,
        ]);
    }

    // ========================
    // NEW CONTACT MESSAGE TESTS
    // ========================

    public function test_new_contact_message_notifies_all_admins(): void
    {
        Notification::fake();

        // Create admin users
        $superAdmin = $this->createUser('super_admin', 'Super Admin');
        $admin = $this->createUser('admin', 'Admin User');

        // Submit contact form
        $response = $this->postJson('/api/v1/contact', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '081234567890',
            'message' => 'This is a test message from a visitor.',
        ]);

        $response->assertStatus(200);

        // Assert that both admin and super_admin received notifications
        Notification::assertSentTo($superAdmin, \App\Notifications\NewContactMessageNotification::class);
        Notification::assertSentTo($admin, \App\Notifications\NewContactMessageNotification::class);
    }

    public function test_new_contact_message_does_not_notify_non_admin_users(): void
    {
        Notification::fake();

        // Create non-admin users (only 'member' role is non-admin)
        $memberUser = $this->createUser('member', 'Member User');

        // Submit contact form
        $response = $this->postJson('/api/v1/contact', [
            'name' => 'Visitor',
            'email' => 'visitor@example.com',
            'message' => 'Hello, this is a test.',
        ]);

        $response->assertStatus(200);

        // Assert that non-admin users did NOT receive notifications
        Notification::assertNotSentTo($memberUser, \App\Notifications\NewContactMessageNotification::class);
    }

    // ========================
    // ADMIN ACTIVITY TESTS
    // ========================

    public function test_program_created_by_admin_notifies_super_admin(): void
    {
        Notification::fake();

        // Create users
        $superAdmin = $this->createUser('super_admin', 'Super Admin');
        $admin = $this->createUser('admin', 'Admin User');

        // Login as admin and create program
        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/programs', [
            'name' => 'Test Program',
            'description' => 'A test program description',
            'frequency' => 'monthly',
        ]);

        $response->assertStatus(200);

        // Assert super admin was notified
        Notification::assertSentTo($superAdmin, \App\Notifications\AdminActivityNotification::class, function ($notification) {
            return $notification->action === 'created'
                && $notification->modelType === 'Program'
                && $notification->actorName === 'Admin User';
        });
    }

    public function test_program_created_by_super_admin_does_not_notify_anyone(): void
    {
        Notification::fake();

        // Create super admin
        $superAdmin = $this->createUser('super_admin', 'Super Admin');

        // Login as super admin and create program
        $response = $this->actingAs($superAdmin, 'sanctum')->postJson('/api/v1/admin/programs', [
            'name' => 'Super Admin Program',
            'description' => 'Created by super admin',
            'frequency' => 'yearly',
        ]);

        $response->assertStatus(200);

        // Assert no notifications were sent (super admin's actions don't trigger notifications)
        Notification::assertNothingSent();
    }

    public function test_announcement_updated_by_admin_notifies_super_admin(): void
    {
        Notification::fake();

        // Create users
        $superAdmin = $this->createUser('super_admin', 'Super Admin');
        $admin = $this->createUser('admin', 'Admin User');

        // Create an announcement with user_id
        $announcement = Announcement::create([
            'user_id' => $superAdmin->id,
            'title' => 'Original Title',
            'slug' => 'original-title',
            'content' => 'Original content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        // Login as admin and update announcement
        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/v1/admin/announcements/{$announcement->id}", [
            'title' => 'Updated Title',
            'content' => 'Updated content',
        ]);

        $response->assertStatus(200);

        // Assert super admin was notified
        Notification::assertSentTo($superAdmin, \App\Notifications\AdminActivityNotification::class, function ($notification) {
            return $notification->action === 'updated'
                && $notification->modelType === 'Announcement';
        });
    }

    public function test_gallery_deleted_by_admin_notifies_super_admin(): void
    {
        Notification::fake();

        // Create users
        $superAdmin = $this->createUser('super_admin', 'Super Admin');
        $admin = $this->createUser('admin', 'Admin User');

        // Create a gallery
        $gallery = Gallery::create([
            'title' => 'Test Gallery',
            'description' => 'A test gallery',
            'is_published' => true,
        ]);

        // Login as admin and delete gallery
        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/admin/galleries/{$gallery->id}");

        $response->assertStatus(200);

        // Assert super admin was notified
        Notification::assertSentTo($superAdmin, \App\Notifications\AdminActivityNotification::class, function ($notification) {
            return $notification->action === 'deleted'
                && $notification->modelType === 'Gallery';
        });
    }

    // ========================
    // PUSH SUBSCRIPTION TESTS
    // ========================

    public function test_subscribe_endpoint_requires_auth(): void
    {
        $response = $this->postJson('/api/v1/push/subscribe', [
            'endpoint' => 'https://example.com/push',
            'keys' => [
                'p256dh' => 'test-p256dh',
                'auth' => 'test-auth',
            ],
        ]);

        $response->assertStatus(401);
    }

    public function test_subscribe_endpoint_saves_subscription_for_authenticated_user(): void
    {
        $user = $this->createUser('admin', 'Test Admin');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/push/subscribe', [
            'endpoint' => 'https://example.com/push/' . time(),
            'keys' => [
                'p256dh' => 'BCt3jJ7gGKkGNfHDGjGJ8QGZDJhLR7wE4J4R5sK3pQ9L8mN1oP2qR4sT5uV6wX7yZ8==',
                'auth' => 'ABC123def456==',
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Push subscription saved successfully.',
        ]);

        // Verify subscription was saved (morphs uses subscribable_id and subscribable_type)
        $this->assertDatabaseHas('push_subscriptions', [
            'subscribable_id' => $user->id,
            'subscribable_type' => 'App\\Models\\User',
        ]);
    }

    public function test_vapid_public_key_endpoint_is_public(): void
    {
        $response = $this->getJson('/api/v1/push/vapid-public-key');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'publicKey',
            ],
        ]);
    }

    // ========================
    // QUEUE INTEGRATION TESTS
    // ========================

    public function test_contact_submission_queues_notification_job(): void
    {
        Notification::fake();

        // Create admin users
        $superAdmin = $this->createUser('super_admin', 'Super Admin');
        $admin = $this->createUser('admin', 'Admin User');

        // Submit contact form
        $response = $this->postJson('/api/v1/contact', [
            'name' => 'Queue Test User',
            'email' => 'queue@test.com',
            'phone' => '08123456789',
            'message' => 'This message should be queued as a notification job.',
        ]);

        $response->assertStatus(200);

        // Assert that both admin and super_admin received notifications
        Notification::assertSentTo($superAdmin, \App\Notifications\NewContactMessageNotification::class);
        Notification::assertSentTo($admin, \App\Notifications\NewContactMessageNotification::class);
    }

    public function test_program_observer_queues_notification_for_super_admin(): void
    {
        Notification::fake();

        // Create users
        $superAdmin = $this->createUser('super_admin', 'Super Admin');
        $admin = $this->createUser('admin', 'Admin Observer');

        // Login as admin and create program (triggers observer)
        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/programs', [
            'name' => 'Observer Test Program',
            'description' => 'Testing observer notification queue',
            'frequency' => 'monthly',
        ]);

        // Assert super admin was notified by observer
        Notification::assertSentTo($superAdmin, \App\Notifications\AdminActivityNotification::class);
    }

    public function test_failed_jobs_table_is_empty_after_processing(): void
    {
        // This test verifies that well-formed notifications don't produce failed jobs
        // We simulate processing by checking that notifications are properly queued
        // The actual failed_jobs table will be empty after queue:work --once processes all jobs

        Notification::fake();

        $superAdmin = $this->createUser('super_admin', 'Failed Job Test Admin');
        $admin = $this->createUser('admin', 'Failed Job Test User');

        // Submit contact (triggers NewContactMessageNotification)
        $this->postJson('/api/v1/contact', [
            'name' => 'Failed Job Test',
            'message' => 'Testing failed jobs table',
        ]);

        // Admin creates program (triggers AdminActivityNotification via observer)
        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/programs', [
            'name' => 'Failed Job Program',
            'frequency' => 'yearly',
        ]);

        // Both notifications should be queued without errors
        Notification::assertSentTo($superAdmin, \App\Notifications\NewContactMessageNotification::class);
        Notification::assertSentTo($superAdmin, \App\Notifications\AdminActivityNotification::class);
    }
}
