<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryPhoto extends Model
{
    protected $fillable = ['gallery_id', 'file_path', 'caption', 'order'];

    public function gallery() { return $this->belongsTo(Gallery::class); }
}