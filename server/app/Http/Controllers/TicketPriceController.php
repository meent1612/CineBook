<?php

namespace App\Http\Controllers;

use App\Models\TicketPrice;

class TicketPriceController extends Controller
{
    public function index()
    {
        try {
            $prices = TicketPrice::orderByRaw("
                CASE seat_type
                    WHEN 'standard'      THEN 1
                    WHEN 'semi_recliner' THEN 2
                    WHEN 'premium'       THEN 3
                    WHEN 'vip'           THEN 4
                END
            ")->get();

            return response()->json([
                'success' => true,
                'prices'  => $prices,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}