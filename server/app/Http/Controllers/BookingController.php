<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Seat;
use App\Models\SeatLock;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class BookingController extends Controller
{
    private function getPrice(string $seatType): int
    {
        return match($seatType) {
            'standard'      => 400,
            'semi_recliner' => 615,
            'premium'       => 815,
            'vip'           => 1200,
            default         => 400,
        };
    }

    
    public function lockSeats(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $request->validate([
            'screening_id' => 'required|integer|exists:screenings,id',
            'seat_ids'     => 'required|array|min:1|max:10',
            'seat_ids.*'   => 'integer|exists:seats,id',
        ]);

        $screeningId = $request->screening_id;
        $seatIds     = $request->seat_ids;
        $lockedUntil = Carbon::now()->addMinutes(10);

       
        SeatLock::where('locked_until', '<', Carbon::now())->delete();

        
        $alreadyBooked = Booking::where('screening_id', $screeningId)
            ->whereIn('seat_id', $seatIds)
            ->where('status', 'confirmed')
            ->exists();

        if ($alreadyBooked) {
            return response()->json([
                'success' => false,
                'message' => 'One or more seats are already booked.',
            ], 409);
        }

        
        $lockedByOthers = SeatLock::where('screening_id', $screeningId)
            ->whereIn('seat_id', $seatIds)
            ->where('user_id', '!=', $user->id)
            ->where('locked_until', '>=', Carbon::now())
            ->exists();

        if ($lockedByOthers) {
            return response()->json([
                'success' => false,
                'message' => 'One or more seats are temporarily held by another user. Try again shortly.',
            ], 409);
        }

        
        foreach ($seatIds as $seatId) {
            SeatLock::updateOrCreate(
                ['screening_id' => $screeningId, 'seat_id' => $seatId],
                ['user_id' => $user->id, 'locked_until' => $lockedUntil]
            );
        }

        return response()->json([
            'success'      => true,
            'message'      => 'Seats locked for 10 minutes.',
            'locked_until' => $lockedUntil->toISOString(),
        ]);
    }

   
    public function unlockSeats(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $request->validate([
            'screening_id' => 'required|integer',
            'seat_ids'     => 'required|array|min:1',
            'seat_ids.*'   => 'integer',
        ]);

        SeatLock::where('screening_id', $request->screening_id)
            ->whereIn('seat_id', $request->seat_ids)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json(['success' => true, 'message' => 'Seats unlocked.']);
    }

    
    public function createBooking(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $request->validate([
            'screening_id' => 'required|integer|exists:screenings,id',
            'seat_ids'     => 'required|array|min:1|max:10',
            'seat_ids.*'   => 'integer|exists:seats,id',
        ]);

        $screeningId = $request->screening_id;
        $seatIds     = $request->seat_ids;

        try {
            DB::beginTransaction();

            SeatLock::where('locked_until', '<', Carbon::now())->delete();

            // Final check with database row lock — prevents race conditions
            $alreadyBooked = Booking::where('screening_id', $screeningId)
                ->whereIn('seat_id', $seatIds)
                ->where('status', 'confirmed')
                ->lockForUpdate()
                ->exists();

            if ($alreadyBooked) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'One or more seats were just taken. Please choose different seats.',
                ], 409);
            }

            $lockedByOthers = SeatLock::where('screening_id', $screeningId)
                ->whereIn('seat_id', $seatIds)
                ->where('user_id', '!=', $user->id)
                ->where('locked_until', '>=', Carbon::now())
                ->exists();

            if ($lockedByOthers) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'One or more seats are temporarily held by another user.',
                ], 409);
            }

            $seats      = Seat::whereIn('id', $seatIds)->get()->keyBy('id');
            $groupId    = Str::uuid()->toString();
            $totalPrice = 0;

            foreach ($seatIds as $seatId) {
                $seat  = $seats[$seatId];
                $price = $this->getPrice($seat->seat_type);
                $totalPrice += $price;

                Booking::create([
                    'booking_group_id' => $groupId,
                    'user_id'          => $user->id,
                    'screening_id'     => $screeningId,
                    'seat_id'          => $seatId,
                    'seat_label'       => $seat->row_label . $seat->seat_number,
                    'seat_type'        => $seat->seat_type,
                    'price'            => $price,
                    'status'           => 'confirmed',
                ]);
            }

            // Release this user's locks — seats are now confirmed
            SeatLock::where('screening_id', $screeningId)
                ->whereIn('seat_id', $seatIds)
                ->where('user_id', $user->id)
                ->delete();

            DB::commit();

            return response()->json([
                'success'          => true,
                'message'          => 'Booking confirmed! Enjoy your movie.',
                'booking_group_id' => $groupId,
                'total_price'      => $totalPrice,
                'seats_booked'     => count($seatIds),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getUserBookings()
    {
        $user = JWTAuth::parseToken()->authenticate();

        $bookings = Booking::where('user_id', $user->id)
            ->with(['screening.movie', 'screening.hall'])
            ->orderBy('created_at', 'desc')
            ->get();

        $grouped = $bookings->groupBy('booking_group_id');

        $result = $grouped->map(function ($groupBookings) {
            $first     = $groupBookings->first();
            $screening = $first->screening;
            $movie     = $screening?->movie;

            $status = 'upcoming';
            if ($first->status === 'cancelled') {
                $status = 'cancelled';
            } elseif ($screening) {
                $showAt = Carbon::parse($screening->show_date . ' ' . $screening->start_time);
                if ($showAt->isPast()) {
                    $status = 'watched';
                }
            }

            return [
                'id'           => $first->id,
                'movie_title'  => $movie?->title      ?? 'Unknown',
                'movie_poster' => $movie?->poster_url ?? null,
                'show_date'    => $screening?->show_date  ?? '',
                'start_time'   => $screening?->start_time ?? '',
                'hall_name'    => $screening?->hall?->name ?? '',
                'seats'        => $groupBookings->pluck('seat_label')->toArray(),
                'total_price'  => $groupBookings->sum('price'),
                'status'       => $status,
            ];
        })->values();

        return response()->json([
            'success'  => true,
            'bookings' => $result,
        ]);
    }
}