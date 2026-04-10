import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useBranch } from "../context/Branchcontext"
import "../CSSfiles/Navbar.css"

export default function Navbar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, logout }                                   = useAuth()
  const { theaters, selectedTheater, selectTheater }       = useBranch()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => { logout(); navigate("/") }

  const handleUsernameClick = () => {
    if (user?.role === "admin") navigate("/admin")
    else navigate("/user")
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navLinks = [
    { to: "/",             label: "HOME" },
    { to: "/showtimes",    label: "SHOW TIMES" },
    ...(user?.role !== "admin" ? [
      { to: "/about",        label: "ABOUT US" },
      { to: "/contact",      label: "CONTACTS" },
      { to: "/ticket-price", label: "TICKET PRICE" },
    ] : []),
    ...(user?.role === "user"  ? [{ to: "/user",  label: "USER DASHBOARD"  }] : []),
    ...(user?.role === "admin" ? [{ to: "/admin", label: "ADMIN DASHBOARD" }] : []),
  ]

  return (
    <nav className="nav">

      {/* Logo */}
      <Link to="/" className="logo">
        <div className="logo-icon">
          <i className="fa-solid fa-film" />
        </div>
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

        {/* Theater dropdown */}
        <div className="branch-dropdown-wrap" ref={dropdownRef}>
          <button
            className="branch-dropdown-btn"
            onClick={() => setDropdownOpen(prev => !prev)}
            aria-label="Select theater"
          >
            <i className="fa-solid fa-location-dot" />
            <span className="branch-name">
              {selectedTheater ? selectedTheater.name : "Select Theater"}
            </span>
            <i className={`fa-solid fa-chevron-${dropdownOpen ? "up" : "down"} branch-chevron`} />
          </button>

          {dropdownOpen && (
            <div className="branch-dropdown-menu">
              <div className="branch-dropdown-label">Select Theater</div>
              {theaters.map(theater => (
                <button
                  key={theater.id}
                  className={`branch-dropdown-item ${selectedTheater?.id === theater.id ? "active" : ""}`}
                  onClick={() => { selectTheater(theater); setDropdownOpen(false) }}
                >
                  <i className="fa-solid fa-building" />
                  <div className="branch-item-info">
                    <span className="branch-item-name">{theater.name}</span>
                    <span className="branch-item-address">{theater.address}</span>
                  </div>
                  {selectedTheater?.id === theater.id && (
                    <i className="fa-solid fa-check branch-check" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        {user ? (
          <>
            <button
              className="nav-username nav-username-btn"
              onClick={handleUsernameClick}
              title={`Go to ${user.role === "admin" ? "Admin" : "User"} Dashboard`}
            >
              <i className="fa-solid fa-user" /> {user.name}
            </button>
            <button className="login-btn" onClick={handleLogout}>Logout</button>
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