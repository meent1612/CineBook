import { useState } from "react"
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
  seats: string[]
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

const PAYMENT_LABEL: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  card:  "Card",
}

const PAYMENT_COLOR: Record<string, string> = {
  bkash: "#fce7f3",
  nagad: "#fff3e0",
  card:  "#e8edf5",
}

const PAYMENT_TEXT_COLOR: Record<string, string> = {
  bkash: "#9d174d",
  nagad: "#92400e",
  card:  "#1e3a5f",
}

const formatShowDate = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00")
  return `${DAY_SHORT[d.getDay()]}, ${String(d.getDate()).padStart(2,"0")} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

const formatBookingDate = (iso: string): string => {
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

const formatTime = (time: string): string => {
  const [h, m] = time.split(":")
  const hour   = parseInt(h)
  return `${String(hour % 12 || 12).padStart(2,"0")}:${m} ${hour >= 12 ? "PM" : "AM"}`
}

const seatList = (seats: string[] | string): string =>
  Array.isArray(seats) ? seats.join(", ") : seats

// ── Poster ─────────────────────────────────────────────
function MoviePoster({ poster, title }: { poster: string | null; title: string }) {
  const [failed, setFailed] = useState(false)
  const src = poster
    ? poster.startsWith("/") ? `${BACKEND}${poster}` : poster
    : ""
  if (!src || failed) {
    return (
      <div className="tdt-poster-fallback">
        <i className="fa-solid fa-film" />
      </div>
    )
  }
  return (
    <img src={src} alt={title} className="tdt-poster" onError={() => setFailed(true)} />
  )
}

// ── Status badge text ──────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  upcoming:  "Upcoming",
  watched:   "Watched",
  cancelled: "Cancelled",
}

// ── Main ───────────────────────────────────────────────
export default function TicketDetail() {
  const location        = useLocation()
  const navigate        = useNavigate()
  const { token }       = useAuth()

  const booking = location.state as Booking | null

  const [cancelling, setCancelling] = useState(false)
  const [cancelMsg,  setCancelMsg]  = useState("")
  const [status,     setStatus]     = useState<Booking["status"]>(booking?.status ?? "upcoming")

  if (!booking) {
    return (
      <div className="tdt-empty-wrap">
        <p>No ticket data found.</p>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    )
  }

  const isPast       = new Date(booking.show_date + "T00:00:00") < new Date()
  const isCancelled  = status === "cancelled"
  const canCancel    = !isCancelled && !isPast
  const seats        = Array.isArray(booking.seats) ? booking.seats : [booking.seats]
  const quantity     = seats.length
  const discount     = 0
  const total        = booking.total_price

  // ── Cancel booking ─────────────────────────────────
  const handleCancel = async () => {
    if (!window.confirm("Cancel this booking? This cannot be undone.")) return
    setCancelling(true)
    setCancelMsg("")
    try {
      const res  = await fetch(`${API_URL}/bookings/group/${booking.booking_group_id}/cancel`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setStatus("cancelled")
      setCancelMsg("Booking cancelled successfully.")
    } catch (err: any) {
      setCancelMsg(err.message || "Cancellation failed. Please try again.")
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="tdt-wrapper">

      {/* Back */}
      <button className="tdt-back" onClick={() => navigate("/dashboard")}>
        <i className="fa-solid fa-arrow-left" /> Back to my bookings
      </button>

      <div className="tdt-card">

        {/* ── Header ── */}
        <div className="tdt-header">
          <MoviePoster poster={booking.movie_poster} title={booking.movie_title} />
          <div className="tdt-header-body">
            <div className="tdt-movie-title">{booking.movie_title}</div>
            <div className="tdt-meta-row">
              <span className="tdt-badge tdt-badge-type">{booking.seat_type}</span>
              <span className={`tdt-badge tdt-badge-status tdt-status-${status}`}>
                <span className="tdt-status-dot" />
                {STATUS_LABEL[status] ?? status}
              </span>
            </div>
            <div className="tdt-booking-id">
              Booking ID: <span>#{booking.booking_group_id}</span>
            </div>
            <div className="tdt-booked-on">
              Booked on {formatBookingDate(booking.booking_date)}
            </div>
          </div>
        </div>

        {/* ── Show Details ── */}
        <div className="tdt-section">
          <div className="tdt-section-title">Show details</div>
          <div className="tdt-grid">
            <div className="tdt-field">
              <div className="tdt-label">Theater</div>
              <div className="tdt-value">{booking.theater_name || "—"}</div>
            </div>
            <div className="tdt-field">
              <div className="tdt-label">Location</div>
              <div className="tdt-value">{booking.theater_address || "—"}</div>
            </div>
            <div className="tdt-field">
              <div className="tdt-label">Date</div>
              <div className="tdt-value">{formatShowDate(booking.show_date)}</div>
            </div>
            <div className="tdt-field">
              <div className="tdt-label">Time</div>
              <div className="tdt-value">{formatTime(booking.start_time)}</div>
            </div>
            <div className="tdt-field">
              <div className="tdt-label">Hall</div>
              <div className="tdt-value">{booking.hall_name || "—"}</div>
            </div>
            <div className="tdt-field">
              <div className="tdt-label">Tickets</div>
              <div className="tdt-value">{quantity}</div>
            </div>
          </div>
        </div>

        {/* ── Seats ── */}
        <div className="tdt-section">
          <div className="tdt-section-title">Seats</div>
          <div className="tdt-seats-row">
            {seats.map(s => (
              <span key={s} className="tdt-seat-chip">{s}</span>
            ))}
          </div>
        </div>

        {/* ── Payment ── */}
        {(booking.transaction_id || booking.payment_method) && (
          <div className="tdt-section">
            <div className="tdt-section-title">Payment</div>
            <div className="tdt-payment-row">
              <div>
                <div className="tdt-label">Transaction ID</div>
                <div className="tdt-trx-id">{booking.transaction_id || "—"}</div>
              </div>
              {booking.payment_method && (
                <span
                  className="tdt-method-badge"
                  style={{
                    background: PAYMENT_COLOR[booking.payment_method] ?? "#f3f4f6",
                    color:      PAYMENT_TEXT_COLOR[booking.payment_method] ?? "#374151",
                  }}
                >
                  <i className="fa-solid fa-mobile-screen-button" />
                  {PAYMENT_LABEL[booking.payment_method] ?? booking.payment_method}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Pricing ── */}
        <div className="tdt-price-section">
          <div className="tdt-price-row">
            <span>Unit price</span>
            <span>{booking.unit_price.toLocaleString()} BDT</span>
          </div>
          <div className="tdt-price-row">
            <span>Tickets</span>
            <span>× {quantity}</span>
          </div>
          {discount > 0 && (
            <div className="tdt-price-row tdt-discount">
              <span>Discount</span>
              <span>−{discount.toLocaleString()} BDT</span>
            </div>
          )}
          <div className="tdt-price-total">
            <span>Total paid</span>
            <span>{total.toLocaleString()} BDT</span>
          </div>
        </div>

        {/* ── Perforated divider ── */}
        <div className="tdt-divider">
          <div className="tdt-divider-circle tdt-divider-left" />
          <div className="tdt-divider-line" />
          <div className="tdt-divider-circle tdt-divider-right" />
        </div>

        {/* ── Feedback message ── */}
        {cancelMsg && (
          <div className={`tdt-msg ${isCancelled ? "tdt-msg-success" : "tdt-msg-error"}`}>
            <i className={`fa-solid ${isCancelled ? "fa-circle-check" : "fa-circle-exclamation"}`} />
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
          {canCancel && (
            <button className="tdt-btn tdt-btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling
                ? <><i className="fa-solid fa-spinner fa-spin" /> Cancelling…</>
                : <><i className="fa-solid fa-xmark" /> Cancel booking</>
              }
            </button>
          )}
        </div>

      </div>

      <div className="tdt-footer">Copyright© 2026 CineBook Limited. All Rights Reserved.</div>
    </div>
  )
}