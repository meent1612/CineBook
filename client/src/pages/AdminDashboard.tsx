import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../CSSfiles/AdminDashboard.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface Movie {
  id: number;
  title: string;
  genre: string | null;
  category: string;
  language: string | null;
  poster_url: string | null;
  status: string;
  is_active: boolean;
}

interface Hall {
  id: number;
  name: string;
  capacity: number;
}

const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`;

export default function AdminDashboard() {
  const { token } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState("December");

  // ── Movies state ──
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [movieError, setMovieError] = useState("");

  // ── Halls state ──
  const [hallList, setHallList] = useState<Hall[]>([]);

  // ── Add movie modal state ──
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [addingMovie, setAddingMovie] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: "",
    genre: "",
    category: "2D",
    language: "English",
    poster_url: "",
  });

  // ── Add screening modal state ──
  const [showAddScreening, setShowAddScreening] = useState(false);
  const [newScreening, setNewScreening] = useState({
    movie_id: "",
    hall_id: "",
    show_date: "",
    start_time: "",
  });

  // ── Load movies and halls on mount ──
  useEffect(() => {
    fetchMovies();
    fetchHalls();
  }, []);

  const fetchMovies = async () => {
    setLoadingMovies(true);
    setMovieError("");
    try {
      const response = await fetch(`${API_URL}/admin/movies`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      setMovieList(data.movies);
    } catch (err: any) {
      setMovieError(err.message || "Failed to load movies.");
    } finally {
      setLoadingMovies(false);
    }
  };

  const fetchHalls = async () => {
    try {
      const response = await fetch(`${API_URL}/halls`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      setHallList(data.halls);
    } catch (err: any) {
      console.error("Failed to load halls:", err.message);
    }
  };

  // ── Add movie via API ──
  const handleAddMovie = async () => {
    if (!newMovie.title) return;
    setAddingMovie(true);
    try {
      const response = await fetch(`${API_URL}/admin/movies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title:      newMovie.title,
          genre:      newMovie.genre      || null,
          category:   newMovie.category,
          language:   newMovie.language   || null,
          poster_url: newMovie.poster_url || null,
          status:     "now_showing",
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      await fetchMovies();
      setNewMovie({ title: "", genre: "", category: "2D", language: "English", poster_url: "" });
      setShowAddMovie(false);
    } catch (err: any) {
      alert(err.message || "Failed to add movie.");
    } finally {
      setAddingMovie(false);
    }
  };

  // ── Delete movie via API ──
  const handleDeleteMovie = async (id: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      const response = await fetch(`${API_URL}/admin/movies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      await fetchMovies();
    } catch (err: any) {
      alert(err.message || "Failed to delete movie.");
    }
  };

  // ── Add screening via API ──
  const handleAddScreening = async () => {
    const { movie_id, hall_id, show_date, start_time } = newScreening;
    if (!movie_id || !hall_id || !show_date || !start_time) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const selectedHall = hallList.find(h => h.id === parseInt(hall_id));
      const response = await fetch(`${API_URL}/admin/screenings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movie_id:        parseInt(movie_id),
          hall_id:         parseInt(hall_id),
          show_date:       show_date,
          start_time:      start_time,
          available_seats: selectedHall?.capacity || 100,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      alert("Screening added successfully!");
      setNewScreening({ movie_id: "", hall_id: "", show_date: "", start_time: "" });
      setShowAddScreening(false);
    } catch (err: any) {
      alert(err.message || "Failed to add screening.");
    }
  };

  const setMovieField =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setNewMovie((prev) => ({ ...prev, [field]: e.target.value }));

  const stats = [
    { label: "Tickets Sold",      value: "15,000" },
    { label: "Active Movies",     value: movieList.length.toString() },
    { label: "Revenue",           value: "40M BDT" },
    { label: "Active Screenings", value: "500" },
  ];

  const mgmt = [
    { label: "Movie\nManagement",     icon: "🎬" },
    { label: "Screening\nManagement", icon: "📽️" },
    { label: "Inbox",                 icon: "📬" },
  ];

  return (
    <div className="admin-wrapper">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-top">
          <div>
            <h1 className="admin-header-title">Good afternoon, admin</h1>
            <p className="admin-header-subtitle">
              Here's what's happening with CineBook today.
            </p>
          </div>
          <div className="admin-header-actions">
            <button className="admin-btn" onClick={() => setShowAddMovie(true)}>
              + Add Movie
            </button>
            <button className="admin-btn" onClick={() => setShowAddScreening(true)}>
              + Add Screening
            </button>
          </div>
        </div>

        {/* Month Selector + Stats */}
        <div className="admin-month-section">
          <div className="admin-month-row">
            <span className="admin-month-label">For the month of:</span>
            <select
              className="admin-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="admin-stats-row">
            {stats.map((s) => (
              <div key={s.label} className="admin-stat-card">
                <div className="admin-stat-value">{s.value}</div>
                <div className="admin-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Management Cards */}
      <div className="admin-mgmt-row">
        {mgmt.map((m) => (
          <div key={m.label} className="admin-mgmt-card">
            <div className="admin-mgmt-icon">{m.icon}</div>
            <div className="admin-mgmt-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Movie List */}
      <div style={{ padding: "1rem 2rem 5rem" }}>
        <h3 style={{ marginBottom: "1rem", fontFamily: "'Playfair Display', serif" }}>
          Movies ({movieList.length})
        </h3>

        {loadingMovies && (
          <p style={{ color: "#888" }}>Loading movies...</p>
        )}

        {movieError && (
          <p style={{ color: "red" }}>{movieError}</p>
        )}

        {!loadingMovies && movieList.length === 0 && (
          <p style={{ color: "#888" }}>No movies found. Add one!</p>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {movieList.map((movie) => (
            <div
              key={movie.id}
              style={{
                background: "white",
                borderRadius: "10px",
                padding: "1rem",
                width: "180px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <img
                src={movie.poster_url || `https://via.placeholder.com/150x200/6B1829/white?text=${encodeURIComponent(movie.title)}`}
                alt={movie.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://via.placeholder.com/150x200/6B1829/white?text=${encodeURIComponent(movie.title)}`;
                }}
              />
              <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.25rem" }}>
                {movie.title}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: "0.5rem" }}>
                {movie.genre || "—"} • {movie.category}
              </div>
              <button
                onClick={() => handleDeleteMovie(movie.id)}
                style={{
                  width: "100%",
                  padding: "0.35rem",
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🗑 Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Movie Modal */}
      {showAddMovie && (
        <div className="modal-backdrop" onClick={() => setShowAddMovie(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Movie</h3>

            <input
              type="text"
              placeholder="Title *"
              value={newMovie.title}
              onChange={setMovieField("title")}
              className="modal-input"
            />

            <input
              type="text"
              placeholder="Genre (e.g. Action, Drama)"
              value={newMovie.genre}
              onChange={setMovieField("genre")}
              className="modal-input"
            />

            <select
              className="modal-input"
              value={newMovie.category}
              onChange={setMovieField("category")}
            >
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="IMAX">IMAX</option>
            </select>

            <input
              type="text"
              placeholder="Language (e.g. English, Bangla)"
              value={newMovie.language}
              onChange={setMovieField("language")}
              className="modal-input"
            />

            <input
              type="text"
              placeholder="Poster URL (optional)"
              value={newMovie.poster_url}
              onChange={setMovieField("poster_url")}
              className="modal-input"
            />

            <div className="modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={() => setShowAddMovie(false)}
              >
                Cancel
              </button>
              <button
                className="modal-confirm-btn"
                onClick={handleAddMovie}
                disabled={addingMovie}
              >
                {addingMovie ? "Adding..." : "Add Movie"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Screening Modal */}
      {showAddScreening && (
        <div className="modal-backdrop" onClick={() => setShowAddScreening(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Screening</h3>

            <select
              className="modal-input"
              value={newScreening.movie_id}
              onChange={(e) => setNewScreening(prev => ({ ...prev, movie_id: e.target.value }))}
            >
              <option value="" disabled>Select Movie</option>
              {movieList.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>

            <select
              className="modal-input"
              value={newScreening.hall_id}
              onChange={(e) => setNewScreening(prev => ({ ...prev, hall_id: e.target.value }))}
            >
              <option value="" disabled>Select Hall</option>
              {hallList.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={newScreening.show_date}
              onChange={(e) => setNewScreening(prev => ({ ...prev, show_date: e.target.value }))}
              className="modal-input"
            />

            <input
              type="time"
              value={newScreening.start_time}
              onChange={(e) => setNewScreening(prev => ({ ...prev, start_time: e.target.value }))}
              className="modal-input"
            />

            <div className="modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={() => setShowAddScreening(false)}
              >
                Cancel
              </button>
              <button
                className="modal-confirm-btn"
                onClick={handleAddScreening}
              >
                Add Screening
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-footer">
        Copyright© 2026 CineBook Limited. All Rights Reserved.
      </div>
    </div>
  );
}