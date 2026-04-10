import { useState, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../CSSfiles/TicketDetail.css"

// ── Types ──────────────────────────────────────────────
interface Booking {
  id: number
  booking_group_id: string
  movie_title: string
  movie_poster: string | null
  show_date: string
  start_time: string
  hall_name: string
  theater_name: string
  theater_address: string
  seats: string[] | string
  seat_type: string
  unit_price: number
  total_price: number
  status: "upcoming" | "watched" | "cancelled"
  payment_method: "bkash" | "nagad" | "card" | null
  transaction_id: string | null
  booking_date: string
}

// ── Constants ──────────────────────────────────────────
const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND  = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAY_SHORT   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

const PAYMENT_LABEL: Record<string, string> = { bkash: "bKash", nagad: "Nagad", card: "Card" }
const PAYMENT_BG:    Record<string, string> = { bkash: "#fce7f3", nagad: "#fff3e0", card: "#e8edf5" }
const PAYMENT_COLOR: Record<string, string> = { bkash: "#9d174d", nagad: "#92400e", card: "#1e3a5f" }

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Upcoming", watched: "Watched", cancelled: "Cancelled",
}

// ── Seat map layout ────────────────────────────────────
// Rows O (top/standard) → A (bottom/VIP), mirroring the actual hall.
// Each row has [left, center, right] seat counts via taper ratios.
const ALL_ROWS = ["O","N","M","L","K","J","I","H","G","F","E","D","C","B","A"] as const
type RowKey = typeof ALL_ROWS[number]

// Seat type per row (matches BookTicket zone layout)
const ROW_TYPE: Record<RowKey, string> = {
  O: "Standard",      N: "Standard",      M: "Standard",
  L: "Standard",      K: "Standard",      J: "Standard",
  I: "Standard",      H: "Standard",
  G: "Semi-Recliner", F: "Semi-Recliner", E: "Semi-Recliner",
  D: "Premium",       C: "Premium",
  B: "VIP",           A: "VIP",
}

// Total seats per row (center + sides)
const ROW_TOTAL: Record<RowKey, number> = {
  O: 30, N: 30, M: 30, L: 30, K: 30, J: 30, I: 30, H: 30,
  G: 36, F: 36, E: 36,
  D: 28, C: 28,
  B: 22, A: 22,
}

// Taper: VIP has narrower sides (fan/wedge shape), Standard wider sides
const TAPER: Record<string, { l: number; r: number }> = {
  Standard:      { l: 0.28, r: 0.28 },
  "Semi-Recliner": { l: 0.22, r: 0.22 },
  Premium:       { l: 0.16, r: 0.16 },
  VIP:           { l: 0.13, r: 0.13 },
}

// Zone colors matching BookTicket (for reference only — not used in TicketDetail)
const ZONE_COLOR: Record<string, string> = {
  Standard:        "#2196F3",
  "Semi-Recliner": "#9C27B0",
  Premium:         "#c8a96e",
  VIP:             "#6B1829",
}

// ── Build rows from labels ─────────────────────────────
interface SeatCell {
  label: string
  section: "left" | "center" | "right"
  isBought: boolean
}

interface RowData {
  row: RowKey
  type: string
  left:   SeatCell[]
  center: SeatCell[]
  right:  SeatCell[]
}

const buildRows = (boughtSet: Set<string>): RowData[] =>
  ALL_ROWS.map(row => {
    const total  = ROW_TOTAL[row]
    const type   = ROW_TYPE[row]
    const ratio  = TAPER[type] ?? { l: 0.28, r: 0.28 }
    const lCount = Math.round(total * ratio.l)
    const rCount = Math.round(total * ratio.r)
    const cCount = total - lCount - rCount

    const makeCell = (seatNum: number, section: SeatCell["section"]): SeatCell => {
      const label = `${row}${seatNum}`
      return { label, section, isBought: boughtSet.has(label) }
    }

    const left:   SeatCell[] = Array.from({ length: lCount }, (_, i) => makeCell(i + 1, "left"))
    const center: SeatCell[] = Array.from({ length: cCount }, (_, i) => makeCell(lCount + i + 1, "center"))
    const right:  SeatCell[] = Array.from({ length: rCount }, (_, i) => makeCell(lCount + cCount + i + 1, "right"))

    return { row, type, left, center, right }
  })

