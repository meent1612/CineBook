<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Seat;
use App\Models\SeatLock;
use App\Models\Screening;
use Illuminate\Http\Request;

class SeatController extends Controller
{
    public function getByScreening($screeningId)
    {
        try {
            $screening = Screening::with('hall')->findOrFail($screeningId);

            $seats = Seat::where('hall_id', $screening->hall_id)
                ->where('is_active', true)
                ->orderBy('row_label')
                ->orderBy('seat_number')
                ->get();

            // Seats permanently booked for this screening
            $bookedSeatIds = Booking::where('screening_id', $screeningId)
                ->where('status', 'confirmed')
                ->pluck('seat_id')
                ->toArray();

            // Clean expired locks, then get active locked seat IDs
            SeatLock::where('locked_until', '<', now())->delete();

            $lockedSeatIds = SeatLock::where('screening_id', $screeningId)
                ->where('locked_until', '>=', now())
                ->pluck('seat_id')
                ->toArray();

            $seatsWithStatus = $seats->map(function ($seat) use ($bookedSeatIds, $lockedSeatIds) {
                if (in_array($seat->id, $bookedSeatIds)) {
                    $status = 'taken';
                } elseif (in_array($seat->id, $lockedSeatIds)) {
                    $status = 'locked';
                } else {
                    $status = 'available';
                }

                return [
                    'id'          => $seat->id,
                    'row_label'   => $seat->row_label,
                    'seat_number' => $seat->seat_number,
                    'seat_type'   => $seat->seat_type,
                    'seat_label'  => $seat->row_label . $seat->seat_number,
                    'status'      => $status,
                    'price'       => $this->getPrice($seat->seat_type),
                ];
            });

            $grouped   = $seatsWithStatus->groupBy('row_label');
            $available = $seatsWithStatus->where('status', 'available')->count();
            $taken     = $seatsWithStatus->whereIn('status', ['taken', 'locked'])->count();

            return response()->json([
                'success'      => true,
                'screening_id' => (int) $screeningId,
                'hall_id'      => $screening->hall_id,
                'hall_name'    => $screening->hall->name ?? null,
                'seats'        => $grouped,
                'summary'      => [
                    'total'     => $seats->count(),
                    'available' => $available,
                    'taken'     => $taken,
                ],
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Screening not found.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function getPrice(string $seatType): int
    {
        static $priceMap = null;

        if ($priceMap === null) {
            $priceMap = \App\Models\TicketPrice::pluck('price', 'seat_type')
                ->map(fn($p) => (int) $p)
                ->toArray();
        }

        return $priceMap[$seatType] ?? 400;
    }
}