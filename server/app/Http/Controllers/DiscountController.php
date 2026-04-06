<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    // GET /api/discounts — public, returns today's active discounts
    public function index(Request $request)
    {
        try {
            $today = Carbon::today()->toDateString();

            $query = Discount::where('is_active', true)
                ->where('start_date', '<=', $today)
                ->where('end_date',   '>=', $today);

            if ($request->filled('theater_id')) {
                $query->where('theater_id', $request->theater_id);
            }

            return response()->json(['success' => true, 'discounts' => $query->get()]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // GET /api/admin/discounts — all active discounts (for admin card)
    public function adminIndex()
    {
        try {
            $discounts = Discount::where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['success' => true, 'discounts' => $discounts]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // POST /api/admin/discounts — create, auto-deactivate old one for same theater
    public function store(Request $request)
    {
        $request->validate([
            'name'              => 'required|string|max:100',
            'theater_id'        => 'required|integer|exists:theaters,id',
            'standard_pct'      => 'required|integer|min:0|max:100',
            'semi_recliner_pct' => 'required|integer|min:0|max:100',
            'premium_pct'       => 'required|integer|min:0|max:100',
            'vip_pct'           => 'required|integer|min:0|max:100',
            'start_date'        => 'required|date',
            'end_date'          => 'required|date|after_or_equal:start_date',
        ]);

        try {
            // Deactivate existing active discount for this theater
            Discount::where('theater_id', $request->theater_id)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            $discount = Discount::create([
                'name'              => $request->name,
                'theater_id'        => $request->theater_id,
                'standard_pct'      => $request->standard_pct,
                'semi_recliner_pct' => $request->semi_recliner_pct,
                'premium_pct'       => $request->premium_pct,
                'vip_pct'           => $request->vip_pct,
                'start_date'        => $request->start_date,
                'end_date'          => $request->end_date,
                'is_active'         => true,
            ]);

            return response()->json(['success' => true, 'discount' => $discount], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // DELETE /api/admin/discounts/{id} — soft-delete (set is_active=false)
    public function destroy($id)
    {
        try {
            $discount = Discount::findOrFail($id);
            $discount->update(['is_active' => false]);

            return response()->json(['success' => true, 'message' => 'Discount removed.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}