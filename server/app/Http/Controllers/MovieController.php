<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    // ── PUBLIC ──────────────────────────────────────────

    // GET /api/movies — everyone can see active movies
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

    // GET /api/movies/{id} — everyone can see a single movie
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

    // ── ADMIN ONLY ───────────────────────────────────────

    // GET /api/admin/movies — admin sees all movies
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

    // POST /api/admin/movies — admin creates a movie
    public function store(Request $request)
    {
        try {
            $request->validate([
                'title'         => 'required|string|max:255',
                'description'   => 'nullable|string',
                'genre'         => 'nullable|string|max:255',
                'category'      => 'nullable|in:2D,3D,IMAX',
                'language'      => 'nullable|string|max:100',
                'duration_mins' => 'nullable|integer',
                'release_date'  => 'nullable|date',
                'poster_url'    => 'nullable|string|max:500',
                'rating'        => 'nullable|string|max:10',
                'status'        => 'nullable|in:now_showing,coming_soon',
                'is_active'     => 'nullable|boolean',
            ]);

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

    // PUT /api/admin/movies/{id} — admin updates a movie
    public function update(Request $request, $id)
    {
        try {
            $movie = Movie::findOrFail($id);

            $request->validate([
                'title'         => 'sometimes|string|max:255',
                'description'   => 'sometimes|nullable|string',
                'genre'         => 'sometimes|nullable|string|max:255',
                'category'      => 'sometimes|nullable|in:2D,3D,IMAX',
                'language'      => 'sometimes|nullable|string|max:100',
                'duration_mins' => 'sometimes|nullable|integer',
                'release_date'  => 'sometimes|nullable|date',
                'poster_url'    => 'sometimes|nullable|string|max:500',
                'rating'        => 'sometimes|nullable|string|max:10',
                'status'        => 'sometimes|nullable|in:now_showing,coming_soon',
                'is_active'     => 'sometimes|nullable|boolean',
            ]);

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

    // DELETE /api/admin/movies/{id} — admin deletes a movie
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