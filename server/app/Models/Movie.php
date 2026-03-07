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
        'trailer_url',
        'status',
        'is_active',
    ];

    
    public function screenings()
    {
        return $this->hasMany(Screening::class);
    }
}