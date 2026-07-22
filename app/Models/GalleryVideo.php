<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryVideo extends Model
{
    protected $fillable = [
        'uploaded_by',
        'title',
        'video_url',
        'public_id',
        'pending_video_url',
        'thumbnail_url',
        'duration',
        'file_size',
        'is_portrait',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'expires_at'  => 'datetime',
        'is_portrait' => 'boolean',
        'duration'    => 'integer',
        'file_size'   => 'integer',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                     ->where('expires_at', '>', now());
    }
}
