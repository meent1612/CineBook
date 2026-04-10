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
const BACKEND  = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"

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

// ── 7-day window ───────────────────────────────────────
const WEEK_DATES = new Set(
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const yyyy = d.getFullYear()
    const mm   = String(d.getMonth() + 1).padStart(2, "0")
    const dd   = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  })
)

const formatTime = (time: string): string => {
  const [h, m] = time.split(":")
  const hour   = parseInt(h)
  const ampm   = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${String(hour12).padStart(2, "0")}:${m} ${ampm}`
}

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

// ── Taper ratios per seat type ─────────────────────────
// VIP rows (closest to screen) are narrow on sides → fan/wedge shape
// Standard rows (furthest) are wide on sides
const TAPER: Record<SeatTypeKey, { l: number; r: number }> = {
  vip:           { l: 0.13, r: 0.13 },   // left=4, right=4  of 31
  premium:       { l: 0.16, r: 0.16 },   // left=5, right=5  of 31
  semi_recliner: { l: 0.22, r: 0.22 },   // left=7, right=7  of 31
  standard:      { l: 0.28, r: 0.28 },   // left=8, right=8  of 30
}

// ── Split a row into left / center / right ─────────────
// Uses seat_type-aware taper so VIP rows appear narrower on sides (fan shape)
const splitRow = (seats: ApiSeat[]): { left: ApiSeat[]; center: ApiSeat[]; right: ApiSeat[] } => {
  if (seats.length === 0) return { left: [], center: [], right: [] }
  const sorted = [...seats].sort((a, b) => a.seat_number - b.seat_number)
  const total  = sorted.length
  // Use the seat type of the first seat in the row (all seats in a row share same type)
  const stype  = sorted[0].seat_type
  const ratio  = TAPER[stype] ?? { l: 0.28, r: 0.28 }
  const lCount = Math.round(total * ratio.l)
  const rCount = Math.round(total * ratio.r)
  return {
    left:   sorted.slice(0, lCount),
    center: sorted.slice(lCount, total - rCount),
    right:  sorted.slice(total - rCount),
  }
}

// ── AI Seat Recommendation ─────────────────────────────
interface RecommendResult {
  seats:  string[]
  reason: string
}

const recommendSeats = (
  seatsByRow:    Record<string, ApiSeat[]>,
  seatStatusMap: Record<string, LocalSeatStatus>,
  seatTypeMap:   Record<string, SeatTypeKey>,
  seatType:      SeatTypeKey,
  quantity:      number,
): RecommendResult => {
  const rows      = Object.keys(seatsByRow).sort()
  const totalRows = rows.length
  if (totalRows === 0) return { seats: [], reason: "No seat data available." }

  const idealRowIndex = Math.round(totalRows * 0.65)

  let bestBlock:    string[] = []
  let bestScore:    number   = -Infinity
  let bestRowLabel: string   = ""

  rows.forEach((rowLabel, rowIndex) => {
    const seats = seatsByRow[rowLabel]
    if (!seats || seats.length === 0) return

    const rowScore = 1 - Math.abs(rowIndex - idealRowIndex) / totalRows

    const availableSeats = seats.filter(s =>
      s.seat_type === seatType &&
      (seatStatusMap[s.seat_label] === "available" || !seatStatusMap[s.seat_label])
    )
    if (availableSeats.length < quantity) return

    const sorted    = [...availableSeats].sort((a, b) => a.seat_number - b.seat_number)
    const totalCols = seats.length
    const centerCol = totalCols / 2

    for (let i = 0; i <= sorted.length - quantity; i++) {
      const block = sorted.slice(i, i + quantity)
      const isConsecutive = block.every((s, idx) =>
        idx === 0 || s.seat_number === block[idx - 1].seat_number + 1
      )
      if (!isConsecutive) continue

      const blockCenter = (block[0].seat_number + block[block.length - 1].seat_number) / 2
      const colScore    = 1 - Math.abs(blockCenter - centerCol) / totalCols
      const totalScore  = rowScore * 0.6 + colScore * 0.4

      if (totalScore > bestScore) {
        bestScore    = totalScore
        bestBlock    = block.map(s => s.seat_label)
        bestRowLabel = rowLabel
      }
    }
  })

  if (bestBlock.length === 0) {
    return {
      seats:  [],
      reason: `No group of ${quantity} consecutive ${SEAT_TYPE_DISPLAY[seatType]} seats available.`,
    }
  }

  const rowPosition =
    rows.indexOf(bestRowLabel) < totalRows * 0.35 ? "front"
    : rows.indexOf(bestRowLabel) < totalRows * 0.65 ? "middle"
    : "back"

  const reason =
    `Row ${bestRowLabel} (${rowPosition} section) — centered for the best screen angle` +
    (quantity > 1 ? `, ${quantity} seats together` : "")

  return { seats: bestBlock, reason }
}

// ── Sub-components ─────────────────────────────────────
function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false)
  const src = movie.poster_url
    ? movie.poster_url.startsWith("/") ? `${BACKEND}${movie.poster_url}` : movie.poster_url
    : ""
  if (!src || failed) {
    return <div className="summary-poster-fallback"><i className="fa-solid fa-film" /></div>
  }
  return (
    <img
      src={src}
      alt={movie.title}
      className="summary-poster"
      onError={() => setFailed(true)}
    />
  )
}

function Section({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
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

  const [aiRecommendedSeats, setAiRecommendedSeats] = useState<string[]>([])
  const [aiReason,           setAiReason]           = useState("")
  const [aiLoading,          setAiLoading]          = useState(false)

  // ── Load movie + screenings ────────────────────────────
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

        // ── Only pick the first screening within the 7-day window ──
        const weekScreenings = movieScreenings.filter(s => WEEK_DATES.has(s.show_date))
        // Fallback to nearest future screening if none in 7-day window
        const today = new Date().toISOString().split("T")[0]
        const futureScreenings = movieScreenings
          .filter(s => s.show_date >= today)
          .sort((a, b) => a.show_date.localeCompare(b.show_date) || a.start_time.localeCompare(b.start_time))
        const screeningsToUse = weekScreenings.length > 0 ? weekScreenings : futureScreenings

        if (screeningsToUse.length > 0) {
          const sorted = [...screeningsToUse].sort((a, b) =>
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

  // ── Discount fetch ─────────────────────────────────────
  useEffect(() => {
    const theaterId = selectedTheater?.id ?? 1
    fetch(`${API_URL}/discounts?theater_id=${theaterId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.discounts.length > 0) setDiscount(data.discounts[0])
        else setDiscount(null)
      })
      .catch(() => {})
  }, [selectedTheater])

  // ── Load seats when screening changes ─────────────────
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
      setAvailableTypes([])
    } finally {
      setSeatsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedScreening) return
    fetchSeats(selectedScreening.id)
  }, [selectedScreening?.id])

  useEffect(() => {
    setAiRecommendedSeats([])
    setAiReason("")
  }, [seatType, quantity])

  // ── AI Recommend handler ───────────────────────────────
  const handleRecommendSeats = () => {
    setSeatStatusMap(prev => {
      const updated = { ...prev }
      selectedSeats.forEach(k => { updated[k] = "available" })
      return updated
    })
    setSelectedSeats([])
    setSelectedSeatIds([])
    setAiRecommendedSeats([])
    setAiReason("")
    setAiLoading(true)

    setTimeout(() => {
      const result = recommendSeats(seatsByRow, seatStatusMap, seatTypeMap, seatType, quantity)
      setAiLoading(false)

      if (result.seats.length === 0) {
        setAiReason(result.reason)
        return
      }

      setSeatStatusMap(prev => {
        const updated = { ...prev }
        result.seats.forEach(k => { updated[k] = "selected" })
        return updated
      })
      setSelectedSeats(result.seats)
      setSelectedSeatIds(result.seats.map(k => seatIdMap[k]))
      setAiRecommendedSeats(result.seats)
      setAiReason(result.reason)

      if (user && token && selectedScreening) {
        const ids = result.seats.map(k => seatIdMap[k])
        fetch(`${API_URL}/seats/lock`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body:    JSON.stringify({ screening_id: selectedScreening.id, seat_ids: ids }),
        }).catch(() => {})
      }
    }, 300)
  }

  // ── Effective price with discount ──────────────────────
  const getEffectivePrice = (type: SeatTypeKey): number => {
    if (!discount) return PRICES[type]
    const pctMap: Record<SeatTypeKey, number> = {
      standard:      discount.standard_pct,
      semi_recliner: discount.semi_recliner_pct,
      premium:       discount.premium_pct,
      vip:           discount.vip_pct,
    }
    const pct = pctMap[type] || 0
    return pct > 0 ? Math.round(PRICES[type] * (1 - pct / 100)) : PRICES[type]
  }

  // ── Derived values ─────────────────────────────────────
  const availableDates = [...new Set(screenings.map(s => s.show_date))]
    .filter(d => WEEK_DATES.has(d))
    .sort()

  const screeningsForDate = screenings
    .filter(s => s.show_date === selectedDate)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const TOTAL = selectedSeats.length * PRICES[seatType]

  const locationDisplay = selectedTheater ? selectedTheater.name    : "—"
  const locationAddress = selectedTheater ? selectedTheater.address : "—"

  // ── Seat toggling ──────────────────────────────────────
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

  // ── Purchase ───────────────────────────────────────────
  const handlePurchase = () => {
    if (!user || !token) { navigate("/login"); return }
    if (!selectedScreening || selectedSeatIds.length === 0 || !movie) return

    navigate("/payment", {
      state: {
        movieTitle:     movie.title,
        movieCategory:  movie.category,
        movieGenre:     movie.genre || "—",
        theaterName:    locationDisplay,
        theaterAddress: locationAddress,
        hallName:       getHallName(selectedScreening),
        showDate:       selectedDate,
        showTime:       formatTime(selectedScreening.start_time),
        seatType:       SEAT_TYPE_DISPLAY[seatType],
        seatLabels:     selectedSeats,
        seatIds:        selectedSeatIds,
        screeningId:    selectedScreening.id,
        quantity:       quantity,
        unitPrice:      getEffectivePrice(seatType),
        totalAmount:    TOTAL,
      },
    })
  }

  // ── Render a single seat button ────────────────────────
  const renderSeat = (seat: ApiSeat) => {
    const key         = seat.seat_label
    const localStatus = seatStatusMap[key] || "available"
    const isWrongZone = seat.seat_type !== seatType
    const isTaken     = localStatus === "taken"
    const isSelected  = localStatus === "selected"
    const isAiPick    = aiRecommendedSeats.includes(key)
    const atLimit     = localStatus === "available" && !isWrongZone && selectedSeats.length >= quantity

    let bg = ZONE_COLORS[seat.seat_type]
    if (isTaken)                 bg = "#9E9E9E"
    if (isSelected && !isAiPick) bg = "#FF9800"
    if (isSelected && isAiPick)  bg = "#22c55e"

    const opacity = isTaken ? 0.5 : isWrongZone ? 0.25 : atLimit ? 0.4 : 1
    const cursor  = isTaken || isWrongZone || atLimit ? "not-allowed" : "pointer"
    const outline = isAiPick && isSelected ? "2px solid #16a34a" : "none"

    return (
      <button
        key={key}
        onClick={() => toggleSeat(key)}
        title={`${key} — ${SEAT_TYPE_DISPLAY[seat.seat_type]} — BDT ${seat.price}${
          isTaken      ? " — Taken"
          : isSelected ? (isAiPick ? " — AI Recommended" : " — Selected")
          : ""
        }`}
        className={`seat-btn ${localStatus}`}
        style={{ background: bg, opacity, cursor, outline, outlineOffset: "1px" }}
        disabled={isTaken}
        aria-label={`Seat ${key}${isAiPick ? ", AI recommended" : ""}`}
      />
    )
  }

  // ── Render guards ──────────────────────────────────────
  if (loading) return <div className="book-loading">Loading booking page…</div>
  if (error) return (
    <div className="book-error">
      {error}
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  )
  if (!movie) return null

  // Rows A→Z sorted, then REVERSED so that:
  // - Last row (O/N/M = Standard) renders at TOP of the map
  // - Row A (VIP) renders at BOTTOM, closest to the screen bar
  // This matches the inspo where Standard is at top and VIP is at bottom near screen
  const sortedRows = Object.keys(seatsByRow).sort().reverse()

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

          {/* ── Date ── */}
          <Section title="Select Date">
            {availableDates.length === 0 ? (
              <p className="book-empty">No dates available for this movie.</p>
            ) : (
              <div className="date-btn-row">
                {availableDates.map(dateStr => {
                  const { display, day } = formatDateLabel(dateStr)
                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateChange(dateStr)}
                      className={`date-btn ${selectedDate === dateStr ? "active" : ""}`}
                    >
                      <div className="date-btn-day">{day}</div>
                      <div>{display.split(" ")[0]}</div>
                      <div className="date-btn-month">{display.split(" ")[1]}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </Section>

          {/* ── Showtime ── */}
          <Section title="Select Showtime">
            {screeningsForDate.length === 0 ? (
              <p className="book-empty">No showtimes for this date.</p>
            ) : (
              <div className="showtime-row">
                <div className="hall-badge">
                  <i className="fa-solid fa-building" /> {getHallName(selectedScreening)}
                </div>
                {screeningsForDate.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleScreeningChange(s)}
                    className={`showtime-btn ${selectedScreening?.id === s.id ? "active" : ""}`}
                    title={getHallName(s)}
                  >
                    {formatTime(s.start_time)}
                  </button>
                ))}
              </div>
            )}
          </Section>

          {/* ── Seat type + quantity ── */}
          <div className="seat-type-quantity-row">
            <Section title="Select Seat Type">
              {seatsLoading ? (
                <p className="book-empty">Loading…</p>
              ) : availableTypes.length === 0 ? (
                <p className="book-empty">No seat types available.</p>
              ) : (
                availableTypes.map(type => (
                  <label key={type} className="seat-type-option">
                    <input
                      type="radio"
                      checked={seatType === type}
                      onChange={() => handleSeatTypeChange(type)}
                    />
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

          {/* ── AI Recommendation ── */}
          <Section title="AI Seat Recommendation">
            <div className="ai-recommend-wrapper">
              <p className="ai-recommend-desc">
                <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: "0.4rem", color: "#a855f7" }} />
                Let our AI pick the <strong>best available seats</strong> for you based on screen
                size, viewing angle, and your party size.
              </p>

              <button
                className="ai-recommend-btn"
                onClick={handleRecommendSeats}
                disabled={seatsLoading || aiLoading || Object.keys(seatsByRow).length === 0}
                aria-label="Get AI seat recommendation"
              >
                {aiLoading ? (
                  <><i className="fa-solid fa-spinner fa-spin" /> Finding best seats…</>
                ) : (
                  <><i className="fa-solid fa-wand-magic-sparkles" /> Recommend Best Seats</>
                )}
              </button>

              {aiReason && (
                <div
                  className={`ai-result-banner ${aiRecommendedSeats.length > 0 ? "ai-result-success" : "ai-result-error"}`}
                  role="status"
                  aria-live="polite"
                >
                  {aiRecommendedSeats.length > 0 ? (
                    <>
                      <i className="fa-solid fa-circle-check" style={{ color: "#22c55e", marginRight: "0.4rem" }} />
                      <span>
                        <strong>Recommended: </strong>
                        {aiRecommendedSeats.join(", ")}
                        <span className="ai-reason-text"> — {aiReason}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-exclamation" style={{ color: "#f97316", marginRight: "0.4rem" }} />
                      {aiReason}
                    </>
                  )}
                </div>
              )}

              {aiRecommendedSeats.length > 0 && (
                <p className="ai-manual-hint">
                  You can keep these seats or click any seat below to pick manually.
                </p>
              )}
            </div>
          </Section>

          {/* ── Seat Map ── */}
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

                {/* ── Screen at the TOP ── */}
                <div className="theatre-screen-top">
                  <div className="theatre-screen-bar" />
                  <div className="theatre-screen-label">▲ SCREEN</div>
                </div>

                {/* ── Three-section hall ── */}
                {/* sortedRows is reversed: Standard rows (O/N/M) at top, VIP (A/B) at bottom */}
                <div className="seat-hall">

                  {/* WALL LEFT */}
                  <div className="hall-wall">WALL</div>

                  {/* LEFT SECTION — tapered (fewer seats for VIP, more for Standard) */}
                  <div className="hall-section hall-section-left">
                    {sortedRows.map(row => {
                      const { left } = splitRow(seatsByRow[row])
                      if (left.length === 0) return null
                      return (
                        <div key={row} className="seat-row seat-row-left">
                          <span className="seat-row-label">{row}</span>
                          {left.map(seat => renderSeat(seat))}
                        </div>
                      )
                    })}
                  </div>

                  {/* AISLE LEFT */}
                  <div className="hall-aisle">
                    {"AISLE".split("").map((ch, i) => <span key={i}>{ch}</span>)}
                  </div>

                  {/* CENTER SECTION */}
                  <div className="hall-section hall-section-center">
                    {sortedRows.map(row => {
                      const { center } = splitRow(seatsByRow[row])
                      if (center.length === 0) return null
                      return (
                        <div key={row} className="seat-row seat-row-center">
                          {center.map(seat => renderSeat(seat))}
                        </div>
                      )
                    })}
                  </div>

                  {/* AISLE RIGHT */}
                  <div className="hall-aisle">
                    {"AISLE".split("").map((ch, i) => <span key={i}>{ch}</span>)}
                  </div>

                  {/* RIGHT SECTION — tapered */}
                  <div className="hall-section hall-section-right">
                    {sortedRows.map(row => {
                      const { right } = splitRow(seatsByRow[row])
                      if (right.length === 0) return null
                      return (
                        <div key={row} className="seat-row seat-row-right">
                          {right.map(seat => renderSeat(seat))}
                        </div>
                      )
                    })}
                  </div>

                  {/* WALL RIGHT */}
                  <div className="hall-wall hall-wall-right">WALL</div>

                </div>

              </div>
            )}
          </Section>

        </div>

        {/* ── Summary card ── */}
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
                {([
                  ["Theater",        locationDisplay],
                  ["Location",       locationAddress],
                  ["Show Date",      selectedDate || "—"],
                  ["Hall",           getHallName(selectedScreening)],
                  ["Show Time",      selectedScreening ? formatTime(selectedScreening.start_time) : "—"],
                  ["Seat Type",      SEAT_TYPE_DISPLAY[seatType]],
                  ["Tickets",        `${quantity}`],
                  ["Selected Seats", selectedSeats.length > 0 ? selectedSeats.join(", ") : "—"],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="summary-row">
                    <span className="summary-row-key">{k}</span>
                    <span className="summary-row-value">{v}</span>
                  </div>
                ))}

                {aiRecommendedSeats.length > 0 &&
                  selectedSeats.length > 0 &&
                  aiRecommendedSeats.every(s => selectedSeats.includes(s)) && (
                  <div className="summary-ai-badge">
                    <i className="fa-solid fa-wand-magic-sparkles" /> AI Recommended
                  </div>
                )}

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
                  Please select {quantity - selectedSeats.length} more seat
                  {quantity - selectedSeats.length !== 1 ? "s" : ""} to continue
                </p>
              )}

            </div>
          </div>
        </div>
      </div>

      <div className="book-footer">
        Copyright© 2026 CineBook Limited. All Rights Reserved.
      </div>
    </div>
  )
}