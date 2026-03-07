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

  const handleUsernameClick = () => {
    if (user?.role === "admin") navigate("/admin")
    else navigate("/user")
  }

  const navLinks = [
    { to: "/",             label: "HOME" },
    { to: "/showtimes",    label: "SHOW TIMES" },
    ...(user?.role !== "admin" ? [
      { to: "/about",        label: "ABOUT US" },
      { to: "/contact",      label: "CONTACTS" },
      { to: "/ticket-price", label: "TICKET PRICE" },
    ] : []),
    ...(user?.role === "user" ? [
      { to: "/user",         label: "USER DASHBOARD" },
    ] : []),
     ...(user?.role === "admin" ? [
       { to: "/admin",       label: "ADMIN DASHBOARD" },
    ] : []),
  ]
 
  return (
    <nav className="nav">
      
      <Link to="/" className="logo">
        <div className="logo-icon">
          <i className="fa-solid fa-film" />
        </div>
        <div>
          <div className="logo-text">CineBook</div>
          <div className="logo-sub">CINEMATIC</div>
        </div>
      </Link>

      
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

      
      <div className="nav-right">
        <div className="location-area">
          <i className="fa-solid fa-location-dot" />
          <span>Tejgaon</span>
        </div>

        {user ? (
          <>
            <button
              className="nav-username nav-username-btn"
              onClick={handleUsernameClick}
              title={`Go to ${user.role === "admin" ? "Admin" : "User"} Dashboard`}
            >
              <i className="fa-solid fa-user" /> {user.name}
            </button>
            <button className="login-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="login-btn" onClick={() => navigate("/login")}>
            <i className="fa-solid fa-user" /> Login
          </button>
        )}
      </div>
    </nav>
  )
}