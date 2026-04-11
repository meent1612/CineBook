import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../CSSfiles/Login.css"

export default function Login() {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.role === "admin") navigate("/admin")
      else navigate("/user")
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-card-header">
          <h2>Login to CineBook</h2>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <p style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>
              {error}
            </p>
          )}

          <div className="login-field">
            <label className="login-label">
              Email<span>*</span>
            </label>
            <input
              type="email"
              placeholder="Email*"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
                onChange={e => setPassword(e.target.value)}
                required
                className="login-input with-icon"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="toggle-pass-btn"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                <i className={`fa-regular ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="login-footer-text">
            New to CineBook?{" "}
            <Link to="/register">Register Now</Link>
          </p>
        </form>
      </div>
    </div>
  )
}