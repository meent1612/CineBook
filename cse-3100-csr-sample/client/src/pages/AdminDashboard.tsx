import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { movies as initialMovies, Movie } from "../data/movies";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function AdminDashboard() {
  const [selectedMonth, setSelectedMonth] = useState("December");
  const [movieList, setMovieList] = useState<Movie[]>(initialMovies);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const navigate = useNavigate();

  const stats = [
    { label: "Tickets Sold", value: "15,000" },
    { label: "Active Movies", value: "6" },
    { label: "Revenue", value: "40M BDT" },
    { label: "Active Screening", value: "500" },
  ];

  const mgmt = [
    { label: "Movie\nManagement", icon: "🎬", path: "/admin/movies" },
    { label: "Screening\nManagement", icon: "📽️", path: "/admin/screenings" },
    { label: "Inbox", icon: "📬", path: "/admin/inbox" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0" }}>
      {/* Admin Header */}
      <div style={{ background: "#6B1829", padding: "1.5rem 2rem 1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ color: "white", fontSize: "1.5rem", fontFamily: "'Playfair Display', serif", marginBottom: "0.25rem" }}>
              Good afternoon, admin
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>
              Here's what's happening with CineBook today.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setShowAddMovie(true)}
              style={adminBtn}
            >
              + Add Movie
            </button>
            <button style={adminBtn}>+ Add Screening</button>
          </div>
        </div>

        {/* Month Selector + Stats */}
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>For the month of:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                borderRadius: "6px",
                padding: "0.25rem 0.5rem",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              {MONTHS.map(m => <option key={m} value={m} style={{ color: "#333", background: "white" }}>{m}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            {stats.map(s => (
              <div
                key={s.label}
                style={{
                  background: "white",
                  borderRadius: "10px",
                  padding: "1rem 1.5rem",
                  flex: 1,
                  textAlign: "center",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#6B1829", fontFamily: "'Playfair Display', serif" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Management Cards */}
      <div style={{ padding: "2rem", display: "flex", gap: "1.5rem" }}>
        {mgmt.map(m => (
          <div
            key={m.label}
            onClick={() => {}}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{m.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", whiteSpace: "pre-line", color: "#222" }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Add Movie Modal */}
      {showAddMovie && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          onClick={() => setShowAddMovie(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              width: "380px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem", fontFamily: "'Playfair Display', serif" }}>Add New Movie</h3>
            <input
              type="text"
              placeholder="Movie Title"
              value={newMovieTitle}
              onChange={e => setNewMovieTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "0.88rem",
                marginBottom: "1rem",
              }}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowAddMovie(false)}
                style={{ flex: 1, padding: "0.65rem", border: "1px solid #ddd", borderRadius: "6px", background: "white", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newMovieTitle) {
                    setMovieList(prev => [...prev, {
                      id: Date.now(),
                      title: newMovieTitle,
                      genre: "Unknown",
                      category: "2D",
                      language: "English",
                      releaseDate: "2026-01-01",
                      poster: "https://via.placeholder.com/150x220/6B1829/white?text=New",
                      showtimes: {},
                    }]);
                    setNewMovieTitle("");
                    setShowAddMovie(false);
                  }
                }}
                style={{ flex: 1, padding: "0.65rem", background: "#6B1829", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }}
              >
                Add Movie
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "#1a1a1a", color: "#aaa", textAlign: "center", padding: "1rem", fontSize: "0.78rem", position: "fixed", bottom: 0, left: 0, right: 0 }}>
        Copyright© 2026 CineBook Limited . All Rights Reserved.
      </div>
    </div>
  );
}

const adminBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.15)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.35)",
  borderRadius: "20px",
  padding: "0.4rem 1rem",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(4px)",
};