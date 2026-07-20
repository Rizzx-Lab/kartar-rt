<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('gallery_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->string('title', 150);
            $table->string('video_url');
            $table->string('public_id');
            $table->string('thumbnail_url')->nullable();
            $table->unsignedInteger('duration');
            $table->unsignedBigInteger('file_size');
            $table->boolean('is_portrait')->default(true);
            $table->timestamp('expires_at')->nullable(false);
            $table->timestamps();

            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_videos');
    }
};
