<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add indexes for frequently queried columns to improve API performance.
     *
     * This migration adds composite indexes for common query patterns:
     * - Announcements: filtering by publish status + date for "published" scope
     * - Galleries: filtering by publish status + ordering by date
     * - Gallery Photos: ordering by created_at for "recent photos" listing
     * - Programs: filtering active programs + ordering
     */
    public function up(): void
    {
        // Announcements indexes - used in scopePublished()
        Schema::table('announcements', function (Blueprint $table) {
            // Composite index for: WHERE is_published = true AND published_at <= now()
            $table->index(['is_published', 'published_at'], 'announcements_published_idx');
            // Index for pinned ordering
            $table->index(['is_pinned', 'published_at'], 'announcements_pinned_date_idx');
        });

        // Galleries indexes - used in public listing
        Schema::table('galleries', function (Blueprint $table) {
            // Composite index for: WHERE is_published = true ORDER BY created_at DESC
            $table->index(['is_published', 'created_at'], 'galleries_published_created_idx');
        });

        // Gallery photos indexes - used in recent photos listing
        Schema::table('gallery_photos', function (Blueprint $table) {
            // Index for: ORDER BY created_at DESC
            $table->index('created_at', 'gallery_photos_created_idx');
            // Index for gallery relationship
            $table->index('gallery_id', 'gallery_photos_gallery_idx');
        });

        // Programs indexes - used in home/program listing
        Schema::table('programs', function (Blueprint $table) {
            // Composite index for: WHERE is_active = true ORDER BY [order]
            $table->index(['is_active', 'order'], 'programs_active_order_idx');
        });

        // Program sessions indexes - used in program detail
        Schema::table('program_sessions', function (Blueprint $table) {
            // Index for program relationship
            $table->index('program_id', 'program_sessions_program_idx');
            // Index for ordering by held_at
            $table->index(['program_id', 'held_at'], 'program_sessions_program_held_idx');
        });

        // Organization members indexes
        Schema::table('organization_members', function (Blueprint $table) {
            // Index for: WHERE is_active = true ORDER BY [order]
            $table->index(['is_active', 'order'], 'org_members_active_order_idx');
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropIndex('announcements_published_idx');
            $table->dropIndex('announcements_pinned_date_idx');
        });

        Schema::table('galleries', function (Blueprint $table) {
            $table->dropIndex('galleries_published_created_idx');
        });

        Schema::table('gallery_photos', function (Blueprint $table) {
            $table->dropIndex('gallery_photos_created_idx');
            $table->dropIndex('gallery_photos_gallery_idx');
        });

        Schema::table('programs', function (Blueprint $table) {
            $table->dropIndex('programs_active_order_idx');
        });

        Schema::table('program_sessions', function (Blueprint $table) {
            $table->dropIndex('program_sessions_program_idx');
            $table->dropIndex('program_sessions_program_held_idx');
        });

        Schema::table('organization_members', function (Blueprint $table) {
            $table->dropIndex('org_members_active_order_idx');
        });
    }
};