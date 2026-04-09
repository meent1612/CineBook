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
            $transactionId = 'TXN-' . now()->format('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));

            $payment = Payment::create([
                'booking_group_id' => $request->booking_group_id,
                'user_id'          => $user->id,
                'amount'           => $request->amount,
                'method'           => $request->method,
                'transaction_id'   => $transactionId,
                'status'           => 'completed',
                'paid_at'          => now(),
            ]);

            return response()->json([
                'success'        => true,
                'message'        => 'Payment recorded successfully.',
                'payment'        => $payment,
                'transaction_id' => $transactionId,   // ← frontend reads this
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}