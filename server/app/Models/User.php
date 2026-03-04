<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Model implements AuthenticatableContract, JWTSubject
{
    use HasFactory, Authenticatable;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'mobile_number',
        'gender',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
    ];

    // Required for JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    // Required for JWT
    public function getJWTCustomClaims(): array
    {
        return [];
    }
}