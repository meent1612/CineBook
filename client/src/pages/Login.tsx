import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin" && password === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#888",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
          width: "380px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#6B1829",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: "1.4rem" }}>
            Login to CineBook
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ padding: "2rem" }}>
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Email/Mobile<span style={{ color: "#6B1829" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Email/Mobile*"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Password<span style={{ color: "#6B1829" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#888",
                  fontSize: "1rem",
                }}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" style={btnStyle}>
            Login
          </button>

          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.83rem", color: "#555" }}>
            New to CineBook?{" "}
            <Link to="/register" style={{ color: "#6B1829", fontWeight: 600 }}>
              Register Now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "0.88rem",
  outline: "none",
  transition: "border-color 0.2s",
};

const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  background: "#6B1829",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "0.95rem",
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.03em",
};