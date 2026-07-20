<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * Run `php artisan schedule:run` every minute via cron.
     * See README.md for the exact cron entry to add in cPanel.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Check every minute for announcements whose published_at date has arrived.
        // The command itself does the DB query, so even if the server misses a
        // minute (e.g. shared-host CPU throttle), the next run will catch it.
        $schedule->command('announcements:publish-due')
            ->everyMinute()
            ->withoutOverlapping()
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
    }
}
