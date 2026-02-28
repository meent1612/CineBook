import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../CSSfiles/Navbar.css";

const navLinks = [
  { to: "/", label: "HOME" },
  { to: "/showtimes", label: "SHOW TIMES" },
  { to: "/about", label: "ABOUT US" },
  { to: "/contact", label: "CONTACTS" },
  { to: "/ticket-price", label: "TICKET PRICE" },
  { to: "/admin", label: "ADMIN DASHBOARD" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="nav">
      <Link to="/" className="logo">
        <div className="logo-icon">🎬</div>
        <div>
          <div className="logo-text">CineBook</div>
          <div className="logo-sub">CINEMATIC</div>
        </div>
      </Link>

      <div className="nav-links">
        {navLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${location.pathname === l.to ? "active" : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="nav-right">
        <div className="location-area">
          <span>📍</span>
          <span>Tejgaon</span>
        </div>
        <button className="login-btn" onClick={() => navigate("/login")}>
          👤 Login
        </button>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="mobile-menu-link"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}