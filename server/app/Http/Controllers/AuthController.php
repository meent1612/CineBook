<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    
    public function register(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|email|unique:users',
            'password'      => 'required|string|min:6|confirmed',
            'mobile_number' => 'nullable|string|max:20',
            'gender'        => 'nullable|in:Male,Female,Other',
        ]);

        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'mobile_number' => $request->mobile_number,
            'gender'        => $request->gender,
            'role'          => 'user',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
            ], 401);
        }

        $user = JWTAuth::user();

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    
    public function me()
    {
        return response()->json([
            'success' => true,
            'user'    => JWTAuth::user(),
        ]);
    }

    
public function updateProfile(Request $request)
{
    $request->validate([
        'name'          => 'sometimes|string|max:255',
        'mobile_number' => 'sometimes|nullable|string|max:20',
        'gender'        => 'sometimes|nullable|in:Male,Female,Other',
    ]);

    $user = JWTAuth::user();
    $user->update($request->only('name', 'mobile_number', 'gender'));

    return response()->json([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user'    => $user,
    ]);
}
}