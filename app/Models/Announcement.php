<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['user_id', 'title', 'slug', 'content', 'type', 'is_pinned', 'published_at', 'expired_at'];
    protected $casts    = ['is_pinned' => 'boolean', 'published_at' => 'datetime', 'expired_at' => 'datetime'];

    public function user() { return $this->belongsTo(User::class); }

    public function scopePublished($q) {
        return $q->whereNotNull('published_at')
                 ->where('published_at', '<=', now())
                 ->where(fn($q) => $q->whereNull('expired_at')->orWhere('expired_at', '>', now()));
    }

    public function scopePinned($q) {
        return $q->where('is_pinned', true);
    }

    public function getRouteKeyName() { return 'slug'; }
}