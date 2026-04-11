<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hall extends Model
{
    use HasFactory;

    protected $table = 'halls';

    protected $fillable = [
        'name',
        'capacity',
        'theater_id',
    ];

    protected $casts = [
        'id'         => 'integer',
        'capacity'   => 'integer',
        'theater_id' => 'integer',
    ];

    public function theater()
    {
        return $this->belongsTo(Theater::class);
    }

    public function screenings()
    {
        return $this->hasMany(Screening::class);
    }

    public function seats()
    {
        return $this->hasMany(Seat::class);
    }
}