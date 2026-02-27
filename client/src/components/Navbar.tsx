import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const styles: { [k: string]: React.CSSProperties } = {
  nav: {
    background: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.5rem",
    height: "64px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "white",
  },
  logoIcon: {
    width: 44,
    height: 44,
    background: "#6B1829",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.1rem",
    color: "white",
    letterSpacing: "0.02em",
  },
  links: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  },
  linkStyle: {
    color: "#ccc",
    fontSize: "0.85rem",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    transition: "color 0.2s",
  },
  activeLink: {
    color: "white",
    borderBottom: "2px solid #6B1829",
    paddingBottom: "2px",
  },
  locationArea: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: "6px",
    padding: "0.3rem 0.7rem",
    color: "#ccc",
    fontSize: "0.85rem",
  },
  hamburger: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1.5rem",
    cursor: "pointer",
    display: "none",
  },
  loginBtn: {
    background: "#6B1829",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "0.4rem 1rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  mobileMenu: {
    position: "fixed" as const,
    top: 64,
    right: 0,
    background: "#1a1a1a",
    width: "220px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    zIndex: 200,
    boxShadow: "-4px 0 16px rgba(0,0,0,0.5)",
  },
};

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
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <div style={styles.logoIcon}>🎬</div>
        <div>
          <div style={styles.logoText}>CineBook</div>
          <div style={{ color: "#aaa", fontSize: "0.62rem", letterSpacing: "0.12em" }}>CINEMATIC</div>
        </div>
      </Link>

      <div style={styles.links}>
        {navLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            style={{
              ...styles.linkStyle,
              ...(location.pathname === l.to ? styles.activeLink : {}),
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={styles.locationArea}>
          <span>📍</span>
          <span>Tejgaon</span>
        </div>
        <button style={styles.loginBtn} onClick={() => navigate("/login")}>
          👤 Login
        </button>
        <button
          style={{ ...styles.hamburger, display: "block" }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              style={{ color: "#ccc", fontSize: "0.9rem" }}
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