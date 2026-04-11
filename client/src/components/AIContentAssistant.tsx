/**
 * AIContentAssistant.tsx
 *
 * A floating "magic wand" bubble that expands into a panel.
 * Admin types a movie title → AI auto-fills description, genre, language,
 * duration, category, and status → admin clicks "Fill Form" to populate
 * the Add/Edit Movie form via the onFill() callback.
 *
 * ─── USAGE ────────────────────────────────────────────────────────────────
 * 1. Place <AIContentAssistant onFill={setNewMovie} /> anywhere inside your
 *    AdminDashboard JSX (e.g. just before the closing </div> of the
 *    showAddMovie modal, or always-mounted so it floats over the whole page).
 *
 * 2. The onFill callback receives a Partial<MovieFormData> object with all
 *    fields that AI returned. Merge it with your existing form state:
 *
 *      <AIContentAssistant
 *        onFill={(data) => setNewMovie(prev => ({ ...prev, ...data }))}
 *      />
 *
 * ─── DEPENDENCIES ─────────────────────────────────────────────────────────
 * No new npm packages needed — uses the built-in fetch() and routes through
 * the Laravel backend proxy at /api/admin/ai/movie-info.
 * ──────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"


// ── Types ──────────────────────────────────────────────────────────────────
export interface MovieFormData {
  title:         string
  description:   string
  genre:         string
  category:      string
  language:      string
  duration_mins: string
  release_date:  string
  poster_url:    string
  trailer_url:   string
  status:        string
  is_active:     boolean
}

interface AIResult {
  title:         string
  description:   string
  genre:         string
  category:      string
  language:      string
  duration_mins: string
  status:        string
  trailer_url:   string
}

interface Props {
  /** Called when admin clicks "Fill Form". Merge into your movie form state. */
  onFill: (data: Partial<MovieFormData>) => void
}

// ── Constants ──────────────────────────────────────────────────────────────
const PRIMARY      = "#6B1829"
const PRIMARY_DARK = "#4a1019"
const PRIMARY_LT   = "#fdf2f4"
const BORDER       = "#e5e7eb"
const MUTED        = "#6b7280"
const TEXT         = "#1a1a1a"
const WHITE        = "#ffffff"

// ── Helpers ────────────────────────────────────────────────────────────────
const fieldLabel: Record<keyof AIResult, string> = {
  title:         "Title",
  description:   "Description",
  genre:         "Genre",
  category:      "Category",
  language:      "Language",
  duration_mins: "Duration (mins)",
  status:        "Status",
  trailer_url:   "Trailer URL",
}

const statusBadge = (s: string) =>
  s === "now_showing"
    ? { bg: "#d1fae5", color: "#065f46", label: "Now Showing" }
    : { bg: "#fef3c7", color: "#92400e", label: "Coming Soon" }

