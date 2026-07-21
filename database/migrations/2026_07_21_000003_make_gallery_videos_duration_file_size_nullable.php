<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('gallery_videos', function (Blueprint $table) {
            // duration and file_size are not known at the time the initial
            // 'processing' record is created (replaceFeaturedVideoAsync inserts only:
            // uploaded_by, title, pending_video_url, public_id, is_portrait,
            // expires_at, status). They are populated by ProcessFeaturedVideoUpload
            // once Cloudinary finishes transcoding and returns metadata.
            $table->unsignedInteger('duration')->nullable()->change();
            $table->unsignedBigInteger('file_size')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('gallery_videos', function (Blueprint $table) {
            $table->unsignedInteger('duration')->nullable(false)->change();
            $table->unsignedBigInteger('file_size')->nullable(false)->change();
        });
    }
};
