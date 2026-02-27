import { useNavigate } from "react-router-dom";
import { movies, DAY_LABELS } from "../data/movies";

export default function ShowTimes() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0" }}>
      {/* Location bar */}
      <div
        style={{
          background: "#2a2a2a",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ color: "#aaa", fontSize: "0.72rem" }}>Weekly Showtime</div>
          <div style={{ color: "white", fontSize: "0.88rem", fontWeight: 600 }}>
            [Love Road, Tejgaon]
          </div>
        </div>
        <button
          style={{
            background: "#6B1829",
            color: "white",
            border: "none",
            borderRadius: "20px",
            padding: "0.3rem 0.8rem",
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          Change Location 🔄
        </button>
      </div>

      {/* Movie rows */}
      <div style={{ padding: "1rem 1rem" }}>
        {movies.map(movie => (
          <div
            key={movie.id}
            style={{
              background: "white",
              borderRadius: "10px",
              marginBottom: "1rem",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex" }}>
              {/* Movie Info */}
              <div
                style={{
                  minWidth: "180px",
                  display: "flex",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  borderRight: "1px solid #eee",
                }}
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{ width: 60, height: 85, objectFit: "cover", borderRadius: "4px" }}
                  onError={e => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/60x85/6B1829/white?text=M`;
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.25rem", color: "#1a1a1a" }}>
                    {movie.title}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#555", lineHeight: 1.5 }}>
                    <div>Category: {movie.category}</div>
                    <div>Genre: {movie.genre}</div>
                    <div>Release: {movie.releaseDate}</div>
                    <div>Language: {movie.language}</div>
                  </div>
                </div>
              </div>

              {/* Showtimes grid */}
              <div style={{ flex: 1, overflowX: "auto" }}>
                <div style={{ display: "flex", minWidth: "700px" }}>
                  {DAY_LABELS.map(({ date, day }) => (
                    <div
                      key={date}
                      style={{
                        flex: 1,
                        borderRight: "1px solid #eee",
                        padding: "0.5rem 0.4rem",
                        minWidth: "100px",
                      }}
                    >
                      <div
                        style={{
                          background: "#6B1829",
                          color: "white",
                          borderRadius: "4px",
                          padding: "0.2rem 0.3rem",
                          textAlign: "center",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          marginBottom: "0.4rem",
                        }}
                      >
                        <div>{date} 26</div>
                        <div>{day}</div>
                      </div>
                      {(movie.showtimes[date] || []).map(time => (
                        <button
                          key={time}
                          style={{
                            display: "block",
                            width: "100%",
                            background: "#e8f5e9",
                            border: "1px solid #a5d6a7",
                            color: "#2e7d32",
                            borderRadius: "4px",
                            padding: "0.2rem 0.3rem",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginBottom: "0.25rem",
                            textAlign: "center",
                          }}
                        >
                          {time}
                        </button>
                      ))}
                      <button
                        onClick={() => navigate(`/book/${movie.id}`)}
                        style={{
                          display: "block",
                          width: "100%",
                          background: "#6B1829",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.2rem 0.3rem",
                          fontSize: "0.68rem",
                          cursor: "pointer",
                          marginTop: "0.3rem",
                        }}
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

      <div
        style={{
          background: "#1a1a1a",
          color: "#aaa",
          textAlign: "center",
          padding: "1rem",
          fontSize: "0.78rem",
        }}
      >
        Copyright© 2026 CineBook Limited . All Rights Reserved.
      </div>
    </div>
  );
}