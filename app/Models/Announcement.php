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

    /**
     * Get the derived status of the announcement.
     *
     * - archived  : expired_at IS NOT NULL AND expired_at <= now()
     * - active    : not archived AND is_published = true AND published_at IS NOT NULL AND published_at <= now()
     * - scheduled : everything else (not published yet and not expired)
     *
     * @return string 'active'|'scheduled'|'archived'
     */
    public function getStatusAttribute(): string
    {
        if ($this->expired_at !== null && $this->expired_at->lte(now())) {
            return 'archived';
        }

        if ($this->is_published && $this->published_at !== null && $this->published_at->lte(now())) {
            return 'active';
        }

        return 'scheduled';
    }

    public function getRouteKeyName() { return 'slug'; }
}
