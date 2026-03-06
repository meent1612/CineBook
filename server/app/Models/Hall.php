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
    ];

    // A hall has many screenings
    public function screenings()
    {
        return $this->hasMany(Screening::class);
    }
}