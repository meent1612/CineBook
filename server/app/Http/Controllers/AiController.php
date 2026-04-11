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

    // ── Core Groq API caller (OpenAI-compatible) ─────────
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

    // ── Minimal movie list to keep prompts short ─────────
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

        // Parse MOVIE_IDS out of response
       $movieIds = [];
if (preg_match('/MOVIE_IDS::\[([^\]]*)\]/', $text, $match)) {
    // Format: MOVIE_IDS::[1,2,3]
    $text     = trim(str_replace($match[0], '', $text));
    $rawIds   = array_map('trim', explode(',', $match[1]));
    $movieIds = array_values(array_filter(array_map('intval', $rawIds)));
} elseif (preg_match('/MOVIE_IDS::([0-9,\s]+)/', $text, $match)) {
    // Format: MOVIE_IDS::1,2,3  (no brackets)
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

        // Strip markdown fences if present
        $clean = trim(preg_replace('/```json|```/', '', $raw));

        // Extract JSON array even if there's extra text
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
    public function recommendations(Request $request)
    {
        $user   = $request->user();
        $movies = Movie::where('is_active', true)
            ->where('status', 'now_showing')
            ->get(['id', 'title', 'genre', 'category', 'language', 'duration_mins', 'status', 'poster_url']);

        // Get user's genre preferences from booking history
        $genreHistory = DB::table('bookings')
            ->join('screenings', 'bookings.screening_id', '=', 'screenings.id')
            ->join('movies',     'screenings.movie_id',   '=', 'movies.id')
            ->where('bookings.user_id', $user->id)
            ->where('bookings.status',  'confirmed')
            ->select('movies.genre')
            ->distinct()
            ->limit(5)
            ->pluck('genre')
            ->filter()
            ->implode(', ');

        if (!$genreHistory) {
            return response()->json([
                'success'      => true,
                'movies'       => $movies,
                'personalised' => false,
            ]);
        }

        $catalog = $movies->map(fn($m) => [
            'id'    => $m->id,
            'title' => $m->title,
            'genre' => $m->genre,
        ])->toJson();

        $system = "You are a movie recommendation engine. Return ONLY a valid JSON array of movie IDs sorted from most to least relevant. No markdown, no explanation, just the array.";

        $userMsg = "User preferred genres: {$genreHistory}\nAvailable movies: {$catalog}\nReturn all IDs sorted by relevance. Example: [3,1,2]";

        $raw = $this->callGroq($system, $userMsg, 150);

        if ($raw === null) {
            return response()->json(['success' => true, 'movies' => $movies, 'personalised' => false]);
        }

        $clean = trim(preg_replace('/```json|```/', '', $raw));

        if (preg_match('/\[[\d,\s]*\]/', $clean, $m)) {
            $clean = $m[0];
        }

        $ids = json_decode($clean, true);

        if (!is_array($ids) || empty($ids)) {
            return response()->json(['success' => true, 'movies' => $movies, 'personalised' => false]);
        }

        $idOrder = array_flip($ids);
        $sorted  = $movies->sortBy(fn($m) => $idOrder[$m->id] ?? 999)->values();

        return response()->json(['success' => true, 'movies' => $sorted, 'personalised' => true]);
    }
}