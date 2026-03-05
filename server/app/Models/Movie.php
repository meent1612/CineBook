<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    use HasFactory;

    protected $table = 'movies';

    protected $fillable = [
        'title',
        'description',
        'genre',
        'category',
        'language',
        'duration_mins',
        'release_date',
        'poster_url',
        'rating',
        'status',
        'is_active',
    ];

    // A movie has many screenings
    public function screenings()
    {
        return $this->hasMany(Screening::class);
    }
}