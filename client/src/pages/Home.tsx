import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { movies } from "../data/movies";

const TABS = ["Now Showing", "Coming Soon", "Buy Tickets", "Show Times"];

const heroMovies = [
  {
    title: "Avatar: Fire and Ash",
    bg: "linear-gradient(135deg, #0f2744 0%, #1a3a6b 50%, #0d1f33 100%)",
    img: "https://image.tmdb.org/t/p/w1280/cKtDJiU5zjcnDnRTzYpQ5xScKvU.jpg",
  },
  {
    title: "Sultana's Dream",
    bg: "linear-gradient(135deg, #2d1b2e 0%, #4a2040 50%, #1a0f1e 100%)",
    img: "",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("Now Showing");
  const [heroIdx, setHeroIdx] = useState(0);
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#111" }}>
      {/* Hero Banner */}
      <div
        style={{
          position: "relative",
          height: "360px",
          overflow: "hidden",
          background: heroMovies[heroIdx].bg,
        }}
      >
        <img
          src={heroMovies[heroIdx].img || "https://image.tmdb.org/t/p/w1280/cKtDJiU5zjcnDnRTzYpQ5xScKvU.jpg"}
          alt="hero"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            opacity: 0.7,
          }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8) 100%)",
          }}
        />
        {/* Dots */}
        <div
          style={{
            position: "absolute",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          {heroMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              style={{
                width: i === heroIdx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === heroIdx ? "white" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ background: "#f0f0f0", minHeight: "calc(100vh - 360px)" }}>
        {/* Tabs + View All */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 2rem 0",
            borderBottom: "2px solid #ddd",
            background: "white",
          }}
        >
          <div style={{ display: "flex", gap: "0" }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "Show Times") navigate("/showtimes");
                  if (tab === "Buy Tickets") navigate("/showtimes");
                }}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab ? "2px solid #6B1829" : "2px solid transparent",
                  color: activeTab === tab ? "#6B1829" : "#555",
                  fontWeight: activeTab === tab ? 700 : 400,
                  fontSize: "0.9rem",
                  padding: "0.75rem 1.2rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  marginBottom: "-2px",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate("/showtimes")}
            style={{
              background: "white",
              border: "1px solid #6B1829",
              color: "#6B1829",
              borderRadius: "6px",
              padding: "0.4rem 1rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            View All Movies
          </button>
        </div>

        {/* Movie Grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "1.5rem 2rem",
            background: "#6B1829",
          }}
        >
          {movies.map(movie => (
            <div
              key={movie.id}
              style={{
                width: "150px",
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
                onError={e => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/150x220/2a2a2a/white?text=${encodeURIComponent(movie.title.substring(0,10))}`;
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                  padding: "2rem 0.5rem 0.5rem",
                }}
              >
                <div style={{ fontSize: "0.65rem", color: "white", fontWeight: 600, marginBottom: "0.3rem" }}>
                  {movie.title.length > 20 ? movie.title.substring(0, 20) + "…" : movie.title}
                </div>
                <button
                  onClick={() => navigate(`/book/${movie.id}`)}
                  style={{
                    background: "#6B1829",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.2rem 0.5rem",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Get Tickets
                </button>
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
    </div>
  );
}