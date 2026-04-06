<?php

namespace App\Http\Controllers;

use App\Models\Screening;
use App\Models\Hall;
use App\Models\Movie;
use Illuminate\Http\Request;

class ScreeningController extends Controller
{
    
    public function index(Request $request)
    {
        try {
            $query = Screening::with(['movie', 'hall']);

            if ($request->has('movie_id'))   { $query->where('movie_id',  $request->movie_id); }
            if ($request->has('date'))       { $query->where('show_date', $request->date); }
            if ($request->has('hall_id'))    { $query->where('hall_id',   $request->hall_id); }
            if ($request->has('theater_id')) {
                $query->whereHas('hall', function ($q) use ($request) {
                    $q->where('theater_id', $request->theater_id);
                });
            }

            // Only return screenings that haven't started yet
            $now = \Carbon\Carbon::now('Asia/Dhaka');
            $query->where(function ($q) use ($now) {
                $q->where('show_date', '>', $now->toDateString())
                ->orWhere(function ($q2) use ($now) {
                    $q2->where('show_date', '=', $now->toDateString())
                        ->where('start_time', '>=', $now->format('H:i:s'));
                });
            });

            $screenings = $query->get();

            return response()->json(['success' => true, 'screenings' => $screenings]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    
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

    
    public function adminIndex(Request $request)
    {
        try {
            $query = Screening::with(['movie', 'hall']);

            if ($request->has('date'))    { $query->where('show_date', $request->date); }
            if ($request->has('hall_id')) { $query->where('hall_id',   $request->hall_id); }

            $screenings = $query->get();

            return response()->json([
                'success'    => true,
                'screenings' => $screenings,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    
    public function store(Request $request)
    {
        try {
            $request->validate([
            'movie_id'   => 'required|exists:movies,id',
            'hall_id'    => 'required|exists:halls,id',
            'start_time' => 'required|in:10:00,15:00,20:00',
            'show_date'  => 'required|date',
        ]);

        $exists = \App\Models\Screening::where('hall_id',   $request->hall_id)
            ->where('show_date',  $request->show_date)
            ->where('start_time', $request->start_time . ':00')
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'This slot is already booked for that hall on that date.',
            ], 409);
        }

        $screening = \App\Models\Screening::create([
            'movie_id'   => $request->movie_id,
            'hall_id'    => $request->hall_id,
            'start_time' => $request->start_time . ':00',
            'show_date'  => $request->show_date,
        ]);

            $screening->load(['movie', 'hall']);

            return response()->json([
                'success'   => true,
                'message'   => 'Screening created successfully.',
                'screening' => $screening,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

   
    public function update(Request $request, $id)
    {
        try {
            $screening = Screening::findOrFail($id);

            $request->validate([
            'movie_id'   => 'sometimes|exists:movies,id',
            'hall_id'    => 'sometimes|exists:halls,id',
            'start_time' => 'sometimes|date_format:H:i',
            'show_date'  => 'sometimes|date',
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