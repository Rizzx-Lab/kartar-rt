<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'title',
        'slug',
        'content',
        'excerpt',
        'type',
        'is_pinned',
        'is_published',
        'published_at',
        'expired_at',
        'image_url',
        'image_public_id',
    ];
    protected $casts = [
        'is_pinned' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'expired_at' => 'datetime',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function session() { return $this->belongsTo(ProgramSession::class); }

    public function scopePublished($q) {
        return $q->where('is_published', true)
                 ->whereNotNull('published_at')
                 ->where('published_at', '<=', now())
                 ->where(fn($q) => $q->whereNull('expired_at')->orWhere('expired_at', '>', now()));
    }

    public function scopePinned($q) {
        return $q->where('is_pinned', true);
    }

    public function getRouteKeyName() { return 'slug'; }
}
