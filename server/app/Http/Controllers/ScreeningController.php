<?php

namespace App\Http\Controllers;

use App\Models\Screening;
use App\Models\Hall;
use App\Models\Movie;
use Illuminate\Http\Request;

class ScreeningController extends Controller
{
    // ── PUBLIC ──────────────────────────────────────────

    // GET /api/screenings — everyone can see screenings
    public function index(Request $request)
    {
        try {
            $query = Screening::with(['movie', 'hall']);

            // Filter by movie_id if provided
            // Example: GET /api/screenings?movie_id=1
            if ($request->has('movie_id')) {
                $query->where('movie_id', $request->movie_id);
            }

            // Filter by date if provided
            // Example: GET /api/screenings?date=2026-03-06
            if ($request->has('date')) {
                $query->where('show_date', $request->date);
            }

            $screenings = $query->get();

            return response()->json([
                'success'    => true,
                'screenings' => $screenings,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // GET /api/screenings/{id} — everyone can see a single screening
    public function show($id)
    {
        try {
            $screening = Screening::with(['movie', 'hall'])->findOrFail($id);

            return response()->json([
                'success'   => true,
                'screening' => $screening,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Screening not found.',
            ], 404);
        }
    }

    // ── ADMIN ONLY ───────────────────────────────────────

    // GET /api/admin/screenings — admin sees all screenings
    public function adminIndex()
    {
        try {
            $screenings = Screening::with(['movie', 'hall'])->get();

            return response()->json([
                'success'    => true,
                'screenings' => $screenings,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // POST /api/admin/screenings — admin creates a screening
    public function store(Request $request)
    {
        try {
            $request->validate([
                'movie_id'        => 'required|exists:movies,id',
                'hall_id'         => 'required|exists:halls,id',
                'start_time'      => 'required|date_format:H:i',
                'show_date'       => 'required|date',
                'available_seats' => 'required|integer|min:1',
            ]);

            $screening = Screening::create($request->all());

            // Load movie and hall info in response
            $screening->load(['movie', 'hall']);

            return response()->json([
                'success'   => true,
                'message'   => 'Screening created successfully.',
                'screening' => $screening,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // PUT /api/admin/screenings/{id} — admin updates a screening
    public function update(Request $request, $id)
    {
        try {
            $screening = Screening::findOrFail($id);

            $request->validate([
                'movie_id'        => 'sometimes|exists:movies,id',
                'hall_id'         => 'sometimes|exists:halls,id',
                'start_time'      => 'sometimes|date_format:H:i',
                'show_date'       => 'sometimes|date',
                'available_seats' => 'sometimes|integer|min:1',
            ]);

            $screening->update($request->all());
            $screening->load(['movie', 'hall']);

            return response()->json([
                'success'   => true,
                'message'   => 'Screening updated successfully.',
                'screening' => $screening,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // DELETE /api/admin/screenings/{id} — admin deletes a screening
    public function destroy($id)
    {
        try {
            $screening = Screening::findOrFail($id);
            $screening->delete();

            return response()->json([
                'success' => true,
                'message' => 'Screening deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}