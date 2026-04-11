<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Screening extends Model
{
    use HasFactory;

    protected $table = 'screenings';

    protected $fillable = [
        'movie_id',
        'hall_id',
        'start_time',
        'show_date',
    ];

    protected $casts = [
        'id'       => 'integer',
        'movie_id' => 'integer',
        'hall_id'  => 'integer',
    ];

    // Strip MSSQL microseconds from TIME column (10:00:00.0000000 → 10:00:00)
    public function getStartTimeAttribute($value)
    {
        if ($value && str_contains($value, '.')) {
            return substr($value, 0, strpos($value, '.'));
        }
        return $value;
    }

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }

    public function hall()
    {
        return $this->belongsTo(Hall::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function seatLocks()
    {
        return $this->hasMany(SeatLock::class);
    }
}