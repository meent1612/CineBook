<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 401);
        }

        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $contactMessage = ContactMessage::create([
            'user_id' => $user->id,
            'name'    => $request->name,
            'email'   => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully.',
            'data'    => $contactMessage,
        ], 201);
    }

    // Admin: all messages
    public function index()
    {
        $messages = ContactMessage::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id'         => $msg->id,
                    'user_id'    => $msg->user_id,
                    'name'       => $msg->name,
                    'email'      => $msg->email,
                    'subject'    => $msg->subject,
                    'message'    => $msg->message,
                    'is_read'    => (bool) $msg->is_read,
                    'created_at' => $msg->created_at,
                ];
            });

        return response()->json(['success' => true, 'messages' => $messages]);
    }

    // User: only their own messages
    public function myMessages(Request $request)
    {
        $user = auth()->user();

        $messages = ContactMessage::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id'         => $msg->id,
                    'name'       => $msg->name,
                    'email'      => $msg->email,
                    'subject'    => $msg->subject,
                    'message'    => $msg->message,
                    'is_read'    => (bool) $msg->is_read,
                    'created_at' => $msg->created_at,
                ];
            });

        return response()->json(['success' => true, 'messages' => $messages]);
    }

    public function markRead($id)
    {
        $msg = ContactMessage::findOrFail($id);
        $msg->update(['is_read' => true]);

        return response()->json(['success' => true, 'message' => 'Marked as read.']);
    }
}