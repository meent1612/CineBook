<?php

namespace App\Http\Controllers;

use App\Models\Theater;
use Illuminate\Http\Request;

class TheaterController extends Controller
{
    /**
     * GET /api/theaters
     * Returns all active theaters.
     * Used by BranchContext.tsx to populate the theater dropdown in the navbar.
     */
    public function index()
    {
        try {
            $theaters = Theater::where('is_active', true)
                ->orderBy('name')
                ->get();

            return response()->json([
                'success'  => true,
                'theaters' => $theaters,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}