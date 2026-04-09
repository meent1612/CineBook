<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Seat;
use App\Models\SeatLock;
use App\Models\TicketPrice;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    private function getPrice(string $seatType, int $screeningId): int
    {
        $basePrice = TicketPrice::where('seat_type', $seatType)->value('price') ?? 400;

        // Find theater for this screening
        $theaterId = \App\Models\Screening::with('hall.theater')
            ->find($screeningId)
            ?->hall
            ?->theater
            ?->id;

        if (!$theaterId) return $basePrice;

        // Check for active discount for this theater today
        $discount = \App\Models\Discount::where('theater_id', $theaterId)
            ->where('is_active', true)
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date',   '>=', now()->toDateString())
            ->first();

        if (!$discount) return $basePrice;

        $pctMap = [
            'standard'      => $discount->standard_pct,
            'semi_recliner' => $discount->semi_recliner_pct,
            'premium'       => $discount->premium_pct,
            'vip'           => $discount->vip_pct,
        ];

        $pct = $pctMap[$seatType] ?? 0;
        return $pct > 0 ? (int) round($basePrice * (1 - $pct / 100)) : $basePrice;
    }

    // ═══════════════════════════════════════════════════════
    // POST /api/seats/lock
    // Temporarily reserves seats for 10 minutes.
    // Body: { screening_id: int, seat_ids: int[] }
    // ═══════════════════════════════════════════════════════
    public function lockSeats(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        $request->validate([
            'screening_id' => 'required|integer|exists:screenings,id',
            'seat_ids'     => 'required|array|min:1|max:10',
            'seat_ids.*'   => 'integer|exists:seats,id',
        ]);

        $screeningId = $request->screening_id;
        $seatIds     = $request->seat_ids;
        $lockedUntil = Carbon::now()->addMinutes(10);

        // Remove stale locks
        SeatLock::where('locked_until', '<', Carbon::now())->delete();

        // Block if already permanently booked
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

        // Block if locked by a different user
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

        // Create or refresh the lock
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

    // ═══════════════════════════════════════════════════════
    // POST /api/seats/unlock
    // Releases locks this user holds when they deselect a seat.
    // Body: { screening_id: int, seat_ids: int[] }
    // ═══════════════════════════════════════════════════════
    public function unlockSeats(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        $request->validate([
            'screening_id' => 'required|integer',
            'seat_ids'     => 'required|array|min:1',
            'seat_ids.*'   => 'integer',
        ]);

        SeatLock::where('screening_id', $request->screening_id)
            ->whereIn('seat_id', $request->seat_ids)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Seats unlocked.',
        ]);
    }

    // ═══════════════════════════════════════════════════════
    // POST /api/bookings
    // Confirms booking with DB transaction + lockForUpdate()
    // Body: { screening_id: int, seat_ids: int[] }
    // ═══════════════════════════════════════════════════════
    public function createBooking(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

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

            // Final conflict check with row lock
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
                $price = $this->getPrice($seat->seat_type, $screeningId);
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

    // ═══════════════════════════════════════════════════════
    // GET /api/bookings
    // Returns all bookings for the logged-in user.
    // Shape matches UserDashboard.tsx Booking interface.
    // ═══════════════════════════════════════════════════════
    public function getUserBookings()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        $bookings = Booking::where('user_id', $user->id)
            ->with(['screening.movie', 'screening.hall.theater'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Group by booking_group_id so one purchase = one card
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

            // Fetch payment method for this booking group
            $payment = Payment::where('booking_group_id', $first->booking_group_id)->first();

            return [
                'id'             => $first->id,
                'booking_group_id' => $first->booking_group_id,
                'movie_title'    => $movie?->title      ?? 'Unknown',
                'movie_poster'   => $movie?->poster_url ?? null,
                'show_date'      => $screening?->show_date  ?? '',
                'start_time'     => $screening?->start_time ?? '',
                'hall_name'      => $screening?->hall?->name    ?? '',
                'theater_name'   => $screening?->hall?->theater?->name    ?? '',  // ← NEW
                'theater_address'=> $screening?->hall?->theater?->address ?? '',  // ← NEW
                'seats'          => $groupBookings->pluck('seat_label')->toArray(),
                'seat_type'      => $first->seat_type,                            // ← NEW
                'unit_price'     => $first->price,                                // ← NEW
                'total_price'    => $groupBookings->sum('price'),
                'status'         => $status,
                'payment_method' => $payment?->method         ?? null,
                'transaction_id' => $payment?->transaction_id ?? null,            // ← NEW
                'booking_date'   => $first->created_at?->toDateString() ?? '',    // ← NEW
            ];
        })->values();

        return response()->json([
            'success'  => true,
            'bookings' => $result,
        ]);
    }
}