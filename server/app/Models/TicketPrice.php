<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketPrice extends Model
{
    protected $table    = 'ticket_prices';
    protected $fillable = ['seat_type', 'price'];
}