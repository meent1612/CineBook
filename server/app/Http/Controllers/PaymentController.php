<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // ═══════════════════════════════════════════════════════
    // POST /api/payments
    // Called by Payment.tsx after booking is created.
    // Body: { booking_group_id, amount, method }
    // ═══════════════════════════════════════════════════════
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        $request->validate([
            'booking_group_id' => 'required|string',
            'amount'           => 'required|integer|min:1',
            'method'           => 'required|in:bkash,nagad,card',
        ]);

        try {
            $payment = Payment::create([
                'booking_group_id' => $request->booking_group_id,
                'user_id'          => $user->id,
                'amount'           => $request->amount,
                'method'           => $request->method,
                'status'           => 'completed',
                'paid_at'          => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully.',
                'payment' => $payment,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}