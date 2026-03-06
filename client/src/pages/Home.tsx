import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../CSSfiles/Home.css"

// ── Types ──────────────────────────────────────────────
interface Movie {
  id: number
  title: string
  genre: string | null
  category: string
  language: string | null
  duration_mins: number | null
  release_date: string | null
  poster_url: string | null
  trailer_url: string | null
  status: "now_showing" | "coming_soon"
  is_active: boolean
}

// ── Constants ──────────────────────────────────────────
const TABS = ["Now Showing", "Coming Soon"] as const
type Tab = typeof TABS[number]

const API_URL  = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND  = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"

// Prepend backend host for relative poster paths (same fix as AdminDashboard)
const posterSrc = (url: string | null): string => {
  if (!url) return ""
  return url.startsWith("/") ? `${BACKEND}${url}` : url
}

// ── Poster with CSS fallback ───────────────────────────
const FALLBACK_COLORS = ["#0f2744", "#2d1b2e", "#1a3a1a", "#3b1f00", "#1a1a3b"]

function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false)
  const src = posterSrc(movie.poster_url)
  const bg  = FALLBACK_COLORS[movie.title.charCodeAt(0) % FALLBACK_COLORS.length]

  if (!src || failed) {
    return (
      <div className="home-poster-fallback" style={{ background: bg }}>
        <span className="home-poster-fallback-icon">🎬</span>
        <span className="home-poster-fallback-title">{movie.title}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={movie.title}
      className="movie-poster"
      onError={() => setFailed(true)}
    />
  )
}

// ── Main Component ─────────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab]   = useState<Tab>("Now Showing")
  const [heroIdx,   setHeroIdx]     = useState(0)
  const [movieList, setMovieList]   = useState<Movie[]>([])
  const [loading,   setLoading]     = useState(true)
  const [error,     setError]       = useState("")
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const isAdmin   = user?.role === "admin"

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      setError("")
      try {
        const res  = await fetch(`${API_URL}/movies`)
        const data = await res.json()
        if (!data.success) throw new Error(data.message)
        setMovieList(data.movies)
      } catch (err: any) {
        setError(err.message || "Failed to load movies.")
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [])

  const nowShowing = movieList.filter(m => m.status === "now_showing" && m.is_active)
  const comingSoon = movieList.filter(m => m.status === "coming_soon"  && m.is_active)
  const displayed  = activeTab === "Now Showing" ? nowShowing : comingSoon

  // Hero uses movies from the active tab; cycle with dots
  const heroMovies = displayed.length > 0 ? displayed : movieList
  const heroMovie  = heroMovies[heroIdx % heroMovies.length] ?? null

  // Reset hero index when tab changes
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setHeroIdx(0)
  }

  return (
    <div className="home-wrapper">

      {/* ── Hero Banner ── */}
      <div className="hero-banner">
        {heroMovie && posterSrc(heroMovie.poster_url) ? (
          <img
            src={posterSrc(heroMovie.poster_url)}
            alt={heroMovie.title}
            className="hero-img"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        ) : (
          <div className="hero-img-placeholder" />
        )}
        <div className="hero-overlay" />

        {/* Hero text */}
        {heroMovie && (
          <div className="hero-text">
            <h2 className="hero-title">{heroMovie.title}</h2>
            <p className="hero-meta">
              {heroMovie.genre || ""}{heroMovie.duration_mins ? ` • ${heroMovie.duration_mins} min` : ""}
            </p>
            <button
              className={`hero-tickets-btn ${isAdmin ? "hero-edit-btn" : ""}`}
              onClick={() => navigate(isAdmin ? "/admin" : `/book/${heroMovie.id}`)}
            >
              {isAdmin ? "✏️ Edit Movie" : "Get Tickets"}
            </button>
          </div>
        )}

        {/* Dots */}
        {heroMovies.length > 1 && (
          <div className="hero-dots">
            {heroMovies.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIdx(i)}
                className={`hero-dot ${i === heroIdx % heroMovies.length ? "active" : "inactive"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Content Area ── */}
      <div className="content-area">

        {/* Tabs + View All */}
        <div className="tabs-bar">
          <div className="tabs-list">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="view-all-btn" onClick={() => navigate("/showtimes")}>
            View All →
          </button>
        </div>

        {/* States */}
        {loading && <p className="home-state-msg">Loading movies…</p>}
        {error   && <p className="home-state-msg home-state-error">{error}</p>}
        {!loading && !error && displayed.length === 0 && (
          <p className="home-state-msg">No movies available right now.</p>
        )}

        {/* Movie Grid */}
        {!loading && !error && displayed.length > 0 && (
          <div className="movie-grid">
            {displayed.map(movie => (
              <div key={movie.id} className="movie-card">
                <MoviePoster movie={movie} />
                <div className="movie-card-overlay">
                  <div className="movie-card-category">{movie.category}</div>
                  <div className="movie-title">
                    {movie.title.length > 22
                      ? movie.title.substring(0, 22) + "…"
                      : movie.title}
                  </div>
                  {movie.genre && (
                    <div className="movie-genre">{movie.genre}</div>
                  )}
                  <button
                    className={`get-tickets-btn ${isAdmin ? "edit-movie-btn" : ""}`}
                    onClick={() => navigate(isAdmin ? "/admin" : `/book/${movie.id}`)}
                  >
                    {isAdmin ? "✏️ Edit Movie" : "Get Tickets"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="home-footer">
          Copyright© 2026 CineBook Limited. All Rights Reserved.
        </div>
      </div>
    </div>
  )
}