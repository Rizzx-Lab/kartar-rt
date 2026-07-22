<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationMember extends Model
{
    protected $fillable = ['name', 'position', 'photo', 'photo_x', 'photo_y', 'photo_scale', 'description', 'order', 'is_active'];
    protected $casts    = [
        'is_active'   => 'boolean',
        'photo_x'     => 'float',
        'photo_y'     => 'float',
        'photo_scale' => 'float',
    ];
}