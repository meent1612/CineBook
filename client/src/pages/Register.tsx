import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    gender: "Male",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    navigate("/login");
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
          width: "400px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ background: "#6B1829", padding: "1.5rem", textAlign: "center" }}>
          <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: "1.4rem" }}>
            Register to CineBook
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.8rem" }}>
          <Field label="Full Name*">
            <input
              type="text"
              placeholder="Full Name*"
              value={form.fullName}
              onChange={set("fullName")}
              required
              style={inputStyle}
            />
          </Field>

          <Field label="Mobile Number*">
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span
                style={{
                  ...inputStyle,
                  width: "72px",
                  background: "#f5f5f5",
                  color: "#555",
                  textAlign: "center",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +880
              </span>
              <input
                type="tel"
                placeholder="1xxxxxxxxx"
                value={form.mobile}
                onChange={set("mobile")}
                required
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </Field>

          <Field label="Email*">
            <input
              type="email"
              placeholder="Email*"
              value={form.email}
              onChange={set("email")}
              required
              style={inputStyle}
            />
          </Field>

          <Field label="Gender">
            <select value={form.gender} onChange={set("gender")} style={inputStyle}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Field>

          <Field label="Password*">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={set("password")}
              required
              style={inputStyle}
            />
          </Field>

          <Field label="Password*">
            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              required
              style={inputStyle}
            />
          </Field>

          <button type="submit" style={btnStyle}>
            Register
          </button>

          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.83rem", color: "#555" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#6B1829", fontWeight: 600 }}>
              Login Now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.62rem 0.9rem",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "0.87rem",
  outline: "none",
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
  marginTop: "0.5rem",
};