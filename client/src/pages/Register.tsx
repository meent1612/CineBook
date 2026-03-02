import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../CSSfiles/Register.css";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    gender: "Male",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.fullName,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
        mobile_number: form.mobile ? `+880${form.mobile}` : undefined,
        gender: form.gender,
      });
      navigate("/user");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <div className="register-card-header">
          <h2>Register to CineBook</h2>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <p style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>
              {error}
            </p>
          )}

          <Field label="Full Name*">
            <input
              type="text"
              placeholder="Full Name*"
              value={form.fullName}
              onChange={set("fullName")}
              required
              className="register-input"
            />
          </Field>

          <Field label="Mobile Number*">
            <div className="mobile-row">
              <span className="mobile-prefix">+880</span>
              <input
                type="tel"
                placeholder="1xxxxxxxxx"
                value={form.mobile}
                onChange={set("mobile")}
                required
                className="register-input flex-1"
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
              className="register-input"
            />
          </Field>

          <Field label="Gender">
            <select
              value={form.gender}
              onChange={set("gender")}
              className="register-select"
            >
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
              className="register-input"
            />
          </Field>

          <Field label="Confirm Password*">
            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              required
              className="register-input"
            />
          </Field>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="register-footer-text">
            Already have an account?{" "}
            <Link to="/login">Login Now</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}