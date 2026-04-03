import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useBranch } from "../context/BranchContext"
import { useAuth } from "../context/AuthContext"
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
  hall_name: string | null
  hall?: { id: number; name: string; capacity: number }
  available_seats: number
}

interface ApiSeat {
  id: number
  row_label: string
  seat_number: number
  seat_type: SeatTypeKey
  seat_label: string
  status: "available" | "taken" | "locked"
  price: number
}

type SeatTypeKey     = "standard" | "semi_recliner" | "premium" | "vip"
type LocalSeatStatus = "available" | "selected" | "taken"

// ── Constants ──────────────────────────────────────────
const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"

const TYPE_ORDER: SeatTypeKey[] = ["standard", "semi_recliner", "premium", "vip"]

const SEAT_TYPE_DISPLAY: Record<SeatTypeKey, string> = {
  standard:      "Standard",
  semi_recliner: "Semi-Recliner",
  premium:       "Premium",
  vip:           "VIP",
}

const PRICES: Record<SeatTypeKey, number> = {
  standard:      400,
  semi_recliner: 615,
  premium:       815,
  vip:           1200,
}

const ZONE_COLORS: Record<SeatTypeKey, string> = {
  standard:      "#2196F3",
  semi_recliner: "#9C27B0",
  premium:       "#c8a96e",
  vip:           "#6B1829",
}

const LEGEND_ITEMS = [
  { color: "#2196F3", label: "Standard"      },
  { color: "#9C27B0", label: "Semi-Recliner" },
  { color: "#c8a96e", label: "Premium"       },
  { color: "#6B1829", label: "VIP"           },
  { color: "#FF9800", label: "Selected"      },
  { color: "#9E9E9E", label: "Taken"         },
]