const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`

// ── Component ──────────────────────────────────────────────────────────────
export default function AIContentAssistant({ onFill }: Props) {
  const [open,       setOpen]       = useState(false)
  const [query,      setQuery]      = useState("")
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState<AIResult | null>(null)
  const [error,      setError]      = useState("")
  const [filled,     setFilled]     = useState(false)
  const [streaming,  setStreaming]  = useState("")   // raw streaming text
  const inputRef  = useRef<HTMLInputElement>(null)
  const panelRef  = useRef<HTMLDivElement>(null)
  const { token } = useAuth()

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Reset filled badge after 3 s
  useEffect(() => {
    if (!filled) return
    const t = setTimeout(() => setFilled(false), 3000)
    return () => clearTimeout(t)
  }, [filled])

  // ── AI call ──────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    const title = query.trim()
    if (!title) return
    setLoading(true)
    setError("")
    setResult(null)
    setStreaming("")

    try {
      const response = await fetch(`${API_URL}/admin/ai/movie-info`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "AI unavailable")
      }

      setResult(data.data as AIResult)
    } catch (err: any) {
      setError(err.message || "Failed to get AI response. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [query])

  // Enter key triggers generate
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGenerate()
  }

  // Fill the form
  const handleFill = () => {
    if (!result) return
    onFill({
      title:         result.title,
      description:   result.description,
      genre:         result.genre,
      category:      result.category,
      language:      result.language,
      duration_mins: result.duration_mins,
      status:        result.status as "now_showing" | "coming_soon",
      trailer_url:   result.trailer_url,
    })
    setFilled(true)
  }

  // Reset to search a new movie
  const handleReset = () => {
    setResult(null)
    setQuery("")
    setError("")
    setStreaming("")
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Bubble ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="AI Content Assistant"
        style={{
          position:     "fixed",
          bottom:       "2rem",
          right:        "2rem",
          zIndex:       1100,
          width:        "56px",
          height:       "56px",
          borderRadius: "50%",
          border:       "none",
          background:   `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})`,
          color:        WHITE,
          fontSize:     "1.3rem",
          cursor:       "pointer",
          boxShadow:    open
            ? `0 0 0 4px ${PRIMARY}55, 0 8px 28px ${PRIMARY}88`
            : `0 4px 20px ${PRIMARY}66`,
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          transition:   "box-shadow 0.25s, transform 0.2s",
          transform:    open ? "scale(1.08)" : "scale(1)",
        }}
      >
        {/* Pulsing ring — only when closed */}
        {!open && (
          <span style={{
            position:     "absolute",
            inset:        "-6px",
            borderRadius: "50%",
            border:       `2px solid ${PRIMARY}`,
            animation:    "aca-pulse 2s ease-in-out infinite",
            pointerEvents: "none",
          }} />
        )}
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-wand-magic-sparkles"}`} />
      </button>

      {/* ── Tooltip label (visible when closed) ── */}
      {!open && (
        <div style={{
          position:     "fixed",
          bottom:       "2.4rem",
          right:        "5.5rem",
          zIndex:       1099,
          background:   PRIMARY_DARK,
          color:        WHITE,
          fontSize:     "0.72rem",
          fontWeight:   700,
          padding:      "0.3rem 0.75rem",
          borderRadius: "999px",
          whiteSpace:   "nowrap",
          pointerEvents: "none",
          boxShadow:    "0 2px 8px rgba(0,0,0,0.18)",
          opacity:      0.92,
        }}>
          AI Content Assistant
        </div>
      )}

      {/* ── Expanded Panel ── */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="AI Content Assistant panel"
          style={{
            position:     "fixed",
            bottom:       "5.5rem",
            right:        "2rem",
            zIndex:       1100,
            width:        "360px",
            maxHeight:    "80vh",
            overflowY:    "auto",
            background:   WHITE,
            borderRadius: "18px",
            boxShadow:    `0 8px 40px rgba(0,0,0,0.16), 0 0 0 1px ${BORDER}`,
            animation:    "aca-slide-up 0.22s cubic-bezier(0.34,1.3,0.64,1)",
            display:      "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{
            background:   `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})`,
            borderRadius: "18px 18px 0 0",
            padding:      "1rem 1.25rem",
            display:      "flex",
            alignItems:   "center",
            gap:          "0.65rem",
            flexShrink:   0,
          }}>
            <div style={{
              width:        "36px",
              height:       "36px",
              borderRadius: "10px",
              background:   "rgba(255,255,255,0.15)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              fontSize:     "1rem",
              color:        WHITE,
              flexShrink:   0,
            }}>
              <i className="fa-solid fa-wand-magic-sparkles" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: WHITE, fontWeight: 800, fontSize: "0.9rem", lineHeight: 1.2 }}>
                AI Content Assistant
              </div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.68rem", marginTop: "0.1rem" }}>
                Auto-fill movie details instantly
              </div>
            </div>
            {/* Sparkle accent */}
            <i className="fa-solid fa-sparkles" style={{ color: "rgba(255,255,255,0.35)", fontSize: "1.1rem" }} />
          </div>

          {/* Body */}
          <div style={{ padding: "1.1rem 1.25rem", flex: 1 }}>

            {/* Search row */}
            {!result && (
              <>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                  Movie Title
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder='e.g. "Oppenheimer"'
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    aria-label="Enter movie title"
                    style={{
                      flex:         1,
                      padding:      "0.55rem 0.85rem",
                      border:       `1.5px solid ${loading ? PRIMARY + "55" : BORDER}`,
                      borderRadius: "10px",
                      fontSize:     "0.82rem",
                      color:        TEXT,
                      background:   loading ? "#fdf2f4" : "#fafafa",
                      outline:      "none",
                      transition:   "border-color 0.15s",
                      boxSizing:    "border-box",
                    }}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !query.trim()}
                    aria-label="Generate movie details"
                    style={{
                      padding:      "0.55rem 0.9rem",
                      background:   loading || !query.trim() ? "#e5e7eb" : PRIMARY,
                      color:        loading || !query.trim() ? MUTED : WHITE,
                      border:       "none",
                      borderRadius: "10px",
                      fontWeight:   700,
                      fontSize:     "0.78rem",
                      cursor:       loading || !query.trim() ? "not-allowed" : "pointer",
                      transition:   "background 0.15s",
                      display:      "flex",
                      alignItems:   "center",
                      gap:          "0.4rem",
                      flexShrink:   0,
                    }}
                  >
                    {loading
                      ? <><i className="fa-solid fa-spinner fa-spin" /> Thinking…</>
                      : <><i className="fa-solid fa-bolt" /> Generate</>
                    }
                  </button>
                </div>

                {/* Hint chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.6rem" }}>
                  {["Inception", "Avatar", "Parasite", "Interstellar"].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      style={{
                        background:   PRIMARY_LT,
                        color:        PRIMARY,
                        border:       `1px solid ${PRIMARY}33`,
                        borderRadius: "999px",
                        fontSize:     "0.68rem",
                        fontWeight:   600,
                        padding:      "0.2rem 0.6rem",
                        cursor:       "pointer",
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* Loading state */}
                {loading && (
                  <div style={{
                    background:   "#fafafa",
                    border:       `1px solid ${BORDER}`,
                    borderRadius: "10px",
                    padding:      "0.75rem",
                    fontSize:     "0.75rem",
                    color:        MUTED,
                    lineHeight:   1.6,
                    minHeight:    "60px",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "0.5rem",
                  }}>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ color: PRIMARY }} />
                    Fetching movie details from AI…
                  </div>
                )}

                {/* Error */}
                {error && !loading && (
                  <div style={{
                    background:   "#fee2e2",
                    border:       "1px solid #fca5a5",
                    color:        "#dc2626",
                    borderRadius: "10px",
                    padding:      "0.65rem 0.85rem",
                    fontSize:     "0.78rem",
                    display:      "flex",
                    gap:          "0.5rem",
                    alignItems:   "flex-start",
                  }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginTop: "0.1rem", flexShrink: 0 }} />
                    {error}
                  </div>
                )}
              </>
            )}

            {/* ── Result card ── */}
            {result && !loading && (
              <div>
                {/* Movie title pill */}
                <div style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "0.5rem",
                  marginBottom: "0.85rem",
                }}>
                  <div style={{
                    flex:         1,
                    fontWeight:   800,
                    fontSize:     "0.95rem",
                    color:        TEXT,
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                  }}>
                    {result.title}
                  </div>
                  {/* Status badge */}
                  {(() => {
                    const { bg, color, label } = statusBadge(result.status)
                    return (
                      <span style={{ background: bg, color, fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px", flexShrink: 0 }}>
                        {label}
                      </span>
                    )
                  })()}
                </div>

                {/* Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                  {(Object.keys(fieldLabel) as Array<keyof AIResult>)
                    .filter(k => k !== "title" && k !== "status")
                    .map(key => (
                      <div key={key} style={{
                        background:   "#fafafa",
                        border:       `1px solid ${BORDER}`,
                        borderRadius: "8px",
                        padding:      "0.55rem 0.75rem",
                      }}>
                        <div style={{ fontSize: "0.6rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                          {fieldLabel[key]}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: TEXT, lineHeight: 1.5 }}>
                          {key === "duration_mins"
                            ? `${result[key]} min`
                            : result[key] || "—"}
                        </div>
                      </div>
                    ))
                  }
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={handleFill}
                    style={{
                      flex:         1,
                      padding:      "0.6rem",
                      background:   filled ? "#10b981" : PRIMARY,
                      color:        WHITE,
                      border:       "none",
                      borderRadius: "10px",
                      fontWeight:   800,
                      fontSize:     "0.82rem",
                      cursor:       "pointer",
                      display:      "flex",
                      alignItems:   "center",
                      justifyContent: "center",
                      gap:          "0.4rem",
                      transition:   "background 0.2s",
                    }}
                  >
                    {filled
                      ? <><i className="fa-solid fa-check" /> Filled!</>
                      : <><i className="fa-solid fa-arrow-up-from-bracket" /> Fill Form</>
                    }
                  </button>
                  <button
                    onClick={handleReset}
                    aria-label="Search again"
                    style={{
                      padding:      "0.6rem 0.85rem",
                      background:   PRIMARY_LT,
                      color:        PRIMARY,
                      border:       `1px solid ${PRIMARY}44`,
                      borderRadius: "10px",
                      fontWeight:   700,
                      fontSize:     "0.82rem",
                      cursor:       "pointer",
                      display:      "flex",
                      alignItems:   "center",
                      gap:          "0.35rem",
                    }}
                  >
                    <i className="fa-solid fa-rotate-left" /> New
                  </button>
                </div>

                {/* Disclaimer */}
                <p style={{ fontSize: "0.62rem", color: MUTED, marginTop: "0.65rem", lineHeight: 1.5, textAlign: "center" }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: "0.3rem" }} />
                  AI-generated. Review before saving.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Keyframe animations (injected once) ── */}
      <style>{`
        @keyframes aca-pulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          50%  { transform: scale(1.35); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0.8; }
        }
        @keyframes aca-slide-up {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </>
  )
}