import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSSfiles/UserDashboard.css";

const USER = {
  name: "Rafi Ahmed",
  email: "rafi.ahmed@gmail.com",
  mobile: "+880 1712-345678",
  gender: "Male",
  location: "Tejgaon, Dhaka",
  memberSince: "January 2025",
  avatar: "RA",
};

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
  const [activeTab, setActiveTab] = useState("Overview");
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(USER);
  const navigate = useNavigate();

  const totalSpent = BOOKED_TICKETS.reduce((s, t) => s + t.total, 0);
  const upcoming = BOOKED_TICKETS.filter((t) => t.status === "upcoming");
  const watched = BOOKED_TICKETS.filter((t) => t.status === "watched");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="ud-wrapper">
      {/* Sidebar */}
      <aside className="ud-sidebar">
        <div className="ud-avatar">{USER.avatar}</div>
        <div className="ud-sidebar-name">{profile.name}</div>
        <div className="ud-sidebar-email">{profile.email}</div>
        <div className="ud-sidebar-badge">Member since {USER.memberSince}</div>

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

        <button className="ud-logout-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </aside>

      {/* Main Content */}
      <main className="ud-main">
        {/* ── OVERVIEW ── */}
        {activeTab === "Overview" && (
          <div className="ud-section">
            <h2 className="ud-section-title">Good to see you, {profile.name.split(" ")[0]} 👋</h2>

            {/* Stats */}
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

            {/* Upcoming ticket */}
            <h3 className="ud-sub-title">Upcoming Booking</h3>
            {upcoming.length === 0 ? (
              <div className="ud-empty">No upcoming bookings.</div>
            ) : (
              upcoming.map((t) => <TicketCard key={t.id} ticket={t} />)
            )}

            {/* Recent */}
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

        {/* ── MY TICKETS ── */}
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

        {/* ── PROFILE ── */}
        {activeTab === "Profile" && (
          <div className="ud-section">
            <div className="ud-profile-header">
              <h2 className="ud-section-title">My Profile</h2>
              <button
                className="ud-edit-btn"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "✓ Save" : "✏️ Edit"}
              </button>
            </div>

            <div className="ud-profile-card">
              <div className="ud-profile-avatar">{USER.avatar}</div>
              <div className="ud-profile-fields">
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Mobile", key: "mobile" },
                  { label: "Gender", key: "gender" },
                  { label: "Location", key: "location" },
                ].map(({ label, key }) => (
                  <div key={key} className="ud-field">
                    <label className="ud-field-label">{label}</label>
                    {editMode ? (
                      <input
                        className="ud-field-input"
                        value={(profile as any)[key]}
                        onChange={set(key)}
                      />
                    ) : (
                      <div className="ud-field-value">{(profile as any)[key]}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TicketCard({ ticket, showStatus }: { ticket: (typeof BOOKED_TICKETS)[0]; showStatus?: boolean }) {
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