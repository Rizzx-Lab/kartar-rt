<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $fillable = ['program_session_id', 'title', 'description', 'cover_photo_id', 'is_published', 'event_date'];
    protected $casts    = ['is_published' => 'boolean', 'event_date' => 'date'];

    public function session() { return $this->belongsTo(ProgramSession::class, 'program_session_id'); }
    public function photos()  { return $this->hasMany(GalleryPhoto::class)->orderBy('order'); }
    public function cover()   { return $this->belongsTo(GalleryPhoto::class, 'cover_photo_id'); }
}