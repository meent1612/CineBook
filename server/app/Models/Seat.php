<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seat extends Model
{
    use HasFactory;

    protected $table = 'seats';

    protected $fillable = [
        'hall_id',
        'row_label',
        'seat_number',
        'seat_type',
        'is_active',
    ];

    public function hall()
    {
        return $this->belongsTo(Hall::class);
    }
}