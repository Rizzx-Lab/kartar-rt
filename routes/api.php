<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PublicApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminApiController;

/*
|--------------------------------------------------------------------------
| API Routes - Next.js Frontend
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->name('api.')->group(function () {

    // ========================
    // AUTHENTICATION
    // ========================
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->name('me')->middleware('auth:sanctum');

    // ========================
    // PUBLIC CONTENT (No auth required)
    // ========================
    Route::get('/home', [PublicApiController::class, 'home'])->name('home');
    Route::get('/programs', [PublicApiController::class, 'programs'])->name('programs.index');
    Route::get('/programs/{slug}', [PublicApiController::class, 'program'])->name('programs.show');
    Route::get('/announcements', [PublicApiController::class, 'announcements'])->name('announcements.index');
    Route::get('/announcements/{slug}', [PublicApiController::class, 'announcement'])->name('announcements.show');
    Route::get('/galleries/recent-photos', [PublicApiController::class, 'recentPhotos'])->name('galleries.recent-photos');
    Route::get('/galleries/archives', [PublicApiController::class, 'archives'])->name('galleries.archives');
    Route::get('/galleries', [PublicApiController::class, 'galleries'])->name('galleries.index');
    Route::get('/galleries/{id}', [PublicApiController::class, 'gallery'])->name('galleries.show');
    Route::get('/about', [PublicApiController::class, 'about'])->name('about');
    Route::get('/contact', [PublicApiController::class, 'contactInfo'])->name('contact.info');
    Route::get('/settings', [PublicApiController::class, 'settings'])->name('settings');
    Route::post('/contact', [PublicApiController::class, 'submitContact'])->name('contact.submit');

    // ========================
    // ADMIN RESOURCES (Auth required)
    // ========================
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {

        // Dashboard
        Route::get('/admin/dashboard', [AdminApiController::class, 'dashboard'])->name('admin.dashboard');

        // Programs
        Route::get('/admin/programs', [AdminApiController::class, 'programs'])->name('admin.programs.index');
        Route::post('/admin/programs', [AdminApiController::class, 'programStore'])->name('admin.programs.store');
        Route::put('/admin/programs/{id}', [AdminApiController::class, 'programUpdate'])->name('admin.programs.update');
        Route::delete('/admin/programs/{id}', [AdminApiController::class, 'programDestroy'])->name('admin.programs.destroy');

        // Program Sessions
        Route::get('/admin/programs/{programId}/sessions', [AdminApiController::class, 'sessions'])->name('admin.sessions.index');
        Route::post('/admin/programs/{programId}/sessions', [AdminApiController::class, 'sessionStore'])->name('admin.sessions.store');
        Route::put('/admin/programs/{programId}/sessions/{sessionId}', [AdminApiController::class, 'sessionUpdate'])->name('admin.sessions.update');
        Route::delete('/admin/programs/{programId}/sessions/{sessionId}', [AdminApiController::class, 'sessionDestroy'])->name('admin.sessions.destroy');

        // Announcements
        Route::get('/admin/announcements', [AdminApiController::class, 'announcements'])->name('admin.announcements.index');
        Route::post('/admin/announcements', [AdminApiController::class, 'announcementStore'])->name('admin.announcements.store');
        Route::put('/admin/announcements/{id}', [AdminApiController::class, 'announcementUpdate'])->name('admin.announcements.update');
        Route::delete('/admin/announcements/{id}', [AdminApiController::class, 'announcementDestroy'])->name('admin.announcements.destroy');

        // Galleries
        Route::get('/admin/galleries', [AdminApiController::class, 'galleries'])->name('admin.galleries.index');
        Route::post('/admin/galleries', [AdminApiController::class, 'galleryStore'])->name('admin.galleries.store');
        Route::put('/admin/galleries/{id}', [AdminApiController::class, 'galleryUpdate'])->name('admin.galleries.update');
        Route::delete('/admin/galleries/{id}', [AdminApiController::class, 'galleryDestroy'])->name('admin.galleries.destroy');
        Route::post('/admin/galleries/{id}/photos', [AdminApiController::class, 'galleryAddPhotos'])->name('admin.galleries.photos.store');
        Route::get('/admin/galleries/{id}/photos', [AdminApiController::class, 'galleryPhotos'])->name('admin.galleries.photos.index');
        Route::delete('/admin/photos/{id}', [AdminApiController::class, 'galleryDeletePhoto'])->name('admin.photos.destroy');

        // Contacts
        Route::get('/admin/contacts', [AdminApiController::class, 'contacts'])->name('admin.contacts.index');
        Route::patch('/admin/contacts/{id}/read', [AdminApiController::class, 'markContactRead'])->name('admin.contacts.read');
        Route::delete('/admin/contacts/{id}', [AdminApiController::class, 'contactDestroy'])->name('admin.contacts.destroy');

        // Users (Super Admin only)
        Route::middleware(['superadmin'])->group(function () {
            Route::get('/admin/users', [AdminApiController::class, 'users'])->name('admin.users.index');
            Route::post('/admin/users', [AdminApiController::class, 'userStore'])->name('admin.users.store');
            Route::put('/admin/users/{id}', [AdminApiController::class, 'userUpdate'])->name('admin.users.update');
            Route::delete('/admin/users/{id}', [AdminApiController::class, 'userDestroy'])->name('admin.users.destroy');
        });

        // Organization Members
        Route::get('/admin/organization', [AdminApiController::class, 'organizationMembers'])->name('admin.organization.index');
        Route::post('/admin/organization', [AdminApiController::class, 'organizationMemberStore'])->name('admin.organization.store');
        Route::put('/admin/organization/{id}', [AdminApiController::class, 'organizationMemberUpdate'])->name('admin.organization.update');
        Route::delete('/admin/organization/{id}', [AdminApiController::class, 'organizationMemberDestroy'])->name('admin.organization.destroy');

        // Settings (Super Admin only)
        Route::middleware(['superadmin'])->group(function () {
            Route::get('/admin/settings', [AdminApiController::class, 'settings'])->name('admin.settings');
            Route::post('/admin/settings', [AdminApiController::class, 'settingsUpdate'])->name('admin.settings.update');
        });
    });

});

// Health check
Route::get('/api/health', fn() => response()->json(['status' => 'ok', 'timestamp' => now()]));