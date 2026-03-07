import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../CSSfiles/UserDashboard.css"

interface Booking {
  id: number
  movie_title: string
  movie_poster: string | null
  show_date: string
  start_time: string
  hall_name: string
  seats: string[]
  total_price: number
  status: "upcoming" | "watched" | "cancelled"
}

interface ProfileData {
  name: string
  email: string
  mobile_number: string
  gender: string
  created_at?: string
}

const TABS    = ["Overview", "My Tickets", "Profile"] as const
type Tab      = typeof TABS[number]
const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"

const posterSrc = (url: string | null): string => {
  if (!url) return ""
  return url.startsWith("/") ? `${BACKEND}${url}` : url
}

const formatTime = (time: string): string => {
  const [h, m] = time.split(":")
  const hour   = parseInt(h)
  const ampm   = hour >= 12 ? "pm" : "am"
  const hour12 = hour % 12 || 12
  return `${String(hour12).padStart(2, "0")}:${m}${ampm}`
}

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  })

function TicketPoster({ title, poster, className }: { title: string; poster: string | null; className: string }) {
  const [failed, setFailed] = useState(false)
  const src = posterSrc(poster)

  if (!src || failed) {
    return (
      <div className={`${className} ticket-poster-fallback`}>
        <i className="fa-solid fa-film" />
      </div>
    )
  }
  return (
    <img src={src} alt={title} className={className} onError={() => setFailed(true)} />
  )
}

function TicketCard({ booking, showStatus }: { booking: Booking; showStatus?: boolean }) {
  return (
    <div className={`ud-ticket-card ${booking.status}`}>
      <TicketPoster
        title={booking.movie_title}
        poster={booking.movie_poster}
        className="ud-ticket-poster"
      />
      <div className="ud-ticket-info">
        <div className="ud-ticket-title">{booking.movie_title}</div>
        <div className="ud-ticket-meta">
          <span><i className="fa-regular fa-calendar" /> {formatDate(booking.show_date)}</span>
          <span><i className="fa-regular fa-clock" /> {formatTime(booking.start_time)}</span>
          <span><i className="fa-solid fa-masks-theater" /> {booking.hall_name}</span>
        </div>
        <div className="ud-ticket-meta">
          <span>
            <i className="fa-solid fa-couch" />{" "}
            {Array.isArray(booking.seats) ? booking.seats.join(", ") : booking.seats}
          </span>
        </div>
      </div>
      <div className="ud-ticket-right">
        {showStatus && (
          <span className={`ud-status-badge ${booking.status}`}>
            {booking.status === "upcoming" ? "Upcoming" : booking.status === "watched" ? "Watched" : "Cancelled"}
          </span>
        )}
        <div className="ud-ticket-total">
          {booking.total_price.toLocaleString()} BDT
        </div>
      </div>
    </div>
  )
}

