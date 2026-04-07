import { useState, useEffect, useRef } from "react"
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
  booking_count?: number  // A) added
}

// ── Constants ──────────────────────────────────────────
const TABS                 = ["Now Showing", "Coming Soon"] as const
type Tab                   = typeof TABS[number]
const API_URL              = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND              = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"
const CAROUSEL_INTERVAL_MS = 4000

const posterSrc = (url: string | null): string => {
  if (!url) return ""
  return url.startsWith("/") ? `${BACKEND}${url}` : url
}

const FALLBACK_COLORS = ["#0f2744", "#2d1b2e", "#1a3a1a", "#3b1f00", "#1a1a3b"]

// ── Poster with fallback ───────────────────────────────
function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false)
  const src = posterSrc(movie.poster_url)
  const bg  = FALLBACK_COLORS[movie.title.charCodeAt(0) % FALLBACK_COLORS.length]

  if (!src || failed) {
    return (
      <div className="home-poster-fallback" style={{ background: bg }}>
        <span className="home-poster-fallback-icon">
          <i className="fas fa-film" />
        </span>
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

// ── Trending Widget ────────────────────────────────────
function TrendingWidget({ movies, onSelect }: { movies: Movie[]; onSelect: (id: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // E) Use real booking counts for heat percentage
  // NEW
  const maxCount = Math.max(...movies.map(m => m.booking_count ?? 0), 0)
  const heatPct  = (m: Movie) => {
    const baseline = 8
    if (maxCount === 0) return baseline
    return Math.round(baseline + ((m.booking_count ?? 0) / maxCount) * (100 - baseline))
  }
  if (movies.length === 0) return null

  // Show at most 8 trending entries
  const trending = movies.slice(0, 8)

  return (
    <section className="trending-section">
      <div className="trending-header">
        <span className="trending-flame">
          {/* animated SVG flame */}
          <svg viewBox="0 0 24 24" className="flame-svg" aria-hidden="true">
            <path d="M12 2C12 2 8 7 8 12c0 2.2 1.8 4 4 4s4-1.8 4-4c0-1.5-.7-2.8-1.5-3.8C14 9.5 13 11 13 12c0 .6-.4 1-1 1s-1-.4-1-1c0-2.5 2-5.5 1-8z"/>
            <path d="M12 22c-3.3 0-6-2.7-6-6 0-3.5 2.5-7 4-9 .5 2 2 4 2 6 0 0 1-1.5 1-3 1.5 1.5 3 3.5 3 6 0 3.3-2.7 6-4 6z" opacity=".6"/>
          </svg>
        </span>
        <h3 className="trending-title">Trending Now</h3>
        <span className="trending-subtitle">Most popular this week</span>
      </div>

      <div className="trending-scroll-wrap">
        {/* Left / right fade masks */}
        <div className="trending-fade trending-fade-left"  aria-hidden="true" />
        <div className="trending-fade trending-fade-right" aria-hidden="true" />

        <div className="trending-track" ref={scrollRef}>
          {trending.map((movie, idx) => {
            const rank   = idx + 1
            const isTop  = rank === 1
            const src    = posterSrc(movie.poster_url)
            const bg     = FALLBACK_COLORS[movie.title.charCodeAt(0) % FALLBACK_COLORS.length]

            return (
              <button
                key={movie.id}
                className={`trending-card ${isTop ? "trending-card--gold" : ""}`}
                onClick={() => onSelect(movie.id)}
                aria-label={`Trending #${rank}: ${movie.title}`}
              >
                {/* Poster / fallback */}
                <div className="trending-poster-wrap">
                  {src ? (
                    <img
                      src={src}
                      alt={movie.title}
                      className="trending-poster"
                      onError={e => {
                        const t = e.target as HTMLImageElement
                        t.style.display = "none"
                        t.nextElementSibling?.removeAttribute("style")
                      }}
                    />
                  ) : null}
                  <div
                    className="trending-poster-fallback"
                    style={{ background: bg, display: src ? "none" : "flex" }}
                  >
                    <i className="fas fa-film" />
                    <span>{movie.title}</span>
                  </div>

                  {/* Rank badge */}
                  <span className={`trending-rank ${isTop ? "trending-rank--gold" : ""}`}>
                    {isTop ? "👑" : `#${rank}`}
                  </span>

                  {/* Gradient scrim for text */}
                  <div className="trending-scrim" />
                </div>

                {/* Info row */}
                <div className="trending-info">
                  <p className="trending-movie-title">
                    {movie.title.length > 18 ? movie.title.substring(0, 18) + "…" : movie.title}
                  </p>

                  {/* E) Heat bar using real data */}
                  <div className="trending-heat-bar-wrap" aria-hidden="true">
                    <div
                      className={`trending-heat-bar ${isTop ? "trending-heat-bar--gold" : ""}`}
                      style={{ width: `${heatPct(movie)}%` }}
                    />
                  </div>
                  <p className="trending-heat-label">{heatPct(movie)}% popularity</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Main Component ─────────────────────────────────────
export default function Home() {
  const [activeTab,     setActiveTab]     = useState<Tab>("Now Showing")
  const [heroIdx,       setHeroIdx]       = useState(0)
  const [movieList,     setMovieList]     = useState<Movie[]>([])
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])  // B) added
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState("")
  const [hoveredId,     setHoveredId]     = useState<number | null>(null)

  const navigate    = useNavigate()
  const { user }    = useAuth()
  const isAdmin     = user?.role === "admin"
  const isLoggedIn  = !!user
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // C) Both fetches in one useEffect
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

    const fetchPopular = async () => {
      try {
        const res  = await fetch(`${API_URL}/movies/popular`)
        const data = await res.json()
        if (data.success) setPopularMovies(data.movies)
      } catch {}
    }

    fetchMovies()
    fetchPopular()  // C) added
  }, [])

  const nowShowing = movieList.filter(m => m.status === "now_showing")
  const comingSoon = movieList.filter(m => m.status === "coming_soon")
  const displayed  = activeTab === "Now Showing" ? nowShowing : comingSoon
  const heroMovies = displayed.length > 0 ? displayed : movieList
  const heroMovie  = heroMovies.length > 0 ? heroMovies[heroIdx % heroMovies.length] : null

  useEffect(() => {
    if (heroMovies.length <= 1) return
    intervalRef.current = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % heroMovies.length)
    }, CAROUSEL_INTERVAL_MS)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [heroMovies.length, activeTab])

  const handleDotClick = (i: number) => {
    setHeroIdx(i)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % heroMovies.length)
    }, CAROUSEL_INTERVAL_MS)
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setHeroIdx(0)
    setHoveredId(null)
  }

  const handleEditMovie  = (movieId: number) => navigate("/admin", { state: { editMovieId: movieId } })
  const handleGetTickets = (movieId: number) => navigate(`/book/${movieId}`)

  const handleTrendingSelect = (movieId: number) => {
    if (isAdmin)         handleEditMovie(movieId)
    else if (isLoggedIn) handleGetTickets(movieId)
    else                 navigate("/login")
  }

  return (
    <div className="home-wrapper">

      {/* ── Hero Banner ── */}
      <div className="hero-banner">
        {heroMovie && posterSrc(heroMovie.poster_url) ? (
          <img
            key={heroMovie.id}
            src={posterSrc(heroMovie.poster_url)}
            alt={heroMovie.title}
            className="hero-img hero-img-fade"
            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        ) : (
          <div className="hero-img-placeholder" />
        )}
        <div className="hero-overlay" />

        {heroMovie && (
          <div className="hero-text">
            <span className="hero-status-badge">
              <i className="fa-solid fa-circle" style={{ fontSize: "0.5rem", marginRight: "0.4rem", color: "#4CAF50" }} />
              {heroMovie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
            </span>
            <h2 className="hero-title">{heroMovie.title}</h2>
            <p className="hero-meta">
              {heroMovie.genre || ""}
              {heroMovie.duration_mins ? ` • ${heroMovie.duration_mins} min` : ""}
              {heroMovie.language ? ` • ${heroMovie.language}` : ""}
            </p>
            <div className="hero-btn-row">
              {heroMovie.trailer_url && !isAdmin && (
                <a
                  href={heroMovie.trailer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hero-trailer-btn"
                >
                  <i className="fa-solid fa-play" /> Watch Trailer
                </a>
              )}
              {isAdmin ? (
                <button
                  className="hero-tickets-btn hero-edit-btn"
                  onClick={() => handleEditMovie(heroMovie.id)}
                >
                  <i className="fa-solid fa-pen" /> Edit Movie
                </button>
              ) : isLoggedIn ? (
                <button
                  className="hero-tickets-btn"
                  onClick={() => handleGetTickets(heroMovie.id)}
                >
                  <i className="fa-solid fa-ticket" /> Get Tickets
                </button>
              ) : null}
            </div>
          </div>
        )}

        {heroMovies.length > 1 && (
          <div className="hero-dots">
            {heroMovies.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`hero-dot ${i === heroIdx % heroMovies.length ? "active" : "inactive"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Trending Widget ── D) uses popularMovies */}
      {!loading && !error && popularMovies.length > 0 && (
        <TrendingWidget movies={popularMovies} onSelect={handleTrendingSelect} />
      )}

      {/* ── Content Area ── */}
      <div className="content-area">

        {/* Tabs */}
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
          <button className="view-all-btn" onClick={() => navigate("/showmovies")}>
            View All →
          </button>
        </div>

        {loading && <p className="home-state-msg">Loading movies…</p>}
        {error   && <p className="home-state-msg home-state-error">{error}</p>}
        {!loading && !error && displayed.length === 0 && (
          <p className="home-state-msg">No movies available right now.</p>
        )}

        {/* ── Movie Grid ── */}
        {!loading && !error && displayed.length > 0 && (
          <div className="movie-grid">
            {displayed.map(movie => (
              <div
                key={movie.id}
                className={`movie-card ${hoveredId === movie.id ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredId(movie.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Status ribbon */}
                <div className={`movie-ribbon ${movie.status === "now_showing" ? "ribbon-showing" : "ribbon-soon"}`}>
                  {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
                </div>

                {/* Category badge */}
                <div className="movie-category-badge">{movie.category}</div>

                <MoviePoster movie={movie} />

                {/* ── Hover Overlay ── */}
                <div className={`movie-card-overlay ${hoveredId === movie.id ? "visible" : ""}`}>
                  <div className="movie-card-hover-title">
                    {movie.title.length > 22 ? movie.title.substring(0, 22) + "…" : movie.title}
                  </div>

                  {isAdmin ? (
                    <button
                      className="get-tickets-btn edit-movie-btn"
                      onClick={() => handleEditMovie(movie.id)}
                    >
                      <i className="fa-solid fa-pen" /> Edit Movie
                    </button>
                  ) : isLoggedIn ? (
                    <button
                      className="get-tickets-btn"
                      onClick={() => handleGetTickets(movie.id)}
                    >
                      <i className="fa-solid fa-ticket" /> Get Tickets
                    </button>
                  ) : (
                    <button
                      className="get-tickets-btn login-prompt-btn"
                      onClick={() => navigate("/login")}
                    >
                      <i className="fa-solid fa-user" /> Login to Book
                    </button>
                  )}
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
