<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            // Add event_date column for documentation date (separate from created_at)
            if (!Schema::hasColumn('galleries', 'event_date')) {
                $table->date('event_date')->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            if (Schema::hasColumn('galleries', 'event_date')) {
                $table->dropColumn('event_date');
            }
        });
    }
};