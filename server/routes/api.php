<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovieController;

// ── Public Auth Routes ────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Public Movie Routes (everyone can see) ────────────
Route::get('/movies',      [MovieController::class, 'index']);
Route::get('/movies/{id}', [MovieController::class, 'show']);

// ── Protected Routes (login required) ─────────────────
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // ── Admin Only Routes ─────────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/movies',        [MovieController::class, 'adminIndex']);
        Route::post('/movies',       [MovieController::class, 'store']);
        Route::put('/movies/{id}',   [MovieController::class, 'update']);
        Route::delete('/movies/{id}',[MovieController::class, 'destroy']);
    });
});