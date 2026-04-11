import { useState, useRef, useEffect, useCallback } from "react"
import "../CSSfiles/Aichatbot.css"

// ── Types ──────────────────────────────────────────────
interface Movie {
  id: number
  title: string
  genre: string | null
  category: string
  language: string | null
  duration_mins: number | null
  release_date: string | null
  poster_url: string | null
  trailer_url: string | null
  status: "now_showing" | "coming_soon"
  is_active: boolean
  rating?: string | null
  description?: string | null
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  movieCards?: RecommendedMovie[]
}

interface RecommendedMovie {
  id: number
  title: string
  genre: string | null
  duration_mins: number | null
  status: string
  poster_url: string | null
}

interface QuickChip {
  label: string
  prompt: string
}

// ── Constants ──────────────────────────────────────────
const API_URL = `${import.meta.env.VITE_BACKEND_ENDPOINT}/api`
const BACKEND = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"

const QUICK_CHIPS: QuickChip[] = [
  { label: "😱 Scare me",           prompt: "I want something really scary tonight" },
  { label: "😂 Make me laugh",      prompt: "I need a good comedy to cheer me up" },
  { label: "💥 Pure action",        prompt: "Give me the most action-packed movie available" },
  { label: "🧠 Mind-bending",       prompt: "I want a movie like Inception — mind-bending thriller" },
  { label: "❤️ Date night",         prompt: "What's a good romantic movie for a date night?" },
  { label: "⏱️ Under 2 hours",      prompt: "Show me good movies under 2 hours long" },
  { label: "🌍 Non-English",        prompt: "Recommend a great non-English language film" },
  { label: "🎟️ What's showing now", prompt: "What movies are currently showing?" },
]

const FALLBACK_COLORS = ["#0f2744", "#2d1b2e", "#1a3a1a", "#3b1f00", "#1a1a3b"]

// ── Helpers ───────────────────────────────────────────
const posterSrc = (url: string | null): string => {
  if (!url) return ""
  return url.startsWith("/") ? `${BACKEND}${url}` : url
}

const formatTime = (): string =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

