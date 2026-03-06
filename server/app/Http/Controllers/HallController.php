<?php

namespace App\Http\Controllers;

use App\Models\Hall;
use Illuminate\Http\Request;

class HallController extends Controller
{
    // GET /api/halls — everyone can see halls
    public function index()
    {
        try {
            $halls = Hall::all();

            return response()->json([
                'success' => true,
                'halls'   => $halls,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // GET /api/halls/{id} — everyone can see a single hall
    public function show($id)
    {
        try {
            $hall = Hall::findOrFail($id);

            return response()->json([
                'success' => true,
                'hall'    => $hall,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Hall not found.',
            ], 404);
        }
    }
}