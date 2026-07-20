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
        'thumbnail_url',
        'duration',
        'file_size',
        'is_portrait',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_portrait' => 'boolean',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }
}
