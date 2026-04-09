<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
    // ═══════════════════════════════════════════════════════
    // POST /api/payments/send-otp
    // Generates a 6-digit OTP, saves it, emails it.
    // Body: { email, movie_title }
    // ═══════════════════════════════════════════════════════
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email'       => 'required|email',
            'movie_title' => 'required|string',
        ]);

        // Delete any previous unused OTPs for this email
        OtpCode::where('email', $request->email)->delete();

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpCode::create([
            'email'      => $request->email,
            'code'       => $code,
            'expires_at' => now()->addMinutes(5),
            'used'       => false,
        ]);

        try {
            Mail::to($request->email)->send(new OtpMail($code, $request->movie_title));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP email. Please check mail config.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent to ' . $request->email,
        ]);
    }

    // ═══════════════════════════════════════════════════════
    // POST /api/payments/verify-otp
    // Checks OTP, then creates the payment record.
    // Body: { email, code, booking_group_id, amount, method }
    // ═══════════════════════════════════════════════════════
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email'            => 'required|email',
            'code'             => 'required|string|size:6',
            'booking_group_id' => 'required|string',
            'amount'           => 'required|integer|min:1',
            'method'           => 'required|in:bkash,nagad,card',
        ]);

        $otp = OtpCode::where('email', $request->email)
            ->where('code',  $request->code)
            ->where('used',  false)
            ->where('expires_at', '>=', now())
            ->first();

        if (!$otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP. Please try again.',
            ], 422);
        }

        // Mark OTP as used
        $otp->update(['used' => true]);

        // Create payment
        $transactionId = 'TXN-' . now()->format('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));

        $payment = Payment::create([
            'booking_group_id' => $request->booking_group_id,
            'user_id'          => auth()->id(),
            'amount'           => $request->amount,
            'method'           => $request->method,
            'transaction_id'   => $transactionId,
            'status'           => 'completed',
            'paid_at'          => now(),
        ]);

        return response()->json([
            'success'        => true,
            'message'        => 'Payment verified and recorded.',
            'transaction_id' => $transactionId,
            'payment'        => $payment,
        ]);
    }

    // ═══════════════════════════════════════════════════════
    // POST /api/payments
    // Card payments — no OTP needed, direct record creation.
    // Body: { booking_group_id, amount, method }
    // ═══════════════════════════════════════════════════════
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 401);
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
                'transaction_id' => $transactionId,
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}