<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\AboutController;
use App\Http\Controllers\Public\ProgramController;
use App\Http\Controllers\Public\AnnouncementController;
use App\Http\Controllers\Public\GalleryController;
use App\Http\Controllers\Public\ContactController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProgramAdminController;
use App\Http\Controllers\Admin\SessionAdminController;
use App\Http\Controllers\Admin\AnnouncementAdminController;
use App\Http\Controllers\Admin\GalleryAdminController;
use App\Http\Controllers\Admin\ContactAdminController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\OrganizationMemberController;

// ── PUBLIC ────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/tentang-kami', [AboutController::class, 'index'])->name('about');
Route::get('/kegiatan', [ProgramController::class, 'index'])->name('programs.index');
Route::get('/kegiatan/{slug}', [ProgramController::class, 'show'])->name('programs.show');
Route::get('/pengumuman', [AnnouncementController::class, 'index'])->name('announcements.index');
Route::get('/pengumuman/{slug}', [AnnouncementController::class, 'show'])->name('announcements.show');
Route::get('/galeri', [GalleryController::class, 'index'])->name('gallery.index');
Route::get('/galeri/{id}', [GalleryController::class, 'show'])->name('gallery.show');
Route::get('/kontak', [ContactController::class, 'index'])->name('contact.index');
Route::post('/kontak', [ContactController::class, 'store'])->name('contact.store');

// ── AUTH ──────────────────────────────────────────────────
Route::get('/login', [LoginController::class, 'showForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// ── ADMIN ─────────────────────────────────────────────────
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('programs', ProgramAdminController::class);
    Route::resource('programs.sessions', SessionAdminController::class)->shallow();
    Route::resource('announcements', AnnouncementAdminController::class);
    Route::resource('galleries', GalleryAdminController::class);
    Route::get('contacts', [ContactAdminController::class, 'index'])->name('contacts.index');
    Route::patch('contacts/{contact}/read', [ContactAdminController::class, 'markRead'])->name('contacts.read');
    Route::delete('contacts/{contact}', [ContactAdminController::class, 'destroy'])->name('contacts.destroy');
    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::patch('settings', [SettingController::class, 'update'])->name('settings.update');
    Route::resource('users', UserController::class)->middleware('superadmin');
    Route::resource('organization', OrganizationMemberController::class)->except(['show']);
});