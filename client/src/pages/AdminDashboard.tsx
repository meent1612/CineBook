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
  description: string | null;
  genre: string | null;
  category: string;
  language: string | null;
  duration_mins: number | null;
  release_date: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  status: "now_showing" | "coming_soon";
  is_active: boolean;
}

interface Hall {
  id: number;
  name: string;
  capacity: number;
}

const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`;

// ── Poster colours for CSS fallback ──
const POSTER_COLORS = ["#6B1829","#1a3a5c","#1a4d2e","#3b1f5e","#7a3b00","#1f4040"];

// ── Poster component — lives outside AdminDashboard so useState is stable ──
const BACKEND = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"

function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false)
  const bg = POSTER_COLORS[movie.title.charCodeAt(0) % POSTER_COLORS.length]

  // Build the full src: relative paths (e.g. /posters/avatar.jpg) get the
  // backend host prepended so the browser fetches them directly — <img> tags
  // don't enforce CORS so this always works regardless of proxy config.
  const src = movie.poster_url
    ? movie.poster_url.startsWith("/")
      ? `${BACKEND}${movie.poster_url}`
      : movie.poster_url
    : null

  if (!src || failed) {
    return (
      <div className="movie-poster-fallback" style={{ background: bg }}>
        <div className="movie-poster-fallback-icon">🎬</div>
        <div className="movie-poster-fallback-title">{movie.title}</div>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={movie.title}
      className="movie-card-img"
      onError={() => setFailed(true)}
    />
  )
}

interface MovieCardProps {
  movie: Movie
  onDelete: (id: number) => void
  onToggleActive: (movie: Movie) => void
}

// ── Movie card — lives outside AdminDashboard ──
function MovieCard({ movie, onDelete, onToggleActive }: MovieCardProps) {
  return (
    <div className="movie-card">
      <div className="movie-card-img-wrap">
        <MoviePoster movie={movie} />
      </div>
      <div className="movie-card-body">
        <div className="movie-card-title">{movie.title}</div>
        <div className="movie-card-meta">
          {movie.genre || "—"} • {movie.category}
          {movie.duration_mins ? ` • ${movie.duration_mins} min` : ""}
        </div>
        {movie.release_date && (
          <div className="movie-card-date">
            {new Date(movie.release_date).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </div>
        )}

        {/* Active toggle */}
        <div className="movie-toggle-row">
          <span className={`movie-toggle-label ${movie.is_active ? "label-active" : "label-inactive"}`}>
            {movie.is_active ? "Active" : "Inactive"}
          </span>
          <button
            className={`toggle-switch ${movie.is_active ? "toggle-on" : "toggle-off"}`}
            onClick={() => onToggleActive(movie)}
            aria-label={`Mark movie as ${movie.is_active ? "inactive" : "active"}`}
            title={`Click to mark as ${movie.is_active ? "inactive" : "active"}`}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        <button className="movie-delete-btn" onClick={() => onDelete(movie.id)}>
          🗑 Delete
        </button>
      </div>
    </div>
  )
}

const EMPTY_MOVIE = {
  title: "",
  description: "",
  genre: "",
  category: "2D",
  language: "English",
  duration_mins: "",
  release_date: "",
  poster_url: "",
  trailer_url: "",
  status: "now_showing",
  is_active: true,
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState("December");

  const [movieList, setMovieList]       = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [movieError, setMovieError]     = useState("");

  const [hallList, setHallList] = useState<Hall[]>([]);

  const [showAddMovie, setShowAddMovie]   = useState(false);
  const [addingMovie, setAddingMovie]     = useState(false);
  const [newMovie, setNewMovie]           = useState({ ...EMPTY_MOVIE });

  const [showAddScreening, setShowAddScreening] = useState(false);
  const [newScreening, setNewScreening] = useState({
    movie_id: "",
    hall_id: "",
    show_date: "",
    start_time: "",
    available_seats: "",
  });

  useEffect(() => {
    fetchMovies();
    fetchHalls();
  }, []);

  const fetchMovies = async () => {
    setLoadingMovies(true);
    setMovieError("");
    try {
      const res  = await fetch(`${API_URL}/admin/movies`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
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
      const res  = await fetch(`${API_URL}/halls`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setHallList(data.halls);
    } catch (err: any) {
      console.error("Failed to load halls:", err.message);
    }
  };

  // ── Add movie ──
  const handleAddMovie = async () => {
    if (!newMovie.title) return;
    setAddingMovie(true);
    try {
      const res  = await fetch(`${API_URL}/admin/movies`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title:         newMovie.title,
          description:   newMovie.description   || null,
          genre:         newMovie.genre         || null,
          category:      newMovie.category,
          language:      newMovie.language      || null,
          duration_mins: newMovie.duration_mins ? parseInt(newMovie.duration_mins) : null,
          release_date:  newMovie.release_date  || null,
          poster_url:    newMovie.poster_url    || null,
          trailer_url:   newMovie.trailer_url   || null,
          status:        newMovie.status,
          is_active:     newMovie.is_active,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await fetchMovies();
      setNewMovie({ ...EMPTY_MOVIE });
      setShowAddMovie(false);
    } catch (err: any) {
      alert(err.message || "Failed to add movie.");
    } finally {
      setAddingMovie(false);
    }
  };

  // ── Delete movie ──
  const handleDeleteMovie = async (id: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      const res  = await fetch(`${API_URL}/admin/movies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await fetchMovies();
    } catch (err: any) {
      alert(err.message || "Failed to delete movie.");
    }
  };

  // ── Toggle is_active (optimistic update — reverts on failure) ──
  const handleToggleActive = async (movie: Movie) => {
    // Optimistically flip the value in the UI immediately
    setMovieList(prev =>
      prev.map(m => m.id === movie.id ? { ...m, is_active: !m.is_active } : m)
    );
    try {
      const res  = await fetch(`${API_URL}/admin/movies/${movie.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !movie.is_active }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
    } catch (err: any) {
      // Revert on failure
      setMovieList(prev =>
        prev.map(m => m.id === movie.id ? { ...m, is_active: movie.is_active } : m)
      );
      alert(err.message || "Failed to update active status.");
    }
  };

  // ── Add screening ──
  const handleAddScreening = async () => {
    const { movie_id, hall_id, show_date, start_time } = newScreening;
    if (!movie_id || !hall_id || !show_date || !start_time) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const selectedHall = hallList.find(h => h.id === parseInt(hall_id));
      const seats = newScreening.available_seats
        ? parseInt(newScreening.available_seats)
        : selectedHall?.capacity || 100;

      const res  = await fetch(`${API_URL}/admin/screenings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          movie_id:        parseInt(movie_id),
          hall_id:         parseInt(hall_id),
          show_date,
          start_time,
          available_seats: seats,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      alert("Screening added successfully!");
      setNewScreening({ movie_id: "", hall_id: "", show_date: "", start_time: "", available_seats: "" });
      setShowAddScreening(false);
    } catch (err: any) {
      alert(err.message || "Failed to add screening.");
    }
  };

  const setMovieField =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;
      setNewMovie(prev => ({ ...prev, [field]: value }));
    };

  const nowShowing  = movieList.filter(m => m.status === "now_showing");
  const comingSoon  = movieList.filter(m => m.status === "coming_soon");

  const stats = [
    { label: "Tickets Sold",      value: "15,000" },
    { label: "Active Movies",     value: movieList.length.toString() },
    { label: "Revenue",           value: "40M BDT" },
    { label: "Active Screenings", value: "500" },
  ];

  const mgmt = [
    { label: "Movie\nManagement",     icon: "🎬", action: () => setShowAddMovie(true) },
    { label: "Screening\nManagement", icon: "📽️",  action: () => setShowAddScreening(true) },
    { label: "Inbox",                 icon: "📬",  action: () => {} },
  ];

  return (
    <div className="admin-wrapper">

      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-top">
          <div>
            <h1 className="admin-header-title">Good afternoon, admin</h1>
            <p className="admin-header-subtitle">Here's what's happening with CineBook today.</p>
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
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="admin-stats-row">
            {stats.map(s => (
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
        {mgmt.map(m => (
          <div key={m.label} className="admin-mgmt-card" onClick={m.action} role="button" tabIndex={0}>
            <div className="admin-mgmt-icon">{m.icon}</div>
            <div className="admin-mgmt-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Movie Sections */}
      <div className="admin-movies-area">
        {loadingMovies && <p className="admin-loading">Loading movies…</p>}
        {movieError   && <p className="admin-error">{movieError}</p>}

        {!loadingMovies && (
          <>
            {/* Now Showing */}
            <section className="movie-section">
              <div className="movie-section-header">
                <span className="movie-section-badge now-showing-badge">● Now Showing</span>
                <span className="movie-section-count">{nowShowing.length} movie{nowShowing.length !== 1 ? "s" : ""}</span>
              </div>
              {nowShowing.length === 0
                ? <p className="admin-empty">No movies currently showing.</p>
                : (
                  <div className="movie-grid">
                    {nowShowing.map(m => <MovieCard key={m.id} movie={m} onDelete={handleDeleteMovie} onToggleActive={handleToggleActive} />)}
                  </div>
                )
              }
            </section>

            {/* Coming Soon */}
            <section className="movie-section">
              <div className="movie-section-header">
                <span className="movie-section-badge coming-soon-badge">◎ Coming Soon</span>
                <span className="movie-section-count">{comingSoon.length} movie{comingSoon.length !== 1 ? "s" : ""}</span>
              </div>
              {comingSoon.length === 0
                ? <p className="admin-empty">No upcoming movies.</p>
                : (
                  <div className="movie-grid">
                    {comingSoon.map(m => <MovieCard key={m.id} movie={m} onDelete={handleDeleteMovie} onToggleActive={handleToggleActive} />)}
                  </div>
                )
              }
            </section>
          </>
        )}
      </div>

      {/* ── Add Movie Modal ── */}
      {showAddMovie && (
        <div className="modal-backdrop" onClick={() => setShowAddMovie(false)}>
          <div className="modal-card modal-wide" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">🎬 Add New Movie</h3>

            <div className="modal-grid">
              <div className="modal-col">
                <label className="modal-label">Title *</label>
                <input type="text" placeholder="e.g. Oppenheimer" value={newMovie.title} onChange={setMovieField("title")} className="modal-input" />

                <label className="modal-label">Description</label>
                <textarea placeholder="Short synopsis…" value={newMovie.description} onChange={setMovieField("description")} className="modal-input modal-textarea" rows={3} />

                <label className="modal-label">Genre</label>
                <input type="text" placeholder="e.g. Action, Drama" value={newMovie.genre} onChange={setMovieField("genre")} className="modal-input" />

                <label className="modal-label">Language</label>
                <input type="text" placeholder="e.g. English, Bangla" value={newMovie.language} onChange={setMovieField("language")} className="modal-input" />
              </div>

              <div className="modal-col">
                <label className="modal-label">Category</label>
                <select className="modal-input" value={newMovie.category} onChange={setMovieField("category")}>
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                </select>

                <label className="modal-label">Status</label>
                <select className="modal-input" value={newMovie.status} onChange={setMovieField("status")}>
                  <option value="now_showing">Now Showing</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>

                <label className="modal-label">Duration (mins)</label>
                <input type="number" placeholder="e.g. 148" value={newMovie.duration_mins} onChange={setMovieField("duration_mins")} className="modal-input" min={1} />

                <label className="modal-label">Release Date</label>
                <input type="date" value={newMovie.release_date} onChange={setMovieField("release_date")} className="modal-input" />

                <label className="modal-label">Poster URL</label>
                <input type="text" placeholder="https://…" value={newMovie.poster_url} onChange={setMovieField("poster_url")} className="modal-input" />

                <label className="modal-label">Trailer URL</label>
                <input type="text" placeholder="https://youtube.com/…" value={newMovie.trailer_url} onChange={setMovieField("trailer_url")} className="modal-input" />

                {/* is_active checkbox */}
                <div className="modal-checkbox-row">
                  <input
                    type="checkbox"
                    id="is_active_check"
                    checked={newMovie.is_active as boolean}
                    onChange={setMovieField("is_active")}
                    className="modal-checkbox"
                  />
                  <label htmlFor="is_active_check" className="modal-checkbox-label">
                    Set as Active
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowAddMovie(false)}>Cancel</button>
              <button className="modal-confirm-btn" onClick={handleAddMovie} disabled={addingMovie}>
                {addingMovie ? "Adding…" : "Add Movie"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Screening Modal ── */}
      {showAddScreening && (
        <div className="modal-backdrop" onClick={() => setShowAddScreening(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">📽️ Add New Screening</h3>

            <label className="modal-label">Movie *</label>
            <select
              className="modal-input"
              value={newScreening.movie_id}
              onChange={e => setNewScreening(prev => ({ ...prev, movie_id: e.target.value }))}
            >
              <option value="" disabled>Select Movie</option>
              {movieList.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>

            <label className="modal-label">Hall *</label>
            <select
              className="modal-input"
              value={newScreening.hall_id}
              onChange={e => setNewScreening(prev => ({ ...prev, hall_id: e.target.value }))}
            >
              <option value="" disabled>Select Hall</option>
              {hallList.map(h => <option key={h.id} value={h.id}>{h.name} (cap: {h.capacity})</option>)}
            </select>

            <label className="modal-label">Show Date *</label>
            <input
              type="date"
              value={newScreening.show_date}
              onChange={e => setNewScreening(prev => ({ ...prev, show_date: e.target.value }))}
              className="modal-input"
            />

            <label className="modal-label">Start Time *</label>
            <input
              type="time"
              value={newScreening.start_time}
              onChange={e => setNewScreening(prev => ({ ...prev, start_time: e.target.value }))}
              className="modal-input"
            />

            <label className="modal-label">Available Seats <span style={{ color:"#aaa", fontWeight:400 }}>(leave blank to use hall capacity)</span></label>
            <input
              type="number"
              placeholder="e.g. 120"
              value={newScreening.available_seats}
              onChange={e => setNewScreening(prev => ({ ...prev, available_seats: e.target.value }))}
              className="modal-input"
              min={1}
            />

            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowAddScreening(false)}>Cancel</button>
              <button className="modal-confirm-btn" onClick={handleAddScreening}>Add Screening</button>
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