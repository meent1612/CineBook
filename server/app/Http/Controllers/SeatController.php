<?php

namespace App\Http\Controllers;

use App\Models\Seat;
use App\Models\Screening;
use Illuminate\Http\Request;

class SeatController extends Controller
{
    /**
     * GET /api/seats/{screeningId}
     * Returns all seats for the hall of the given screening,
     * each marked as available or taken.
     * Groups seats by row for easy frontend rendering.
     */
    public function getByScreening($screeningId)
    {
        try {
           
            $screening = Screening::with('hall')->findOrFail($screeningId);

           
            $seats = Seat::where('hall_id', $screening->hall_id)
                ->where('is_active', true)
                ->orderBy('row_label')
                ->orderBy('seat_number')
                ->get();

            
            $bookedSeatIds = collect(); 
            
            $seatsWithStatus = $seats->map(function ($seat) use ($bookedSeatIds) {
                return [
                    'id'          => $seat->id,
                    'row_label'   => $seat->row_label,
                    'seat_number' => $seat->seat_number,
                    'seat_type'   => $seat->seat_type,
                    'seat_label'  => $seat->row_label . $seat->seat_number,
                    'status'      => $bookedSeatIds->contains($seat->id) ? 'taken' : 'available',
                    'price'       => $this->getPrice($seat->seat_type),
                ];
            });

            
            $grouped = $seatsWithStatus->groupBy('row_label');

            return response()->json([
                'success'      => true,
                'screening_id' => (int) $screeningId,
                'hall_id'      => $screening->hall_id,
                'hall_name'    => $screening->hall->name ?? null,
                'seats'        => $grouped,
                'summary'      => [
                    'total'     => $seats->count(),
                    'available' => $seats->count() - $bookedSeatIds->count(),
                    'taken'     => $bookedSeatIds->count(),
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
        return match($seatType) {
            'standard'      => 400,
            'semi_recliner' => 615,
            'premium'       => 815,
            'vip'           => 1200,
            default         => 400,
        };
    }
}