<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('gallery_videos', function (Blueprint $table) {
            // Allow video_url to be null during the 'processing' phase, when the
            // final transcoded URL hasn't been populated yet. The URL is set by
            // ProcessFeaturedVideoUpload once Cloudinary finishes the async
            // transformation. Existing 'active' records always have a non-null URL.
            $table->string('video_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('gallery_videos', function (Blueprint $table) {
            $table->string('video_url')->nullable(false)->change();
        });
    }
};
