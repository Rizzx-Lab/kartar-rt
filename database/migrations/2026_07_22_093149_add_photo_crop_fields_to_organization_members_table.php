<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('organization_members', function (Blueprint $table) {
            $table->float('photo_x', 8, 4)->default(50)->after('photo');
            $table->float('photo_y', 8, 4)->default(50)->after('photo_x');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_members', function (Blueprint $table) {
            $table->dropColumn(['photo_x', 'photo_y']);
        });
    }
};
