<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    protected $table    = 'discounts';
    protected $fillable = [
        'name', 'theater_id',
        'standard_pct', 'semi_recliner_pct', 'premium_pct', 'vip_pct',
        'start_date', 'end_date', 'is_active',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'start_date' => 'date',
        'end_date'   => 'date',
    ];
}