<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeatLock extends Model
{
    use HasFactory;

    protected $table = 'seat_locks';

    protected $fillable = [
        'screening_id',
        'seat_id',
        'user_id',
        'locked_until',
    ];

    protected $dates = ['locked_until'];

    public function seat()
    {
        return $this->belongsTo(Seat::class);
    }

    public function screening()
    {
        return $this->belongsTo(Screening::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}