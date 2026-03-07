<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ScreeningController;
use App\Http\Controllers\HallController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);


Route::get('/movies',          [MovieController::class, 'index']);
Route::get('/movies/{id}',     [MovieController::class, 'show']);
Route::get('/screenings',      [ScreeningController::class, 'index']);
Route::get('/screenings/{id}', [ScreeningController::class, 'show']);
Route::get('/halls',           [HallController::class, 'index']);
Route::get('/halls/{id}',      [HallController::class, 'show']);


Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

  
    Route::middleware('admin')->prefix('admin')->group(function () {
       
        Route::get('/movies',          [MovieController::class, 'adminIndex']);
        Route::post('/movies',         [MovieController::class, 'store']);
        Route::put('/movies/{id}',     [MovieController::class, 'update']);
        Route::delete('/movies/{id}',  [MovieController::class, 'destroy']);

       
        Route::get('/screenings',         [ScreeningController::class, 'adminIndex']);
        Route::post('/screenings',        [ScreeningController::class, 'store']);
        Route::put('/screenings/{id}',    [ScreeningController::class, 'update']);
        Route::delete('/screenings/{id}', [ScreeningController::class, 'destroy']);
    });
});