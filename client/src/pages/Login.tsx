import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSSfiles/Login.css";

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
    <div className="login-wrapper">
      <div className="login-card">
        {/* Header */}
        <div className="login-card-header">
          <h2>Login to CineBook</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label className="login-label">
              Email/Mobile<span>*</span>
            </label>
            <input
              type="text"
              placeholder="Email/Mobile*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <div className="login-field last">
            <label className="login-label">
              Password<span>*</span>
            </label>
            <div className="password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input with-icon"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="toggle-pass-btn"
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

          <p className="login-footer-text">
            New to CineBook?{" "}
            <Link to="/register">Register Now</Link>
          </p>
        </form>
      </div>
    </div>
  );
}