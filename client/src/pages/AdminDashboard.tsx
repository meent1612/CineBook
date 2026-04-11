import { useState, useEffect, useCallback } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import AIContentAssistant from "../components/AIContentAssistant"

// ─── Constants ───────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

const API_URL       = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND       = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"
const POSTER_COLORS = ["#6B1829","#1a3a5c","#1a4d2e","#3b1f5e","#7a3b00","#1f4040"]

const SUBJECT_COLORS: Record<string, { bg: string; color: string }> = {
  "Booking Issue":     { bg: "#fef3c7", color: "#92400e" },
  "Refund Request":    { bg: "#fee2e2", color: "#991b1b" },
  "Movie Inquiry":     { bg: "#ede9fe", color: "#5b21b6" },
  "Technical Support": { bg: "#dbeafe", color: "#1e40af" },
  "General Feedback":  { bg: "#d1fae5", color: "#065f46" },
  "Other":             { bg: "#f3f4f6", color: "#374151" },
}

const THEATERS = [
  { id: 1, name: "Dhanmondi" },
  { id: 2, name: "Shantinagar" },
]

const SLOTS = ["10:00", "15:00", "20:00"]

// ─── Bangladesh timezone helper ───────────────────────────────────────────────
const getBDDate = (): Date => {
  const now = new Date()
  const bdOffset = 6 * 60
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + bdOffset * 60000)
}

const getTodayBDStr = (): string => {
  const bd = getBDDate()
  return `${bd.getFullYear()}-${String(bd.getMonth() + 1).padStart(2, "0")}-${String(bd.getDate()).padStart(2, "0")}`
}

// ─── Toast Types ──────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
}

