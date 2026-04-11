<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Movie;

class AiController extends Controller
{
    private string $apiKey;
    private string $model;
    private string $apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    public function __construct()
    {
        $this->apiKey = config('services.groq.key', '');
        $this->model  = config('services.groq.model', 'llama-3.3-70b-versatile');
    }

    // ── Core Groq API caller ─────────────────────────────
    private function callGroq(string $systemPrompt, string $userMessage, int $maxTokens = 400): ?string
    {
        if (empty($this->apiKey)) {
            Log::error('Groq: API key is empty');
            return null;
        }

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type'  => 'application/json',
                ])
                ->post($this->apiUrl, [
                    'model'       => $this->model,
                    'max_tokens'  => $maxTokens,
                    'temperature' => 0.7,
                    'messages'    => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user',   'content' => $userMessage],
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Groq HTTP error ' . $response->status() . ': ' . $response->body());
                return null;
            }

            return $response->json('choices.0.message.content');

        } catch (\Exception $e) {
            Log::error('Groq exception: ' . $e->getMessage());
            return null;
        }
    }

    // ── Minimal movie list for prompts ───────────────────
    private function getMinimalMovies(): \Illuminate\Support\Collection
    {
        return Movie::where('is_active', true)
            ->get(['id', 'title', 'genre', 'language', 'duration_mins', 'status'])
            ->map(fn($m) => [
                'id'       => $m->id,
                'title'    => $m->title,
                'genre'    => $m->genre    ?? 'Unknown',
                'language' => $m->language ?? 'Unknown',
                'duration' => $m->duration_mins,
                'status'   => $m->status,
            ]);
    }

    // ── POST /api/ai/chat ────────────────────────────────
    public function chat(Request $request)
    {
        $request->validate(['message' => 'required|string|max:300']);

        $movies  = $this->getMinimalMovies();
        $catalog = $movies->map(fn($m) =>
            "{$m['id']}. {$m['title']} | {$m['genre']} | {$m['duration']}min | {$m['status']}"
        )->implode("\n");

        $system = "You are CineBot, a friendly cinema assistant for CineBook in Bangladesh.
Current movies:
{$catalog}

Ticket prices: Standard=400 BDT, Semi-Recliner=615 BDT, Premium=815 BDT, VIP=1200 BDT.
Only answer cinema/movie questions. Keep responses concise (2-3 sentences).
When recommending movies, append this line at the very end of your response:
MOVIE_IDS::[comma-separated IDs]
Use only real IDs from the list above, max 4. Never mention MOVIE_IDS to the user.";

        $text = $this->callGroq($system, $request->input('message'), 350);

        if ($text === null) {
            return response()->json([
                'success' => false,
                'message' => 'AI service unavailable. Please try again.',
            ], 503);
        }

        $movieIds = [];
        if (preg_match('/MOVIE_IDS::\[([^\]]*)\]/', $text, $match)) {
            $text     = trim(str_replace($match[0], '', $text));
            $rawIds   = array_map('trim', explode(',', $match[1]));
            $movieIds = array_values(array_filter(array_map('intval', $rawIds)));
        } elseif (preg_match('/MOVIE_IDS::([0-9,\s]+)/', $text, $match)) {
            $text     = trim(str_replace($match[0], '', $text));
            $rawIds   = array_map('trim', explode(',', $match[1]));
            $movieIds = array_values(array_filter(array_map('intval', $rawIds)));
        }

        $recommendedMovies = [];
        if (!empty($movieIds)) {
            $recommendedMovies = Movie::whereIn('id', $movieIds)
                ->where('is_active', true)
                ->get(['id', 'title', 'genre', 'duration_mins', 'status', 'poster_url'])
                ->toArray();
        }

        return response()->json([
            'success' => true,
            'reply'   => trim($text),
            'movies'  => $recommendedMovies,
        ]);
    }

    // ── POST /api/ai/search ──────────────────────────────
    public function search(Request $request)
    {
        $request->validate(['query' => 'required|string|max:150']);

        $movies  = $this->getMinimalMovies();
        $catalog = $movies->toJson();

        $system = "You are a movie search engine. Return ONLY a valid JSON array of matching movie IDs from the provided list. No markdown, no explanation, no extra text whatsoever. Return [] if nothing matches.";

        $userMsg = "Movies: {$catalog}\nQuery: \"{$request->input('query')}\"";

        $raw = $this->callGroq($system, $userMsg, 100);

        if ($raw === null) {
            return response()->json(['success' => false, 'message' => 'AI unavailable.'], 503);
        }

        $clean = trim(preg_replace('/```json|```/', '', $raw));

        if (preg_match('/\[[\d,\s]*\]/', $clean, $m)) {
            $clean = $m[0];
        }

        $ids = json_decode($clean, true);
        if (!is_array($ids)) $ids = [];

        $matched = Movie::whereIn('id', $ids)
            ->where('is_active', true)
            ->get(['id', 'title', 'genre', 'category', 'language', 'duration_mins', 'status', 'poster_url'])
            ->values();

        return response()->json(['success' => true, 'movies' => $matched, 'ids' => $ids]);
    }

    // ── GET /api/ai/recommendations ──────────────────────
    // Returns ALL active movies (both statuses), sorted by relevance if user has booking history.
    // Frontend splits them into now_showing / coming_soon tabs itself.
    public function recommendations(Request $request)
    {
        $user = $request->user();

        // Get ALL active movies (not just now_showing) so frontend can split by tab
        $allMovies = Movie::where('is_active', true)
            ->get(['id', 'title', 'genre', 'category', 'language', 'duration_mins', 'status', 'poster_url']);

        // ── Get genre history from confirmed bookings ──────────────────
        // bookings → screenings → movies (via movie_id on screenings)
        $genreRows = DB::table('bookings')
            ->join('screenings', 'bookings.screening_id', '=', 'screenings.id')
            ->join('movies',     'screenings.movie_id',   '=', 'movies.id')
            ->where('bookings.user_id', $user->id)
            ->where('bookings.status',  'confirmed')
            ->whereNotNull('movies.genre')
            ->where('movies.genre', '!=', '')
            ->select('movies.genre')
            ->distinct()
            ->limit(5)
            ->pluck('movies.genre')
            ->toArray();

        // No booking history → return default order, personalised=false
        if (empty($genreRows)) {
            return response()->json([
                'success'      => true,
                'movies'       => $allMovies,
                'personalised' => false,
                'debug_genres' => [], // helpful for Postman debugging
            ]);
        }

        $genreHistory = implode(', ', $genreRows);

        // Build a compact catalog for the prompt (all movies, both statuses)
        $catalog = $allMovies->map(fn($m) => [
            'id'     => $m->id,
            'title'  => $m->title,
            'genre'  => $m->genre ?? 'Unknown',
            'status' => $m->status,
        ])->toJson();

        $system = "You are a movie recommendation engine. Return ONLY a valid JSON array of ALL movie IDs sorted from most to least relevant based on user genre preferences. Include every ID from the list — just reorder them. No markdown, no explanation, just the array.";

        $userMsg = "User preferred genres: {$genreHistory}\nAll movies: {$catalog}\nReturn ALL IDs sorted by relevance. Example: [3,1,2,5,4]";

        $raw = $this->callGroq($system, $userMsg, 200);

        // If Groq fails, return default order with personalised=false
        if ($raw === null) {
            return response()->json([
                'success'      => true,
                'movies'       => $allMovies,
                'personalised' => false,
            ]);
        }

        $clean = trim(preg_replace('/```json|```/', '', $raw));

        if (preg_match('/\[[\d,\s]*\]/', $clean, $m)) {
            $clean = $m[0];
        }

        $ids = json_decode($clean, true);

        // Groq returned bad JSON → fall back
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'success'      => true,
                'movies'       => $allMovies,
                'personalised' => false,
            ]);
        }

        // Sort movies by Groq's recommended order
        // Movies not in the returned list (Groq missed some) go to the end
        $idOrder = array_flip($ids);
        $sorted  = $allMovies->sortBy(fn($m) => $idOrder[$m->id] ?? 9999)->values();

        return response()->json([
            'success'      => true,
            'movies'       => $sorted,
            'personalised' => true,
            'debug_genres' => $genreRows, // helpful for Postman debugging
        ]);
    }

    // ── POST /api/admin/ai/movie-info ────────────────────
    public function movieInfo(Request $request)
    {
        $request->validate(['title' => 'required|string|max:200']);

        $title = $request->input('title');

        $system = "You are a cinema database assistant.
Given a movie title, return ONLY a JSON object — no markdown, no extra text.
The JSON must have exactly these keys:
{
  \"title\":         \"<exact movie title>\",
  \"description\":   \"<2-3 sentence synopsis, no spoilers>\",
  \"genre\":         \"<comma-separated genres, e.g. Action, Thriller>\",
  \"category\":      \"<one of: 2D | 3D | IMAX>\",
  \"language\":      \"<original release language, e.g. English>\",
  \"duration_mins\": \"<runtime as a number string, e.g. 148>\",
  \"status\":        \"<one of: now_showing | coming_soon>\",
  \"trailer_url\":   \"<official YouTube trailer URL, e.g. https://www.youtube.com/watch?v=...>\"
}
If you do not recognise the movie, still fill every field with plausible values.";

        $raw = $this->callGroq($system, "Movie title: \"{$title}\"", 500);

        if ($raw === null) {
            return response()->json([
                'success' => false,
                'message' => 'AI service unavailable. Please try again.',
            ], 503);
        }

        // Strip markdown fences if present
        $clean = trim(preg_replace('/```json|```/', '', $raw));

        $parsed = json_decode($clean, true);

        if (!is_array($parsed)) {
            return response()->json([
                'success' => false,
                'message' => 'AI returned invalid data. Please try again.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data'    => $parsed,
        ]);
    }
}