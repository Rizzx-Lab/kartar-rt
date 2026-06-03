<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'frequency', 'cover_image', 'is_active', 'order'];
    protected $casts    = ['is_active' => 'boolean'];

    public function sessions() { return $this->hasMany(ProgramSession::class); }

    public function getRouteKeyName() { return 'slug'; }
}