const formatTime = (time: string): string => {
  const [h, m] = time.split(":")
  const hour   = parseInt(h)
  const ampm   = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${String(hour12).padStart(2, "0")}:${m} ${ampm}`
}

// Reads hall name from either hall_name (flat) or hall.name (nested)
const getHallName = (screening: Screening | null): string => {
  if (!screening) return "—"
  return screening.hall_name || screening.hall?.name || "—"
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
  const { selectedTheater } = useBranch()
  const { user, token }     = useAuth()

  const [movie,             setMovie]             = useState<Movie | null>(null)
  const [screenings,        setScreenings]        = useState<Screening[]>([])
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState("")
  const [selectedDate,      setSelectedDate]      = useState("")
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)

  const [seatsByRow,     setSeatsByRow]     = useState<Record<string, ApiSeat[]>>({})
  const [seatStatusMap,  setSeatStatusMap]  = useState<Record<string, LocalSeatStatus>>({})
  const [seatIdMap,      setSeatIdMap]      = useState<Record<string, number>>({})
  const [seatTypeMap,    setSeatTypeMap]    = useState<Record<string, SeatTypeKey>>({})
  const [availableTypes, setAvailableTypes] = useState<SeatTypeKey[]>([])
  const [seatsLoading,   setSeatsLoading]   = useState(false)

  const [seatType,        setSeatType]        = useState<SeatTypeKey>("standard")
  const [quantity,        setQuantity]        = useState(1)
  const [selectedSeats,   setSelectedSeats]   = useState<string[]>([])
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([])

  // ── Load movie + screenings ──────────────────────────
  useEffect(() => {
    if (!id) return
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
  }, [id, selectedTheater])

  // ── Load seats when screening changes ────────────────
  const fetchSeats = useCallback(async (screeningId: number) => {
    setSeatsLoading(true)
    try {
      const res  = await fetch(`${API_URL}/seats/${screeningId}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      const statusMap: Record<string, LocalSeatStatus> = {}
      const idMap:     Record<string, number>           = {}
      const typeMap:   Record<string, SeatTypeKey>      = {}
      const rows:      Record<string, ApiSeat[]>        = {}
      const typesFound = new Set<SeatTypeKey>()

      Object.entries(data.seats as Record<string, ApiSeat[]>).forEach(([row, seats]) => {
        rows[row] = seats
        seats.forEach(seat => {
          const local: LocalSeatStatus = seat.status === "available" ? "available" : "taken"
          statusMap[seat.seat_label] = local
          idMap[seat.seat_label]     = seat.id
          typeMap[seat.seat_label]   = seat.seat_type
          typesFound.add(seat.seat_type)
        })
      })

      setSeatsByRow(rows)
      setSeatStatusMap(statusMap)
      setSeatIdMap(idMap)
      setSeatTypeMap(typeMap)
      setSelectedSeats([])
      setSelectedSeatIds([])

      const orderedTypes = TYPE_ORDER.filter(t => typesFound.has(t))
      setAvailableTypes(orderedTypes)
      setSeatType(prev => orderedTypes.includes(prev) ? prev : (orderedTypes[0] ?? "standard"))
    } catch {
      setSeatsByRow({})
    } finally {
      setSeatsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedScreening) return
    fetchSeats(selectedScreening.id)
  }, [selectedScreening?.id])

  // ── Derived values ────────────────────────────────────
  const availableDates    = [...new Set(screenings.map(s => s.show_date))].sort()
  const screeningsForDate = screenings
    .filter(s => s.show_date === selectedDate)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const TOTAL = selectedSeats.length * PRICES[seatType]

  const locationDisplay = selectedTheater ? selectedTheater.name    : "—"
  const locationAddress = selectedTheater ? selectedTheater.address : "—"

  // ── Seat toggling ─────────────────────────────────────
  const toggleSeat = async (key: string) => {
    const localStatus  = seatStatusMap[key] || "available"
    const thisSeatType = seatTypeMap[key]

    if (localStatus === "taken")   return
    if (thisSeatType !== seatType) return

    if (localStatus === "selected") {
      setSeatStatusMap(prev => ({ ...prev, [key]: "available" }))
      setSelectedSeats(prev => prev.filter(k => k !== key))
      setSelectedSeatIds(prev => prev.filter(id => id !== seatIdMap[key]))

      if (user && token && selectedScreening) {
        fetch(`${API_URL}/seats/unlock`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body:    JSON.stringify({ screening_id: selectedScreening.id, seat_ids: [seatIdMap[key]] }),
        }).catch(() => {})
      }
    } else {
      if (selectedSeats.length >= quantity) return

      if (user && token && selectedScreening) {
        try {
          const res = await fetch(`${API_URL}/seats/lock`, {
            method:  "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body:    JSON.stringify({ screening_id: selectedScreening.id, seat_ids: [seatIdMap[key]] }),
          })
          if (res.status === 409) {
            fetchSeats(selectedScreening.id)
            return
          }
        } catch {
          // network error — still allow selection
        }
      }

      setSeatStatusMap(prev => ({ ...prev, [key]: "selected" }))
      setSelectedSeats(prev => [...prev, key])
      setSelectedSeatIds(prev => [...prev, seatIdMap[key]])
    }
  }

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty)
    if (selectedSeats.length > newQty) {
      const toKeep   = selectedSeats.slice(0, newQty)
      const toRemove = selectedSeats.slice(newQty)
      setSeatStatusMap(prev => {
        const updated = { ...prev }
        toRemove.forEach(k => { updated[k] = "available" })
        return updated
      })
      setSelectedSeats(toKeep)
      setSelectedSeatIds(prev => prev.slice(0, newQty))
    }
  }

  const handleSeatTypeChange = (type: SeatTypeKey) => {
    setSeatStatusMap(prev => {
      const updated = { ...prev }
      selectedSeats.forEach(k => { updated[k] = "available" })
      return updated
    })
    setSelectedSeats([])
    setSelectedSeatIds([])
    setSeatType(type)
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    const first = screenings
      .filter(s => s.show_date === date)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))[0]
    setSelectedScreening(first || null)
  }

  const handleScreeningChange = (screening: Screening) => {
    setSelectedScreening(screening)
  }

  // ── Purchase — redirects to home (payment in checkpoint 3) ──
  const handlePurchase = () => {
    if (!user || !token) { navigate("/login"); return }
    if (!selectedScreening || selectedSeatIds.length === 0) return
    navigate("/")
  }

  // ── Render guards ─────────────────────────────────────
  if (loading) return <div className="book-loading">Loading booking page…</div>
  if (error)   return (
    <div className="book-error">{error}<button onClick={() => navigate(-1)}>Go Back</button></div>
  )
  if (!movie)  return null

  return (
    <div className="book-wrapper">

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
                  <i className="fa-solid fa-building" /> {getHallName(selectedScreening)}
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
              {availableTypes.length === 0 ? (
                <p className="book-empty">Loading…</p>
              ) : (
                availableTypes.map(type => (
                  <label key={type} className="seat-type-option">
                    <input type="radio" checked={seatType === type}
                      onChange={() => handleSeatTypeChange(type)} />
                    <span style={{
                      display: "inline-block", width: "10px", height: "10px",
                      borderRadius: "2px", background: ZONE_COLORS[type], flexShrink: 0,
                    }} />
                    <span>{SEAT_TYPE_DISPLAY[type]}</span>
                    <span className="seat-type-price">BDT {PRICES[type]}</span>
                  </label>
                ))
              )}
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
                <span className="seat-limit-reached">
                  <i className="fa-solid fa-check" /> Limit reached
                </span>
              )}
            </div>

            <div className="seat-legend">
              {LEGEND_ITEMS.map(({ color, label }) => (
                <span key={label} className="legend-item">
                  <span className="legend-dot" style={{ background: color }} />{label}
                </span>
              ))}
            </div>

            {seatsLoading ? (
              <p className="book-empty" style={{ padding: "1rem 0" }}>
                <i className="fa-solid fa-spinner fa-spin" /> Loading seats…
              </p>
            ) : Object.keys(seatsByRow).length === 0 ? (
              <p className="book-empty">No seat data available.</p>
            ) : (
              <div className="seat-map-wrapper">
                {Object.keys(seatsByRow).sort().map(row => (
                  <div key={row} className="seat-row">
                    <span className="seat-row-label">{row}</span>
                    {seatsByRow[row].map(seat => {
                      const key         = seat.seat_label
                      const localStatus = seatStatusMap[key] || "available"
                      const isWrongZone = seat.seat_type !== seatType
                      const isTaken     = localStatus === "taken"
                      const isSelected  = localStatus === "selected"
                      const atLimit     = localStatus === "available" && !isWrongZone && selectedSeats.length >= quantity

                      let bg = ZONE_COLORS[seat.seat_type]
                      if (isSelected) bg = "#FF9800"
                      if (isTaken)    bg = "#9E9E9E"

                      const opacity = isTaken ? 0.5 : isWrongZone ? 0.18 : atLimit ? 0.35 : 1
                      const cursor  = isTaken || isWrongZone || atLimit ? "not-allowed" : "pointer"

                      return (
                        <button
                          key={key}
                          onClick={() => toggleSeat(key)}
                          title={`${key} — ${SEAT_TYPE_DISPLAY[seat.seat_type]} — BDT ${seat.price}${isTaken ? " — Taken" : isSelected ? " — Selected" : ""}`}
                          className={`seat-btn ${localStatus}`}
                          style={{ background: bg, opacity, cursor }}
                          disabled={isTaken}
                          aria-label={`Seat ${key}`}
                        />
                      )
                    })}
                  </div>
                ))}
                <div className="theatre-screen">THEATRE SCREEN</div>
              </div>
            )}
          </Section>

        </div>

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
                  ["Hall",           getHallName(selectedScreening)],
                  ["Show Time",      selectedScreening ? formatTime(selectedScreening.start_time) : "—"],
                  ["Seat Type",      SEAT_TYPE_DISPLAY[seatType]],
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

              <button
                className="purchase-btn"
                onClick={handlePurchase}
                disabled={selectedSeats.length !== quantity || !selectedScreening}
              >
                {!user
                  ? <><i className="fa-solid fa-lock" /> Login to Purchase</>
                  : <><i className="fa-solid fa-credit-card" /> PURCHASE TICKET</>
                }
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