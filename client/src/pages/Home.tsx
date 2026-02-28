import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { movies } from "../data/movies";
import "../CSSfiles/Home.css";

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
    <div className="home-wrapper">
      {/* Hero Banner */}
      <div
        className="hero-banner"
        style={{ background: heroMovies[heroIdx].bg }}
      >
        <img
          src={
            heroMovies[heroIdx].img ||
            "https://image.tmdb.org/t/p/w1280/cKtDJiU5zjcnDnRTzYpQ5xScKvU.jpg"
          }
          alt="hero"
          className="hero-img"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="hero-overlay" />

        {/* Dots */}
        <div className="hero-dots">
          {heroMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`hero-dot ${i === heroIdx ? "active" : "inactive"}`}
            />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {/* Tabs + View All */}
        <div className="tabs-bar">
          <div className="tabs-list">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "Show Times") navigate("/showtimes");
                  if (tab === "Buy Tickets") navigate("/showtimes");
                }}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="view-all-btn" onClick={() => navigate("/showtimes")}>
            View All Movies
          </button>
        </div>

        {/* Movie Grid */}
        <div className="movie-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <img
                src={movie.poster}
                alt={movie.title}
                className="movie-poster"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/150x220/2a2a2a/white?text=${encodeURIComponent(
                    movie.title.substring(0, 10)
                  )}`;
                }}
              />
              <div className="movie-card-overlay">
                <div className="movie-title">
                  {movie.title.length > 20
                    ? movie.title.substring(0, 20) + "…"
                    : movie.title}
                </div>
                <button
                  className="get-tickets-btn"
                  onClick={() => navigate(`/book/${movie.id}`)}
                >
                  Get Tickets
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="footer">
          Copyright© 2026 CineBook Limited . All Rights Reserved.
        </div>
      </div>
    </div>
  );
}