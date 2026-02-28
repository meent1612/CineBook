import { useNavigate } from "react-router-dom";
import { movies, DAY_LABELS } from "../data/movies";
import "../CSSfiles/Showtimes.css";

export default function ShowTimes() {
  const navigate = useNavigate();

  return (
    <div className="showtimes-wrapper">
      {/* Location Bar */}
      <div className="location-bar">
        <div>
          <div className="location-label">Weekly Showtime</div>
          <div className="location-name">[Love Road, Tejgaon]</div>
        </div>
        <button className="change-location-btn">Change Location 🔄</button>
      </div>

      {/* Movie Rows */}
      <div className="movie-rows">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-row">
            <div className="movie-row-inner">
              {/* Movie Info */}
              <div className="movie-info">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="movie-info-poster"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/60x85/6B1829/white?text=M";
                  }}
                />
                <div>
                  <div className="movie-info-title">{movie.title}</div>
                  <div className="movie-info-details">
                    <div>Category: {movie.category}</div>
                    <div>Genre: {movie.genre}</div>
                    <div>Release: {movie.releaseDate}</div>
                    <div>Language: {movie.language}</div>
                  </div>
                </div>
              </div>

              {/* Showtimes Grid */}
              <div className="showtimes-grid-wrapper">
                <div className="showtimes-grid">
                  {DAY_LABELS.map(({ date, day }) => (
                    <div key={date} className="day-column">
                      <div className="day-header">
                        <div>{date} 26</div>
                        <div>{day}</div>
                      </div>
                      {(movie.showtimes[date] || []).map((time) => (
                        <button key={time} className="showtime-btn">
                          {time}
                        </button>
                      ))}
                      <button
                        className="get-tickets-btn"
                        onClick={() => navigate(`/book/${movie.id}`)}
                      >
                        Get Tickets
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="footer">
        Copyright© 2026 CineBook Limited . All Rights Reserved.
      </div>
    </div>
  );
}