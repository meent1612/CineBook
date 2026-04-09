<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    // NEW
    protected $fillable = [
        'booking_group_id',
        'user_id',
        'amount',
        'method',
        'status',
        'paid_at',
        'transaction_id',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];
}