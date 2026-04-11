import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`;

interface SentMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const SUBJECT_COLORS: Record<string, { bg: string; color: string }> = {
  "Booking Issue":     { bg: "#fef3c7", color: "#92400e" },
  "Refund Request":    { bg: "#fee2e2", color: "#991b1b" },
  "Movie Inquiry":     { bg: "#ede9fe", color: "#5b21b6" },
  "Technical Support": { bg: "#dbeafe", color: "#1e40af" },
  "General Feedback":  { bg: "#d1fae5", color: "#065f46" },
  "Other":             { bg: "#f3f4f6", color: "#374151" },
};

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

  // My messages history
  const [myMessages,     setMyMessages]     = useState<SentMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedId,     setExpandedId]     = useState<number | null>(null);

  const fetchMyMessages = async () => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const res  = await fetch(`${API_URL}/contact/my-messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setMyMessages((data.messages as any[]).map(m => ({ ...m, is_read: Boolean(m.is_read) })));
    } catch {
      // silently fail — not critical
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchMyMessages();
  }, [user, token]);

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
      // Refresh history after sending
      fetchMyMessages();
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

      {/* Hero */}
      <div style={{ background: "#6B1829", padding: "3rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 40px)" }} />
        <i className="fa-solid fa-paper-plane" style={{ fontSize: "2.5rem", color: "rgba(255,255,255,0.9)", marginBottom: "0.75rem", display: "block" }} />
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: "white", marginBottom: "0.65rem" }}>Contact Us</h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto" }}>
          Have a question or feedback? We'd love to hear from you. Our team usually responds within 24 hours.
        </p>
      </div>

      {/* Contact form + sidebar */}
      <div style={{ maxWidth: "900px", margin: "2.5rem auto", padding: "0 1.5rem", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>

        {/* Left sidebar */}
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

        {/* Right: form */}
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

      {/* My Message History — only shown when logged in */}
      {user && (
        <div style={{ maxWidth: "900px", margin: "0 auto 2.5rem", padding: "0 1.5rem" }}>
          <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>

            {/* Section header */}
            <div style={{ background: "#1a1a2e", padding: "1rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }} />
                <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", margin: 0 }}>My Message History</h2>
              </div>
              {myMessages.length > 0 && (
                <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
                  {myMessages.length} ticket{myMessages.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div style={{ padding: "1.5rem 1.75rem" }}>
              {loadingHistory && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "0.5rem" }} />Loading your messages…
                </div>
              )}

              {!loadingHistory && myMessages.length === 0 && (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                  <i className="fa-regular fa-comment-dots" style={{ fontSize: "2.5rem", color: "#ddd", display: "block", marginBottom: "0.75rem" }} />
                  <div style={{ fontSize: "0.9rem", color: "#999", fontWeight: 500 }}>You haven't sent any messages yet.</div>
                  <div style={{ fontSize: "0.8rem", color: "#bbb", marginTop: "0.3rem" }}>Use the form above to get in touch with us.</div>
                </div>
              )}

              {!loadingHistory && myMessages.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {myMessages.map((msg, idx) => {
                    const subjectStyle = SUBJECT_COLORS[msg.subject] || SUBJECT_COLORS["Other"];
                    const isExpanded   = expandedId === msg.id;
                    const dateStr      = new Date(msg.created_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    });
                    const timeStr = new Date(msg.created_at).toLocaleTimeString("en-GB", {
                      hour: "2-digit", minute: "2-digit",
                    });

                    return (
                      <div key={msg.id} style={{
                        border: "1px solid #e8e8e8",
                        borderRadius: "10px",
                        overflow: "hidden",
                        transition: "box-shadow 0.15s",
                      }}>
                        {/* Row header — always visible, clickable to expand */}
                        <div
                          onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.85rem 1rem",
                            cursor: "pointer",
                            background: isExpanded ? "#fafafa" : "white",
                            userSelect: "none",
                          }}
                        >
                          {/* Ticket number */}
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "6px",
                            background: "#6B1829", color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem", fontWeight: 700, flexShrink: 0,
                          }}>
                            #{myMessages.length - idx}
                          </div>

                          {/* Subject badge */}
                          <span style={{
                            background: subjectStyle.bg, color: subjectStyle.color,
                            fontSize: "0.72rem", fontWeight: 700,
                            padding: "0.2rem 0.6rem", borderRadius: "999px",
                            flexShrink: 0,
                          }}>
                            {msg.subject}
                          </span>

                          {/* Message preview */}
                          <span style={{
                            fontSize: "0.82rem", color: "#555",
                            flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {msg.message}
                          </span>

                          {/* Status badge */}
                          <span style={{
                            fontSize: "0.68rem", fontWeight: 700,
                            padding: "0.18rem 0.55rem", borderRadius: "999px", flexShrink: 0,
                            background: msg.is_read ? "#e8f5e9" : "#fff3e0",
                            color:      msg.is_read ? "#2e7d32"  : "#e65100",
                          }}>
                            {msg.is_read ? "✓ Seen" : "Pending"}
                          </span>

                          {/* Date */}
                          <span style={{ fontSize: "0.72rem", color: "#aaa", flexShrink: 0 }}>{dateStr}</span>

                          {/* Chevron */}
                          <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"}`}
                            style={{ fontSize: "0.7rem", color: "#bbb", flexShrink: 0 }} />
                        </div>

                        {/* Expanded body */}
                        {isExpanded && (
                          <div style={{ borderTop: "1px solid #f0f0f0", padding: "1rem 1rem 1rem 1rem", background: "#fafafa" }}>
                            <div style={{ display: "flex", gap: "2rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                              <div>
                                <div style={{ fontSize: "0.68rem", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Sent by</div>
                                <div style={{ fontSize: "0.82rem", color: "#333", fontWeight: 500 }}>{msg.name} &lt;{msg.email}&gt;</div>
                              </div>
                              <div>
                                <div style={{ fontSize: "0.68rem", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Date &amp; time</div>
                                <div style={{ fontSize: "0.82rem", color: "#333", fontWeight: 500 }}>{dateStr} at {timeStr}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: "0.68rem", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Status</div>
                                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: msg.is_read ? "#2e7d32" : "#e65100" }}>
                                  {msg.is_read
                                    ? <><i className="fa-solid fa-circle-check" style={{ marginRight: "0.3rem" }} />Seen by support</>
                                    : <><i className="fa-solid fa-clock" style={{ marginRight: "0.3rem" }} />Awaiting review</>
                                  }
                                </div>
                              </div>
                            </div>
                            <div style={{ fontSize: "0.68rem", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Message</div>
                            <div style={{
                              fontSize: "0.85rem", color: "#444", lineHeight: 1.7,
                              background: "white", border: "1px solid #eee",
                              borderRadius: "6px", padding: "0.75rem 1rem",
                              whiteSpace: "pre-wrap",
                            }}>
                              {msg.message}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map placeholder */}
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