export default function UserDashboard() {
  const { user, token, logout } = useAuth()
  const navigate                = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>("Overview")

  const [profile, setProfile] = useState<ProfileData>({
    name:          user?.name               || "",
    email:         user?.email              || "",
    mobile_number: (user as any)?.mobile_number || "",
    gender:        (user as any)?.gender        || "",
    created_at:    (user as any)?.created_at    || "",
  })
  const [editMode, setEditMode] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [profErr,  setProfErr]  = useState("")

  const [bookings,      setBookings]      = useState<Booking[]>([])
  const [loadingBooks,  setLoadingBooks]  = useState(true)
  const [bookingsError, setBookingsError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res  = await fetch(`${API_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (!data.success) throw new Error(data.message)
        setProfile({
          name:          data.user.name          || "",
          email:         data.user.email         || "",
          mobile_number: data.user.mobile_number || "",
          gender:        data.user.gender        || "",
          created_at:    data.user.created_at    || "",
        })
      } catch { }
    }
    fetchProfile()
  }, [token])

  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBooks(true)
      setBookingsError("")
      try {
        const res  = await fetch(`${API_URL}/bookings`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (!data.success) throw new Error(data.message)
        setBookings(data.bookings)
      } catch (err: any) {
        setBookingsError(err.message || "Failed to load bookings.")
      } finally {
        setLoadingBooks(false)
      }
    }
    fetchBookings()
  }, [token])

  const upcoming   = bookings.filter(b => b.status === "upcoming")
  const watched    = bookings.filter(b => b.status === "watched")
  const totalSpent = bookings.reduce((sum, b) => sum + b.total_price, 0)

  const initials = profile.name
    .split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "?"

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : ""

  const handleSave = async () => {
    setSaving(true)
    setProfErr("")
    try {
      const res  = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name, mobile_number: profile.mobile_number, gender: profile.gender }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setEditMode(false)
    } catch (err: any) {
      setProfErr(err.message || "Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate("/") }

  
  const tabIcon = (tab: Tab) => {
    if (tab === "Overview")   return "fa-chart-bar"
    if (tab === "My Tickets") return "fa-ticket"
    return "fa-user"
  }

  return (
    <div className="ud-wrapper">

     
      <aside className="ud-sidebar">
        <div className="ud-avatar">{initials}</div>
        <div className="ud-sidebar-name">{profile.name || "User"}</div>
        <div className="ud-sidebar-email">{profile.email}</div>
        {memberSince && <div className="ud-sidebar-badge">Member since {memberSince}</div>}

        <nav className="ud-nav">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`ud-nav-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              <span className="ud-nav-icon">
                <i className={`fa-solid ${tabIcon(tab)}`} />
              </span>
              {tab}
            </button>
          ))}
        </nav>

        <button className="ud-logout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-arrow-left" /> Back to Home
        </button>
      </aside>

      
      <main className="ud-main">

        
        {activeTab === "Overview" && (
          <div className="ud-section">
            <h2 className="ud-section-title">
              Good to see you, {profile.name.split(" ")[0] || "there"}
              <i className="fa-solid fa-hand-wave" style={{ marginLeft: "0.4rem" }} />
            </h2>

            <div className="ud-stats-row">
              <div className="ud-stat-card">
                <div className="ud-stat-value">{bookings.length}</div>
                <div className="ud-stat-label">Total Bookings</div>
              </div>
              <div className="ud-stat-card">
                <div className="ud-stat-value">{watched.length}</div>
                <div className="ud-stat-label">Movies Watched</div>
              </div>
              <div className="ud-stat-card">
                <div className="ud-stat-value">{upcoming.length}</div>
                <div className="ud-stat-label">Upcoming</div>
              </div>
              <div className="ud-stat-card highlight">
                <div className="ud-stat-value">{totalSpent.toLocaleString()}</div>
                <div className="ud-stat-label">BDT Spent</div>
              </div>
            </div>

            <h3 className="ud-sub-title">Upcoming Bookings</h3>
            {loadingBooks && <p className="ud-state-msg">Loading…</p>}
            {/*bookingsError && <p className="ud-state-msg ud-state-error">{bookingsError}</p>*/}
            {!loadingBooks && upcoming.length === 0 && <div className="ud-empty">No upcoming bookings.</div>}
            {/*upcoming.map(b => <TicketCard key={b.id} booking={b} />)*/}

            <h3 className="ud-sub-title">Recently Watched</h3>
            {!loadingBooks && watched.length === 0 && <div className="ud-empty">No watched movies yet.</div>}
            <div className="ud-recent-row">
              {watched.map(b => (
                <div key={b.id} className="ud-recent-card">
                  <TicketPoster title={b.movie_title} poster={b.movie_poster} className="ud-recent-poster" />
                  <div className="ud-recent-title">{b.movie_title}</div>
                  <div className="ud-recent-date">{formatDate(b.show_date)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        
        {activeTab === "My Tickets" && (
          <div className="ud-section">
            <h2 className="ud-section-title">My Tickets</h2>
            <div className="ud-ticket-filter-row">
              <span className="ud-filter-badge upcoming">{upcoming.length} Upcoming</span>
              <span className="ud-filter-badge watched">{watched.length} Watched</span>
            </div>
            {loadingBooks  && <p className="ud-state-msg">Loading tickets…</p>}
            {/*bookingsError && <p className="ud-state-msg ud-state-error">{bookingsError}</p>*/}
            {!loadingBooks && bookings.length === 0 && (
              <div className="ud-empty">You haven't booked any tickets yet.</div>
            )}
            {/*bookings.map(b => <TicketCard key={b.id} booking={b} showStatus />)*/}
          </div>
        )}

       
        {activeTab === "Profile" && (
          <div className="ud-section">
            <div className="ud-profile-header">
              <h2 className="ud-section-title">My Profile</h2>
              <button
                className="ud-edit-btn"
                onClick={() => editMode ? handleSave() : setEditMode(true)}
                disabled={saving}
              >
                {saving ? (
                  "Saving…"
                ) : editMode ? (
                  <><i className="fa-solid fa-check" /> Save</>
                ) : (
                  <><i className="fa-solid fa-pen" /> Edit</>
                )}
              </button>
            </div>

            {profErr && <p className="ud-state-msg ud-state-error">{profErr}</p>}

            <div className="ud-profile-card">
              <div className="ud-profile-avatar">{initials}</div>
              <div className="ud-profile-fields">

                <div className="ud-field">
                  <label className="ud-field-label">Full Name</label>
                  {editMode ? (
                    <input className="ud-field-input" value={profile.name}
                      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                  ) : (
                    <div className="ud-field-value">{profile.name || "—"}</div>
                  )}
                </div>

                <div className="ud-field">
                  <label className="ud-field-label">Email</label>
                  <div className="ud-field-value ud-field-readonly">{profile.email}</div>
                </div>

                <div className="ud-field">
                  <label className="ud-field-label">Mobile</label>
                  {editMode ? (
                    <input className="ud-field-input" value={profile.mobile_number}
                      placeholder="e.g. 01XXXXXXXXX"
                      onChange={e => setProfile(p => ({ ...p, mobile_number: e.target.value }))} />
                  ) : (
                    <div className="ud-field-value">{profile.mobile_number || "—"}</div>
                  )}
                </div>

                <div className="ud-field">
                  <label className="ud-field-label">Gender</label>
                  {editMode ? (
                    <select className="ud-field-input" value={profile.gender}
                      onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="ud-field-value">{profile.gender || "—"}</div>
                  )}
                </div>

                {memberSince && (
                  <div className="ud-field">
                    <label className="ud-field-label">Member Since</label>
                    <div className="ud-field-value ud-field-readonly">{memberSince}</div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}