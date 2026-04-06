<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Base query: bookings → screenings → halls → theaters → movies (5-table JOIN)
            $base = DB::table('bookings as b')
                ->join('screenings as sc', 'b.screening_id', '=', 'sc.id')
                ->join('halls as h',       'sc.hall_id',     '=', 'h.id')
                ->join('theaters as t',    'h.theater_id',   '=', 't.id')
                ->join('movies as m',      'sc.movie_id',    '=', 'm.id')
                ->where('b.status', 'confirmed');

            // ── Optional filters (handles all 7 combinations automatically) ──
            if ($request->filled('month') && $request->filled('year')) {
                $base->whereMonth('sc.show_date', $request->month)
                     ->whereYear('sc.show_date',  $request->year);
            }
            if ($request->filled('theater_id')) {
                $base->where('t.id', $request->theater_id);
            }
            if ($request->filled('movie_id')) {
                $base->where('m.id', $request->movie_id);
            }

            // ── Summary totals (CASE WHEN conditional aggregation) ────────────
            $summary = (clone $base)->selectRaw("
                SUM(b.price) as total_revenue,
                COUNT(b.id)  as total_bookings,
                SUM(CASE WHEN b.seat_type IN ('standard', 'semi_recliner') THEN b.price ELSE 0 END) as regular_revenue,
                SUM(CASE WHEN b.seat_type IN ('premium', 'vip')            THEN b.price ELSE 0 END) as premium_revenue
            ")->first();

            // ── Daily breakdown (GROUP BY day) ────────────────────────────────
            $daily = (clone $base)->selectRaw("
                DAY(sc.show_date) as day,
                SUM(b.price)      as total_revenue,
                COUNT(b.id)       as bookings,
                SUM(CASE WHEN b.seat_type IN ('standard', 'semi_recliner') THEN b.price ELSE 0 END) as regular_revenue,
                SUM(CASE WHEN b.seat_type IN ('premium', 'vip')            THEN b.price ELSE 0 END) as premium_revenue
            ")->groupByRaw('DAY(sc.show_date)')
              ->orderByRaw('DAY(sc.show_date)')
              ->get();

            // ── Revenue by movie (GROUP BY movie) ────────────────────────────
            $byMovie = (clone $base)->selectRaw("
                m.id,
                m.title,
                SUM(b.price) as revenue,
                COUNT(b.id)  as bookings
            ")->groupBy('m.id', 'm.title')
              ->orderByRaw('SUM(b.price) DESC')
              ->get();

            // ── Revenue by theater (GROUP BY theater) ────────────────────────
            $byTheater = (clone $base)->selectRaw("
                t.id,
                t.name,
                SUM(b.price) as revenue,
                COUNT(b.id)  as bookings
            ")->groupBy('t.id', 't.name')
              ->orderByRaw('SUM(b.price) DESC')
              ->get();

            // ── Revenue by seat type (GROUP BY seat_type) ────────────────────
            $bySeat = (clone $base)->selectRaw("
                b.seat_type,
                SUM(b.price) as revenue,
                COUNT(b.id)  as bookings
            ")->groupBy('b.seat_type')
              ->orderByRaw('SUM(b.price) DESC')
              ->get();

            return response()->json([
                'success'    => true,
                'summary'    => [
                    'total_revenue'   => (int) ($summary->total_revenue   ?? 0),
                    'total_bookings'  => (int) ($summary->total_bookings  ?? 0),
                    'regular_revenue' => (int) ($summary->regular_revenue ?? 0),
                    'premium_revenue' => (int) ($summary->premium_revenue ?? 0),
                ],
                'daily'      => $daily,
                'by_movie'   => $byMovie,
                'by_theater' => $byTheater,
                'by_seat'    => $bySeat,
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}