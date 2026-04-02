<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $table = 'bookings';

    protected $fillable = [
        'booking_group_id',
        'user_id',
        'screening_id',
        'seat_id',
        'seat_label',
        'seat_type',
        'price',
        'status',
    ];

    protected $casts = [
        'id'           => 'integer',
        'user_id'      => 'integer',
        'screening_id' => 'integer',
        'seat_id'      => 'integer',
        'price'        => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function screening()
    {
        return $this->belongsTo(Screening::class);
    }

    public function seat()
    {
        return $this->belongsTo(Seat::class);
    }
}