import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../CSSfiles/UserDashboard.css";

const BOOKED_TICKETS = [
  {
    id: 1,
    movie: "Avatar: Fire and Ash",
    poster: "https://image.tmdb.org/t/p/w1280/cKtDJiU5zjcnDnRTzYpQ5xScKvU.jpg",
    date: "24 Jan 2026",
    time: "06:30pm",
    hall: "Hall 3",
    seats: ["G4", "G5"],
    type: "Premium",
    total: 1630,
    status: "upcoming",
  },
  {
    id: 2,
    movie: "Mufasa: The Lion King",
    poster: "https://image.tmdb.org/t/p/w185/lurEK87kukWNaHd0zYnsi3yzJrs.jpg",
    date: "18 Jan 2026",
    time: "03:00pm",
    hall: "Hall 1",
    seats: ["C7"],
    type: "Semi-recliner",
    total: 615,
    status: "watched",
  },
  {
    id: 3,
    movie: "Moana 2",
    poster: "https://image.tmdb.org/t/p/w185/yh64qqGbTi9zQMNiKSCEBNBqkUl.jpg",
    date: "10 Jan 2026",
    time: "12:15pm",
    hall: "Hall 2",
    seats: ["D3", "D4", "D5"],
    type: "Premium",
    total: 2445,
    status: "watched",
  },
];

const TABS = ["Overview", "My Tickets", "Profile"];

export default function UserDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Overview");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile_number: user?.mobile_number || "",
    gender: user?.gender || "",
  });

  const totalSpent = BOOKED_TICKETS.reduce((s, t) => s + t.total, 0);
  const upcoming = BOOKED_TICKETS.filter((t) => t.status === "upcoming");
  const watched = BOOKED_TICKETS.filter((t) => t.status === "watched");

  // Get initials for avatar
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Member since from user created_at
  const memberSince = user
    ? new Date((user as any).created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_ENDPOINT}/api/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name,
            mobile_number: profile.mobile_number,
            gender: profile.gender,
          }),
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="ud-wrapper">
      {/* Sidebar */}
      <aside className="ud-sidebar">
        <div className="ud-avatar">{initials}</div>
        <div className="ud-sidebar-name">{profile.name}</div>
        <div className="ud-sidebar-email">{profile.email}</div>
        <div className="ud-sidebar-badge">Member since {memberSince}</div>

        <nav className="ud-nav">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`ud-nav-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="ud-nav-icon">
                {tab === "Overview" ? "📊" : tab === "My Tickets" ? "🎟️" : "👤"}
              </span>
              {tab}
            </button>
          ))}
        </nav>

        <button className="ud-logout-btn" onClick={handleLogout}>
          ← Back to Home
        </button>
      </aside>

      {/* Main Content */}
      <main className="ud-main">
        {/* OVERVIEW */}
        {activeTab === "Overview" && (
          <div className="ud-section">
            <h2 className="ud-section-title">
              Good to see you, {profile.name.split(" ")[0]} 👋
            </h2>
            <div className="ud-stats-row">
              <div className="ud-stat-card">
                <div className="ud-stat-value">{BOOKED_TICKETS.length}</div>
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

            <h3 className="ud-sub-title">Upcoming Booking</h3>
            {upcoming.length === 0 ? (
              <div className="ud-empty">No upcoming bookings.</div>
            ) : (
              upcoming.map((t) => <TicketCard key={t.id} ticket={t} />)
            )}

            <h3 className="ud-sub-title">Recently Watched</h3>
            <div className="ud-recent-row">
              {watched.map((t) => (
                <div key={t.id} className="ud-recent-card">
                  <img
                    src={t.poster}
                    alt={t.movie}
                    className="ud-recent-poster"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/80x115/2a2a2a/white?text=M";
                    }}
                  />
                  <div className="ud-recent-title">{t.movie}</div>
                  <div className="ud-recent-date">{t.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY TICKETS */}
        {activeTab === "My Tickets" && (
          <div className="ud-section">
            <h2 className="ud-section-title">My Tickets</h2>
            <div className="ud-ticket-filter-row">
              <span className="ud-filter-badge upcoming">
                {upcoming.length} Upcoming
              </span>
              <span className="ud-filter-badge watched">
                {watched.length} Watched
              </span>
            </div>
            {BOOKED_TICKETS.map((t) => (
              <TicketCard key={t.id} ticket={t} showStatus />
            ))}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "Profile" && (
          <div className="ud-section">
            <div className="ud-profile-header">
              <h2 className="ud-section-title">My Profile</h2>
              <button
                className="ud-edit-btn"
                onClick={() => (editMode ? handleSave() : setEditMode(true))}
                disabled={saving}
              >
                {saving ? "Saving..." : editMode ? "✓ Save" : "✏️ Edit"}
              </button>
            </div>

            {error && (
              <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
            )}

            <div className="ud-profile-card">
              <div className="ud-profile-avatar">{initials}</div>
              <div className="ud-profile-fields">

                {/* Full Name - editable */}
                <div className="ud-field">
                  <label className="ud-field-label">Full Name</label>
                  {editMode ? (
                    <input
                      className="ud-field-input"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="ud-field-value">{profile.name}</div>
                  )}
                </div>

                {/* Email - always read only */}
                <div className="ud-field">
                  <label className="ud-field-label">Email</label>
                  <div className="ud-field-value">{profile.email}</div>
                </div>

                {/* Mobile - editable */}
                <div className="ud-field">
                  <label className="ud-field-label">Mobile</label>
                  {editMode ? (
                    <input
                      className="ud-field-input"
                      value={profile.mobile_number}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          mobile_number: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <div className="ud-field-value">
                      {profile.mobile_number || "—"}
                    </div>
                  )}
                </div>

                {/* Gender - editable */}
                <div className="ud-field">
                  <label className="ud-field-label">Gender</label>
                  {editMode ? (
                    <select
                      className="ud-field-input"
                      value={profile.gender}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, gender: e.target.value }))
                      }
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="ud-field-value">{profile.gender || "—"}</div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TicketCard({
  ticket,
  showStatus,
}: {
  ticket: (typeof BOOKED_TICKETS)[0];
  showStatus?: boolean;
}) {
  return (
    <div className={`ud-ticket-card ${ticket.status}`}>
      <img
        src={ticket.poster}
        alt={ticket.movie}
        className="ud-ticket-poster"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://via.placeholder.com/60x85/2a2a2a/white?text=M";
        }}
      />
      <div className="ud-ticket-info">
        <div className="ud-ticket-title">{ticket.movie}</div>
        <div className="ud-ticket-meta">
          <span>📅 {ticket.date}</span>
          <span>🕐 {ticket.time}</span>
          <span>🎭 {ticket.hall}</span>
        </div>
        <div className="ud-ticket-meta">
          <span>💺 {ticket.seats.join(", ")}</span>
          <span>🏷️ {ticket.type}</span>
        </div>
      </div>
      <div className="ud-ticket-right">
        {showStatus && (
          <span className={`ud-status-badge ${ticket.status}`}>
            {ticket.status === "upcoming" ? "Upcoming" : "Watched"}
          </span>
        )}
        <div className="ud-ticket-total">{ticket.total.toLocaleString()} BDT</div>
      </div>
    </div>
  );
}