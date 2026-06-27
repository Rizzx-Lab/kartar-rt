<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\{Request, JsonResponse};

class PushSubscriptionController extends Controller
{
    public function vapidPublicKey(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'publicKey' => config('webpush.vapid.public_key'),
            ],
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|url',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $data = $request->all();
        $endpoint = $data['endpoint'];
        $publicKey = $data['keys']['p256dh'] ?? null;
        $authToken = $data['keys']['auth'] ?? null;

        // Create or update subscription
        $user->updatePushSubscription($endpoint, $publicKey, $authToken);

        return response()->json([
            'success' => true,
            'message' => 'Push subscription saved successfully.',
        ]);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|url',
        ]);

        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $endpoint = $request->input('endpoint');

        // Delete the subscription
        $user->deletePushSubscription($endpoint);

        return response()->json([
            'success' => true,
            'message' => 'Push subscription removed successfully.',
        ]);
    }
}
