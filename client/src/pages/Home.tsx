import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../CSSfiles/Home.css"


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
const CAROUSEL_INTERVAL_MS = 4000  

const posterSrc = (url: string | null): string => {
  if (!url) return ""
  return url.startsWith("/") ? `${BACKEND}${url}` : url
}


const FALLBACK_COLORS = ["#0f2744", "#2d1b2e", "#1a3a1a", "#3b1f00", "#1a1a3b"]

function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false)
  const src = posterSrc(movie.poster_url)
  const bg  = FALLBACK_COLORS[movie.title.charCodeAt(0) % FALLBACK_COLORS.length]

  if (!src || failed) {
    return (
      <div className="home-poster-fallback" style={{ background: bg }}>
        <span className="home-poster-fallback-icon"><i className="fas fa-film"></i></span>
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


export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Now Showing")
  const [heroIdx,   setHeroIdx]   = useState(0)
  const [movieList, setMovieList] = useState<Movie[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState("")

  const navigate     = useNavigate()
  const { user }     = useAuth()
  const isAdmin      = user?.role === "admin"
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)

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
  const heroMovies = displayed.length > 0 ? displayed : movieList
  const heroMovie  = heroMovies.length > 0 ? heroMovies[heroIdx % heroMovies.length] : null

  
  useEffect(() => {
    if (heroMovies.length <= 1) return  

    intervalRef.current = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % heroMovies.length)
    }, CAROUSEL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
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
  }

  const handleEditMovie = (movieId: number) => {
    navigate("/admin", { state: { editMovieId: movieId } })
  }

  return (
    <div className="home-wrapper">

      
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
            <h2 className="hero-title">{heroMovie.title}</h2>
            <p className="hero-meta">
              {heroMovie.genre || ""}
              {heroMovie.duration_mins ? ` • ${heroMovie.duration_mins} min` : ""}
            </p>
            {isAdmin ? (
              <button
                className="hero-tickets-btn hero-edit-btn"
                onClick={() => handleEditMovie(heroMovie.id)}
              >
                <i className="fa-solid fa-pencil"></i> Edit Movie
              </button>
            ) : (
              <button
                className="hero-tickets-btn"
                onClick={() => navigate(`/book/${heroMovie.id}`)}
              >
                Get Tickets
              </button>
            )}
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

     
      <div className="content-area">

        
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

       
        {!loading && !error && displayed.length > 0 && (
          <div className="movie-grid">
            {displayed.map(movie => (
              <div key={movie.id} className="movie-card">
                <MoviePoster movie={movie} />
                <div className="movie-card-overlay">
                  <div className="movie-card-category">{movie.category}</div>
                  <div className="movie-title">
                    {movie.title.length > 22 ? movie.title.substring(0, 22) + "…" : movie.title}
                  </div>
                  {movie.genre && <div className="movie-genre">{movie.genre}</div>}
                  {isAdmin ? (
                    <button
                      className="get-tickets-btn edit-movie-btn"
                      onClick={() => handleEditMovie(movie.id)}
                    >
                      <i className="fa-solid fa-pencil"></i> Edit Movie
                    </button>
                  ) : (
                    <button
                      className="get-tickets-btn"
                      onClick={() => navigate(`/book/${movie.id}`)}
                    >
                      Get Tickets
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