<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('gallery_photos', function (Blueprint $table) {
            // Add index for faster lookups by gallery_id + order
            $table->index(['gallery_id', 'order']);
        });

        Schema::table('galleries', function (Blueprint $table) {
            // Add index for faster ordering by created_at
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('gallery_photos', function (Blueprint $table) {
            $table->dropIndex(['gallery_id', 'order']);
        });

        Schema::table('galleries', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};
