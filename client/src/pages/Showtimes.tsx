import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../CSSfiles/Showtimes.css"

// ── Types ──────────────────────────────────────────────
interface Movie {
  id: number
  title: string
  poster_url: string | null
  category: string
  genre: string | null
  release_date: string | null
  language: string | null
}

interface Screening {
  id: number
  movie_id: number
  show_date: string    // "2026-03-22"
  start_time: string   // "10:00:00"
}

// ── Constants ──────────────────────────────────────────
const API_URL         = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND         = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"
const FALLBACK_COLORS = ["#4e0f1a", "#1a3a5c", "#1a4d2e", "#3b1f5e", "#7a3b00"]
const DAY_NAMES       = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// ── Build next 7 real calendar days from today ─────────
const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, "0")
  const dd   = String(d.getDate()).padStart(2, "0")
  return {
    dateStr: `${yyyy}-${mm}-${dd}`,
    dayName: DAY_NAMES[d.getDay()],
    dateNum: String(d.getDate()).padStart(2, "0"),
  }
})

// ── Format "10:00:00" → "10:00am" ─────────────────────
const formatTime = (time: string): string => {
  const [h, m] = time.split(":")
  const hour   = parseInt(h)
  const ampm   = hour >= 12 ? "pm" : "am"
  const hour12 = hour % 12 || 12
  return `${String(hour12).padStart(2, "0")}:${m}${ampm}`
}

// ── Poster component ───────────────────────────────────
function Poster({ title, url }: { title: string; url: string | null }) {
  const src = url ? (url.startsWith("/") ? `${BACKEND}${url}` : url) : ""
  const bg  = FALLBACK_COLORS[title.charCodeAt(0) % FALLBACK_COLORS.length]

  if (!src) {
    return (
      <div className="poster-thumb-fallback" style={{ background: bg }}>
        <i className="fa-solid fa-film" />
      </div>
    )
  }
  return (
    <>
      <img
        src={src}
        alt={title}
        className="movie-info-poster"
        onError={e => {
          const el = e.target as HTMLImageElement
          el.style.display = "none"
          const fallback = el.nextSibling as HTMLElement
          if (fallback) fallback.style.display = "flex"
        }}
      />
      <div
        className="poster-thumb-fallback"
        style={{ background: bg, display: "none" }}
      >
        <i className="fa-solid fa-film" />
      </div>
    </>
  )
}

// ── Main Component ─────────────────────────────────────
export default function ShowTimes() {
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const isAdmin      = user?.role === "admin"

  const [movies,     setMovies]     = useState<Movie[]>([])
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        const [moviesRes, screeningsRes] = await Promise.all([
          fetch(`${API_URL}/movies`),
          fetch(`${API_URL}/screenings`),
        ])
        const moviesData     = await moviesRes.json()
        const screeningsData = await screeningsRes.json()

        if (!moviesData.success)     throw new Error(moviesData.message)
        if (!screeningsData.success) throw new Error(screeningsData.message)

        setMovies(moviesData.movies)
        setScreenings(screeningsData.screenings)
      } catch (err: any) {
        setError(err.message || "Failed to load showtimes.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const weekDates = WEEK_DAYS.map(d => d.dateStr)

  const moviesThisWeek = movies.filter(movie =>
    screenings.some(s => s.movie_id === movie.id && weekDates.includes(s.show_date))
  )

  const getSlotsForDay = (movieId: number, dateStr: string): string[] =>
    screenings
      .filter(s => s.movie_id === movieId && s.show_date === dateStr)
      .map(s => formatTime(s.start_time))
      .sort()

  const handleTicketBtn = (movieId: number) => {
    if (isAdmin) navigate("/admin", { state: { editMovieId: movieId } })
    else navigate(`/book/${movieId}`)
  }

  return (
    <div className="showtimes-wrapper">

      {/* Location Bar */}
      <div className="location-bar">
        <div>
          <div className="location-label">Weekly Showtime</div>
          <div className="location-name">
            <i className="fa-solid fa-location-dot" /> Love Road, Tejgaon
          </div>
        </div>
        <button className="change-location-btn">
          <i className="fa-solid fa-rotate" /> Change Location
        </button>
      </div>

      {/* States */}
      {loading && <p className="showtimes-state-msg">Loading showtimes…</p>}
      {error   && <p className="showtimes-state-msg showtimes-state-error">{error}</p>}
      {!loading && !error && moviesThisWeek.length === 0 && (
        <p className="showtimes-state-msg">No screenings scheduled this week.</p>
      )}

      {/* Movie Rows */}
      {!loading && !error && moviesThisWeek.length > 0 && (
        <div className="movie-rows">
          {moviesThisWeek.map(movie => (
            <div key={movie.id} className="movie-row">
              <div className="movie-row-inner">

                {/* Left: Movie Info */}
                <div className="movie-info">
                  <Poster title={movie.title} url={movie.poster_url} />
                  <div>
                    <div className="movie-info-title">{movie.title}</div>
                    <div className="movie-info-details">
                      <div><i className="fa-solid fa-layer-group" /> {movie.category}</div>
                      {movie.genre        && <div><i className="fa-solid fa-masks-theater" /> {movie.genre}</div>}
                      {movie.release_date && <div><i className="fa-solid fa-calendar-days" /> {movie.release_date}</div>}
                      {movie.language     && <div><i className="fa-solid fa-language" /> {movie.language}</div>}
                    </div>
                  </div>
                </div>

                {/* Right: 7-day showtime grid */}
                <div className="showtimes-grid-wrapper">
                  <div className="showtimes-grid">
                    {WEEK_DAYS.map(({ dateStr, dayName, dateNum }) => {
                      const slots = getSlotsForDay(movie.id, dateStr)
                      return (
                        <div key={dateStr} className="day-column">
                          <div className="day-header">
                            <div className="day-date">{dateNum}</div>
                            <div className="day-name">{dayName}</div>
                          </div>

                          {slots.length === 0 ? (
                            <div className="no-show">—</div>
                          ) : (
                            slots.map(time => (
                              <button key={time} className="showtime-btn">
                                <i className="fa-regular fa-clock" /> {time}
                              </button>
                            ))
                          )}

                          {slots.length > 0 && (
                            <button
                              className={`get-tickets-btn ${isAdmin ? "edit-movie-btn" : ""}`}
                              onClick={() => handleTicketBtn(movie.id)}
                            >
                              {isAdmin
                                ? <><i className="fa-solid fa-pen" /> Edit Data</>
                                : <><i className="fa-solid fa-ticket" /> Get Tickets</>
                              }
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      <div className="footer">
        Copyright© 2026 CineBook Limited. All Rights Reserved.
      </div>
    </div>
  )
}