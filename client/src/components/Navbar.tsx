import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../CSSfiles/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Build nav links based on role
  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/showtimes", label: "SHOW TIMES" },
    { to: "/about", label: "ABOUT US" },
    { to: "/contact", label: "CONTACTS" },
    { to: "/ticket-price", label: "TICKET PRICE" },
    // Show Admin Dashboard only for admin
    ...(user?.role === "admin" ? [{ to: "/admin", label: "ADMIN DASHBOARD" }] : []),
    // Show User Dashboard only for logged in user
    ...(user?.role === "user" ? [{ to: "/user", label: "USER DASHBOARD" }] : []),
  ];

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

        {user ? (
          <>
            <span className="nav-username">👤 {user.name}</span>
            <button className="login-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="login-btn" onClick={() => navigate("/login")}>
            👤 Login
          </button>
        )}

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
          {user && (
            <button className="mobile-menu-link" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}