<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('program_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->string('title', 150);
            $table->dateTime('held_at');
            $table->string('location', 200)->nullable();
            $table->text('description')->nullable();
            $table->integer('participant_count')->nullable();
            $table->enum('status', ['upcoming', 'done', 'cancelled'])->default('upcoming');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('program_sessions'); }
};