// ── Helpers ────────────────────────────────────────────
const toArray = (s: string[] | string): string[] =>
  Array.isArray(s) ? s : s ? [s] : []

const formatShowDate = (d: string) => {
  const dt = new Date(d + "T00:00:00")
  return `${DAY_SHORT[dt.getDay()]}, ${String(dt.getDate()).padStart(2,"0")} ${MONTH_SHORT[dt.getMonth()]}`
}

const formatBookingDate = (iso: string) => {
  const d    = new Date(iso)
  const day  = String(d.getDate()).padStart(2,"0")
  const mon  = MONTH_SHORT[d.getMonth()]
  const yr   = d.getFullYear()
  const h    = d.getHours()
  const m    = String(d.getMinutes()).padStart(2,"0")
  const ampm = h >= 12 ? "PM" : "AM"
  const h12  = h % 12 || 12
  return `${day} ${mon} ${yr}, ${String(h12).padStart(2,"0")}:${m} ${ampm}`
}

const formatTime = (t: string) => {
  const [h, m] = t.split(":")
  const hour   = parseInt(h)
  return `${String(hour % 12 || 12).padStart(2,"0")}:${m} ${hour >= 12 ? "PM" : "AM"}`
}

// Deterministic QR pattern from booking_group_id
const makeQrPat = (seed: string): boolean[] => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) { hash = ((hash << 5) - hash) + seed.charCodeAt(i); hash |= 0 }
  const pat: boolean[] = []
  for (let i = 0; i < 49; i++) pat.push(((hash >> (i % 32)) & 1) === 1)
  ;[0,1,2,3,4,5,6,7,14,21,28,35,42,43,44,45,46,47,48].forEach(i => { pat[i] = true })
  return pat
}

// ── Sub-components ─────────────────────────────────────
function MoviePoster({ poster, title }: { poster: string | null; title: string }) {
  const [failed, setFailed] = useState(false)
  const src = poster ? (poster.startsWith("/") ? `${BACKEND}${poster}` : poster) : ""
  if (!src || failed) {
    return <div className="tdt-poster-fallback"><i className="fa-solid fa-film" /></div>
  }
  return <img src={src} alt={title} className="tdt-poster" onError={() => setFailed(true)} />
}

function QRCode({ seed }: { seed: string }) {
  const pat = useMemo(() => makeQrPat(seed), [seed])
  return (
    <div className="tdt-qr" aria-label="Ticket QR code">
      {pat.map((on, i) => <span key={i} className={on ? "tdt-qr-on" : ""} />)}
    </div>
  )
}

