<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            // Add missing excerpt column
            if (!Schema::hasColumn('announcements', 'excerpt')) {
                $table->string('excerpt', 250)->nullable()->after('content');
            }

            // Add missing is_published column
            if (!Schema::hasColumn('announcements', 'is_published')) {
                $table->boolean('is_published')->default(true)->after('is_pinned');
            }
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (Schema::hasColumn('announcements', 'excerpt')) {
                $table->dropColumn('excerpt');
            }
            if (Schema::hasColumn('announcements', 'is_published')) {
                $table->dropColumn('is_published');
            }
        });
    }
};