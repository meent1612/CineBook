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

            
            if ($request->has('movie_id')) {
                $query->where('movie_id', $request->movie_id);
            }

            
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