// ── Seat Map ───────────────────────────────────────────
// Fan-shaped 3-section layout identical to BookTicket image.
// Bought seats = crimson/orange, all others = grey.
function SeatMap({ boughtSeats }: { boughtSeats: string[] }) {
  const boughtSet = useMemo(() => new Set(boughtSeats), [boughtSeats])
  const rows      = useMemo(() => buildRows(boughtSet), [boughtSet])

  const renderCell = (cell: SeatCell) => (
    <span
      key={cell.label}
      title={cell.label}
      className={`tdt-s ${cell.isBought ? "tdt-s-bought" : "tdt-s-other"}`}
      aria-label={cell.label + (cell.isBought ? " — your seat" : "")}
    />
  )

  // Group rows by type for zone dividers
  let lastType = ""

  return (
    <div className="tdt-seatmap">

      {/* Screen */}
      <div className="tdt-screen-wrap">
        <div className="tdt-screen-bar" />
        <div className="tdt-screen-label">&#9650; SCREEN</div>
      </div>

      {/* Hall */}
      <div className="tdt-hall">
        <div className="tdt-hall-wall">WALL</div>

        <div className="tdt-hall-inner">

          {/* LEFT section */}
          <div className="tdt-hall-sec tdt-hall-left">
            {rows.map(({ row, type, left }) => {
              if (left.length === 0) return null
              const showDivider = type !== lastType
              if (showDivider) lastType = type  // mutate for left pass — reset below
              return (
                <div key={row} className="tdt-seat-row">
                  <span className="tdt-row-lbl">{row}</span>
                  {left.map(renderCell)}
                </div>
              )
            })}
          </div>

          <div className="tdt-hall-aisle"><span className="tdt-aisle-lbl">AISLE</span></div>

          {/* CENTER section */}
          <div className="tdt-hall-sec tdt-hall-center">
            {(() => {
              let _lastType = ""
              return rows.map(({ row, type, center }) => {
                if (center.length === 0) return null
                const showDivider = type !== _lastType
                if (showDivider) _lastType = type
                return (
                  <div key={row} className="tdt-seat-row">
                    {showDivider && (
                      <div className="tdt-zone-label" style={{ color: ZONE_COLOR[type] }}>
                        {type}
                      </div>
                    )}
                    {center.map(renderCell)}
                  </div>
                )
              })
            })()}
          </div>

          <div className="tdt-hall-aisle"><span className="tdt-aisle-lbl">AISLE</span></div>

          {/* RIGHT section */}
          <div className="tdt-hall-sec tdt-hall-right">
            {rows.map(({ row, right }) => {
              if (right.length === 0) return null
              return (
                <div key={row} className="tdt-seat-row tdt-seat-row-right">
                  {right.map(renderCell)}
                  <span className="tdt-row-lbl tdt-row-lbl-r">{row}</span>
                </div>
              )
            })}
          </div>

        </div>

        <div className="tdt-hall-wall tdt-hall-wall-r">WALL</div>
      </div>

      {/* Legend */}
      <div className="tdt-map-legend">
        <span className="tdt-leg"><span className="tdt-leg-dot tdt-leg-other" />Other seats</span>
        <span className="tdt-leg"><span className="tdt-leg-dot tdt-leg-bought" />Your seats</span>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────
export default function TicketDetail() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { token } = useAuth()

  const booking = location.state as Booking | null

  const [cancelling, setCancelling] = useState(false)
  const [cancelMsg,  setCancelMsg]  = useState("")
  const [status,     setStatus]     = useState<Booking["status"]>(booking?.status ?? "upcoming")

  if (!booking) {
    return (
      <div className="tdt-empty">
        <i className="fa-solid fa-ticket" />
        <p>No ticket data found.</p>
        <button onClick={() => navigate("/user")}>Back to dashboard</button>
      </div>
    )
  }

  const seats     = toArray(booking.seats)
  const quantity  = seats.length
  
  return (
    <div className="tdt-wrapper">

      <button className="tdt-back" onClick={() => navigate("/user")}>
        <i className="fa-solid fa-arrow-left" /> Back to my bookings
      </button>

      <div className="tdt-ticket">

        {/* ── Hero ── */}
        <div className="tdt-hero">
          <MoviePoster poster={booking.movie_poster} title={booking.movie_title} />
          <div className="tdt-hero-body">
            <div className="tdt-movie-title">{booking.movie_title}</div>
            <div className="tdt-badge-row">
              <span className="tdt-badge tdt-badge-type">{booking.seat_type}</span>
              <span className={`tdt-badge tdt-badge-status tdt-status-${status}`}>
                <span className="tdt-dot" />{STATUS_LABEL[status] ?? status}
              </span>
            </div>
            <div className="tdt-bid">#{booking.booking_group_id}</div>
            <div className="tdt-bon">Booked {formatBookingDate(booking.booking_date)}</div>
          </div>
        </div>

        {/* ── Crimson strip ── */}
        <div className="tdt-strip">
          {[
            { l: "Date",    v: formatShowDate(booking.show_date)   },
            { l: "Time",    v: formatTime(booking.start_time)      },
            { l: "Hall",    v: booking.hall_name || "—"            },
            { l: "Tickets", v: String(quantity)                    },
          ].map(({ l, v }) => (
            <div key={l} className="tdt-strip-item">
              <span className="tdt-sl">{l}</span>
              <span className="tdt-sv">{v}</span>
            </div>
          ))}
        </div>

        {/* ── Venue ── */}
        <div className="tdt-sec">
          <div className="tdt-sec-title">Venue</div>
          <div className="tdt-grid2">
            <div><div className="tdt-fl">Theater</div><div className="tdt-fv">{booking.theater_name || "—"}</div></div>
            <div><div className="tdt-fl">Location</div><div className="tdt-fv">{booking.theater_address || "—"}</div></div>
          </div>
        </div>

        {/* ── Seats + map ── */}
        <div className="tdt-sec">
          <div className="tdt-sec-title">Your seats</div>

          {/* Seat chips with type label */}
          <div className="tdt-seats">
            {seats.map(s => (
              <div key={s} className="tdt-seat-chip-wrap">
                <span className="tdt-seat-chip">
                  <i className="fa-solid fa-couch" />
                  {s}
                </span>
                <span className="tdt-seat-chip-type">{booking.seat_type}</span>
              </div>
            ))}
          </div>

          <SeatMap boughtSeats={seats} />
        </div>

        {/* ── Payment ── */}
        {(booking.transaction_id || booking.payment_method) && (
          <div className="tdt-sec">
            <div className="tdt-sec-title">Payment</div>
            <div className="tdt-pay-row">
              <div>
                <div className="tdt-fl">Transaction ID</div>
                <div className="tdt-trx">{booking.transaction_id || "—"}</div>
              </div>
              {booking.payment_method && (
                <span className="tdt-method" style={{
                  background: PAYMENT_BG[booking.payment_method]    ?? "#f3f4f6",
                  color:      PAYMENT_COLOR[booking.payment_method] ?? "#374151",
                }}>
                  <i className="fa-solid fa-mobile-screen-button" />
                  {PAYMENT_LABEL[booking.payment_method] ?? booking.payment_method}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Pricing ── */}
        <div className="tdt-pricing">
          <div className="tdt-pr">
            <span>{booking.unit_price.toLocaleString()} BDT × {quantity} ticket{quantity > 1 ? "s" : ""}</span>
            <span>{booking.total_price.toLocaleString()} BDT</span>
          </div>
          <div className="tdt-pr"><span>Convenience charge</span><span>0 BDT</span></div>
          <div className="tdt-ptotal">
            <span>Total paid</span>
            <span>{booking.total_price.toLocaleString()} BDT</span>
          </div>
        </div>

        {/* ── Perforated divider ── */}
        <div className="tdt-perf">
          <div className="tdt-perf-dot tdt-perf-l" />
          <div className="tdt-perf-line" />
          <div className="tdt-perf-dot tdt-perf-r" />
        </div>

        {/* ── QR stub ── */}
        <div className="tdt-qr-row">
          <QRCode seed={booking.booking_group_id} />
          <div>
            <div className="tdt-qr-title">Show this at the counter</div>
            <div className="tdt-qr-desc">Present at the cinema entrance. Valid for one-time entry only.</div>
          </div>
        </div>

        {/* ── Feedback ── */}
        {cancelMsg && (
          <div className={`tdt-msg ${status === "cancelled" ? "tdt-msg-ok" : "tdt-msg-err"}`}>
            <i className={`fa-solid ${status === "cancelled" ? "fa-circle-check" : "fa-circle-exclamation"}`} />
            {cancelMsg}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="tdt-actions">
          <button className="tdt-btn" onClick={() => window.print()}>
            <i className="fa-solid fa-download" /> Download
          </button>
          <button className="tdt-btn">
            <i className="fa-solid fa-share-nodes" /> Share
          </button>
          
        </div>

      </div>

      <div className="tdt-footer">Copyright© 2026 CineBook Limited. All Rights Reserved.</div>
    </div>
  )
}