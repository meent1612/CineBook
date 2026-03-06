<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Please login.',
                ], 401);
            }

            if ($user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden. Admin access only.',
                ], 403);
            }

            return $next($request);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Token invalid or expired.',
            ], 401);
        }
    }
}