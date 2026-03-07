import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../CSSfiles/AdminDashboard.css"

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

const API_URL       = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND       = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"
const POSTER_COLORS = ["#6B1829","#1a3a5c","#1a4d2e","#3b1f5e","#7a3b00","#1f4040"]

interface Movie {
  id: number
  title: string
  description: string | null
  genre: string | null
  category: string
  language: string | null
  duration_mins: number | null
  release_date: string | null
  poster_url: string | null
  trailer_url: string | null
  status: "now_showing" | "coming_soon"
  is_active: boolean
}

interface Hall {
  id: number
  name: string
  capacity: number
}

function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false)
  const bg  = POSTER_COLORS[movie.title.charCodeAt(0) % POSTER_COLORS.length]
  const src = movie.poster_url
    ? movie.poster_url.startsWith("/") ? `${BACKEND}${movie.poster_url}` : movie.poster_url
    : null

  if (!src || failed) {
    return (
      <div className="movie-poster-fallback" style={{ background: bg }}>
        <div className="movie-poster-fallback-icon">
          <i className="fa-solid fa-film" />
        </div>
        <div className="movie-poster-fallback-title">{movie.title}</div>
      </div>
    )
  }
  return (
    <img src={src} alt={movie.title} className="movie-card-img" onError={() => setFailed(true)} />
  )
}

interface MovieCardProps {
  movie: Movie
  onDelete: (id: number) => void
  onToggleActive: (movie: Movie) => void
  onEdit: (movie: Movie) => void
}

