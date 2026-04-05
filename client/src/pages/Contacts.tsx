import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`;

export default function Contacts() {
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    name:    user?.name  || "",
    email:   user?.email || "",
    subject: "",
    message: "",
  });
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user || !token) {
      setError("You must be logged in to send a message.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/contact`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSent(true);
      setForm({ name: user?.name || "", email: user?.email || "", subject: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: "fa-solid fa-location-dot", label: "Address",       value: "Love Road, Tejgaon, Dhaka 1215, Bangladesh" },
    { icon: "fa-solid fa-phone",         label: "Phone",         value: "+880 1700-000000" },
    { icon: "fa-solid fa-envelope",      label: "Email",         value: "support@cinebook.com.bd" },
    { icon: "fa-solid fa-clock",         label: "Booking Hours", value: "9:00 AM – 11:00 PM (Daily)" },
  ];

  const socials = [
    { icon: "fa-brands fa-facebook-f", label: "Facebook" },
    { icon: "fa-brands fa-instagram",  label: "Instagram" },
    { icon: "fa-brands fa-x-twitter",  label: "Twitter" },
    { icon: "fa-brands fa-youtube",    label: "YouTube" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0" }}>

      <div style={{ background: "#6B1829", padding: "3rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 40px)" }} />
        <i className="fa-solid fa-paper-plane" style={{ fontSize: "2.5rem", color: "rgba(255,255,255,0.9)", marginBottom: "0.75rem", display: "block" }} />
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: "white", marginBottom: "0.65rem" }}>Contact Us</h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto" }}>
          Have a question or feedback? We'd love to hear from you. Our team usually responds within 24 hours.
        </p>
      </div>

      <div style={{ maxWidth: "900px", margin: "2.5rem auto", padding: "0 1.5rem", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>

        <div style={{ width: "280px", flexShrink: 0 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "1.75rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", color: "#6B1829", marginBottom: "1.25rem" }}>Get In Touch</h2>
            {contactInfo.map(item => (
              <div key={item.label} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.1rem" }}>
                <i className={item.icon} style={{ fontSize: "1.1rem", color: "#6B1829", marginTop: "3px", width: "18px", textAlign: "center" }} />
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.15rem" }}>{item.label}</div>
                  <div style={{ fontSize: "0.82rem", color: "#333", fontWeight: 500, lineHeight: 1.5 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem 1.75rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "0.75rem", color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.85rem" }}>Follow Us</div>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {socials.map(s => (
                <button key={s.label} title={s.label}
                  style={{ width: "38px", height: "38px", borderRadius: "8px", border: "1px solid #eee", background: "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f9f0f2"; (e.currentTarget as HTMLElement).style.borderColor = "#6B1829"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fafafa"; (e.currentTarget as HTMLElement).style.borderColor = "#eee"; }}
                >
                  <i className={s.icon} style={{ fontSize: "0.9rem", color: "#6B1829" }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ background: "#6B1829", padding: "1rem 1.75rem" }}>
              <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: "1.15rem" }}>Send Us a Message</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "1.75rem" }}>

              {!user && (
                <div style={{ background: "#fff3cd", border: "1px solid #ffc107", color: "#856404", borderRadius: "6px", padding: "0.75rem 1rem", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "0.5rem" }} />
                  You must be <a href="/login" style={{ color: "#6B1829", fontWeight: 600 }}>logged in</a> to send a message.
                </div>
              )}

              {sent && (
                <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", color: "#2e7d32", borderRadius: "6px", padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.25rem", textAlign: "center" }}>
                  <i className="fa-solid fa-circle-check" /> Message sent! We'll get back to you soon.
                </div>
              )}

              {error && (
                <div style={{ background: "#fee2e2", border: "1px solid #f87171", color: "#dc2626", borderRadius: "6px", padding: "0.75rem 1rem", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }} />{error}
                </div>
              )}

              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Full Name*</label>
                  <input type="text" placeholder="Your full name" value={form.name} onChange={set("name")} required style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Email*</label>
                  <input type="email" placeholder="your@email.com" value={form.email} onChange={set("email")} required style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Subject*</label>
                <select value={form.subject} onChange={set("subject")} required style={inputStyle}>
                  <option value="">Select a subject...</option>
                  <option>Booking Issue</option>
                  <option>Refund Request</option>
                  <option>Movie Inquiry</option>
                  <option>Technical Support</option>
                  <option>General Feedback</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Message*</label>
                <textarea placeholder="Write your message here..." value={form.message} onChange={set("message")} required rows={5}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </div>

              <button type="submit" disabled={loading || !user}
                style={{ ...btnStyle, opacity: loading || !user ? 0.6 : 1, cursor: loading || !user ? "not-allowed" : "pointer" }}>
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "0.5rem" }} />Sending…</>
                  : <><i className="fa-solid fa-paper-plane" style={{ marginRight: "0.5rem" }} />Send Message</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto 2.5rem", padding: "0 1.5rem" }}>
        <div style={{ background: "#ddd", borderRadius: "12px", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ textAlign: "center" }}>
            <i className="fa-solid fa-map-location-dot" style={{ fontSize: "2.5rem", color: "#6B1829", marginBottom: "0.5rem", display: "block" }} />
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#555" }}>CineBook — Love Road, Tejgaon, Dhaka</div>
            <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>Dhaka 1215, Bangladesh</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#1a1a1a", color: "#aaa", textAlign: "center", padding: "1rem", fontSize: "0.78rem" }}>
        Copyright© 2026 CineBook Limited. All Rights Reserved.
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.35rem", color: "#333",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.62rem 0.9rem", border: "1px solid #ddd", borderRadius: "6px",
  fontSize: "0.87rem", outline: "none", boxSizing: "border-box" as const,
};
const btnStyle: React.CSSProperties = {
  width: "100%", padding: "0.75rem", background: "#6B1829", color: "white",
  border: "none", borderRadius: "6px", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.03em",
};