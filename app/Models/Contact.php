<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = ['name', 'phone', 'message', 'is_read'];
    protected $casts    = ['is_read' => 'boolean'];
}