function MovieCard({ movie, onDelete, onToggleActive, onEdit }: MovieCardProps) {
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

        <div className="movie-toggle-row">
          <span className={`movie-toggle-label ${movie.is_active ? "label-active" : "label-inactive"}`}>
            {movie.is_active ? "Active" : "Inactive"}
          </span>
          <button
            className={`toggle-switch ${movie.is_active ? "toggle-on" : "toggle-off"}`}
            onClick={() => onToggleActive(movie)}
            aria-label={`Mark movie as ${movie.is_active ? "inactive" : "active"}`}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        <div className="movie-card-actions">
          <button className="movie-edit-btn" onClick={() => onEdit(movie)}>
            <i className="fa-solid fa-pen" /> Edit
          </button>
          <button className="movie-delete-btn" onClick={() => onDelete(movie.id)}>
            <i className="fa-solid fa-trash" /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const EMPTY_MOVIE = {
  title: "", description: "", genre: "", category: "2D",
  language: "English", duration_mins: "", release_date: "",
  poster_url: "", trailer_url: "", status: "now_showing", is_active: true,
}

export default function AdminDashboard() {
  const { token }   = useAuth()
  const location    = useLocation()

  const [selectedMonth, setSelectedMonth] = useState("March")
  const [movieList,     setMovieList]     = useState<Movie[]>([])
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [movieError,    setMovieError]    = useState("")
  const [hallList,      setHallList]      = useState<Hall[]>([])

  const [showAddMovie,  setShowAddMovie]  = useState(false)
  const [addingMovie,   setAddingMovie]   = useState(false)
  const [newMovie,      setNewMovie]      = useState({ ...EMPTY_MOVIE })

  const [showEditMovie, setShowEditMovie] = useState(false)
  const [editingMovie,  setEditingMovie]  = useState(false)
  const [editMovie,     setEditMovie]     = useState({ ...EMPTY_MOVIE, id: 0 })

  const [showAddScreening, setShowAddScreening] = useState(false)
  const [newScreening,     setNewScreening]     = useState({
    movie_id: "", hall_id: "", show_date: "", start_time: "", available_seats: "",
  })

  useEffect(() => { fetchMovies(); fetchHalls() }, [])

  useEffect(() => {
    const editId = (location.state as any)?.editMovieId
    if (!editId || movieList.length === 0) return
    const target = movieList.find(m => m.id === editId)
    if (!target) return
    handleOpenEdit(target)
    window.history.replaceState({}, "")
  }, [location.state, movieList])

  const fetchMovies = async () => {
    setLoadingMovies(true)
    setMovieError("")
    try {
      const res  = await fetch(`${API_URL}/admin/movies`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setMovieList(data.movies)
    } catch (err: any) {
      setMovieError(err.message || "Failed to load movies.")
    } finally {
      setLoadingMovies(false)
    }
  }

  const fetchHalls = async () => {
    try {
      const res  = await fetch(`${API_URL}/halls`)
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setHallList(data.halls)
    } catch (err: any) {
      console.error("Failed to load halls:", err.message)
    }
  }

  const handleAddMovie = async () => {
    if (!newMovie.title) return
    setAddingMovie(true)
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
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      await fetchMovies()
      setNewMovie({ ...EMPTY_MOVIE })
      setShowAddMovie(false)
    } catch (err: any) {
      alert(err.message || "Failed to add movie.")
    } finally {
      setAddingMovie(false)
    }
  }

  const handleDeleteMovie = async (id: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) return
    try {
      const res  = await fetch(`${API_URL}/admin/movies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      await fetchMovies()
    } catch (err: any) {
      alert(err.message || "Failed to delete movie.")
    }
  }

  const handleOpenEdit = (movie: Movie) => {
    setEditMovie({
      id:            movie.id,
      title:         movie.title,
      description:   movie.description  || "",
      genre:         movie.genre        || "",
      category:      movie.category,
      language:      movie.language     || "",
      duration_mins: movie.duration_mins?.toString() || "",
      release_date:  movie.release_date || "",
      poster_url:    movie.poster_url   || "",
      trailer_url:   movie.trailer_url  || "",
      status:        movie.status,
      is_active:     movie.is_active,
    })
    setShowEditMovie(true)
  }

  const handleEditMovie = async () => {
    if (!editMovie.title) return
    setEditingMovie(true)
    try {
      const res  = await fetch(`${API_URL}/admin/movies/${editMovie.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title:         editMovie.title,
          description:   editMovie.description   || null,
          genre:         editMovie.genre         || null,
          category:      editMovie.category,
          language:      editMovie.language      || null,
          duration_mins: editMovie.duration_mins ? parseInt(editMovie.duration_mins as string) : null,
          release_date:  editMovie.release_date  || null,
          poster_url:    editMovie.poster_url    || null,
          trailer_url:   editMovie.trailer_url   || null,
          status:        editMovie.status,
          is_active:     editMovie.is_active,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      await fetchMovies()
      setShowEditMovie(false)
    } catch (err: any) {
      alert(err.message || "Failed to update movie.")
    } finally {
      setEditingMovie(false)
    }
  }

  const handleToggleActive = async (movie: Movie) => {
    setMovieList(prev => prev.map(m => m.id === movie.id ? { ...m, is_active: !m.is_active } : m))
    try {
      const res  = await fetch(`${API_URL}/admin/movies/${movie.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !movie.is_active }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
    } catch (err: any) {
      setMovieList(prev => prev.map(m => m.id === movie.id ? { ...m, is_active: movie.is_active } : m))
      alert(err.message || "Failed to update active status.")
    }
  }

  const handleAddScreening = async () => {
    const { movie_id, hall_id, show_date, start_time } = newScreening
    if (!movie_id || !hall_id || !show_date || !start_time) {
      alert("Please fill in all required fields.")
      return
    }
    try {
      const selectedHall = hallList.find(h => h.id === parseInt(hall_id))
      const seats = newScreening.available_seats
        ? parseInt(newScreening.available_seats)
        : selectedHall?.capacity || 100

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
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      alert("Screening added successfully!")
      setNewScreening({ movie_id: "", hall_id: "", show_date: "", start_time: "", available_seats: "" })
      setShowAddScreening(false)
    } catch (err: any) {
      alert(err.message || "Failed to add screening.")
    }
  }

  const setMovieField = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
        ? e.target.checked : e.target.value
      setNewMovie(prev => ({ ...prev, [field]: value }))
    }

  const setEditField = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
        ? e.target.checked : e.target.value
      setEditMovie(prev => ({ ...prev, [field]: value }))
    }

  const nowShowing   = movieList.filter(m => m.status === "now_showing")
  const comingSoon   = movieList.filter(m => m.status === "coming_soon")
  const activeMovies = movieList.filter(m => m.is_active)

  const stats = [
    { label: "Tickets Sold",      value: "15,000",                         icon: "fa-ticket" },
    { label: "Total Movies",      value: movieList.length.toString(),      icon: "fa-film" },
    { label: "Active Movies",     value: activeMovies.length.toString(),   icon: "fa-circle-play" },
    { label: "Revenue",           value: "40M BDT",                        icon: "fa-sack-dollar" },
    { label: "Active Screenings", value: "500",                            icon: "fa-clapperboard" },
  ]

  const mgmt = [
    { label: "Movie Management",     icon: "fa-film",        action: () => setShowAddMovie(true) },
    { label: "Screening Management", icon: "fa-clapperboard", action: () => setShowAddScreening(true) },
    { label: "Inbox",                icon: "fa-inbox",        action: () => {} },
  ]

  return (
    <div className="admin-wrapper">

      
      <div className="admin-header">
        <div className="admin-header-top">
          <div>
            <h1 className="admin-header-title">Good afternoon, admin</h1>
            <p className="admin-header-subtitle">Here's what's happening with CineBook today.</p>
          </div>
        </div>

        <div className="admin-month-section">
          <div className="admin-month-row">
            <span className="admin-month-label">For the month of:</span>
            <select
              className="admin-month-select"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="admin-stats-row">
            {stats.map(s => (
              <div key={s.label} className="admin-stat-card">
                <i className={`fa-solid ${s.icon} admin-stat-icon`} />
                <div className="admin-stat-value">{s.value}</div>
                <div className="admin-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="admin-mgmt-row">
        {mgmt.map(m => (
          <div
            key={m.label}
            className="admin-mgmt-card"
            onClick={m.action}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && m.action()}
          >
            <div className="admin-mgmt-icon">
              <i className={`fa-solid ${m.icon}`} />
            </div>
            <div className="admin-mgmt-label">{m.label}</div>
          </div>
        ))}
      </div>

      
      <div className="admin-movies-area">
        {loadingMovies && <p className="admin-loading">Loading movies…</p>}
        {movieError    && <p className="admin-error">{movieError}</p>}

        {!loadingMovies && (
          <>
            <section className="movie-section">
              <div className="movie-section-header">
                <span className="movie-section-badge now-showing-badge">
                  <i className="fa-solid fa-circle" /> Now Showing
                </span>
                <span className="movie-section-count">{nowShowing.length} movie{nowShowing.length !== 1 ? "s" : ""}</span>
              </div>
              {nowShowing.length === 0
                ? <p className="admin-empty">No movies currently showing.</p>
                : (
                  <div className="movie-grid">
                    {nowShowing.map(m => (
                      <MovieCard key={m.id} movie={m}
                        onDelete={handleDeleteMovie}
                        onToggleActive={handleToggleActive}
                        onEdit={handleOpenEdit}
                      />
                    ))}
                  </div>
                )
              }
            </section>

            <section className="movie-section">
              <div className="movie-section-header">
                <span className="movie-section-badge coming-soon-badge">
                  <i className="fa-regular fa-circle" /> Coming Soon
                </span>
                <span className="movie-section-count">{comingSoon.length} movie{comingSoon.length !== 1 ? "s" : ""}</span>
              </div>
              {comingSoon.length === 0
                ? <p className="admin-empty">No upcoming movies.</p>
                : (
                  <div className="movie-grid">
                    {comingSoon.map(m => (
                      <MovieCard key={m.id} movie={m}
                        onDelete={handleDeleteMovie}
                        onToggleActive={handleToggleActive}
                        onEdit={handleOpenEdit}
                      />
                    ))}
                  </div>
                )
              }
            </section>
          </>
        )}
      </div>

      
      {showAddMovie && (
        <div className="modal-backdrop" onClick={() => setShowAddMovie(false)}>
          <div className="modal-card modal-wide" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              <i className="fa-solid fa-film" /> Add New Movie
            </h3>
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
                <input type="text" placeholder="/posters/movie.jpg" value={newMovie.poster_url} onChange={setMovieField("poster_url")} className="modal-input" />
                <label className="modal-label">Trailer URL</label>
                <input type="text" placeholder="https://youtube.com/…" value={newMovie.trailer_url} onChange={setMovieField("trailer_url")} className="modal-input" />
                <div className="modal-checkbox-row">
                  <input type="checkbox" id="is_active_check" checked={newMovie.is_active as boolean} onChange={setMovieField("is_active")} className="modal-checkbox" />
                  <label htmlFor="is_active_check" className="modal-checkbox-label">Set as Active</label>
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

      
      {showAddScreening && (
        <div className="modal-backdrop" onClick={() => setShowAddScreening(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              <i className="fa-solid fa-clapperboard" /> Add New Screening
            </h3>
            <label className="modal-label">Movie *</label>
            <select className="modal-input" value={newScreening.movie_id} onChange={e => setNewScreening(p => ({ ...p, movie_id: e.target.value }))}>
              <option value="" disabled>Select Movie</option>
              {movieList.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
            <label className="modal-label">Hall *</label>
            <select className="modal-input" value={newScreening.hall_id} onChange={e => setNewScreening(p => ({ ...p, hall_id: e.target.value }))}>
              <option value="" disabled>Select Hall</option>
              {hallList.map(h => <option key={h.id} value={h.id}>{h.name} (cap: {h.capacity})</option>)}
            </select>
            <label className="modal-label">Show Date *</label>
            <input type="date" value={newScreening.show_date} onChange={e => setNewScreening(p => ({ ...p, show_date: e.target.value }))} className="modal-input" />
            <label className="modal-label">Start Time *</label>
            <input type="time" value={newScreening.start_time} onChange={e => setNewScreening(p => ({ ...p, start_time: e.target.value }))} className="modal-input" />
            <label className="modal-label">
              Available Seats <span style={{ color: "#aaa", fontWeight: 400 }}>(leave blank to use hall capacity)</span>
            </label>
            <input type="number" placeholder="e.g. 120" value={newScreening.available_seats} onChange={e => setNewScreening(p => ({ ...p, available_seats: e.target.value }))} className="modal-input" min={1} />
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowAddScreening(false)}>Cancel</button>
              <button className="modal-confirm-btn" onClick={handleAddScreening}>Add Screening</button>
            </div>
          </div>
        </div>
      )}

     
      {showEditMovie && (
        <div className="modal-backdrop" onClick={() => setShowEditMovie(false)}>
          <div className="modal-card modal-wide" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              <i className="fa-solid fa-pen" /> Edit Movie
            </h3>
            <div className="modal-grid">
              <div className="modal-col">
                <label className="modal-label">Title *</label>
                <input type="text" placeholder="e.g. Oppenheimer" value={editMovie.title} onChange={setEditField("title")} className="modal-input" />
                <label className="modal-label">Description</label>
                <textarea placeholder="Short synopsis…" value={editMovie.description as string} onChange={setEditField("description")} className="modal-input modal-textarea" rows={3} />
                <label className="modal-label">Genre</label>
                <input type="text" placeholder="e.g. Action, Drama" value={editMovie.genre as string} onChange={setEditField("genre")} className="modal-input" />
                <label className="modal-label">Language</label>
                <input type="text" placeholder="e.g. English, Bangla" value={editMovie.language as string} onChange={setEditField("language")} className="modal-input" />
              </div>
              <div className="modal-col">
                <label className="modal-label">Category</label>
                <select className="modal-input" value={editMovie.category} onChange={setEditField("category")}>
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                </select>
                <label className="modal-label">Status</label>
                <select className="modal-input" value={editMovie.status} onChange={setEditField("status")}>
                  <option value="now_showing">Now Showing</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
                <label className="modal-label">Duration (mins)</label>
                <input type="number" placeholder="e.g. 148" value={editMovie.duration_mins as string} onChange={setEditField("duration_mins")} className="modal-input" min={1} />
                <label className="modal-label">Release Date</label>
                <input type="date" value={editMovie.release_date as string} onChange={setEditField("release_date")} className="modal-input" />
                <label className="modal-label">Poster URL</label>
                <input type="text" placeholder="/posters/movie.jpg" value={editMovie.poster_url as string} onChange={setEditField("poster_url")} className="modal-input" />
                <label className="modal-label">Trailer URL</label>
                <input type="text" placeholder="https://youtube.com/…" value={editMovie.trailer_url as string} onChange={setEditField("trailer_url")} className="modal-input" />
                <div className="modal-checkbox-row">
                  <input type="checkbox" id="edit_is_active_check" checked={editMovie.is_active as boolean} onChange={setEditField("is_active")} className="modal-checkbox" />
                  <label htmlFor="edit_is_active_check" className="modal-checkbox-label">Set as Active</label>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowEditMovie(false)}>Cancel</button>
              <button className="modal-confirm-btn" onClick={handleEditMovie} disabled={editingMovie}>
                {editingMovie ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-footer">
        Copyright© 2026 CineBook Limited. All Rights Reserved.
      </div>
    </div>
  )
}