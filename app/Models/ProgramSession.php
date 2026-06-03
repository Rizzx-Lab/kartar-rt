<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramSession extends Model
{
    protected $fillable = ['program_id', 'title', 'held_at', 'location', 'description', 'participant_count', 'status'];
    protected $casts    = ['held_at' => 'datetime'];

    public function program() { return $this->belongsTo(Program::class); }
    public function gallery() { return $this->hasOne(Gallery::class); }
}