// ─── Toast Component ──────────────────────────────────────────────────────────
const TOAST_ICONS: Record<ToastType, string> = {
  success: "fa-circle-check",
  error:   "fa-circle-xmark",
  info:    "fa-circle-info",
  warning: "fa-triangle-exclamation",
}

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string; progress: string }> = {
  success: { bg: "#f0fdf4", border: "#bbf7d0", icon: "#16a34a", progress: "#16a34a" },
  error:   { bg: "#fff1f2", border: "#fecdd3", icon: "#6B1829", progress: "#6B1829" },
  info:    { bg: "#eff6ff", border: "#bfdbfe", icon: "#2563eb", progress: "#2563eb" },
  warning: { bg: "#fffbeb", border: "#fde68a", icon: "#d97706", progress: "#d97706" },
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div style={{
      position: "fixed",
      top: "1.25rem",
      right: "1.25rem",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "0.6rem",
      pointerEvents: "none",
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const c = TOAST_COLORS[toast.type]

  useEffect(() => {
    // Mount → slide in
    const t1 = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss after 3.8s
    const t2 = setTimeout(() => handleDismiss(), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleDismiss = () => {
    setLeaving(true)
    setTimeout(() => onDismiss(toast.id), 320)
  }

  return (
    <div
      onClick={handleDismiss}
      style={{
        pointerEvents: "all",
        cursor: "pointer",
        minWidth: "300px",
        maxWidth: "380px",
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: "14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 1.5px 4px rgba(0,0,0,0.07)",
        overflow: "hidden",
        transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(calc(100% + 1.25rem)) scale(0.96)",
        opacity: visible && !leaving ? 1 : 0,
        transition: leaving
          ? "transform 0.32s cubic-bezier(0.4,0,1,1), opacity 0.28s ease"
          : "transform 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease",
      }}
    >
      {/* Progress bar */}
      <div style={{
        height: "3px",
        background: `${c.progress}22`,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: c.progress,
          transformOrigin: "left",
          animation: visible ? "toastProgress 3.8s linear forwards" : "none",
        }} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.85rem 1rem" }}>
        {/* Icon */}
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: `${c.icon}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <i className={`fa-solid ${TOAST_ICONS[toast.type]}`} style={{ color: c.icon, fontSize: "0.95rem" }} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700,
            fontSize: "0.84rem",
            color: "#111827",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            marginBottom: toast.message ? "0.2rem" : 0,
          }}>
            {toast.title}
          </div>
          {toast.message && (
            <div style={{
              fontSize: "0.76rem",
              color: "#6b7280",
              lineHeight: 1.5,
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            }}>
              {toast.message}
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={e => { e.stopPropagation(); handleDismiss() }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#9ca3af", fontSize: "0.75rem", padding: "0.1rem",
            flexShrink: 0, lineHeight: 1,
          }}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <style>{`
        @keyframes toastProgress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  )
}

// ─── useToast hook ────────────────────────────────────────────────────────────
let _toastId = 0

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = ++_toastId
    setToasts(prev => [...prev, { id, type, title, message }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (title: string, message?: string) => addToast("success", title, message),
    error:   (title: string, message?: string) => addToast("error",   title, message),
    info:    (title: string, message?: string) => addToast("info",    title, message),
    warning: (title: string, message?: string) => addToast("warning", title, message),
  }

  return { toasts, dismissToast, toast }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Movie {
  
  id: number; title: string; description: string | null; genre: string | null
  category: string; language: string | null; duration_mins: number | null
  release_date: string | null; poster_url: string | null; carasol_url: string | null; trailer_url: string | null
  status: "now_showing" | "coming_soon"; is_active: boolean
}
interface Hall {
  id: number; name: string; capacity: number
  theater?: { id: number; name: string }
}
interface Screening {
  id: number; movie_id: number; hall_id?: number; hall_name: string
  show_date: string; start_time: string; available_seats: number
}
interface ContactMessage {
  id: number; user_id: number; name: string; email: string; subject: string
  message: string; is_read: boolean; created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime12 = (time: string): string => {
  const [h, m] = time.split(":")
  const hour = parseInt(h); const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${String(hour12).padStart(2, "0")}:${m} ${ampm}`
}
const formatDateDisplay = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

// ─── Sub-components ───────────────────────────────────────────────────────────
function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false)
  const bg = POSTER_COLORS[movie.title.charCodeAt(0) % POSTER_COLORS.length]
  const src = movie.poster_url
    ? movie.poster_url.startsWith("/") ? `${BACKEND}${movie.poster_url}` : movie.poster_url
    : null
  if (!src || failed) {
    return (
      <div style={{ background: bg, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
        <i className="fa-solid fa-film" style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.5rem" }} />
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.65rem", textAlign: "center", padding: "0 0.5rem", fontWeight: 600, lineHeight: 1.3 }}>{movie.title}</span>
      </div>
    )
  }
  return <img src={src} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setFailed(true)} />
}

function SlotButtons({ selected, takenSlots, onSelect }: { selected: string; takenSlots: string[]; onSelect: (s: string) => void }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
      {SLOTS.map(slot => {
        const taken = takenSlots.includes(slot); const isSel = selected === slot
        return (
          <button key={slot} type="button" disabled={taken} onClick={() => !taken && onSelect(slot)}
            style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: `1.5px solid ${taken ? "#e5e7eb" : isSel ? "#6B1829" : "#d1d5db"}`, background: taken ? "#f9fafb" : isSel ? "#6B1829" : "white", color: taken ? "#9ca3af" : isSel ? "white" : "#374151", fontSize: "0.75rem", fontWeight: 600, cursor: taken ? "not-allowed" : "pointer", transition: "all 0.15s" }}>
            {formatTime12(slot + ":00")}{taken ? " ✗" : ""}
          </button>
        )
      })}
    </div>
  )
}

function HallOptions({ hallList }: { hallList: Hall[] }) {
  const theaterNames = [...new Set(hallList.map(h => h.theater?.name ?? "Unknown"))]
  return (
    <>
      <option value="" disabled>Select Hall</option>
      {theaterNames.map(tn => (
        <optgroup key={tn} label={tn}>
          {hallList.filter(h => (h.theater?.name ?? "Unknown") === tn)
            .map(h => <option key={h.id} value={h.id}>{h.name} (cap: {h.capacity})</option>)}
        </optgroup>
      ))}
    </>
  )
}

// ─── Shared modal styles ───────────────────────────────────────────────────────
const modalBackdrop: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem",
}
const modalCard: React.CSSProperties = {
  background: "white", borderRadius: "16px", width: "100%", maxWidth: "520px",
  maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
}
const modalWide: React.CSSProperties = { ...modalCard, maxWidth: "720px" }
const inp: React.CSSProperties = {
  width: "100%", padding: "0.6rem 0.85rem", border: "1.5px solid #e5e7eb", borderRadius: "8px",
  fontSize: "0.82rem", color: "#1a1a1a", background: "#fafafa", marginBottom: "0.6rem",
  outline: "none", boxSizing: "border-box",
}
const lbl: React.CSSProperties = { display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }

const EMPTY_MOVIE = {
  title: "", description: "", genre: "", category: "2D",
  language: "English", duration_mins: "", release_date: "",
  poster_url: "", carasol_url: "", trailer_url: "", status: "now_showing", is_active: true,
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { token } = useAuth()
  const location  = useLocation()
  const { toasts, dismissToast, toast } = useToast()

  const [activeTab, setActiveTab] = useState<"overview" | "management" | "inbox" | "movies">("overview")

  // Data
  const [movieList,     setMovieList]     = useState<Movie[]>([])
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [movieError,    setMovieError]    = useState("")
  const [hallList,      setHallList]      = useState<Hall[]>([])

  // Calendar
  const todayBD = getBDDate()
  const [calYear,  setCalYear]  = useState(todayBD.getFullYear())
  const [calMonth, setCalMonth] = useState(todayBD.getMonth())
  const [calSelectedDate, setCalSelectedDate] = useState(getTodayBDStr())
  const [calScreenings, setCalScreenings] = useState<Screening[]>([])
  const [loadingCalScreenings, setLoadingCalScreenings] = useState(false)

  // Discount states
  const [discountName,         setDiscountName]         = useState("")
  const [discountTheater,      setDiscountTheater]       = useState("1")
  const [discountStandard,     setDiscountStandard]      = useState("")
  const [discountSemiRecliner, setDiscountSemiRecliner]  = useState("")
  const [discountPremium,      setDiscountPremium]       = useState("")
  const [discountVip,          setDiscountVip]           = useState("")
  const [discountStartDate,    setDiscountStartDate]     = useState("")
  const [discountEndDate,      setDiscountEndDate]       = useState("")
  const [applyingDiscount,     setApplyingDiscount]      = useState(false)
  const [activeDiscounts,      setActiveDiscounts]       = useState<any[]>([])

  // Income filter
  const [incomeMonth,   setIncomeMonth]   = useState(MONTHS[todayBD.getMonth()])
  const [incomeTheater, setIncomeTheater] = useState("all")
  const [incomeMovie,   setIncomeMovie]   = useState("all")

  // Analytics state
  const [analytics,        setAnalytics]        = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Add/Edit Movie modals
  const [showAddMovie,  setShowAddMovie]  = useState(false)
  const [addingMovie,   setAddingMovie]   = useState(false)
  const [newMovie,      setNewMovie]      = useState({ ...EMPTY_MOVIE })
  const [showEditMovie, setShowEditMovie] = useState(false)
  const [editingMovie,  setEditingMovie]  = useState(false)
  const [editMovie,     setEditMovie]     = useState({ ...EMPTY_MOVIE, id: 0 })

  // Add Screening modal
  const [showAddScreening, setShowAddScreening] = useState(false)
  const [newScreening,     setNewScreening]     = useState({ movie_id: "", hall_id: "", show_date: "", start_time: "", available_seats: "" })

  // Edit Screening modal
  const [showEditScreening,  setShowEditScreening]  = useState(false)
  const [editScreeningMovie, setEditScreeningMovie] = useState<Movie | null>(null)
  const [editScreeningDate,  setEditScreeningDate]  = useState("")
  const [editScreeningList,  setEditScreeningList]  = useState<Screening[]>([])
  const [loadingScreenings,  setLoadingScreenings]  = useState(false)
  const [editingScreeningId, setEditingScreeningId] = useState<number | null>(null)
  const [editScreeningForm,  setEditScreeningForm]  = useState({ hall_id: "", start_time: "" })
  const [showInlineAdd,      setShowInlineAdd]      = useState(false)
  const [inlineNewScreening, setInlineNewScreening] = useState({ hall_id: "", start_time: "", available_seats: "" })
  const [takenSlots,         setTakenSlots]         = useState<string[]>([])

  // Inbox
  const [inboxMessages, setInboxMessages] = useState<ContactMessage[]>([])
  const [loadingInbox,  setLoadingInbox]  = useState(false)
  const [markingReadId, setMarkingReadId] = useState<number | null>(null)
  const [inboxError,    setInboxError]    = useState("")
  const [inboxFilter,   setInboxFilter]   = useState<"all" | "unread" | "read">("all")
  const [expandedMsgId, setExpandedMsgId] = useState<number | null>(null)

  useEffect(() => { fetchMovies(); fetchHalls(); fetchActiveDiscounts() }, [])

  useEffect(() => {
    fetchCalScreenings(calSelectedDate)
  }, [calSelectedDate])

  useEffect(() => {
    const state = location.state as any
    if (!state) return
    if (state.openScreeningModal && state.editMovieId && state.editDate) {
      if (movieList.length === 0) return
      const movie = movieList.find(m => m.id === state.editMovieId)
      if (movie) { openEditScreeningModal(movie, state.editDate) }
      window.history.replaceState({}, ""); return
    }
    if (state.openScreeningModal) { setShowAddScreening(true); window.history.replaceState({}, ""); return }
    if (state.editMovieId && movieList.length > 0) {
      const target = movieList.find(m => m.id === state.editMovieId)
      if (target) { handleOpenEdit(target); window.history.replaceState({}, "") }
    }
  }, [location.state, movieList])

  useEffect(() => {
    if (activeTab === "overview") fetchAnalytics()
  }, [incomeMonth, incomeTheater, incomeMovie, activeTab])

  // ── Fetch helpers ────────────────────────────────────────────────────────────
  const fetchMovies = async () => {
    setLoadingMovies(true); setMovieError("")
    try {
      const res  = await fetch(`${API_URL}/admin/movies`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setMovieList(data.movies)
    } catch (err: any) { setMovieError(err.message || "Failed to load movies.") }
    finally { setLoadingMovies(false) }
  }

  const fetchHalls = async () => {
    try {
      const res  = await fetch(`${API_URL}/halls`)
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setHallList(data.halls)
    } catch (err: any) { console.error("Failed to load halls:", err.message) }
  }

  const fetchCalScreenings = async (date: string) => {
    setLoadingCalScreenings(true)
    try {
      const res = await fetch(`${API_URL}/admin/screenings?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setCalScreenings((data.screenings as Screening[]).sort((a, b) => a.start_time.localeCompare(b.start_time)))
    } catch { setCalScreenings([]) }
    finally { setLoadingCalScreenings(false) }
  }

  const fetchInbox = async () => {
    setLoadingInbox(true); setInboxError("")
    try {
      const res  = await fetch(`${API_URL}/admin/contact-messages`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || "Failed to load messages.")
      setInboxMessages((data.messages as any[]).map(m => ({ ...m, is_read: Boolean(m.is_read) })))
    } catch (err: any) { setInboxError(err.message || "Could not load messages.") }
    finally { setLoadingInbox(false) }
  }

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const params = new URLSearchParams()
      if (incomeMonth !== "all") {
        const monthNum = MONTHS.indexOf(incomeMonth) + 1
        params.set("month", String(monthNum))
        params.set("year",  String(calYear))
      }
      if (incomeTheater !== "all") params.set("theater_id", incomeTheater)
      if (incomeMovie   !== "all") params.set("movie_id",   incomeMovie)

      const res  = await fetch(`${API_URL}/admin/analytics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setAnalytics(data)
      else setAnalytics(null)
    } catch {
      setAnalytics(null)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const fetchActiveDiscounts = async () => {
    try {
      const res  = await fetch(`${API_URL}/admin/discounts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setActiveDiscounts(data.discounts)
    } catch {}
  }

  const handleMarkRead = async (id: number) => {
    setMarkingReadId(id)
    try {
      const res  = await fetch(`${API_URL}/admin/contact-messages/${id}/read`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setInboxMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
      toast.success("Message marked as read")
    } catch (err: any) {
      toast.error("Failed to mark as read", err.message)
    }
    finally { setMarkingReadId(null) }
  }

  const handleMarkAllRead = async () => {
    for (const msg of inboxMessages.filter(m => !m.is_read)) await handleMarkRead(msg.id)
    toast.success("All messages marked as read")
  }

  const fetchTakenSlots = async (hallId: string, date: string) => {
    if (!hallId || !date) { setTakenSlots([]); return }
    try {
      const res  = await fetch(`${API_URL}/screenings?hall_id=${hallId}&date=${date}`)
      const data = await res.json()
      if (!data.success) return
      setTakenSlots((data.screenings as { start_time: string }[]).map(s => s.start_time.slice(0, 5)))
    } catch { setTakenSlots([]) }
  }

  const fetchScreeningsForEdit = async (movieId: number, dateStr: string) => {
    setLoadingScreenings(true)
    try {
      const res  = await fetch(`${API_URL}/screenings`)
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setEditScreeningList(
        (data.screenings as Screening[])
          .filter(s => s.movie_id === movieId && s.show_date === dateStr)
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
      )
    } catch (err: any) {
      console.error("Failed to load screenings:", err.message)
      setEditScreeningList([])
    }
    finally { setLoadingScreenings(false) }
  }

  const openEditScreeningModal = (movie: Movie, dateStr: string) => {
    setEditScreeningMovie(movie); setEditScreeningDate(dateStr)
    setEditingScreeningId(null); setShowEditScreening(true)
    fetchScreeningsForEdit(movie.id, dateStr)
  }

  const startEditingScreening = (s: Screening) => {
    const h = hallList.find(h => h.name === s.hall_name)
    setEditingScreeningId(s.id)
    setEditScreeningForm({ hall_id: h ? String(h.id) : (s.hall_id ? String(s.hall_id) : ""), start_time: s.start_time.slice(0, 5) })
  }

  const saveEditingScreening = async () => {
    if (!editingScreeningId) return
    const { hall_id, start_time } = editScreeningForm
    if (!hall_id || !start_time) {
      toast.warning("Missing fields", "Hall and start time are required.")
      return
    }
    try {
      const res  = await fetch(`${API_URL}/admin/screenings/${editingScreeningId}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ hall_id: parseInt(hall_id), start_time }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setEditingScreeningId(null)
      toast.success("Screening updated")
      if (editScreeningMovie) fetchScreeningsForEdit(editScreeningMovie.id, editScreeningDate)
    } catch (err: any) {
      toast.error("Failed to update screening", err.message)
    }
  }

  const handleDeleteScreening = async (screeningId: number) => {
    if (!confirm("Are you sure you want to delete this screening?")) return
    try {
      const res  = await fetch(`${API_URL}/admin/screenings/${screeningId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success("Screening deleted")
      if (editScreeningMovie) fetchScreeningsForEdit(editScreeningMovie.id, editScreeningDate)
    } catch (err: any) {
      toast.error("Failed to delete screening", err.message)
    }
  }

  const handleAddMovie = async () => {
    if (!newMovie.title) return
    setAddingMovie(true)
    try {
      const res  = await fetch(`${API_URL}/admin/movies`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newMovie.title, description: newMovie.description || null, genre: newMovie.genre || null,
          category: newMovie.category, language: newMovie.language || null,
          duration_mins: newMovie.duration_mins ? parseInt(newMovie.duration_mins) : null,
          release_date: newMovie.release_date || null, poster_url: newMovie.poster_url || null,
          trailer_url: newMovie.trailer_url || null, status: newMovie.status, is_active: newMovie.is_active,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      await fetchMovies()
      setNewMovie({ ...EMPTY_MOVIE })
      setShowAddMovie(false)
      toast.success("Movie added", `"${newMovie.title}" has been added successfully.`)
    } catch (err: any) {
      toast.error("Failed to add movie", err.message)
    }
    finally { setAddingMovie(false) }
  }

  const handleDeleteMovie = async (id: number) => {
    const movie = movieList.find(m => m.id === id)
    if (!confirm("Delete this movie?")) return
    try {
      const res  = await fetch(`${API_URL}/admin/movies/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      await fetchMovies()
      toast.success("Movie deleted", movie ? `"${movie.title}" has been removed.` : undefined)
    } catch (err: any) {
      toast.error("Failed to delete movie", err.message)
    }
  }

  const handleOpenEdit = (movie: Movie) => {
    setEditMovie({
      id: movie.id, title: movie.title, description: movie.description || "",
      genre: movie.genre || "", category: movie.category, language: movie.language || "",
      duration_mins: movie.duration_mins?.toString() || "", release_date: movie.release_date || "",
      poster_url: movie.poster_url || "",carasol_url: movie.carasol_url || "", trailer_url: movie.trailer_url || "",
      status: movie.status, is_active: movie.is_active,
    })
    setShowEditMovie(true)
  }

  const handleEditMovie = async () => {
    if (!editMovie.title) return
    setEditingMovie(true)
    try {
      const res  = await fetch(`${API_URL}/admin/movies/${editMovie.id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editMovie.title, description: editMovie.description || null, genre: editMovie.genre || null,
          category: editMovie.category, language: editMovie.language || null,
          duration_mins: editMovie.duration_mins ? parseInt(editMovie.duration_mins as string) : null,
          release_date: editMovie.release_date || null, poster_url: editMovie.poster_url || null,
          trailer_url: editMovie.trailer_url || null, status: editMovie.status, is_active: editMovie.is_active,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      await fetchMovies()
      setShowEditMovie(false)
      toast.success("Movie updated", `"${editMovie.title}" has been saved.`)
    } catch (err: any) {
      toast.error("Failed to update movie", err.message)
    }
    finally { setEditingMovie(false) }
  }

  const handleToggleActive = async (movie: Movie) => {
    setMovieList(prev => prev.map(m => m.id === movie.id ? { ...m, is_active: !m.is_active } : m))
    try {
      const res  = await fetch(`${API_URL}/admin/movies/${movie.id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !movie.is_active }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success(
        !movie.is_active ? "Movie activated" : "Movie deactivated",
        `"${movie.title}" is now ${!movie.is_active ? "active" : "inactive"}.`
      )
    } catch (err: any) {
      setMovieList(prev => prev.map(m => m.id === movie.id ? { ...m, is_active: movie.is_active } : m))
      toast.error("Failed to update", err.message)
    }
  }

  const handleAddScreening = async () => {
    const { movie_id, hall_id, show_date, start_time } = newScreening
    if (!movie_id || !hall_id || !show_date || !start_time) {
      toast.warning("Missing fields", "Please fill in all required fields.")
      return
    }
    try {
      const selectedHall = hallList.find(h => h.id === parseInt(hall_id))
      const seats = newScreening.available_seats ? parseInt(newScreening.available_seats) : selectedHall?.capacity || 100
      const res  = await fetch(`${API_URL}/admin/screenings`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ movie_id: parseInt(movie_id), hall_id: parseInt(hall_id), show_date, start_time, available_seats: seats }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success("Screening added", `Scheduled for ${formatTime12(start_time + ":00")} on ${show_date}.`)
      setNewScreening({ movie_id: "", hall_id: "", show_date: "", start_time: "", available_seats: "" })
      setTakenSlots([])
      setShowAddScreening(false)
    } catch (err: any) {
      toast.error("Failed to add screening", err.message)
    }
  }

  const handleInlineAddScreening = async () => {
    if (!editScreeningMovie || !editScreeningDate) return
    const { hall_id, start_time } = inlineNewScreening
    if (!hall_id || !start_time) {
      toast.warning("Missing fields", "Hall and start time are required.")
      return
    }
    try {
      const selectedHall = hallList.find(h => h.id === parseInt(hall_id))
      const seats = inlineNewScreening.available_seats ? parseInt(inlineNewScreening.available_seats) : selectedHall?.capacity || 100
      const res  = await fetch(`${API_URL}/admin/screenings`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ movie_id: editScreeningMovie.id, hall_id: parseInt(hall_id), show_date: editScreeningDate, start_time, available_seats: seats }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success("Screening added")
      setInlineNewScreening({ hall_id: "", start_time: "", available_seats: "" })
      setTakenSlots([])
      setShowInlineAdd(false)
      fetchScreeningsForEdit(editScreeningMovie.id, editScreeningDate)
    } catch (err: any) {
      toast.error("Failed to add screening", err.message)
    }
  }

  const handleApplyDiscount = async () => {
    if (!discountName || !discountStartDate || !discountEndDate) {
      toast.warning("Missing fields", "Please fill in discount name, start date, and end date.")
      return
    }
    setApplyingDiscount(true)
    try {
      const res  = await fetch(`${API_URL}/admin/discounts`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name:              discountName,
          theater_id:        parseInt(discountTheater),
          standard_pct:      parseInt(discountStandard)     || 0,
          semi_recliner_pct: parseInt(discountSemiRecliner) || 0,
          premium_pct:       parseInt(discountPremium)      || 0,
          vip_pct:           parseInt(discountVip)          || 0,
          start_date:        discountStartDate,
          end_date:          discountEndDate,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success("Discount applied", `"${discountName}" is now active.`)
      setDiscountName(""); setDiscountStandard(""); setDiscountSemiRecliner("")
      setDiscountPremium(""); setDiscountVip(""); setDiscountStartDate(""); setDiscountEndDate("")
      fetchActiveDiscounts()
    } catch (err: any) {
      toast.error("Failed to apply discount", err.message)
    } finally {
      setApplyingDiscount(false)
    }
  }

  const handleRemoveDiscount = async (id: number) => {
    const discount = activeDiscounts.find(d => d.id === id)
    if (!confirm("Remove this discount?")) return
    try {
      const res  = await fetch(`${API_URL}/admin/discounts/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success("Discount removed", discount ? `"${discount.name}" has been removed.` : undefined)
      fetchActiveDiscounts()
    } catch (err: any) {
      toast.error("Failed to remove discount", err.message)
    }
  }

  const setMovieField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value
    setNewMovie(prev => ({ ...prev, [field]: value }))
  }
  const setEditField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value
    setEditMovie(prev => ({ ...prev, [field]: value }))
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const nowShowing   = movieList.filter(m => m.status === "now_showing")
  const comingSoon   = movieList.filter(m => m.status === "coming_soon")
  const nowActive    = nowShowing.filter(m => m.is_active)
  const nowInactive  = nowShowing.filter(m => !m.is_active)
  const soonActive   = comingSoon.filter(m => m.is_active)
  const soonInactive = comingSoon.filter(m => !m.is_active)

  const unreadCount   = inboxMessages.filter(m => !m.is_read).length
  const filteredInbox = inboxMessages.filter(m =>
    inboxFilter === "all" ? true : inboxFilter === "unread" ? !m.is_read : m.is_read
  )

  const daysInMonth  = getDaysInMonth(calYear, calMonth)
  const firstDay     = getFirstDayOfMonth(calYear, calMonth)
  const todayStr     = getTodayBDStr()

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) } else setCalMonth(m => m - 1) }
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) } else setCalMonth(m => m + 1) }

  // Analytics derived values
  const dailyData   = analytics?.daily || []
  const maxIncome   = dailyData.length > 0 ? Math.max(...dailyData.map((d: any) => d.total_revenue), 1) : 1
  const totalIncome = analytics?.summary?.total_revenue || 0

  const getSeatRev = (type: string): number =>
    (analytics?.by_seat || []).find((s: any) => s.seat_type === type)?.revenue || 0

  const totalStandard     = getSeatRev("standard")
  const totalSemiRecliner = getSeatRev("semi_recliner")
  const totalPremium      = getSeatRev("premium")
  const totalVip          = getSeatRev("vip")

  const fmt = (n: number) => n >= 1000 ? `৳${(n / 1000).toFixed(1)}k` : `৳${n}`

  // ── Styles ──────────────────────────────────────────────────────────────────
  const PRIMARY    = "#6B1829"
  const PRIMARY_LT = "#f9e8eb"
  const BG         = "#f4f4f6"
  const CARD       = "#ffffff"
  const TEXT       = "#1a1a1a"
  const MUTED      = "#6b7280"
  const BORDER     = "#e5e7eb"

  const s = {
    wrapper: {
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: BG,
      minHeight: "100vh",
      color: TEXT,
    } as React.CSSProperties,

    tabBar: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
      padding: "0.75rem 2rem",
      background: CARD,
      borderBottom: `1px solid ${BORDER}`,
    } as React.CSSProperties,

    tabItem: (active: boolean): React.CSSProperties => ({
      padding: "0.45rem 1.1rem",
      borderRadius: "999px",
      fontSize: "0.82rem",
      fontWeight: 600,
      cursor: "pointer",
      border: active ? "none" : `1px solid ${BORDER}`,
      background: active ? PRIMARY : "transparent",
      color: active ? "white" : MUTED,
      transition: "all 0.15s",
    }),
    tabBadge: {
      background: PRIMARY,
      color: "white",
      borderRadius: "999px",
      fontSize: "0.6rem",
      fontWeight: 700,
      padding: "0.1rem 0.4rem",
      marginLeft: "0.3rem",
    } as React.CSSProperties,

    body: {
      display: "grid",
      gridTemplateColumns: "440px 1fr 220px",
      gap: "1.5rem",
      padding: "1.5rem",
      maxWidth: "1500px",
      margin: "0 auto",
    } as React.CSSProperties,

    card: {
      background: CARD,
      borderRadius: "14px",
      border: `1px solid ${BORDER}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      overflow: "hidden" as const,
    } as React.CSSProperties,

    calHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 1.5rem 1rem" },
    calTitle: { fontSize: "1.4rem", fontWeight: 700, color: TEXT },
    calNav: { display: "flex", gap: "0.5rem" },
    calNavBtn: {
      background: PRIMARY_LT, border: `1px solid ${BORDER}`,
      color: PRIMARY, width: "34px", height: "34px",
      borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem",
      display: "flex", alignItems: "center", justifyContent: "center",
    } as React.CSSProperties,
    calGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 1.25rem 1.25rem", gap: "3px" },
    calDayLabel: { textAlign: "center" as const, fontSize: "0.72rem", fontWeight: 700, color: MUTED, padding: "0.5rem 0", textTransform: "uppercase" as const },
    calDay: (isToday: boolean, isSelected: boolean, isEmpty: boolean): React.CSSProperties => ({
      textAlign: "center", fontSize: "0.88rem",
      fontWeight: isToday || isSelected ? 700 : 400,
      padding: "0.55rem 0.25rem", borderRadius: "8px",
      cursor: isEmpty ? "default" : "pointer",
      color: isEmpty ? "transparent" : isToday ? PRIMARY : isSelected ? "white" : TEXT,
      background: isSelected && !isToday ? PRIMARY : isToday ? PRIMARY_LT : "transparent",
      border: isSelected ? `1px solid ${PRIMARY}` : "1px solid transparent",
      outline: isToday && !isSelected ? `1.5px solid ${PRIMARY}` : "none",
    }),

    scheduleWrap: { padding: "0 1.5rem 1.5rem", maxHeight: "300px", overflowY: "auto" as const },
    scheduleItem: {
      display: "flex", alignItems: "center", gap: "0.85rem",
      padding: "0.75rem 0.85rem", borderRadius: "10px", marginBottom: "0.5rem",
      background: "#fafafa", border: `1px solid ${BORDER}`,
    } as React.CSSProperties,
    scheduleTime: { fontSize: "0.72rem", fontWeight: 700, color: MUTED, width: "58px", flexShrink: 0 } as React.CSSProperties,
    scheduleInfo: { flex: 1, minWidth: 0 },
    scheduleTitle: { fontSize: "0.85rem", fontWeight: 700, color: TEXT, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
    scheduleSub: { fontSize: "0.72rem", color: MUTED, marginTop: "0.1rem" },

    rightCol: { display: "flex", flexDirection: "column" as const, gap: "1.25rem" },

    discountCard: {
      background: PRIMARY, borderRadius: "14px", padding: "1.25rem",
      position: "relative" as const, overflow: "hidden",
      boxShadow: "0 4px 20px rgba(107,24,41,0.3)",
    },
    discountTitle: { fontSize: "0.95rem", fontWeight: 800, color: "white", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" },
    discountInp: {
      background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: "8px", padding: "0.45rem 0.6rem", color: "white",
      fontSize: "0.78rem", fontWeight: 600, width: "100%",
      boxSizing: "border-box" as const, outline: "none",
    },
    discountLabel: { fontSize: "0.6rem", color: "rgba(255,255,255,0.75)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "0.2rem" },
    discountSelect: {
      background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: "8px", padding: "0.45rem 0.6rem", color: "white",
      fontSize: "0.78rem", fontWeight: 600, width: "100%",
      boxSizing: "border-box" as const, outline: "none", cursor: "pointer",
    },

    incomeCard: { background: CARD, borderRadius: "14px", border: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "1.25rem" },
    incomeHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
    incomeTitle: { fontSize: "0.95rem", fontWeight: 700, color: TEXT },
    incomeFilters: { display: "flex", gap: "0.5rem" },
    incomeSel: { background: "#f9fafb", border: `1px solid ${BORDER}`, borderRadius: "8px", color: TEXT, fontSize: "0.72rem", padding: "0.3rem 0.6rem", cursor: "pointer", outline: "none" } as React.CSSProperties,
    incomeStats: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.5rem", marginBottom: "1rem" },
    incomeStat: { display: "flex", flexDirection: "column" as const },
    incomeStatVal: { fontSize: "1.2rem", fontWeight: 800, color: TEXT },
    incomeStatLabel: { fontSize: "0.7rem", color: MUTED, fontWeight: 500, display: "flex", alignItems: "center", gap: "0.3rem" },
    incomeStatDot: (color: string): React.CSSProperties => ({ width: "7px", height: "7px", borderRadius: "50%", background: color }),
    barChart: { display: "flex", alignItems: "flex-end", gap: "0.5rem", height: "100px" },
    barWrap: { flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "0.4rem", height: "100%" },
    barStack: { flex: 1, width: "100%", display: "flex", flexDirection: "column" as const, justifyContent: "flex-end", gap: "2px" },
    barSeg: (h: number, color: string): React.CSSProperties => ({
      width: "100%", borderRadius: "4px 4px 0 0", background: color,
      height: `${h}%`, minHeight: h > 0 ? "3px" : "0", transition: "height 0.3s",
    }),
    barLabel: { fontSize: "0.6rem", color: MUTED, fontWeight: 600 },
  }

  // ── Movie card ─────────────────────────────────────────────────────────────
  const MovieCard = ({ movie }: { movie: Movie }) => (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "border-color 0.15s" }}>
      <div style={{ height: "200px", position: "relative", overflow: "hidden" }}>
        <MoviePoster movie={movie} />
        <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", display: "flex", gap: "0.3rem" }}>
          <span style={{ background: movie.status === "now_showing" ? "#10b981" : "#f59e0b", color: "white", fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "999px" }}>
            {movie.status === "now_showing" ? "NOW" : "SOON"}
          </span>
          <span style={{ background: movie.is_active ? "#3b82f6" : "#9ca3af", color: "white", fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "999px" }}>
            {movie.is_active ? "ACTIVE" : "OFF"}
          </span>
        </div>
      </div>
      <div style={{ padding: "0.75rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: TEXT, marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{movie.title}</div>
        <div style={{ fontSize: "0.68rem", color: MUTED, marginBottom: "0.6rem" }}>{movie.genre || "—"} · {movie.category}{movie.duration_mins ? ` · ${movie.duration_mins}m` : ""}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.65rem", color: movie.is_active ? "#10b981" : MUTED, fontWeight: 700 }}>{movie.is_active ? "Active" : "Inactive"}</span>
          <button onClick={() => handleToggleActive(movie)}
            style={{ width: "36px", height: "20px", borderRadius: "999px", border: "none", background: movie.is_active ? PRIMARY : "#d1d5db", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
            <span style={{ position: "absolute", top: "2px", left: movie.is_active ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button onClick={() => handleOpenEdit(movie)}
            style={{ flex: 1, padding: "0.4rem", background: PRIMARY_LT, border: `1px solid ${PRIMARY}44`, color: PRIMARY, borderRadius: "8px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
            <i className="fa-solid fa-pen" /> Edit
          </button>
          <button onClick={() => handleDeleteMovie(movie.id)}
            style={{ flex: 1, padding: "0.4rem", background: "#fee2e2", border: "1px solid #fca5a5", color: "#ef4444", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
            <i className="fa-solid fa-trash" /> Delete
          </button>
        </div>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.wrapper}>
      {/* ── Toast Notifications ── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div style={s.tabBar}>
        {(["overview","management","inbox","movies"] as const).map(tab => (
          <button key={tab} style={s.tabItem(activeTab === tab)}
            onClick={() => { setActiveTab(tab); if (tab === "inbox") fetchInbox() }}>
            {tab === "overview"    && <><i className="fa-solid fa-gauge-high" style={{ marginRight: "0.35rem" }} />Overview</>}
            {tab === "management" && <><i className="fa-solid fa-sliders" style={{ marginRight: "0.35rem" }} />Management</>}
            {tab === "inbox"      && <><i className="fa-solid fa-inbox" style={{ marginRight: "0.35rem" }} />Inbox{unreadCount > 0 && <span style={s.tabBadge}>{unreadCount}</span>}</>}
            {tab === "movies"     && <><i className="fa-solid fa-film" style={{ marginRight: "0.35rem" }} />Movies</>}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div style={s.body}>
          {/* Left: Calendar + Schedule */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            <div style={s.card}>
              <div style={s.calHeader}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {MONTHS[calMonth]}, {calYear}
                  </div>
                  <div style={s.calTitle}>
                    {calSelectedDate === todayStr ? "Today" : formatDateDisplay(calSelectedDate).split(",")[0]}
                    {calSelectedDate === todayStr && <span style={{ fontSize: "0.82rem", color: PRIMARY, marginLeft: "0.5rem", fontWeight: 600 }}>Today</span>}
                  </div>
                </div>
                <div style={s.calNav}>
                  <button style={s.calNavBtn} onClick={prevMonth}><i className="fa-solid fa-chevron-left" /></button>
                  <button style={s.calNavBtn} onClick={nextMonth}><i className="fa-solid fa-chevron-right" /></button>
                </div>
              </div>

              <div style={s.calGrid}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                  <div key={d} style={s.calDayLabel}>{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e${i}`} style={s.calDay(false, false, true)}>0</div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day     = i + 1
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const isT     = dateStr === todayStr
                  const isSel   = dateStr === calSelectedDate
                  return (
                    <div key={day} style={s.calDay(isT, isSel, false)} onClick={() => setCalSelectedDate(dateStr)}>
                      {day}
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: `1px solid ${BORDER}`, padding: "0.9rem 1.5rem 0.6rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
                  Schedule · {new Date(calSelectedDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </div>
              </div>
              <div style={s.scheduleWrap}>
                {loadingCalScreenings && <div style={{ textAlign: "center", color: MUTED, padding: "1rem", fontSize: "0.8rem" }}>Loading…</div>}
                {!loadingCalScreenings && calScreenings.length === 0 && (
                  <div style={{ textAlign: "center", color: "#9ca3af", padding: "1.5rem", fontSize: "0.8rem" }}>No screenings on this date.</div>
                )}
                {!loadingCalScreenings && calScreenings.map(s2 => {
                  const movie = movieList.find(m => m.id === s2.movie_id)
                  const hall = hallList.find(h => h.name === s2.hall_name || h.id === s2.hall_id)
                  const hallDisplay    = hall?.name || s2.hall_name || "—"
                  const theaterDisplay = hall?.theater?.name || ""
                  const locationLabel  = theaterDisplay ? `${hallDisplay} · ${theaterDisplay}` : hallDisplay
                  return (
                    <div key={s2.id} style={s.scheduleItem}>
                      <div style={s.scheduleTime}>{formatTime12(s2.start_time)}</div>
                      <div style={{ width: "36px", height: "36px", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                        {movie ? <MoviePoster movie={movie} /> : <div style={{ background: BORDER, width: "100%", height: "100%" }} />}
                      </div>
                      <div style={s.scheduleInfo}>
                        <div style={s.scheduleTitle}>{movie?.title || "Unknown"}</div>
                        <div style={s.scheduleSub}>{locationLabel}</div>
                      </div>
                      {s2.available_seats === 0 && (
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ef4444", flexShrink: 0 }}>SOLD OUT</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Middle column: Discount + Active Discounts + Income */}
          <div style={s.rightCol}>

            {/* Discount Widget */}
            <div style={s.discountCard}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
              <div style={{ position: "absolute", bottom: "-30px", right: "60px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
              <div style={s.discountTitle}>
                <i className="fa-solid fa-tag" />
                Issue Seat Discount
              </div>

              {/* Offer Name — full width */}
              <div style={{ marginBottom: "0.6rem" }}>
                <div style={s.discountLabel}>Offer Name</div>
                <input type="text" placeholder="e.g. Eid Special" style={s.discountInp}
                  value={discountName} onChange={e => setDiscountName(e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.6rem" }}>
                <div>
                  <div style={s.discountLabel}>Theatre</div>
                  <select style={s.discountSelect} value={discountTheater}
                    onChange={e => setDiscountTheater(e.target.value)}>
                    {THEATERS.map(t => (
                      <option key={t.id} value={t.id} style={{ background: "#2a0a10", color: "white" }}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={s.discountLabel}>Standard %</div>
                  <input type="number" min={0} max={100} placeholder="e.g. 10" style={s.discountInp}
                    value={discountStandard} onChange={e => setDiscountStandard(e.target.value)} />
                </div>
                <div>
                  <div style={s.discountLabel}>Semi-Recliner %</div>
                  <input type="number" min={0} max={100} placeholder="e.g. 15" style={s.discountInp}
                    value={discountSemiRecliner} onChange={e => setDiscountSemiRecliner(e.target.value)} />
                </div>
                <div>
                  <div style={s.discountLabel}>Premium %</div>
                  <input type="number" min={0} max={100} placeholder="e.g. 20" style={s.discountInp}
                    value={discountPremium} onChange={e => setDiscountPremium(e.target.value)} />
                </div>
                <div>
                  <div style={s.discountLabel}>VIP %</div>
                  <input type="number" min={0} max={100} placeholder="e.g. 25" style={s.discountInp}
                    value={discountVip} onChange={e => setDiscountVip(e.target.value)} />
                </div>
                <div>
                  <div style={s.discountLabel}>Start Date</div>
                  <input type="date" style={s.discountInp}
                    value={discountStartDate} onChange={e => setDiscountStartDate(e.target.value)} />
                </div>
                <div>
                  <div style={s.discountLabel}>End Date</div>
                  <input type="date" style={s.discountInp}
                    value={discountEndDate} onChange={e => setDiscountEndDate(e.target.value)} />
                </div>
              </div>

              <button onClick={handleApplyDiscount} disabled={applyingDiscount}
                style={{ marginTop: "0.25rem", background: "white", color: PRIMARY, border: "none", borderRadius: "10px", padding: "0.6rem 1.5rem", fontWeight: 800, fontSize: "0.82rem", cursor: applyingDiscount ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <i className="fa-solid fa-check" />
                {applyingDiscount ? "Applying…" : "Apply Discount"}
              </button>
            </div>

            {/* Active Discounts card */}
            {activeDiscounts.length > 0 && (
              <div style={{ background: CARD, borderRadius: "14px", border: `1px solid ${BORDER}`, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: TEXT, marginBottom: "0.6rem" }}>
                  <i className="fa-solid fa-tag" style={{ color: PRIMARY, marginRight: "0.4rem" }} />
                  Active Discounts
                </div>
                {activeDiscounts.map(d => {
                  const theater = THEATERS.find(t => String(t.id) === String(d.theater_id))

                  const formatDate = (iso: string) =>
                    new Date(iso).toLocaleString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                      hour: "numeric", minute: "2-digit", hour12: true
                    })

                  const discountBadges: { label: string; pct: number }[] = [
                    { label: "Standard", pct: d.standard_pct },
                    { label: "Semi-Recliner", pct: d.semi_recliner_pct },
                    { label: "Premium", pct: d.premium_pct },
                    { label: "VIP", pct: d.vip_pct },
                  ].filter(b => b.pct > 0)

                  return (
                    <div
                      key={d.id}
                      style={{
                        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                        padding: "0.75rem 0.875rem", borderRadius: "10px",
                        background: "#fdf2f4", border: `1px solid ${PRIMARY}33`, marginBottom: "0.5rem"
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: PRIMARY, marginBottom: "0.25rem" }}>
                          {d.name}
                        </div>
                        {theater && (
                          <div style={{
                            display: "inline-flex", alignItems: "center", gap: "0.25rem",
                            background: `${PRIMARY}12`, border: `1px solid ${PRIMARY}33`,
                            borderRadius: "999px", padding: "0.15rem 0.55rem",
                            fontSize: "0.7rem", fontWeight: 600, color: PRIMARY,
                            marginBottom: "0.35rem"
                          }}>
                            <i className="fa-solid fa-clapperboard" style={{ fontSize: "0.6rem" }} />
                            {theater.name}
                          </div>
                        )}
                        <div style={{ fontSize: "0.72rem", color: MUTED, marginBottom: "0.4rem" }}>
                          <i className="fa-regular fa-calendar" style={{ marginRight: "0.3rem" }} />
                          {formatDate(d.start_date)}
                          <span style={{ margin: "0 0.3rem", opacity: 0.5 }}>→</span>
                          {formatDate(d.end_date)}
                        </div>
                        {discountBadges.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                            {discountBadges.map(b => (
                              <span
                                key={b.label}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: "0.2rem",
                                  background: `${PRIMARY}18`, color: PRIMARY,
                                  border: `1px solid ${PRIMARY}44`,
                                  borderRadius: "999px", padding: "0.15rem 0.55rem",
                                  fontSize: "0.68rem", fontWeight: 700
                                }}
                              >
                                <i className="fa-solid fa-percent" style={{ fontSize: "0.55rem" }} />
                                {b.label}: {b.pct}% off
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveDiscount(d.id)}
                        aria-label={`Remove discount ${d.name}`}
                        style={{
                          background: "#fee2e2", color: "#dc2626", border: "none",
                          borderRadius: "6px", padding: "0.35rem 0.6rem",
                          fontSize: "0.75rem", cursor: "pointer", marginLeft: "0.75rem",
                          flexShrink: 0, alignSelf: "flex-start"
                        }}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Income */}
            <div style={s.incomeCard}>
              <div style={s.incomeHeader}>
                <div style={s.incomeTitle}><i className="fa-solid fa-chart-column" style={{ color: PRIMARY, marginRight: "0.4rem" }} />Income</div>
                <div style={s.incomeFilters}>
                  <select style={s.incomeSel} value={incomeMonth} onChange={e => setIncomeMonth(e.target.value)}>
                    <option value="all">All Months</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select style={s.incomeSel} value={incomeTheater} onChange={e => setIncomeTheater(e.target.value)}>
                    <option value="all">All Theatres</option>
                    {THEATERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <select style={s.incomeSel} value={incomeMovie} onChange={e => setIncomeMovie(e.target.value)}>
                    <option value="all">All Movies</option>
                    {movieList.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
              </div>

              {/* Total + seat type breakdown */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={s.incomeStat}>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: TEXT }}>{fmt(totalIncome)}</div>
                  <div style={s.incomeStatLabel}>Total Revenue</div>
                </div>
              </div>
              <div style={s.incomeStats}>
                <div style={s.incomeStat}>
                  <div style={{ ...s.incomeStatVal, color: PRIMARY }}>{fmt(totalStandard)}</div>
                  <div style={s.incomeStatLabel}><span style={s.incomeStatDot(PRIMARY)} />Standard</div>
                </div>
                <div style={s.incomeStat}>
                  <div style={{ ...s.incomeStatVal, color: "#7c3aed" }}>{fmt(totalSemiRecliner)}</div>
                  <div style={s.incomeStatLabel}><span style={s.incomeStatDot("#7c3aed")} />Semi Recliner</div>
                </div>
                <div style={s.incomeStat}>
                  <div style={{ ...s.incomeStatVal, color: "#0369a1" }}>{fmt(totalPremium)}</div>
                  <div style={s.incomeStatLabel}><span style={s.incomeStatDot("#0369a1")} />Premium</div>
                </div>
                <div style={s.incomeStat}>
                  <div style={{ ...s.incomeStatVal, color: "#b45309" }}>{fmt(totalVip)}</div>
                  <div style={s.incomeStatLabel}><span style={s.incomeStatDot("#b45309")} />VIP</div>
                </div>
              </div>

              {/* Bar chart */}
              <div style={s.barChart}>
                {loadingAnalytics ? (
                  <div style={{ color: MUTED, fontSize: "0.8rem", margin: "auto" }}>
                    <i className="fa-solid fa-spinner fa-spin" />
                  </div>
                ) : dailyData.length === 0 ? (
                  <div style={{ color: "#9ca3af", fontSize: "0.78rem", margin: "auto", textAlign: "center" as const }}>
                    No bookings this period.
                  </div>
                ) : (
                  dailyData.map((d: any) => {
                    const regH = Math.round((d.regular_revenue / maxIncome) * 100)
                    const preH = Math.round((d.premium_revenue / maxIncome) * 100)
                    return (
                      <div key={d.day} style={s.barWrap}>
                        <div style={s.barStack}>
                          <div style={s.barSeg(preH, "#e5e7eb")} title={`Premium: ${fmt(d.premium_revenue)}`} />
                          <div style={s.barSeg(regH, PRIMARY)}   title={`Regular: ${fmt(d.regular_revenue)}`} />
                        </div>
                        <div style={s.barLabel}>{d.day}</div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Breakdown tables */}
              {analytics?.by_movie?.length > 0 && (
                <div style={{ marginTop: "1rem", borderTop: `1px solid ${BORDER}`, paddingTop: "0.75rem" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                    By Movie
                  </div>
                  {analytics.by_movie.slice(0, 5).map((m: any) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem", fontSize: "0.78rem" }}>
                      <span style={{ color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "65%" }}>{m.title}</span>
                      <span style={{ color: PRIMARY, fontWeight: 700, flexShrink: 0 }}>{fmt(m.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}

              {analytics?.by_theater?.length > 0 && (
                <div style={{ marginTop: "0.75rem", borderTop: `1px solid ${BORDER}`, paddingTop: "0.75rem" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                    By Theater
                  </div>
                  {analytics.by_theater.map((t: any) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem", fontSize: "0.78rem" }}>
                      <span style={{ color: TEXT }}>{t.name}</span>
                      <span style={{ color: PRIMARY, fontWeight: 700 }}>{fmt(t.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}

              {analytics?.by_seat?.length > 0 && (
                <div style={{ marginTop: "0.75rem", borderTop: `1px solid ${BORDER}`, paddingTop: "0.75rem" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                    By Seat Type
                  </div>
                  {analytics.by_seat.map((s: any) => (
                    <div key={s.seat_type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem", fontSize: "0.78rem" }}>
                      <span style={{ color: TEXT, textTransform: "capitalize" as const }}>{s.seat_type.replace("_", " ")}</span>
                      <span style={{ color: MUTED, fontWeight: 600 }}>{s.bookings} tickets · <span style={{ color: PRIMARY }}>{fmt(s.revenue)}</span></span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column: stat cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Total Movies",  value: movieList.length,  icon: "fa-film",       color: "#3b82f6" },
              { label: "Now Showing",   value: nowShowing.length, icon: "fa-circle-play", color: "#10b981" },
              { label: "Coming Soon",   value: comingSoon.length, icon: "fa-clock",       color: "#f59e0b" },
            ].map(stat => (
              <div key={stat.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "1.25rem 1.25rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <i className={`fa-solid ${stat.icon}`} style={{ color: stat.color, fontSize: "1.25rem" }} />
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: TEXT, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: "0.78rem", color: MUTED, fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MANAGEMENT TAB ── */}
      {activeTab === "management" && (
        <div style={{ padding: "1.5rem", maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: "700px" }}>
            {[
              { label: "Movie Management",     icon: "fa-film",         desc: "Add, edit and remove movies from the catalogue", action: () => setShowAddMovie(true),     red: true  },
              { label: "Screening Management", icon: "fa-clapperboard", desc: "Schedule and manage screening sessions",          action: () => setShowAddScreening(true), red: true  },
            ].map(m => (
              <div key={m.label} onClick={m.action} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && m.action()}
                style={{ background: m.red ? PRIMARY : CARD, border: `1px solid ${m.red ? PRIMARY : BORDER}`, borderRadius: "16px", padding: "2rem", cursor: "pointer", transition: "opacity 0.15s, transform 0.1s", boxShadow: m.red ? "0 4px 20px rgba(107,24,41,0.25)" : "0 1px 4px rgba(0,0,0,0.05)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1" }}>
                <div style={{ width: "56px", height: "56px", background: m.red ? "rgba(255,255,255,0.15)" : PRIMARY_LT, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  <i className={`fa-solid ${m.icon}`} style={{ color: m.red ? "white" : PRIMARY, fontSize: "1.4rem" }} />
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem", color: m.red ? "white" : TEXT, marginBottom: "0.4rem" }}>{m.label}</div>
                <div style={{ fontSize: "0.82rem", color: m.red ? "rgba(255,255,255,0.7)" : MUTED }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INBOX TAB ── */}
      {activeTab === "inbox" && (
        <div style={{ padding: "1.25rem", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: TEXT }}>Inbox</div>
              <div style={{ fontSize: "0.75rem", color: MUTED }}>{inboxMessages.length} total · {unreadCount} unread</div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {(["all","unread","read"] as const).map(f => (
                <button key={f} onClick={() => setInboxFilter(f)}
                  style={{ padding: "0.35rem 0.9rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", border: `1px solid ${BORDER}`, background: inboxFilter === f ? PRIMARY : CARD, color: inboxFilter === f ? "white" : MUTED, transition: "all 0.15s" }}>
                  {f === "all" ? `All (${inboxMessages.length})` : f === "unread" ? `Unread (${unreadCount})` : `Read (${inboxMessages.length - unreadCount})`}
                </button>
              ))}
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead}
                  style={{ padding: "0.35rem 0.9rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", border: `1px solid ${BORDER}`, background: CARD, color: MUTED }}>
                  <i className="fa-solid fa-check-double" style={{ marginRight: "0.3rem" }} />Mark all read
                </button>
              )}
            </div>
          </div>

          {loadingInbox && <div style={{ textAlign: "center", color: MUTED, padding: "3rem" }}><i className="fa-solid fa-spinner fa-spin" /></div>}
          {!loadingInbox && inboxError && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#ef4444", borderRadius: "10px", padding: "0.85rem 1rem", fontSize: "0.85rem" }}>{inboxError}</div>}
          {!loadingInbox && !inboxError && filteredInbox.length === 0 && (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: "3rem", fontSize: "0.9rem" }}>No messages.</div>
          )}

          {!loadingInbox && !inboxError && filteredInbox.map(msg => {
            const sc   = SUBJECT_COLORS[msg.subject] || SUBJECT_COLORS["Other"]
            const isExp = expandedMsgId === msg.id
            const dateStr = new Date(msg.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            const timeStr = new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
            return (
              <div key={msg.id} style={{ background: CARD, border: `1px solid ${msg.is_read ? BORDER : PRIMARY + "66"}`, borderLeft: `3px solid ${msg.is_read ? BORDER : PRIMARY}`, borderRadius: "10px", marginBottom: "0.5rem", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div onClick={() => setExpandedMsgId(isExp ? null : msg.id)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", cursor: "pointer" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: msg.is_read ? "transparent" : PRIMARY, flexShrink: 0 }} />
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: PRIMARY, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>{msg.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.2rem" }}>
                      <span style={{ fontWeight: msg.is_read ? 500 : 700, fontSize: "0.85rem", color: TEXT }}>{msg.name}</span>
                      <span style={{ fontSize: "0.65rem", color: MUTED }}>{msg.email}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <span style={{ background: sc.bg, color: sc.color, fontSize: "0.62rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "999px" }}>{msg.subject}</span>
                      <span style={{ fontSize: "0.75rem", color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.message.slice(0, 60)}{msg.message.length > 60 ? "…" : ""}</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.68rem", color: MUTED }}>{dateStr}</span>
                    {!msg.is_read && <span style={{ background: PRIMARY, color: "white", fontSize: "0.58rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: "999px" }}>NEW</span>}
                  </div>
                  <i className={`fa-solid fa-chevron-${isExp ? "up" : "down"}`} style={{ fontSize: "0.65rem", color: MUTED, flexShrink: 0 }} />
                </div>
                {isExp && (
                  <div style={{ borderTop: `1px solid ${BORDER}`, padding: "1rem", background: "#fafafa" }}>
                    <div style={{ display: "flex", gap: "2rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                      <div><div style={{ fontSize: "0.62rem", color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: "0.15rem" }}>From</div><div style={{ fontSize: "0.82rem", color: TEXT }}>{msg.name} · {msg.email}</div></div>
                      <div><div style={{ fontSize: "0.62rem", color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: "0.15rem" }}>Received</div><div style={{ fontSize: "0.82rem", color: TEXT }}>{dateStr} at {timeStr}</div></div>
                    </div>
                    <div style={{ fontSize: "0.62rem", color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem" }}>Message</div>
                    <div style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.7, background: CARD, border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "0.75rem 1rem", whiteSpace: "pre-wrap", marginBottom: "0.75rem" }}>{msg.message}</div>
                    {!msg.is_read && (
                      <button onClick={() => handleMarkRead(msg.id)} disabled={markingReadId === msg.id}
                        style={{ background: PRIMARY, color: "white", border: "none", borderRadius: "8px", padding: "0.4rem 1rem", fontSize: "0.78rem", fontWeight: 700, cursor: markingReadId === msg.id ? "wait" : "pointer" }}>
                        {markingReadId === msg.id ? "Marking…" : <><i className="fa-solid fa-check" style={{ marginRight: "0.35rem" }} />Mark as read</>}
                      </button>
                    )}
                    {msg.is_read && <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}><i className="fa-solid fa-circle-check" style={{ marginRight: "0.35rem" }} />Read</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── MOVIES TAB ── */}
      {activeTab === "movies" && (
        <div style={{ padding: "1.25rem", maxWidth: "1400px", margin: "0 auto" }}>
          {loadingMovies && <div style={{ textAlign: "center", color: MUTED, padding: "3rem" }}><i className="fa-solid fa-spinner fa-spin" /></div>}
          {movieError    && <div style={{ color: "#ef4444", padding: "1rem" }}>{movieError}</div>}

          {!loadingMovies && (
            <>
              <section style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <span style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.75rem" }}>
                    <i className="fa-solid fa-circle" style={{ fontSize: "0.45rem", marginRight: "0.35rem", verticalAlign: "middle" }} />NOW SHOWING
                  </span>
                  <span style={{ color: MUTED, fontSize: "0.75rem" }}>{nowShowing.length} movie{nowShowing.length !== 1 ? "s" : ""}</span>
                </div>

                {nowActive.length > 0 && (
                  <>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>Active</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                      {nowActive.map(m => <MovieCard key={m.id} movie={m} />)}
                    </div>
                  </>
                )}
                {nowInactive.length > 0 && (
                  <>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>Inactive</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "0.75rem" }}>
                      {nowInactive.map(m => <MovieCard key={m.id} movie={m} />)}
                    </div>
                  </>
                )}
                {nowShowing.length === 0 && <p style={{ color: MUTED, fontSize: "0.85rem" }}>No movies currently showing.</p>}
              </section>

              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.75rem" }}>
                    <i className="fa-regular fa-circle" style={{ fontSize: "0.45rem", marginRight: "0.35rem", verticalAlign: "middle" }} />COMING SOON
                  </span>
                  <span style={{ color: MUTED, fontSize: "0.75rem" }}>{comingSoon.length} movie{comingSoon.length !== 1 ? "s" : ""}</span>
                </div>

                {soonActive.length > 0 && (
                  <>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>Active</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                      {soonActive.map(m => <MovieCard key={m.id} movie={m} />)}
                    </div>
                  </>
                )}
                {soonInactive.length > 0 && (
                  <>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>Inactive</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "0.75rem" }}>
                      {soonInactive.map(m => <MovieCard key={m.id} movie={m} />)}
                    </div>
                  </>
                )}
                {comingSoon.length === 0 && <p style={{ color: MUTED, fontSize: "0.85rem" }}>No upcoming movies.</p>}
              </section>
            </>
          )}
        </div>
      )}

      {/* ════════════════ MODALS ════════════════ */}

      {/* Add Movie */}
      {showAddMovie && (
        <div style={modalBackdrop} onClick={() => setShowAddMovie(false)}>
          <div style={modalWide} onClick={e => e.stopPropagation()}>
            <div style={{ background: `linear-gradient(135deg,#2a0a10,${PRIMARY})`, padding: "1.25rem 1.5rem", borderRadius: "16px 16px 0 0" }}>
              <div style={{ color: "white", fontWeight: 800, fontSize: "1rem" }}><i className="fa-solid fa-film" style={{ marginRight: "0.5rem" }} />Add New Movie</div>
            </div>
            <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
              <div>
                <label style={lbl}>Title *</label><input type="text" placeholder="e.g. Oppenheimer" value={newMovie.title} onChange={setMovieField("title")} style={inp} />
                <label style={lbl}>Description</label><textarea placeholder="Short synopsis…" value={newMovie.description} onChange={setMovieField("description")} style={{ ...inp, height: "72px", resize: "vertical" } as React.CSSProperties} rows={3} />
                <label style={lbl}>Genre</label><input type="text" placeholder="e.g. Action, Drama" value={newMovie.genre} onChange={setMovieField("genre")} style={inp} />
                <label style={lbl}>Language</label><input type="text" placeholder="e.g. English, Bangla" value={newMovie.language} onChange={setMovieField("language")} style={inp} />
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select style={inp} value={newMovie.category} onChange={setMovieField("category")}><option value="2D">2D</option><option value="3D">3D</option></select>
                <label style={lbl}>Status</label>
                <select style={inp} value={newMovie.status} onChange={setMovieField("status")}><option value="now_showing">Now Showing</option><option value="coming_soon">Coming Soon</option></select>
                <label style={lbl}>Duration (mins)</label><input type="number" placeholder="e.g. 148" value={newMovie.duration_mins} onChange={setMovieField("duration_mins")} style={inp} min={1} />
                <label style={lbl}>Release Date</label><input type="date" value={newMovie.release_date} onChange={setMovieField("release_date")} style={inp} />
                <label style={lbl}>Poster URL</label><input type="text" placeholder="/posters/movie.jpg" value={newMovie.poster_url} onChange={setMovieField("poster_url")} style={inp} />
                <label style={lbl}>Carousel URL</label>
<input type="text" placeholder="/carasols/movie.jpg" value={newMovie.carasol_url as string} onChange={setMovieField("carasol_url")} style={inp} />
                <label style={lbl}>Trailer URL</label><input type="text" placeholder="https://youtube.com/…" value={newMovie.trailer_url} onChange={setMovieField("trailer_url")} style={inp} />
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input type="checkbox" id="is_active_check" checked={newMovie.is_active as boolean} onChange={setMovieField("is_active")} />
                  <label htmlFor="is_active_check" style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 600 }}>Set as Active</label>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", padding: "0 1.25rem 1.25rem" }}>
              <button onClick={() => setShowAddMovie(false)} style={{ padding: "0.55rem 1.25rem", border: `1.5px solid ${BORDER}`, borderRadius: "10px", background: "white", color: "#374151", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAddMovie} disabled={addingMovie} style={{ padding: "0.55rem 1.5rem", border: "none", borderRadius: "10px", background: PRIMARY, color: "white", fontWeight: 700, cursor: addingMovie ? "wait" : "pointer" }}>
                {addingMovie ? "Adding…" : "Add Movie"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Content Assistant — always mounted, floats over everything */}
      <AIContentAssistant
        onFill={(data) => setNewMovie(prev => ({ ...prev, ...data }))}
      />

      {/* Edit Movie */}
      {showEditMovie && (
        <div style={modalBackdrop} onClick={() => setShowEditMovie(false)}>
          <div style={modalWide} onClick={e => e.stopPropagation()}>
            <div style={{ background: `linear-gradient(135deg,#2a0a10,${PRIMARY})`, padding: "1.25rem 1.5rem", borderRadius: "16px 16px 0 0" }}>
              <div style={{ color: "white", fontWeight: 800, fontSize: "1rem" }}><i className="fa-solid fa-pen" style={{ marginRight: "0.5rem" }} />Edit Movie</div>
            </div>
            <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
              <div>
                <label style={lbl}>Title *</label><input type="text" value={editMovie.title} onChange={setEditField("title")} style={inp} />
                <label style={lbl}>Description</label><textarea value={editMovie.description as string} onChange={setEditField("description")} style={{ ...inp, height: "72px", resize: "vertical" } as React.CSSProperties} rows={3} />
                <label style={lbl}>Genre</label><input type="text" value={editMovie.genre as string} onChange={setEditField("genre")} style={inp} />
                <label style={lbl}>Language</label><input type="text" value={editMovie.language as string} onChange={setEditField("language")} style={inp} />
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select style={inp} value={editMovie.category} onChange={setEditField("category")}><option value="2D">2D</option><option value="3D">3D</option></select>
                <label style={lbl}>Status</label>
                <select style={inp} value={editMovie.status} onChange={setEditField("status")}><option value="now_showing">Now Showing</option><option value="coming_soon">Coming Soon</option></select>
                <label style={lbl}>Duration (mins)</label><input type="number" value={editMovie.duration_mins as string} onChange={setEditField("duration_mins")} style={inp} min={1} />
                <label style={lbl}>Release Date</label><input type="date" value={editMovie.release_date as string} onChange={setEditField("release_date")} style={inp} />
                <label style={lbl}>Poster URL</label><input type="text" value={editMovie.poster_url as string} onChange={setEditField("poster_url")} style={inp} />
                <label style={lbl}>Carousel URL</label>
<input type="text" placeholder="https://…landscape image" value={editMovie.carasol_url as string} onChange={setEditField("carasol_url")} style={inp} />
                <label style={lbl}>Trailer URL</label><input type="text" value={editMovie.trailer_url as string} onChange={setEditField("trailer_url")} style={inp} />
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input type="checkbox" id="edit_is_active_check" checked={editMovie.is_active as boolean} onChange={setEditField("is_active")} />
                  <label htmlFor="edit_is_active_check" style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 600 }}>Set as Active</label>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", padding: "0 1.25rem 1.25rem" }}>
              <button onClick={() => setShowEditMovie(false)} style={{ padding: "0.55rem 1.25rem", border: `1.5px solid ${BORDER}`, borderRadius: "10px", background: "white", color: "#374151", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleEditMovie} disabled={editingMovie} style={{ padding: "0.55rem 1.5rem", border: "none", borderRadius: "10px", background: PRIMARY, color: "white", fontWeight: 700, cursor: editingMovie ? "wait" : "pointer" }}>
                {editingMovie ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Screening */}
      {showAddScreening && (
        <div style={modalBackdrop} onClick={() => { setShowAddScreening(false); setTakenSlots([]) }}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#0a2a10,#1a4d2e)", padding: "1.25rem 1.5rem", borderRadius: "16px 16px 0 0" }}>
              <div style={{ color: "white", fontWeight: 800, fontSize: "1rem" }}><i className="fa-solid fa-clapperboard" style={{ marginRight: "0.5rem" }} />Add New Screening</div>
            </div>
            <div style={{ padding: "1.25rem" }}>
              <label style={lbl}>Movie *</label>
              <select style={inp} value={newScreening.movie_id} onChange={e => setNewScreening(p => ({ ...p, movie_id: e.target.value }))}>
                <option value="" disabled>Select Movie</option>
                {movieList.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              <label style={lbl}>Hall *</label>
              <select style={inp} value={newScreening.hall_id}
                onChange={e => { setNewScreening(p => ({ ...p, hall_id: e.target.value, start_time: "" })); fetchTakenSlots(e.target.value, newScreening.show_date) }}>
                <HallOptions hallList={hallList} />
              </select>
              <label style={lbl}>Show Date *</label>
              <input type="date" style={inp} value={newScreening.show_date}
                onChange={e => { setNewScreening(p => ({ ...p, show_date: e.target.value, start_time: "" })); fetchTakenSlots(newScreening.hall_id, e.target.value) }} />
              <label style={lbl}>Time Slot *</label>
              <SlotButtons selected={newScreening.start_time} takenSlots={takenSlots} onSelect={slot => setNewScreening(p => ({ ...p, start_time: slot }))} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button onClick={() => { setShowAddScreening(false); setTakenSlots([]) }} style={{ padding: "0.55rem 1.25rem", border: `1.5px solid ${BORDER}`, borderRadius: "10px", background: "white", color: "#374151", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleAddScreening} style={{ padding: "0.55rem 1.5rem", border: "none", borderRadius: "10px", background: "#1a4d2e", color: "white", fontWeight: 700, cursor: "pointer" }}>Add Screening</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Screening */}
      {showEditScreening && editScreeningMovie && (
        <div style={modalBackdrop} onClick={() => { setShowEditScreening(false); setShowInlineAdd(false); setEditingScreeningId(null); setTakenSlots([]) }}>
          <div style={modalWide} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#0a1a2e,#1a3a5c)", padding: "1.25rem 1.5rem", borderRadius: "16px 16px 0 0" }}>
              <div style={{ color: "white", fontWeight: 800, fontSize: "1rem" }}><i className="fa-solid fa-pen" style={{ marginRight: "0.5rem" }} />Edit Screenings</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", marginTop: "0.2rem" }}>{editScreeningMovie.title} · {formatDateDisplay(editScreeningDate)}</div>
            </div>
            <div style={{ padding: "1.25rem" }}>
              {loadingScreenings ? (
                <div style={{ textAlign: "center", color: MUTED, padding: "2rem" }}><i className="fa-solid fa-spinner fa-spin" /></div>
              ) : editScreeningList.length === 0 ? (
                <p style={{ color: MUTED, fontSize: "0.85rem" }}>No screenings found.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead><tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Time","Hall","Theater","Actions"].map(h => <th key={h} style={{ textAlign: "left", padding: "0.4rem 0.5rem", color: MUTED, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {editScreeningList.map(s2 => {
                      const mh = hallList.find(h => h.name === s2.hall_name || h.id === s2.hall_id)
                      return (
                        <tr key={s2.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          {editingScreeningId === s2.id ? (
                            <>
                              <td style={{ padding: "0.4rem 0.5rem" }}>
                                <select style={{ ...inp, margin: 0 }} value={editScreeningForm.start_time} onChange={e => setEditScreeningForm(p => ({ ...p, start_time: e.target.value }))}>
                                  <option value="" disabled>Select Slot</option>
                                  {SLOTS.map(slot => <option key={slot} value={slot}>{formatTime12(slot + ":00")}</option>)}
                                </select>
                              </td>
                              <td colSpan={2} style={{ padding: "0.4rem 0.5rem" }}>
                                <select style={{ ...inp, margin: 0 }} value={editScreeningForm.hall_id} onChange={e => setEditScreeningForm(p => ({ ...p, hall_id: e.target.value }))}><HallOptions hallList={hallList} /></select>
                              </td>
                              <td style={{ padding: "0.4rem 0.5rem" }}>
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                  <button onClick={saveEditingScreening} style={{ background: "#10b981", color: "white", border: "none", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer" }}><i className="fa-solid fa-check" /></button>
                                  <button onClick={() => setEditingScreeningId(null)} style={{ background: BORDER, color: "#374151", border: "none", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer" }}><i className="fa-solid fa-xmark" /></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={{ padding: "0.5rem" }}><strong>{formatTime12(s2.start_time)}</strong></td>
                              <td style={{ padding: "0.5rem" }}>{s2.hall_name || mh?.name || "—"}</td>
                              <td style={{ padding: "0.5rem" }}>{mh?.theater?.name || "—"}</td>
                              <td style={{ padding: "0.5rem" }}>
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                  <button onClick={() => startEditingScreening(s2)} style={{ background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer" }}><i className="fa-solid fa-pen" /></button>
                                  <button onClick={() => handleDeleteScreening(s2.id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer" }}><i className="fa-solid fa-trash" /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {showInlineAdd ? (
                <div style={{ background: "#f9fafb", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1rem", marginTop: "0.75rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: TEXT, marginBottom: "0.5rem" }}>Add Another Screening</div>
                  <label style={lbl}>Hall *</label>
                  <select style={inp} value={inlineNewScreening.hall_id}
                    onChange={e => { setInlineNewScreening(p => ({ ...p, hall_id: e.target.value, start_time: "" })); fetchTakenSlots(e.target.value, editScreeningDate) }}>
                    <HallOptions hallList={hallList} />
                  </select>
                  <label style={lbl}>Time Slot *</label>
                  <SlotButtons selected={inlineNewScreening.start_time} takenSlots={takenSlots} onSelect={slot => setInlineNewScreening(p => ({ ...p, start_time: slot }))} />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => { setShowInlineAdd(false); setTakenSlots([]) }} style={{ padding: "0.45rem 1rem", border: `1.5px solid ${BORDER}`, borderRadius: "8px", background: "white", color: "#374151", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
                    <button onClick={handleInlineAddScreening} style={{ padding: "0.45rem 1.25rem", border: "none", borderRadius: "8px", background: "#1a3a5c", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>Add</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setShowInlineAdd(true); setTakenSlots([]) }}
                  style={{ marginTop: "0.75rem", padding: "0.5rem 1rem", border: `1.5px dashed ${BORDER}`, borderRadius: "8px", background: "transparent", color: MUTED, fontWeight: 700, cursor: "pointer", fontSize: "0.78rem", width: "100%" }}>
                  <i className="fa-solid fa-plus" style={{ marginRight: "0.4rem" }} />Add Screening for This Date
                </button>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button onClick={() => { setShowEditScreening(false); setShowInlineAdd(false); setEditingScreeningId(null); setTakenSlots([]) }}
                  style={{ padding: "0.55rem 1.25rem", border: `1.5px solid ${BORDER}`, borderRadius: "10px", background: "white", color: "#374151", fontWeight: 700, cursor: "pointer" }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", padding: "1.5rem", color: "#9ca3af", fontSize: "0.72rem", fontWeight: 500 }}>
        Copyright© 2026 CineBook Limited. All Rights Reserved.
      </div>
    </div>
  )
}