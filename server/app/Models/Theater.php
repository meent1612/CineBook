<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Theater extends Model
{
    use HasFactory;

    protected $table = 'theaters';

    protected $fillable = [
        'name',
        'address',
        'city',
        'is_active',
    ];
}