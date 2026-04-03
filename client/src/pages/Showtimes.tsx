import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useBranch } from "../context/BranchContext"
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
  trailer_url: string | null
  duration_mins: number | null
}

interface Screening {
  id: number
  movie_id: number
  show_date: string
  start_time: string
  hall_name: string
}

// ── Constants ──────────────────────────────────────────
const API_URL         = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND         = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"
const FALLBACK_COLORS = ["#4e0f1a", "#1a3a5c", "#1a4d2e", "#3b1f5e", "#7a3b00"]
const MONTH_NAMES     = ["January","February","March","April","May","June",
                         "July","August","September","October","November","December"]
const FULL_DAY        = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

const ordinal = (n: number): string => {
  const s = ["th","st","nd","rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, "0")
  const dd   = String(d.getDate()).padStart(2, "0")
  return {
    dateStr: `${yyyy}-${mm}-${dd}`,
    fullDay: FULL_DAY[d.getDay()],
    ordDate: ordinal(d.getDate()),
    month:   MONTH_NAMES[d.getMonth()],
    year:    d.getFullYear(),
  }
})

const formatTime = (time: string): string => {
  const [h, m] = time.split(":")
  const hour   = parseInt(h)
  const ampm   = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${String(hour12).padStart(2, "0")}:${m} ${ampm}`
}

const HALL_COLORS = ["#f5c518", "#00bcd4", "#4caf50", "#9c27b0", "#ff5722"]
const hallColorMap: Record<string, string> = {}
let hallColorIdx = 0
const getHallColor = (hall: string): string => {
  if (!hallColorMap[hall]) {
    hallColorMap[hall] = HALL_COLORS[hallColorIdx % HALL_COLORS.length]
    hallColorIdx++
  }
  return hallColorMap[hall]
}

function Poster({ title, url }: { title: string; url: string | null }) {
  const [failed, setFailed] = useState(false)
  const src = url ? (url.startsWith("/") ? `${BACKEND}${url}` : url) : ""
  const bg  = FALLBACK_COLORS[title.charCodeAt(0) % FALLBACK_COLORS.length]

  if (!src || failed) {
    return (
      <div className="st-poster-fallback" style={{ background: bg }}>
        <i className="fa-solid fa-film" />
        <span>{title}</span>
      </div>
    )
  }
  return <img src={src} alt={title} className="st-poster-img" onError={() => setFailed(true)} />
}

// ── Main Component ─────────────────────────────────────
export default function ShowTimes() {
  const navigate            = useNavigate()
  const { user }            = useAuth()
  const { selectedTheater } = useBranch()
  const isAdmin             = user?.role === "admin"

  const [movies,     setMovies]     = useState<Movie[]>([])
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        const screeningsUrl = selectedTheater
          ? `${API_URL}/screenings?theater_id=${selectedTheater.id}`
          : `${API_URL}/screenings`
        const [moviesRes, screeningsRes] = await Promise.all([
          fetch(`${API_URL}/movies`),
          fetch(screeningsUrl),
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
  }, [selectedTheater])

  const weekDates      = WEEK_DAYS.map(d => d.dateStr)
  const moviesThisWeek = movies.filter(movie =>
    screenings.some(s => s.movie_id === movie.id && weekDates.includes(s.show_date))
  )

  const getScreeningsForDay = (movieId: number, dateStr: string): Screening[] =>
    screenings
      .filter(s => s.movie_id === movieId && s.show_date === dateStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const allHalls = [...new Set(screenings.map(s => s.hall_name).filter(Boolean))]

  // Details → movie detail page
  const handleDetails = (movieId: number) => {
    if (isAdmin) navigate("/admin", { state: { editMovieId: movieId } })
    else navigate(`/movie/${movieId}`)
  }

  // Get Tickets → booking page
  const handleGetTickets = (movieId: number) => navigate(`/book/${movieId}`)

  // Edit Data (admin) → opens Screening Management modal in AdminDashboard with context
  const handleEditData = (movieId: number, dateStr: string) => {
    navigate("/admin", { state: { openScreeningModal: true, editMovieId: movieId, editDate: dateStr } })
  }

  const locationDisplay = selectedTheater
    ? `${selectedTheater.name}, ${selectedTheater.address}`
    : "Select a theater"

  return (
    <div className="st-wrapper">

      {/* Page Header */}
      <div className="st-page-header">
        <div className="st-page-header-left">
          <h1 className="st-page-title">Weekly Showtime</h1>
          <div className="st-page-location">
            <i className="fa-solid fa-location-dot" />
            <span>[ {locationDisplay} ]</span>
          </div>
        </div>

        {allHalls.length > 0 && (
          <div className="st-hall-legend">
            {allHalls.map(hall => (
              <div key={hall} className="st-hall-badge">
                <span className="st-hall-dot" style={{ background: getHallColor(hall) }} />
                {hall}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* States */}
      {loading && <p className="st-state-msg">Loading showtimes…</p>}
      {error   && <p className="st-state-msg st-state-error">{error}</p>}
      {!loading && !error && moviesThisWeek.length === 0 && (
        <p className="st-state-msg">No screenings scheduled this week.</p>
      )}

      {/* Movie Rows */}
      {!loading && !error && moviesThisWeek.length > 0 && (
        <div className="st-movie-list">
          {moviesThisWeek.map(movie => (
            <div key={movie.id} className="st-movie-row">

              <div className="st-movie-left">
                <div className="st-poster-wrap">
                  <Poster title={movie.title} url={movie.poster_url} />
                </div>
                <div className="st-movie-meta">
                  <h2 className="st-movie-title">{movie.title}</h2>
                  <div className="st-meta-table">
                    <div className="st-meta-row">
                      <span className="st-meta-key">Category</span>
                      <span className="st-meta-sep">:</span>
                      <span className="st-meta-val">{movie.category}</span>
                    </div>
                    {movie.genre && (
                      <div className="st-meta-row">
                        <span className="st-meta-key">Genre</span>
                        <span className="st-meta-sep">:</span>
                        <span className="st-meta-val">{movie.genre}</span>
                      </div>
                    )}
                    {movie.release_date && (
                      <div className="st-meta-row">
                        <span className="st-meta-key">Release</span>
                        <span className="st-meta-sep">:</span>
                        <span className="st-meta-val">{movie.release_date}</span>
                      </div>
                    )}
                    {movie.language && (
                      <div className="st-meta-row">
                        <span className="st-meta-key">Language</span>
                        <span className="st-meta-sep">:</span>
                        <span className="st-meta-val">{movie.language}</span>
                      </div>
                    )}
                    {movie.duration_mins && (
                      <div className="st-meta-row">
                        <span className="st-meta-key">Duration</span>
                        <span className="st-meta-sep">:</span>
                        <span className="st-meta-val">{movie.duration_mins} min</span>
                      </div>
                    )}
                  </div>
                  <div className="st-movie-btns">
                    <button className="st-details-btn" onClick={() => handleDetails(movie.id)}>
                      {isAdmin ? <><i className="fa-solid fa-pen" /> Edit Movie</> : "Details"}
                    </button>
                    {movie.trailer_url && (
                      <a href={movie.trailer_url} target="_blank" rel="noreferrer" className="st-trailer-btn">
                        <i className="fa-solid fa-circle-play" /> Watch Trailer
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="st-schedule-grid">
                {WEEK_DAYS.map(({ dateStr, fullDay, ordDate, month, year }) => {
                  const dayScreenings = getScreeningsForDay(movie.id, dateStr)
                  return (
                    <div key={dateStr} className="st-day-col">
                      <div className="st-day-header">
                        <div className="st-day-name">{fullDay}</div>
                        <div className="st-day-date">{ordDate}, {month} {year}</div>
                      </div>
                      <div className="st-slots">
                        {dayScreenings.length === 0 ? (
                          <div className="st-no-show">—</div>
                        ) : (
                          dayScreenings.map(s => (
                            <button key={s.id} className="st-time-btn"
                              style={{ background: getHallColor(s.hall_name) }} title={s.hall_name}>
                              <i className="fa-solid fa-ticket" /> {formatTime(s.start_time)}
                            </button>
                          ))
                        )}
                      </div>

                      {dayScreenings.length > 0 && (
                        <button
                          className={`st-get-ticket-btn ${isAdmin ? "st-edit-btn" : ""}`}
                          onClick={() => isAdmin ? handleEditData(movie.id, dateStr) : handleGetTickets(movie.id)}
                        >
                          {isAdmin
                            ? <><i className="fa-solid fa-clapperboard" /> Edit Screening</>
                            : <><i className="fa-solid fa-ticket" /> Get Tickets</>
                          }
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      <div className="st-footer">Copyright© 2026 CineBook Limited. All Rights Reserved.</div>
    </div>
  )
}