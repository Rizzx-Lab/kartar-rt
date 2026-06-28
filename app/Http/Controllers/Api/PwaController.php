<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PwaController extends Controller
{
    /**
     * Get PWA installation status for currently authenticated user.
     *
     * @route GET /api/v1/user/pwa-status
     */
    public function getPwaStatus(): JsonResponse
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'data' => [
                'pwa_installed' => (bool) $user->pwa_installed,
            ],
        ]);
    }

    /**
     * Mark PWA as installed for currently authenticated user.
     *
     * @route POST /api/v1/user/pwa-installed
     */
    public function markInstalled(): JsonResponse
    {
        $user = Auth::user();
        $user->update(['pwa_installed' => true]);

        return response()->json([
            'success' => true,
            'message' => 'PWA installation status updated.',
        ]);
    }

    /**
     * Reset PWA installation status for a specific user (super_admin only).
     *
     * @route POST /api/v1/users/{id}/reset-pwa
     */
    public function resetPwa(int $id): JsonResponse
    {
        $currentUser = Auth::user();

        // Server-side role check - only super_admin can reset
        if (!$currentUser->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Super admin access required.',
            ], 403);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $targetUser->update(['pwa_installed' => false]);

        return response()->json([
            'success' => true,
            'message' => 'PWA status reset successfully.',
        ]);
    }
}
