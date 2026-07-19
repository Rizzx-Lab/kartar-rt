<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PushSubscriptionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'webpush.vapid.public_key' => 'test-public-key',
            'webpush.vapid.private_key' => 'test-private-key',
            'webpush.vapid.subject' => 'mailto:test@example.com',
        ]);
    }

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
    // SUBSCRIBE ENDPOINT
    // ========================

    public function test_subscribe_endpoint_stores_subscription_in_database(): void
    {
        $user = $this->createUser('admin', 'Test Admin');

        $subscriptionPayload = [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-' . time(),
            'keys' => [
                'p256dh' => 'BCt3jJ7gGKkGNfHDGjGJ8QGZDJhLR7wE4J4R5sK3pQ9L8mN1oP2qR4sT5uV6wX7yZ8A9B==',
                'auth' => 'ABC123def456GHI789==',
            ],
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/push/subscribe', $subscriptionPayload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Push subscription saved successfully.',
        ]);

        $this->assertDatabaseHas('push_subscriptions', [
            'subscribable_id' => $user->id,
            'subscribable_type' => 'App\\Models\\User',
        ]);
    }

    public function test_subscribe_endpoint_requires_valid_subscription_payload(): void
    {
        $user = $this->createUser('admin', 'Test Admin');

        // Missing keys
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/push/subscribe', [
            'endpoint' => 'https://example.com/push',
        ]);

        $response->assertStatus(422);

        // Missing endpoint
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/push/subscribe', [
            'keys' => [
                'p256dh' => 'BCt3jJ7gGKkGNfHDGjGJ8QGZDJhLR7wE4J4R5sK3pQ9L8mN1oP2qR4sT5uV6wX7yZ8==',
                'auth' => 'ABC123def456==',
            ],
        ]);

        $response->assertStatus(422);
    }

    // ========================
    // UNSUBSCRIBE ENDPOINT
    // ========================

    public function test_unsubscribe_endpoint_removes_subscription_from_database(): void
    {
        $user = $this->createUser('admin', 'Test Admin');

        $endpoint = 'https://fcm.googleapis.com/fcm/send/remove-test-' . time();

        // First subscribe
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/push/subscribe', [
            'endpoint' => $endpoint,
            'keys' => [
                'p256dh' => 'BCt3jJ7gGKkGNfHDGjGJ8QGZDJhLR7wE4J4R5sK3pQ9L8mN1oP2qR4sT5uV6wX7yZ8==',
                'auth' => 'ABC123def456==',
            ],
        ]);

        // Verify subscription exists
        $this->assertDatabaseHas('push_subscriptions', [
            'subscribable_id' => $user->id,
            'subscribable_type' => 'App\\Models\\User',
        ]);

        // Now unsubscribe
        $response = $this->actingAs($user, 'sanctum')->deleteJson('/api/v1/push/unsubscribe', [
            'endpoint' => $endpoint,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Push subscription removed successfully.',
        ]);

        // Verify subscription is removed
        $this->assertDatabaseMissing('push_subscriptions', [
            'subscribable_id' => $user->id,
            'subscribable_type' => 'App\\Models\\User',
        ]);
    }

    public function test_unsubscribe_requires_authentication(): void
    {
        $response = $this->deleteJson('/api/v1/push/unsubscribe', [
            'endpoint' => 'https://example.com/push',
        ]);

        $response->assertStatus(401);
    }

    // ========================
    // VAPID PUBLIC KEY ENDPOINT
    // ========================

    public function test_vapid_public_key_returns_correct_key(): void
    {
        $response = $this->getJson('/api/v1/push/vapid-public-key');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'publicKey' => 'test-public-key',
            ],
        ]);
    }

    public function test_vapid_public_key_is_public_no_auth_required(): void
    {
        // Ensure the endpoint works without any authentication
        $response = $this->getJson('/api/v1/push/vapid-public-key');
        $response->assertStatus(200);

        // Should also work for unauthenticated users
        $guestUser = null; // No user
        $this->assertNull($guestUser);
        $response = $this->getJson('/api/v1/push/vapid-public-key');
        $response->assertStatus(200);
    }

    // ========================
    // SUBSCRIBE REQUIRES AUTH
    // ========================

    public function test_subscribe_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/push/subscribe', [
            'endpoint' => 'https://example.com/push',
            'keys' => [
                'p256dh' => 'BCt3jJ7gGKkGNfHDGjGJ8QGZDJhLR7wE4J4R5sK3pQ9L8mN1oP2qR4sT5uV6wX7yZ8==',
                'auth' => 'ABC123def456==',
            ],
        ]);

        $response->assertStatus(401);
    }
}
