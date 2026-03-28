import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useBranch } from "../context/BranchContext"
import "../CSSfiles/Bookticket.css"
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
  status: string
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
const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"

const ROWS = ["A","B","C","D","E","F","G","H","I","J","K","L"]
const COLS = 14

type SeatStatus = "available" | "selected" | "taken"

const SEAT_COLORS: Record<SeatStatus, string> = {
  available: "#4CAF50",
  selected:  "#FF9800",
  taken:     "#9E9E9E",
}

const LEGEND = [
  { color: "#4CAF50", label: "Available" },
  { color: "#FF9800", label: "Selected"  },
  { color: "#9E9E9E", label: "Taken"     },
]

const PRICES: Record<string, number> = {
  "Premium":       815,
  "Semi-recliner": 615,
}

const formatTime = (time: string): string => {
  const [h, m] = time.split(":")
  const hour   = parseInt(h)
  const ampm   = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${String(hour12).padStart(2, "0")}:${m} ${ampm}`
}

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAY_SHORT   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

const formatDateLabel = (dateStr: string): { display: string; day: string } => {
  const d = new Date(dateStr + "T00:00:00")
  return {
    display: `${String(d.getDate()).padStart(2,"0")} ${MONTH_SHORT[d.getMonth()]}`,
    day:     DAY_SHORT[d.getDay()],
  }
}

const generateSeats = (): Record<string, SeatStatus> => {
  const takenSeats = new Set([
    "A3","A4","B6","B7","C2","C8","D5","E9","F3","F4","F5",
    "G7","G8","H1","H2","I6","J3","J4","K9","L5","L6","L7",
  ])
  const map: Record<string, SeatStatus> = {}
  ROWS.forEach(row => {
    for (let c = 1; c <= COLS; c++) {
      const key = `${row}${c}`
      map[key] = takenSeats.has(key) ? "taken" : "available"
    }
  })
  return map
}

function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false)
  const src = movie.poster_url
    ? movie.poster_url.startsWith("/") ? `${BACKEND}${movie.poster_url}` : movie.poster_url
    : ""

  if (!src || failed) {
    return <div className="summary-poster-fallback"><i className="fa-solid fa-film" /></div>
  }
  return <img src={src} alt={movie.title} className="summary-poster" onError={() => setFailed(true)} />
}

function Section({ title, children, className }: {
  title: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`book-section${className ? ` ${className}` : ""}`}>
      <h3>{title}</h3>
      <div className="book-section-body">{children}</div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────
export default function BookTicket() {
  const { id }              = useParams<{ id: string }>()
  const navigate            = useNavigate()
  const { selectedTheater } = useBranch()           // ← branch context

  const [movie,             setMovie]             = useState<Movie | null>(null)
  const [screenings,        setScreenings]        = useState<Screening[]>([])
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState("")
  const [selectedDate,      setSelectedDate]      = useState("")
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [seatType,          setSeatType]          = useState<"Premium" | "Semi-recliner">("Premium")
  const [quantity,          setQuantity]          = useState(1)
  const [seats,             setSeats]             = useState<Record<string, SeatStatus>>(generateSeats)
  const [selectedSeats,     setSelectedSeats]     = useState<string[]>([])

  useEffect(() => {
    if (!id) return
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

        const found = moviesData.movies.find((m: Movie) => m.id === parseInt(id))
        if (!found) throw new Error("Movie not found.")

        const movieScreenings: Screening[] = screeningsData.screenings.filter(
          (s: Screening) => s.movie_id === parseInt(id)
        )
        setMovie(found)
        setScreenings(movieScreenings)

        if (movieScreenings.length > 0) {
          const sorted = [...movieScreenings].sort((a, b) =>
            a.show_date.localeCompare(b.show_date) || a.start_time.localeCompare(b.start_time)
          )
          setSelectedDate(sorted[0].show_date)
          setSelectedScreening(sorted[0])
        }
      } catch (err: any) {
        setError(err.message || "Failed to load booking data.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const availableDates    = [...new Set(screenings.map(s => s.show_date))].sort()
  const screeningsForDate = screenings
    .filter(s => s.show_date === selectedDate)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const PRICE = PRICES[seatType]
  const TOTAL = selectedSeats.length * PRICE

  // ── Location display from selected theater ──
  const locationDisplay = selectedTheater ? selectedTheater.name : "—"
  const locationAddress = selectedTheater ? selectedTheater.address : "—"

  const toggleSeat = (key: string) => {
    const status = seats[key]
    if (status === "taken") return
    if (status === "selected") {
      setSeats(prev => ({ ...prev, [key]: "available" }))
      setSelectedSeats(prev => prev.filter(k => k !== key))
    } else {
      if (selectedSeats.length >= quantity) return
      setSeats(prev => ({ ...prev, [key]: "selected" }))
      setSelectedSeats(prev => [...prev, key])
    }
  }

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty)
    if (selectedSeats.length > newQty) {
      const toKeep   = selectedSeats.slice(0, newQty)
      const toRemove = selectedSeats.slice(newQty)
      setSeats(prev => {
        const updated = { ...prev }
        toRemove.forEach(k => { updated[k] = "available" })
        return updated
      })
      setSelectedSeats(toKeep)
    }
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    const first = screenings
      .filter(s => s.show_date === date)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))[0]
    setSelectedScreening(first || null)
    setSeats(generateSeats())
    setSelectedSeats([])
  }

  const handleScreeningChange = (screening: Screening) => {
    setSelectedScreening(screening)
    setSeats(generateSeats())
    setSelectedSeats([])
  }

  if (loading) return <div className="book-loading">Loading booking page…</div>
  if (error)   return <div className="book-error">{error}<button onClick={() => navigate(-1)}>Go Back</button></div>
  if (!movie)  return null

  return (
    <div className="book-wrapper">

      {/* Location Bar — uses selected theater */}
      <div className="book-location-bar">
        <div className="book-location-label">
          <i className="fa-solid fa-location-dot" /> {locationDisplay}
        </div>
        <div className="book-location-name">{locationAddress}</div>
      </div>

      <div className="book-main">
        <div className="book-left">

          <Section title="Select Date">
            {availableDates.length === 0 ? (
              <p className="book-empty">No dates available for this movie.</p>
            ) : (
              <div className="date-btn-row">
                {availableDates.map(dateStr => {
                  const { display, day } = formatDateLabel(dateStr)
                  return (
                    <button key={dateStr} onClick={() => handleDateChange(dateStr)}
                      className={`date-btn ${selectedDate === dateStr ? "active" : ""}`}>
                      <div className="date-btn-day">{day}</div>
                      <div>{display.split(" ")[0]}</div>
                      <div className="date-btn-month">{display.split(" ")[1]}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </Section>

          <Section title="Select Showtime">
            {screeningsForDate.length === 0 ? (
              <p className="book-empty">No showtimes for this date.</p>
            ) : (
              <div className="showtime-row">
                <div className="hall-badge">
                  <i className="fa-solid fa-building" /> {selectedScreening?.hall_name || "—"}
                </div>
                {screeningsForDate.map(s => (
                  <button key={s.id} onClick={() => handleScreeningChange(s)}
                    className={`showtime-btn ${selectedScreening?.id === s.id ? "active" : ""}`}
                    title={`${s.available_seats} seats available`}>
                    {formatTime(s.start_time)}
                  </button>
                ))}
              </div>
            )}
          </Section>

          <div className="seat-type-quantity-row">
            <Section title="Select Seat Type">
              {Object.entries(PRICES).map(([type, price]) => (
                <label key={type} className="seat-type-option">
                  <input type="radio" checked={seatType === type}
                    onChange={() => setSeatType(type as "Premium" | "Semi-recliner")} />
                  <span>{type}</span>
                  <span className="seat-type-price">BDT {price}</span>
                </label>
              ))}
            </Section>

            <Section title="Ticket Quantity">
              <div className="quantity-controls">
                <button className="q-btn" onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}>−</button>
                <span className="quantity-label">{quantity} Ticket{quantity > 1 ? "s" : ""}</span>
                <button className="q-btn" onClick={() => handleQuantityChange(Math.min(10, quantity + 1))}>+</button>
              </div>
              <p className="quantity-hint">
                <i className="fa-solid fa-circle-info" /> Select exactly {quantity} seat{quantity > 1 ? "s" : ""} below
              </p>
            </Section>
          </div>

          <Section title="Select Seats">
            <div className="seat-selection-info">
              <span>Selected: <strong>{selectedSeats.length} / {quantity}</strong></span>
              {selectedSeats.length === quantity && (
                <span className="seat-limit-reached"><i className="fa-solid fa-check" /> Limit reached</span>
              )}
            </div>
            <div className="seat-legend">
              {LEGEND.map(({ color, label }) => (
                <span key={label} className="legend-item">
                  <span className="legend-dot" style={{ background: color }} />{label}
                </span>
              ))}
            </div>
            <div className="seat-map-wrapper">
              {ROWS.map(row => (
                <div key={row} className="seat-row">
                  <span className="seat-row-label">{row}</span>
                  {Array.from({ length: COLS }, (_, i) => {
                    const key    = `${row}${i + 1}`
                    const status = seats[key] || "available"
                    const isBlockedByLimit = status === "available" && selectedSeats.length >= quantity
                    return (
                      <button key={key} onClick={() => toggleSeat(key)} title={key}
                        className={`seat-btn ${status}`}
                        style={{
                          background: SEAT_COLORS[status],
                          opacity:    isBlockedByLimit ? 0.35 : 1,
                          cursor:     isBlockedByLimit || status === "taken" ? "not-allowed" : "pointer",
                        }}
                        disabled={status === "taken"}
                        aria-label={`Seat ${key} — ${status}`}
                      />
                    )
                  })}
                </div>
              ))}
              <div className="theatre-screen">THEATRE SCREEN</div>
            </div>
          </Section>
        </div>

        {/* Summary */}
        <div className="book-right">
          <div className="summary-card">
            <div className="summary-header">
              <i className="fa-solid fa-ticket" /> Tickets Summary
            </div>
            <div className="summary-body">
              <div className="summary-movie-row">
                <MoviePoster movie={movie} />
                <div>
                  <div className="summary-movie-title">{movie.title}</div>
                  <div className="summary-movie-genre">{movie.genre || "—"}</div>
                  <div className="summary-movie-category">{movie.category}</div>
                </div>
              </div>

              <div className="summary-details">
                {[
                  ["Theater",        locationDisplay],
                  ["Location",       locationAddress],
                  ["Show Date",      selectedDate || "—"],
                  ["Hall",           selectedScreening?.hall_name || "—"],
                  ["Show Time",      selectedScreening ? formatTime(selectedScreening.start_time) : "—"],
                  ["Seat Type",      seatType],
                  ["Tickets",        `${quantity}`],
                  ["Selected Seats", selectedSeats.length > 0 ? selectedSeats.join(", ") : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="summary-row">
                    <span className="summary-row-key">{k}</span>
                    <span className="summary-row-value">{v}</span>
                  </div>
                ))}
                <div className="summary-total">
                  <span>Total Amount</span>
                  <span className="summary-total-amount">{TOTAL.toLocaleString()} BDT</span>
                </div>
              </div>

              <button className="purchase-btn"
                disabled={selectedSeats.length !== quantity || !selectedScreening}
                title={selectedSeats.length !== quantity ? `Please select ${quantity} seat(s)` : ""}>
                <i className="fa-solid fa-credit-card" /> PURCHASE TICKET
              </button>

              {selectedSeats.length !== quantity && (
                <p className="purchase-hint">
                  Please select {quantity - selectedSeats.length} more seat{quantity - selectedSeats.length !== 1 ? "s" : ""} to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="book-footer">Copyright© 2026 CineBook Limited. All Rights Reserved.</div>
    </div>
  )
}