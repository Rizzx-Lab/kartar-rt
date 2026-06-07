<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - OBSOLETE
|--------------------------------------------------------------------------
|
| Semua halaman web sekarang menggunakan Next.js frontend.
| Laravel hanya berfungsi sebagai API backend.
|
| Jika Anda butuh route web, tambahkan di bawah.
|
*/

// Optional: Health check
Route::get('/', function () {
    return response()->json([
        'name' => 'Kartar-RT API',
        'version' => '2.0.0',
        'status' => 'running',
        'frontend' => 'http://localhost:3000',
        'endpoints' => [
            'GET /api/v1/home',
            'GET /api/v1/programs',
            'GET /api/v1/announcements',
            'GET /api/v1/galleries/recent-photos',
            'GET /api/v1/galleries/archives',
            'GET /api/v1/about',
            'POST /api/v1/contact',
        ]
    ]);
});