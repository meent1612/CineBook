<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MovieController extends Controller
{
    public function index()
    {
        try {
            $movies = Movie::where('is_active', true)->get();

            return response()->json([
                'success' => true,
                'movies'  => $movies,
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
            $movie = Movie::findOrFail($id);

            return response()->json([
                'success' => true,
                'movie'   => $movie,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Movie not found.',
            ], 404);
        }
    }

    public function adminIndex()
    {
        try {
            $movies = Movie::all();

            return response()->json([
                'success' => true,
                'movies'  => $movies,
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
            $validator = Validator::make($request->all(), [
                'title'         => 'required|string|max:255',
                'description'   => 'nullable|string',
                'genre'         => 'nullable|string|max:255',
                'category'      => 'nullable|in:2D,3D',
                'language'      => 'nullable|string|max:100',
                'duration_mins' => 'nullable|integer',
                'release_date'  => 'nullable|date',
                'poster_url'    => 'nullable|string|max:500',
                'trailer_url'   => 'nullable|string|max:500',
                'status'        => 'nullable|in:now_showing,coming_soon',
                'is_active'     => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $movie = Movie::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Movie created successfully.',
                'movie'   => $movie,
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
            $movie = Movie::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title'         => 'sometimes|string|max:255',
                'description'   => 'sometimes|nullable|string',
                'genre'         => 'sometimes|nullable|string|max:255',
                'category'      => 'sometimes|nullable|in:2D,3D',
                'language'      => 'sometimes|nullable|string|max:100',
                'duration_mins' => 'sometimes|nullable|integer',
                'release_date'  => 'sometimes|nullable|date',
                'poster_url'    => 'sometimes|nullable|string|max:500',
                'trailer_url'   => 'sometimes|nullable|string|max:500',
                'status'        => 'sometimes|nullable|in:now_showing,coming_soon',
                'is_active'     => 'sometimes|nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $movie->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Movie updated successfully.',
                'movie'   => $movie,
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
            $movie = Movie::findOrFail($id);
            $movie->delete();

            return response()->json([
                'success' => true,
                'message' => 'Movie deleted successfully.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}