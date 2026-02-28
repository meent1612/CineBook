import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { movies as initialMovies, Movie } from "../data/movies";
import "../CSSfiles/AdminDashboard.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface Screening {
  id: number;
  movie: string;
  hall: string;
  date: string;
  time: string;
}

export default function AdminDashboard() {
  const [selectedMonth, setSelectedMonth] = useState("December");
  const [movieList, setMovieList] = useState<Movie[]>(initialMovies);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [newMovieTitle, setNewMovieTitle] = useState("");

  const [showAddScreening, setShowAddScreening] = useState(false);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [newScreening, setNewScreening] = useState({
    movie: "",
    hall: "",
    date: "",
    time: "",
  });

  const navigate = useNavigate();

  const stats = [
    { label: "Tickets Sold", value: "15,000" },
    { label: "Active Movies", value: movieList.length.toString() },
    { label: "Revenue", value: "40M BDT" },
    { label: "Active Screening", value: (500 + screenings.length).toString() },
  ];

  const mgmt = [
    { label: "Movie\nManagement", icon: "🎬", path: "/admin/movies" },
    { label: "Screening\nManagement", icon: "📽️", path: "/admin/screenings" },
    { label: "Inbox", icon: "📬", path: "/admin/inbox" },
  ];

  const handleAddMovie = () => {
    if (newMovieTitle) {
      setMovieList((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: newMovieTitle,
          genre: "Unknown",
          category: "2D",
          language: "English",
          releaseDate: "2026-01-01",
          poster: "https://via.placeholder.com/150x220/6B1829/white?text=New",
          showtimes: {},
        },
      ]);
      setNewMovieTitle("");
      setShowAddMovie(false);
    }
  };

  const handleAddScreening = () => {
    const { movie, hall, date, time } = newScreening;
    if (movie && hall && date && time) {
      setScreenings((prev) => [
        ...prev,
        { id: Date.now(), movie, hall, date, time },
      ]);
      setNewScreening({ movie: "", hall: "", date: "", time: "" });
      setShowAddScreening(false);
    }
  };

  const setScreeningField =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setNewScreening((prev) => ({ ...prev, [field]: e.target.value }));

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
          <div key={m.label} className="admin-mgmt-card" onClick={() => {}}>
            <div className="admin-mgmt-icon">{m.icon}</div>
            <div className="admin-mgmt-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Add Movie Modal */}
      {showAddMovie && (
        <div className="modal-backdrop" onClick={() => setShowAddMovie(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Movie</h3>
            <input
              type="text"
              placeholder="Movie Title"
              value={newMovieTitle}
              onChange={(e) => setNewMovieTitle(e.target.value)}
              className="modal-input"
            />
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowAddMovie(false)}>
                Cancel
              </button>
              <button className="modal-confirm-btn" onClick={handleAddMovie}>
                Add Movie
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
              value={newScreening.movie}
              onChange={setScreeningField("movie")}
            >
              <option value="" disabled>Select Movie</option>
              {movieList.map((m) => (
                <option key={m.id} value={m.title}>{m.title}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Hall (e.g. Hall 1)"
              value={newScreening.hall}
              onChange={setScreeningField("hall")}
              className="modal-input"
            />

            <input
              type="date"
              value={newScreening.date}
              onChange={setScreeningField("date")}
              className="modal-input"
            />

            <input
              type="time"
              value={newScreening.time}
              onChange={setScreeningField("time")}
              className="modal-input"
            />

            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowAddScreening(false)}>
                Cancel
              </button>
              <button className="modal-confirm-btn" onClick={handleAddScreening}>
                Add Screening
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-footer">
        Copyright© 2026 CineBook Limited . All Rights Reserved.
      </div>
    </div>
  );
}