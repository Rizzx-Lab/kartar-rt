<?php

namespace App\Providers;

use App\Models\{Announcement, Gallery, Program};
use App\Observers\{AnnouncementObserver, GalleryObserver, ProgramObserver};
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Program::observe(ProgramObserver::class);
        Announcement::observe(AnnouncementObserver::class);
        Gallery::observe(GalleryObserver::class);
    }
}
