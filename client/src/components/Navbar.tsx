import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../CSSfiles/Navbar.css"

export default function Navbar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const navLinks = [
    { to: "/",            label: "HOME" },
    { to: "/showtimes",   label: "SHOW TIMES" },
    { to: "/about",       label: "ABOUT US" },
    { to: "/contact",     label: "CONTACTS" },
    { to: "/ticket-price",label: "TICKET PRICE" },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "ADMIN DASHBOARD" }] : []),
    ...(user?.role === "user"  ? [{ to: "/user",  label: "USER DASHBOARD"  }] : []),
  ]

  return (
    <nav className="nav">
      {/* Logo */}
      <Link to="/" className="logo">
        <div className="logo-icon">🎬</div>
        <div>
          <div className="logo-text">CineBook</div>
          <div className="logo-sub">CINEMATIC</div>
        </div>
      </Link>

      {/* Nav links */}
      <div className="nav-links">
        {navLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${location.pathname === l.to ? "active" : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
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
      </div>
    </nav>
  )
}