<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands([
        __DIR__.'/../app/Console/Commands',
    ])
    ->withSchedule(function (Schedule $schedule) {
        // Check every minute for announcements whose published_at date has arrived.
        // The command itself does the DB query, so even if the server misses a
        // minute (e.g. shared-host CPU throttle), the next run will catch it.
        $schedule->command('announcements:publish-due')
            ->everyMinute()
            ->withoutOverlapping()
            ->runInBackground();

        // Check every minute for featured videos whose 7-day window has expired.
        // Deletes from both Cloudinary and DB; no archiving.
        $schedule->command('gallery-videos:purge-expired')
            ->everyMinute()
            ->withoutOverlapping()
            ->runInBackground();
    })
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin'      => \App\Http\Middleware\AdminMiddleware::class,
            'superadmin' => \App\Http\Middleware\SuperAdminMiddleware::class,
        ]);

        // Prevent CDN/edge caching of all public API responses.
        // This ensures only Laravel's file-cache and Next.js ISR control freshness.
        $middleware->api(prepend: [
            \App\Http\Middleware\PreventApiCacheMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();