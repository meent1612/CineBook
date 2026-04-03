import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../CSSfiles/Payment.css"

// ── Types ──────────────────────────────────────────────
type PaymentMethod = "bkash" | "nagad" | "card"

interface BookingData {
  movieTitle: string
  movieCategory: string
  movieGenre: string
  theaterName: string
  theaterAddress: string
  hallName: string
  showDate: string
  showTime: string
  seatType: string
  seatLabels: string[]
  seatIds: number[]
  screeningId: number
  quantity: number
  unitPrice: number
  totalAmount: number
}

// ── Constants ──────────────────────────────────────────
const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`

const METHODS: { key: PaymentMethod; label: string; icon: string; color: string }[] = [
  { key: "bkash", label: "bKash",  icon: "fa-solid fa-mobile-screen-button", color: "#E2136E" },
  { key: "nagad", label: "Nagad",  icon: "fa-solid fa-mobile-screen-button", color: "#F6921E" },
  { key: "card",  label: "Card",   icon: "fa-solid fa-credit-card",          color: "#1a3a5c" },
]

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
}

// ── Main Component ─────────────────────────────────────
export default function Payment() {
  const navigate        = useNavigate()
  const location        = useLocation()
  const { user, token } = useAuth()

  const booking = location.state as BookingData | null

  const [method,      setMethod]      = useState<PaymentMethod>("bkash")
  const [phone,       setPhone]       = useState("")
  const [cardNumber,  setCardNumber]  = useState("")
  const [cardExpiry,  setCardExpiry]  = useState("")
  const [cardCvv,     setCardCvv]     = useState("")
  const [cardName,    setCardName]    = useState("")
  const [processing,  setProcessing]  = useState(false)
  const [error,       setError]       = useState("")
  const [step,        setStep]        = useState<"form" | "otp" | "success">("form")
  const [otp,         setOtp]         = useState("")
  const [trxId,       setTrxId]       = useState("")
  const [countdown,   setCountdown]   = useState(0)

  // Redirect if no booking data or not logged in
  useEffect(() => {
    if (!booking) navigate("/")
    if (!user || !token) navigate("/login")
  }, [booking, user, token])

  // Countdown timer for success redirect
  useEffect(() => {
    if (step !== "success" || countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    if (countdown === 1) setTimeout(() => navigate("/"), 1200)
    return () => clearTimeout(timer)
  }, [step, countdown])

  if (!booking) return null

  const convenienceCharge = 0
  const grandTotal        = booking.totalAmount + convenienceCharge

  // ── Submit Payment ──
  const handleSubmitPayment = async () => {
    setError("")

    if (method === "bkash" || method === "nagad") {
      if (!phone || phone.length < 11) {
        setError("Please enter a valid phone number.")
        return
      }
    }
    if (method === "card") {
      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
        setError("Please enter a valid card number.")
        return
      }
      if (!cardExpiry) { setError("Please enter card expiry."); return }
      if (!cardCvv || cardCvv.length < 3) { setError("Please enter CVV."); return }
      if (!cardName) { setError("Please enter cardholder name."); return }
    }

    setProcessing(true)
    try {
      // Step 1: Create booking
      const bookingRes = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          screening_id: booking.screeningId,
          seat_ids:     booking.seatIds,
        }),
      })
      const bookingData = await bookingRes.json()
      if (!bookingData.success) throw new Error(bookingData.message)

      const bookingGroupId = bookingData.booking_group_id
        || bookingData.bookings?.[0]?.booking_group_id
        || crypto.randomUUID()

      // Step 2: Create payment record
      const paymentRes = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          booking_group_id: bookingGroupId,
          amount:           grandTotal,
          method:           method,
        }),
      })
      const paymentData = await paymentRes.json()
      if (!paymentData.success) throw new Error(paymentData.message)

      // Mobile banking → OTP step
      if (method === "bkash" || method === "nagad") {
        setStep("otp")
        setProcessing(false)
        return
      }

      // Card → direct success
      setTrxId(paymentData.payment?.id?.toString()
        || Math.random().toString(36).slice(2, 12).toUpperCase())
      setStep("success")
      setCountdown(8)
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  // ── Verify OTP ──
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter the OTP sent to your phone.")
      return
    }
    setProcessing(true)
    setError("")
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setTrxId(Math.random().toString(36).slice(2, 12).toUpperCase())
      setStep("success")
      setCountdown(8)
    } catch {
      setError("OTP verification failed.")
    } finally {
      setProcessing(false)
    }
  }

  // ── Card input formatters ──
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16)
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim())
  }

  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4)
    setCardExpiry(digits.length >= 3 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits)
  }

  // ═══════════════════════════════════════════════════════
  // SUCCESS SCREEN
  // ═══════════════════════════════════════════════════════
  if (step === "success") {
    return (
      <div className="pay-wrapper">
        <div className="pay-success-card">
          <div className="pay-success-icon">
            <i className="fa-solid fa-circle-check" />
          </div>
          <h2 className="pay-success-title">Payment Successful!</h2>
          <p className="pay-success-subtitle">Your tickets have been booked</p>

          <div className="pay-success-details">
            {[
              ["Transaction ID", trxId],
              ["Movie",          booking.movieTitle],
              ["Date & Time",    `${formatDate(booking.showDate)} — ${booking.showTime}`],
              ["Seats",          booking.seatLabels.join(", ")],
              ["Amount Paid",    `${grandTotal.toLocaleString()} BDT`],
              ["Method",         method.charAt(0).toUpperCase() + method.slice(1)],
            ].map(([k, v]) => (
              <div key={k} className="pay-success-row">
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>

          <p className="pay-success-redirect">Redirecting to home in {countdown}s…</p>
          <button className="pay-success-btn" onClick={() => navigate("/")}>
            <i className="fa-solid fa-house" /> Go Home Now
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // OTP SCREEN
  // ═══════════════════════════════════════════════════════
  if (step === "otp") {
    const mLabel = method === "bkash" ? "bKash" : "Nagad"
    const mColor = method === "bkash" ? "#E2136E" : "#F6921E"

    return (
      <div className="pay-wrapper">
        <div className="pay-card pay-otp-card">
          <div className="pay-otp-header" style={{ background: mColor }}>
            <i className="fa-solid fa-shield-halved" />
            <span>Verify {mLabel} Payment</span>
          </div>
          <div className="pay-otp-body">
            <p className="pay-otp-msg">
              An OTP has been sent to <strong>{phone.slice(0, 4)}****{phone.slice(-3)}</strong>.
              Enter it below to confirm your payment of <strong>{grandTotal.toLocaleString()} BDT</strong>.
            </p>

            <label className="pay-label">Enter OTP</label>
            <input
              type="text" className="pay-input pay-otp-input" maxLength={6}
              placeholder="e.g. 123456" value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />

            {error && <div className="pay-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}

            <div className="pay-otp-actions">
              <button className="pay-cancel-btn" onClick={() => { setStep("form"); setOtp("") }}>
                <i className="fa-solid fa-arrow-left" /> Back
              </button>
              <button className="pay-submit-btn" onClick={handleVerifyOtp}
                disabled={processing} style={{ background: mColor }}>
                {processing
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Verifying…</>
                  : <><i className="fa-solid fa-check" /> Confirm Payment</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // PAYMENT FORM
  // ═══════════════════════════════════════════════════════
  return (
    <div className="pay-wrapper">
      <div className="pay-container">

        {/* ── Left: Order Summary ── */}
        <div className="pay-summary">
          <div className="pay-summary-header">
            <i className="fa-solid fa-receipt" />
            <span>Order Summary</span>
          </div>

          <div className="pay-summary-movie">
            <h3>{booking.movieTitle}</h3>
            <span className="pay-summary-badge">{booking.movieCategory}</span>
          </div>

          <div className="pay-summary-details">
            {[
              ["Theater",  booking.theaterName],
              ["Location", booking.theaterAddress],
              ["Date",     formatDate(booking.showDate)],
              ["Time",     booking.showTime],
              ["Hall",     booking.hallName],
              ["Seats",    booking.seatLabels.join(", ")],
              ["Type",     booking.seatType],
            ].map(([k, v]) => (
              <div key={k} className="pay-summary-row">
                <span className="pay-summary-key">{k}</span>
                <span className="pay-summary-val">{v}</span>
              </div>
            ))}
          </div>

          <div className="pay-summary-pricing">
            <div className="pay-summary-row">
              <span>Subtotal ({booking.quantity} ticket{booking.quantity > 1 ? "s" : ""})</span>
              <span>{booking.totalAmount.toLocaleString()} BDT</span>
            </div>
            <div className="pay-summary-row">
              <span>Convenience Charge</span>
              <span>{convenienceCharge} BDT</span>
            </div>
            <div className="pay-summary-total">
              <span>Total</span>
              <span>{grandTotal.toLocaleString()} BDT</span>
            </div>
          </div>
        </div>

        {/* ── Right: Payment Form ── */}
        <div className="pay-form-section">
          <div className="pay-form-header">
            <i className="fa-solid fa-lock" />
            <span>Secure Payment</span>
          </div>

          {/* Method Tabs */}
          <div className="pay-method-row">
            {METHODS.map(m => (
              <button key={m.key}
                className={`pay-method-btn ${method === m.key ? "active" : ""}`}
                onClick={() => { setMethod(m.key); setError("") }}
                style={method === m.key ? { borderColor: m.color, color: m.color } : {}}>
                <i className={m.icon} style={method === m.key ? { color: m.color } : {}} />
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* bKash / Nagad */}
          {(method === "bkash" || method === "nagad") && (
            <div className="pay-fields">
              <div className="pay-method-banner" style={{
                background: method === "bkash" ? "#FDE8F0" : "#FFF3E0",
                borderLeft: `4px solid ${method === "bkash" ? "#E2136E" : "#F6921E"}`,
              }}>
                <i className="fa-solid fa-mobile-screen-button"
                   style={{ color: method === "bkash" ? "#E2136E" : "#F6921E" }} />
                <span>Pay <strong>{grandTotal.toLocaleString()} BDT</strong> via {method === "bkash" ? "bKash" : "Nagad"}</span>
              </div>

              <label className="pay-label">
                {method === "bkash" ? "bKash" : "Nagad"} Account Number *
              </label>
              <div className="pay-input-wrap">
                <span className="pay-input-prefix">+880</span>
                <input type="tel" className="pay-input pay-input-with-prefix"
                  placeholder="1XXXXXXXXX" maxLength={11}
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} />
              </div>
              <p className="pay-input-hint">
                Enter the {method === "bkash" ? "bKash" : "Nagad"} number linked to your account
              </p>
            </div>
          )}

          {/* Card */}
          {method === "card" && (
            <div className="pay-fields">
              <label className="pay-label">Card Number *</label>
              <div className="pay-input-wrap">
                <i className="fa-solid fa-credit-card pay-input-icon" />
                <input type="text" className="pay-input pay-input-with-icon"
                  placeholder="0000 0000 0000 0000" maxLength={19}
                  value={cardNumber} onChange={e => handleCardNumberChange(e.target.value)} />
              </div>

              <div className="pay-card-row">
                <div className="pay-card-field">
                  <label className="pay-label">Expiry *</label>
                  <input type="text" className="pay-input" placeholder="MM/YY"
                    maxLength={5} value={cardExpiry}
                    onChange={e => handleExpiryChange(e.target.value)} />
                </div>
                <div className="pay-card-field">
                  <label className="pay-label">CVV *</label>
                  <input type="password" className="pay-input" placeholder="•••"
                    maxLength={4} value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, ""))} />
                </div>
              </div>

              <label className="pay-label">Cardholder Name *</label>
              <input type="text" className="pay-input" placeholder="As shown on card"
                value={cardName} onChange={e => setCardName(e.target.value)} />
            </div>
          )}

          {error && <div className="pay-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}

          <button className="pay-submit-btn" onClick={handleSubmitPayment}
            disabled={processing}
            style={{ background: METHODS.find(m => m.key === method)?.color }}>
            {processing
              ? <><i className="fa-solid fa-spinner fa-spin" /> Processing…</>
              : <><i className="fa-solid fa-lock" /> Pay {grandTotal.toLocaleString()} BDT</>}
          </button>

          <button className="pay-back-btn" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left" /> Back to Seat Selection
          </button>

          <div className="pay-secure-note">
            <i className="fa-solid fa-shield-halved" />
            <span>Your payment information is encrypted and secure</span>
          </div>
        </div>
      </div>

      <div className="pay-footer">Copyright© 2026 CineBook Limited. All Rights Reserved.</div>
    </div>
  )
}