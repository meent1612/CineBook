<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ScreeningController;
use App\Http\Controllers\HallController;
use App\Http\Controllers\TheaterController;
use App\Http\Controllers\SeatController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TicketPriceController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DiscountController;

// ══════════════════════════════════════════════
// Public routes
// ══════════════════════════════════════════════
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/movies',          [MovieController::class,     'index']);
Route::get('/movies/popular', [MovieController::class, 'popular']);
Route::get('/movies/{id}',     [MovieController::class,     'show']);
Route::get('/screenings',      [ScreeningController::class, 'index']);
Route::get('/screenings/{id}', [ScreeningController::class, 'show']);
Route::get('/halls',           [HallController::class,      'index']);
Route::get('/halls/{id}',      [HallController::class,      'show']);
Route::get('/theaters',        [TheaterController::class,   'index']);

Route::get('/seats/{screeningId}', [SeatController::class, 'getByScreening']);
Route::get('/ticket-prices',       [TicketPriceController::class, 'index']);
Route::get('/discounts', [DiscountController::class, 'index']);


// ══════════════════════════════════════════════
// Authenticated routes
// ══════════════════════════════════════════════
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    Route::get('/profile', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    Route::post('/seats/lock',   [BookingController::class, 'lockSeats']);
    Route::post('/seats/unlock', [BookingController::class, 'unlockSeats']);

    Route::get('/bookings',  [BookingController::class, 'getUserBookings']);
    Route::post('/bookings', [BookingController::class, 'createBooking']);

    Route::post('/payments',            [PaymentController::class, 'store']);
    Route::post('/payments/send-otp',   [PaymentController::class, 'sendOtp']);
    Route::post('/payments/verify-otp', [PaymentController::class, 'verifyOtp']);
    
    // Contact — user must be logged in
    Route::post('/contact',             [ContactController::class, 'store']);
    Route::get('/contact/my-messages',  [ContactController::class, 'myMessages']);

    // ── Admin routes ────────────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {

        Route::get('/movies',         [MovieController::class,     'adminIndex']);
        Route::post('/movies',        [MovieController::class,     'store']);
        Route::put('/movies/{id}',    [MovieController::class,     'update']);
        Route::delete('/movies/{id}', [MovieController::class,     'destroy']);

        Route::get('/screenings',         [ScreeningController::class, 'adminIndex']);
        Route::post('/screenings',        [ScreeningController::class, 'store']);
        Route::put('/screenings/{id}',    [ScreeningController::class, 'update']);
        Route::delete('/screenings/{id}', [ScreeningController::class, 'destroy']);

        Route::get('/analytics', [AnalyticsController::class, 'index']);

        Route::get('/discounts',         [DiscountController::class, 'adminIndex']);
        Route::post('/discounts',        [DiscountController::class, 'store']);
        Route::delete('/discounts/{id}', [DiscountController::class, 'destroy']);
        
        // Inbox
        Route::get('/contact-messages',           [ContactController::class, 'index']);
        Route::put('/contact-messages/{id}/read', [ContactController::class, 'markRead']);
    });
});