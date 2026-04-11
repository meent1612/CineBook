import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../CSSfiles/Showmovies.css"

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

const TABS    = ["Now Showing", "Coming Soon"] as const
type Tab      = typeof TABS[number]
const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"

const posterSrc = (url: string | null): string => {
  if (!url) return ""
  return url.startsWith("/") ? `${BACKEND}${url}` : url
}

const FALLBACK_COLORS = ["#4e0f1a", "#1a3a5c", "#1a4d2e", "#3b1f5e", "#7a3b00", "#1f4040"]

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false)
  const src = posterSrc(movie.poster_url)
  const bg  = FALLBACK_COLORS[movie.title.charCodeAt(0) % FALLBACK_COLORS.length]

  if (!src || failed) {
    return (
      <div className="st-poster-fallback" style={{ background: bg }}>
        <span className="st-poster-fallback-icon"><i className="fas fa-film"></i></span>
        <span className="st-poster-fallback-title">{movie.title}</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={movie.title}
      className="st-poster-img"
      onError={() => setFailed(true)}
    />
  )
}

export default function Showtimes() {
  const [activeTab, setActiveTab] = useState<Tab>("Now Showing")
  const [movieList, setMovieList] = useState<Movie[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState("")
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const navigate    = useNavigate()
  const { user }    = useAuth()
  const isAdmin     = user?.role === "admin"
  const isLoggedIn  = !!user

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

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setHoveredId(null)
  }

  const handleGetTickets = (movieId: number) => {
    if (isAdmin) {
      navigate("/admin", { state: { editMovieId: movieId } })
    } else {
      navigate(`/book/${movieId}`)
    }
  }

  return (
    <div className="st-wrapper">

      {/* Header */}
      <div className="st-header">
        <h1 className="st-header-title">View All Movies</h1>
        <p className="st-header-sub">View all the latest movies that are available at CineBook</p>
      </div>

      {/* Tabs */}
      <div className="st-tabs-bar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`st-tab-btn ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && <p className="st-state-msg">Loading movies…</p>}
      {error   && <p className="st-state-msg st-state-error">{error}</p>}
      {!loading && !error && displayed.length === 0 && (
        <p className="st-state-msg">No movies available right now.</p>
      )}

      {/* Movie Grid */}
      {!loading && !error && displayed.length > 0 && (
        <div className="st-grid">
          {displayed.map(movie => (
            <div
              key={movie.id}
              className={`st-card st-card-poster ${hoveredId === movie.id ? "st-hovered" : ""}`}
              onMouseEnter={() => setHoveredId(movie.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Category badge top-left */}
              <div className="st-category-badge">{movie.category}</div>

              {/* Status ribbon top-right */}
              <div className={`st-ribbon ${movie.status === "now_showing" ? "st-ribbon-showing" : "st-ribbon-soon"}`}>
                {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
              </div>

              <MoviePoster movie={movie} />

              {/* Hover detail overlay */}
              <div className={`st-hover-overlay ${hoveredId === movie.id ? "visible" : ""}`}>

                {/* Title */}
                <div className="st-hover-title">
                  {movie.title.length > 28 ? movie.title.substring(0, 28) + "…" : movie.title}
                </div>

                {/* Info rows */}
                <div className="st-hover-info">
                  {movie.genre && (
                    <div className="st-hover-row">
                      <span className="st-hover-label">
                        <i className="fa-solid fa-masks-theater" /> Genre
                      </span>
                      <span className="st-hover-value">
                        {movie.genre.length > 18 ? movie.genre.substring(0, 18) + "…" : movie.genre}
                      </span>
                    </div>
                  )}
                  {movie.language && (
                    <div className="st-hover-row">
                      <span className="st-hover-label">
                        <i className="fa-solid fa-language" /> Language
                      </span>
                      <span className="st-hover-value">{movie.language}</span>
                    </div>
                  )}
                  {movie.duration_mins && (
                    <div className="st-hover-row">
                      <span className="st-hover-label">
                        <i className="fa-regular fa-clock" /> Duration
                      </span>
                      <span className="st-hover-value">{movie.duration_mins} min</span>
                    </div>
                  )}
                  {movie.release_date && (
                    <div className="st-hover-row">
                      <span className="st-hover-label">
                        <i className="fa-regular fa-calendar" /> Release
                      </span>
                      <span className="st-hover-value">{formatDate(movie.release_date)}</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="st-hover-divider" />

                {/* Action buttons */}
                <div className="st-hover-actions">
                  {movie.trailer_url && !isAdmin && (
                    <a
                      href={movie.trailer_url}
                      target="_blank"
                      rel="noreferrer"
                      className="st-trailer-btn"
                      onClick={e => e.stopPropagation()}
                    >
                      <i className="fa-solid fa-play" /> Trailer
                    </a>
                  )}
                  {isAdmin ? (
                    <button
                      className="st-ticket-btn st-edit-btn"
                      onClick={() => handleGetTickets(movie.id)}
                    >
                      <i className="fa-solid fa-pen" /> Edit
                    </button>
                  ) : isLoggedIn ? (
                    <button
                      className="st-ticket-btn"
                      onClick={() => handleGetTickets(movie.id)}
                    >
                      <i className="fa-solid fa-ticket" /> Get Tickets
                    </button>
                  ) : (
                    <button
                      className="st-ticket-btn st-login-btn"
                      onClick={() => navigate("/login")}
                    >
                      <i className="fa-solid fa-user" /> Login to Book
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      <div className="st-footer">
        Copyright© 2026 CineBook Limited. All Rights Reserved.
      </div>
    </div>
  )
}
