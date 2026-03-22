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
  const [activeTab,  setActiveTab]  = useState<Tab>("Now Showing")
  const [movieList,  setMovieList]  = useState<Movie[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin  = user?.role === "admin"

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
    setExpandedId(null)
  }

  const handleCardClick = (movieId: number) => {
    
    setExpandedId(prev => prev === movieId ? null : movieId)
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

      
      <div className="st-header">
        <h1 className="st-header-title">View All Movies</h1>
        <p className="st-header-sub">View all the latest movies that are available at CineBook</p>
      </div>

      
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

      
      {!loading && !error && displayed.length > 0 && (
        <div className="st-grid">
          {displayed.map(movie => {
            const isExpanded = expandedId === movie.id

           
            if (isExpanded) {
              return (
                <div key={movie.id} className="st-card st-card-info">
                 
                  <div className="st-info-top">
                    {movie.trailer_url ? (
                      <a
                        href={movie.trailer_url}
                        target="_blank"
                        rel="noreferrer"
                        className="st-play-btn"
                        aria-label="Watch trailer"
                      >
                        <i className="fa-regular fa-circle-play" />
                      </a>
                    ) : (
                      <div className="st-play-btn st-play-btn-disabled">
                        <i className="fa-regular fa-circle-play" />
                      </div>
                    )}
                  </div>

                  <div className="st-info-body">
                    <div className="st-info-title">{movie.title}</div>

                    {movie.release_date && (
                      <div className="st-info-row">
                        <span className="st-info-label">RELEASE :</span>
                        <span className="st-info-value">{movie.release_date}</span>
                      </div>
                    )}

                    {movie.genre && (
                      <div className="st-info-row">
                        <span className="st-info-label">GENRE :</span>
                        <span className="st-info-value">{movie.genre.toUpperCase()}</span>
                      </div>
                    )}

                    {movie.duration_mins && (
                      <div className="st-info-row">
                        <span className="st-info-label">DURATION :</span>
                        <span className="st-info-value">{movie.duration_mins} min</span>
                      </div>
                    )}

                    {movie.language && (
                      <div className="st-info-row">
                        <span className="st-info-label">LANGUAGE :</span>
                        <span className="st-info-value">{movie.language}</span>
                      </div>
                    )}
                  </div>

                  <div className="st-info-actions">
                    <button
                      className="st-ticket-btn"
                      onClick={() => handleGetTickets(movie.id)}
                    >
                      {isAdmin ? (
                        <>
                          <i className="fa-solid fa-pencil"></i> Edit
                        </>
                      ) : (
                        "Get Tickets"
                      )}
                    </button>
                    <button
                      className="st-details-btn"
                      onClick={() => setExpandedId(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )
            }

           
            return (
              <div
                key={movie.id}
                className="st-card st-card-poster"
                onClick={() => handleCardClick(movie.id)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${movie.title}`}
                onKeyDown={e => e.key === "Enter" && handleCardClick(movie.id)}
              >
                <MoviePoster movie={movie} />
                <div className="st-card-overlay">
                  <button
                    className="st-ticket-btn"
                    onClick={e => {
                      e.stopPropagation() 
                      handleGetTickets(movie.id)
                    }}
                  >
                    {isAdmin ? (
                      <>
                        <i className="fa-solid fa-pencil"></i> Edit
                      </>
                    ) : (
                      "Get Tickets"
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="st-footer">
        Copyright© 2026 CineBook Limited. All Rights Reserved.
      </div>
    </div>
  )
}