// ── Movie Result Card ─────────────────────────────────
const MovieResultCard = ({
  movie,
  onBook,
}: {
  movie: RecommendedMovie
  onBook: (id: number) => void
}) => {
  const [imgFailed, setImgFailed] = useState(false)
  const src = posterSrc(movie.poster_url)
  const bg  = FALLBACK_COLORS[movie.title.charCodeAt(0) % FALLBACK_COLORS.length]

  return (
    <div className="cb-movie-card" role="article" aria-label={`Recommendation: ${movie.title}`}>
      <div className="cb-movie-card-poster">
        {src && !imgFailed ? (
          <img src={src} alt={movie.title} onError={() => setImgFailed(true)} />
        ) : (
          <div className="cb-movie-card-poster-fallback" style={{ background: bg }}>
            <i className="fa-solid fa-film" aria-hidden="true" />
          </div>
        )}
        <span
          className={`cb-movie-card-status ${
            movie.status === "now_showing" ? "status--showing" : "status--soon"
          }`}
        >
          {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
        </span>
      </div>

      <div className="cb-movie-card-info">
        <p className="cb-movie-card-title">
          {movie.title.length > 22 ? movie.title.slice(0, 22) + "…" : movie.title}
        </p>
        <p className="cb-movie-card-meta">
          {[movie.genre, movie.duration_mins ? `${movie.duration_mins}m` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <button
          className="cb-movie-card-btn"
          onClick={() => onBook(movie.id)}
          aria-label={`Book tickets for ${movie.title}`}
          tabIndex={0}
        >
          <i className="fa-solid fa-ticket" aria-hidden="true" /> Book Tickets
        </button>
      </div>
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────
const TypingDots = () => (
  <div className="cb-typing-dots" aria-label="CineBot is typing">
    <span /><span /><span />
  </div>
)

// ── Search Results Component ──────────────────────────
const SearchResults = ({
  movies,
  query,
  onBook,
}: {
  movies: RecommendedMovie[]
  query: string
  onBook: (id: number) => void
}) => {
  if (movies.length === 0) {
    return (
      <div className="cb-search-empty" role="status">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <p>No movies found for <strong>"{query}"</strong></p>
        <p className="cb-search-empty-hint">Try a genre, mood, or actor name</p>
      </div>
    )
  }

  return (
    <div className="cb-search-results" role="list" aria-label={`${movies.length} results for ${query}`}>
      <p className="cb-search-count">
        <i className="fa-solid fa-magnifying-glass" /> {movies.length} result{movies.length !== 1 ? "s" : ""} for <strong>"{query}"</strong>
      </p>
      <div className="cb-movie-cards-row">
        {movies.map(movie => (
          <MovieResultCard key={movie.id} movie={movie} onBook={onBook} />
        ))}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────
export default function AIChatbot({
  onNavigate,
}: {
  onNavigate?: (path: string) => void
}) {
  // panel state
  const [isOpen,        setIsOpen]        = useState(false)
  // tab: "chat" | "search"
  const [activeTab,     setActiveTab]     = useState<"chat" | "search">("chat")

  // chat state
  const [messages,      setMessages]      = useState<ChatMessage[]>([])
  const [chatInput,     setChatInput]     = useState("")
  const [chatLoading,   setChatLoading]   = useState(false)
  const [showChips,     setShowChips]     = useState(true)

  // search state
  const [searchInput,   setSearchInput]   = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<RecommendedMovie[] | null>(null)
  const [lastQuery,     setLastQuery]     = useState("")

  // catalog (for count display only)
  const [catalog,       setCatalog]       = useState<Movie[]>([])
  const [catalogLoaded, setCatalogLoaded] = useState(false)
  const [hasUnread,     setHasUnread]     = useState(false)

  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const chatInputRef    = useRef<HTMLTextAreaElement>(null)
  const searchInputRef  = useRef<HTMLInputElement>(null)

  // Fetch catalog on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res  = await fetch(`${API_URL}/movies`)
        const data = await res.json()
        if (data.success) setCatalog(data.movies)
      } catch {
        // silently fail
      } finally {
        setCatalogLoaded(true)
      }
    }
    fetchCatalog()
  }, [])

  // Unread badge after 4s
  useEffect(() => {
    const t = setTimeout(() => {
      if (!isOpen && messages.length === 0) setHasUnread(true)
    }, 4000)
    return () => clearTimeout(t)
  }, [])

  // Scroll to bottom on new chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, chatLoading])

  // Focus correct input on tab/open change
  useEffect(() => {
    if (!isOpen) return
    setTimeout(() => {
      if (activeTab === "chat")   chatInputRef.current?.focus()
      if (activeTab === "search") searchInputRef.current?.focus()
    }, 300)
    setHasUnread(false)
  }, [isOpen, activeTab])

  const handleToggle = () => setIsOpen(prev => !prev)

  const handleReset = () => {
    setMessages([])
    setShowChips(true)
    setChatInput("")
    setSearchResults(null)
    setSearchInput("")
    setLastQuery("")
  }

  // ── Chat send ──────────────────────────────────────
  const handleChatSend = useCallback(async (text?: string) => {
    const userText = (text ?? chatInput).trim()
    if (!userText || chatLoading) return

    const userMsg: ChatMessage = { role: "user", content: userText }
    setMessages(prev => [...prev, userMsg])
    setChatInput("")
    setShowChips(false)
    setChatLoading(true)

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "AI unavailable")
      }

      const replyText: string       = data.reply  ?? "Sorry, something went wrong 🎥"
      const movies: RecommendedMovie[] = data.movies ?? []

      setMessages(prev => [
        ...prev,
        {
          role:       "assistant",
          content:    replyText,
          movieCards: movies.length > 0 ? movies : undefined,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Looks like the projector broke 🎬 — please try again shortly." },
      ])
    } finally {
      setChatLoading(false)
    }
  }, [chatInput, chatLoading])

  // ── Smart Search ───────────────────────────────────
  const handleSearch = useCallback(async (text?: string) => {
    const query = (text ?? searchInput).trim()
    if (!query || searchLoading) return

    setLastQuery(query)
    setSearchResults(null)
    setSearchLoading(true)

    try {
      const response = await fetch(`${API_URL}/ai/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Search unavailable")
      }

      // data.movies is the matched movie list from the backend
      setSearchResults(data.movies ?? [])
    } catch {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [searchInput, searchLoading])

  const handleChipClick    = (chip: QuickChip) => handleChatSend(chip.prompt)

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleChatSend()
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleBookMovie = (movieId: number) => {
    if (onNavigate) onNavigate(`/book/${movieId}`)
    else window.location.href = `/book/${movieId}`
  }

  // ── Render ──
  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`cb-fab ${isOpen ? "cb-fab--open" : ""}`}
        onClick={handleToggle}
        aria-label={isOpen ? "Close CineBot" : "Open AI Movie Assistant"}
        tabIndex={0}
      >
        {isOpen
          ? <i className="fa-solid fa-xmark cb-fab-icon" aria-hidden="true" />
          : <>
              <i className="fa-solid fa-robot cb-fab-icon" aria-hidden="true" />
              {hasUnread && <span className="cb-fab-badge" aria-label="Unread notification">1</span>}
            </>
        }
        {!isOpen && <div className="cb-fab-ring" aria-hidden="true" />}
      </button>

      {/* Chat Panel */}
      <div
        className={`cb-panel ${isOpen ? "cb-panel--open" : ""}`}
        role="dialog"
        aria-label="CineBot AI Movie Assistant"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="cb-header">
          <div className="cb-header-left">
            <div className="cb-avatar" aria-hidden="true">
              <i className="fa-solid fa-robot" />
              <span className="cb-avatar-dot" />
            </div>
            <div>
              <p className="cb-header-name">CineBot</p>
              <p className="cb-header-status">
                {catalogLoaded
                  ? `${catalog.length} movies loaded · Online`
                  : "Loading catalog…"}
              </p>
            </div>
          </div>
          <div className="cb-header-actions">
            <button
              className="cb-icon-btn"
              onClick={handleReset}
              aria-label="Start new conversation"
              title="New conversation"
              tabIndex={0}
            >
              <i className="fa-solid fa-rotate-left" aria-hidden="true" />
            </button>
            <button
              className="cb-icon-btn"
              onClick={handleToggle}
              aria-label="Close chat"
              tabIndex={0}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="cb-tab-bar" role="tablist" aria-label="CineBot modes">
          <button
            className={`cb-tab ${activeTab === "chat" ? "cb-tab--active" : ""}`}
            onClick={() => setActiveTab("chat")}
            role="tab"
            aria-selected={activeTab === "chat"}
            tabIndex={0}
          >
            <i className="fa-solid fa-comments" aria-hidden="true" /> Chat
          </button>
          <button
            className={`cb-tab ${activeTab === "search" ? "cb-tab--active" : ""}`}
            onClick={() => setActiveTab("search")}
            role="tab"
            aria-selected={activeTab === "search"}
            tabIndex={0}
          >
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Smart Search
          </button>
        </div>

        {/* ══════════════════════════════════════
            CHAT TAB
        ══════════════════════════════════════ */}
        {activeTab === "chat" && (
          <>
            {/* Messages */}
            <div className="cb-messages" role="log" aria-live="polite" aria-atomic="false">

              {/* Welcome screen */}
              {messages.length === 0 && (
                <div className="cb-welcome">
                  <div className="cb-welcome-icon" aria-hidden="true">🎬</div>
                  <p className="cb-welcome-title">Your personal movie guide</p>
                  <p className="cb-welcome-sub">
                    Describe your mood, search by vibe, or ask anything — I'll match you to the perfect film from our{" "}
                    <strong style={{ color: "var(--cb-gold)" }}>
                      {catalog.length > 0 ? `${catalog.length} live listings` : "catalog"}
                    </strong>.
                  </p>
                  <div className="cb-welcome-examples" aria-label="Example searches">
                    <span>"scary but not gory"</span>
                    <span>"movies like Inception"</span>
                    <span>"action under 2 hrs"</span>
                  </div>
                </div>
              )}

              {/* Message bubbles */}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`cb-msg-row ${msg.role === "user" ? "cb-msg-row--user" : "cb-msg-row--bot"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="cb-msg-avatar" aria-hidden="true">
                      <i className="fa-solid fa-robot" />
                    </div>
                  )}

                  <div className="cb-msg-content-col">
                    <div className={`cb-bubble ${msg.role === "user" ? "cb-bubble--user" : "cb-bubble--bot"}`}>
                      <p className="cb-bubble-text">{msg.content}</p>
                      <span className="cb-bubble-time" aria-hidden="true">{formatTime()}</span>
                    </div>

                    {/* Movie result cards */}
                    {msg.movieCards && msg.movieCards.length > 0 && (
                      <div
                        className="cb-movie-cards-row"
                        role="list"
                        aria-label={`${msg.movieCards.length} movie recommendation${msg.movieCards.length > 1 ? "s" : ""}`}
                      >
                        {msg.movieCards.map(movie => (
                          <MovieResultCard
                            key={movie.id}
                            movie={movie}
                            onBook={handleBookMovie}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {chatLoading && (
                <div className="cb-msg-row cb-msg-row--bot">
                  <div className="cb-msg-avatar" aria-hidden="true">
                    <i className="fa-solid fa-robot" />
                  </div>
                  <div className="cb-bubble cb-bubble--bot">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            {/* Quick Chips */}
            {showChips && messages.length === 0 && (
              <div className="cb-chips" role="list" aria-label="Quick mood prompts">
                {QUICK_CHIPS.map(chip => (
                  <button
                    key={chip.label}
                    className="cb-chip"
                    onClick={() => handleChipClick(chip)}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`Quick prompt: ${chip.label}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input */}
            <div className="cb-input-row">
              <textarea
                ref={chatInputRef}
                className="cb-input"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder={`Try "scary but not gory" or "what's showing now"…`}
                rows={1}
                aria-label="Type your movie request"
                disabled={chatLoading}
              />
              <button
                className={`cb-send-btn ${chatInput.trim() && !chatLoading ? "cb-send-btn--active" : ""}`}
                onClick={() => handleChatSend()}
                disabled={!chatInput.trim() || chatLoading}
                aria-label="Send message"
                tabIndex={0}
              >
                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              </button>
            </div>

            <p className="cb-footer-note" aria-hidden="true">
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 4, color: "var(--cb-gold)" }} />
              Powered by Groq · Matching from your live catalog
            </p>
          </>
        )}

        {/* ══════════════════════════════════════
            SEARCH TAB
        ══════════════════════════════════════ */}
        {activeTab === "search" && (
          <>
            <div className="cb-search-panel">
              {/* Search intro */}
              <div className="cb-search-intro">
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "var(--cb-gold)", marginRight: "0.4rem" }} aria-hidden="true" />
                <span>AI-powered search — find movies by mood, genre, actor, or description</span>
              </div>

              {/* Search input row */}
              <div className="cb-search-input-row">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="cb-search-input"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder='Try "sad romance" or "space thriller"…'
                  aria-label="Search movies"
                  disabled={searchLoading}
                />
                <button
                  className={`cb-search-btn ${searchInput.trim() && !searchLoading ? "cb-search-btn--active" : ""}`}
                  onClick={() => handleSearch()}
                  disabled={!searchInput.trim() || searchLoading}
                  aria-label="Search"
                  tabIndex={0}
                >
                  {searchLoading
                    ? <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                    : <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                  }
                </button>
              </div>

              {/* Search suggestion chips */}
              {searchResults === null && !searchLoading && (
                <div className="cb-search-chips" aria-label="Search suggestions">
                  {["Action", "Romance", "Horror", "Comedy", "Thriller", "Sci-Fi"].map(suggestion => (
                    <button
                      key={suggestion}
                      className="cb-chip"
                      onClick={() => {
                        setSearchInput(suggestion)
                        handleSearch(suggestion)
                      }}
                      tabIndex={0}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading state */}
              {searchLoading && (
                <div className="cb-search-loading" role="status" aria-live="polite">
                  <div className="cb-typing-dots">
                    <span /><span /><span />
                  </div>
                  <span>Searching with AI…</span>
                </div>
              )}

              {/* Results */}
              {!searchLoading && searchResults !== null && (
                <div className="cb-search-results-wrap">
                  <SearchResults
                    movies={searchResults}
                    query={lastQuery}
                    onBook={handleBookMovie}
                  />
                  <button
                    className="cb-search-clear"
                    onClick={() => {
                      setSearchResults(null)
                      setSearchInput("")
                      setLastQuery("")
                      searchInputRef.current?.focus()
                    }}
                    tabIndex={0}
                  >
                    <i className="fa-solid fa-rotate-left" aria-hidden="true" /> New search
                  </button>
                </div>
              )}
            </div>

            <p className="cb-footer-note" aria-hidden="true">
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 4, color: "var(--cb-gold)" }} />
              Powered by Groq · Searching your live catalog
            </p>
          </>
        )}
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div className="cb-backdrop" onClick={handleToggle} aria-hidden="true" />
      )}
    </>
  )
}