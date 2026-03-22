import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useBranch } from "../context/BranchContext"
import "../CSSfiles/MovieDetail.css"

// ── Types ──────────────────────────────────────────────
interface Movie {
  id: number
  title: string
  description: string | null
  genre: string | null
  category: string
  language: string | null
  duration_mins: number | null
  release_date: string | null
  poster_url: string | null
  trailer_url: string | null
  status: string
  is_active: boolean
}

interface Screening {
  id: number
  movie_id: number
  show_date: string
  start_time: string
  hall_name: string
  available_seats: number
}

// ── Constants ──────────────────────────────────────────
const API_URL     = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND     = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"
const FULL_DAY    = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const MONTH_NAMES = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"]

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

const posterSrc = (url: string | null): string => {
  if (!url) return ""
  return url.startsWith("/") ? `${BACKEND}${url}` : url
}

// ── Main Component ─────────────────────────────────────
export default function MovieDetail() {
  const { id }              = useParams<{ id: string }>()
  const navigate            = useNavigate()
  const { user }            = useAuth()
  const { selectedTheater } = useBranch()           // ← branch context
  const isAdmin             = user?.role === "admin"

  const [movie,      setMovie]      = useState<Movie | null>(null)
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")
  const [posterErr,  setPosterErr]  = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        const [movieRes, screeningsRes] = await Promise.all([
          fetch(`${API_URL}/movies`),
          fetch(`${API_URL}/screenings`),
        ])
        const moviesData     = await movieRes.json()
        const screeningsData = await screeningsRes.json()

        if (!moviesData.success)     throw new Error(moviesData.message)
        if (!screeningsData.success) throw new Error(screeningsData.message)

        const found = moviesData.movies.find((m: Movie) => m.id === parseInt(id))
        if (!found) throw new Error("Movie not found.")

        setMovie(found)
        setScreenings(screeningsData.screenings.filter(
          (s: Screening) => s.movie_id === parseInt(id)
        ))
      } catch (err: any) {
        setError(err.message || "Failed to load movie.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const getScreeningsForDay = (dateStr: string): Screening[] =>
    screenings
      .filter(s => s.show_date === dateStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const allHalls       = [...new Set(screenings.map(s => s.hall_name).filter(Boolean))]
  const src            = posterSrc(movie?.poster_url ?? null)
  const locationDisplay = selectedTheater
    ? `${selectedTheater.name}, ${selectedTheater.address}`
    : "Select a theater"

  if (loading) return <div className="md-loading">Loading…</div>
  if (error)   return <div className="md-error">{error} <button onClick={() => navigate(-1)}>Go Back</button></div>
  if (!movie)  return null

  return (
    <div className="md-wrapper">

      {/* Hero */}
      <div className="md-hero" style={{ backgroundImage: src && !posterErr ? `url(${src})` : "none" }}>
        <div className="md-hero-overlay" />
        <div className="md-hero-content">
          <div className="md-poster-wrap">
            {src && !posterErr ? (
              <img src={src} alt={movie.title} className="md-poster-img" onError={() => setPosterErr(true)} />
            ) : (
              <div className="md-poster-fallback"><i className="fa-solid fa-film" /></div>
            )}
          </div>

          <div className="md-info">
            <h1 className="md-title">{movie.title}</h1>
            {movie.description && <p className="md-description">{movie.description}</p>}

            <div className="md-meta-table">
              <div className="md-meta-row">
                <span className="md-meta-key">Category</span>
                <span className="md-meta-sep">:</span>
                <span className="md-meta-val">{movie.category}</span>
              </div>
              {movie.genre && (
                <div className="md-meta-row">
                  <span className="md-meta-key">Genre</span>
                  <span className="md-meta-sep">:</span>
                  <span className="md-meta-val">{movie.genre}</span>
                </div>
              )}
              {movie.release_date && (
                <div className="md-meta-row">
                  <span className="md-meta-key">Release</span>
                  <span className="md-meta-sep">:</span>
                  <span className="md-meta-val">{movie.release_date}</span>
                </div>
              )}
              {movie.language && (
                <div className="md-meta-row">
                  <span className="md-meta-key">Language</span>
                  <span className="md-meta-sep">:</span>
                  <span className="md-meta-val">{movie.language}</span>
                </div>
              )}
              {movie.duration_mins && (
                <div className="md-meta-row">
                  <span className="md-meta-key">Duration</span>
                  <span className="md-meta-sep">:</span>
                  <span className="md-meta-val">{movie.duration_mins} min</span>
                </div>
              )}
            </div>

            <div className="md-action-btns">
              <button className="md-showtime-btn"
                onClick={() => document.getElementById("md-showtime-section")?.scrollIntoView({ behavior: "smooth" })}>
                <i className="fa-solid fa-clock" /> Show Time
              </button>
              {movie.trailer_url && (
                <a href={movie.trailer_url} target="_blank" rel="noreferrer" className="md-trailer-btn">
                  <i className="fa-solid fa-circle-play" /> Watch Trailer
                </a>
              )}
              {isAdmin && (
                <button className="md-edit-btn"
                  onClick={() => navigate("/admin", { state: { editMovieId: movie.id } })}>
                  <i className="fa-solid fa-pen" /> Edit Movie
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtime Section */}
      <div className="md-showtime-section" id="md-showtime-section">
        <div className="md-showtime-header">
          <div className="md-showtime-title-row">
            <h2 className="md-showtime-title">Showtime</h2>
            {/* ── Selected theater shown here ── */}
            <div className="md-location">
              <i className="fa-solid fa-location-dot" />
              <span>[ {locationDisplay} ]</span>
            </div>
          </div>

          {allHalls.length > 0 && (
            <div className="md-hall-legend">
              {allHalls.map(hall => (
                <div key={hall} className="md-hall-badge">
                  <span className="md-hall-dot" style={{ background: getHallColor(hall) }} />
                  {hall}
                </div>
              ))}
            </div>
          )}
        </div>

        {screenings.length === 0 ? (
          <p className="md-no-screenings">No screenings scheduled this week.</p>
        ) : (
          <div className="md-schedule-grid">
            {WEEK_DAYS.map(({ dateStr, fullDay, ordDate, month, year }) => {
              const dayScreenings = getScreeningsForDay(dateStr)
              return (
                <div key={dateStr} className="md-day-col">
                  <div className="md-day-header">
                    <div className="md-day-name">{fullDay}</div>
                    <div className="md-day-date">{ordDate}, {month} {year}</div>
                  </div>
                  <div className="md-slots">
                    {dayScreenings.length === 0 ? (
                      <div className="md-no-show">—</div>
                    ) : (
                      dayScreenings.map(s => (
                        <button key={s.id} className="md-time-btn"
                          style={{ background: getHallColor(s.hall_name) }}
                          title={`${s.hall_name} — ${s.available_seats} seats`}>
                          <i className="fa-solid fa-ticket" /> {formatTime(s.start_time)}
                        </button>
                      ))
                    )}
                  </div>
                  {dayScreenings.length > 0 && (
                    <button
                      className={`md-get-ticket-btn ${isAdmin ? "md-admin-btn" : ""}`}
                      onClick={() => isAdmin
                        ? navigate("/admin", { state: { editMovieId: movie.id } })
                        : navigate(`/book/${movie.id}`)
                      }
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
        )}
      </div>

      <div className="md-footer">Copyright© 2026 CineBook Limited. All Rights Reserved.</div>
    </div>
  )
}