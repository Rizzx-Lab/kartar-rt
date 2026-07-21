<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('gallery_videos', function (Blueprint $table) {
            // Raw/original URL returned immediately by Cloudinary before transformation.
            // Cleared (set to null) once the async job populates video_url with the
            // final transcoded URL.
            $table->string('pending_video_url')->nullable()->after('public_id');

            // Tracks where the video is in its lifecycle:
            //   'processing' — upload succeeded, async transcoding in progress on Cloudinary
            //   'active'     — transcoding complete, video is live
            //   'failed'     — transcoding timed out or errored after all job retries
            $table->string('status', 20)->default('processing')->after('pending_video_url');
        });
    }

    public function down(): void
    {
        Schema::table('gallery_videos', function (Blueprint $table) {
            $table->dropColumn(['pending_video_url', 'status']);
        });
    }
};
