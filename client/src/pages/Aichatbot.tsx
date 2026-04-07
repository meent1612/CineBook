import { useState, useRef, useEffect } from "react"
import "../CSSfiles/AIChatbot.css"

// ── Types ──────────────────────────────────────────────
interface Message {
  role: "user" | "assistant"
  content: string
}

interface QuickChip {
  label: string
  icon: string   // FA class string
  prompt: string
}

// ── Constants ──────────────────────────────────────────
const QUICK_CHIPS: QuickChip[] = [
  { label: "Recommend a movie",   icon: "fa-solid fa-film",         prompt: "Can you recommend a movie for me?" },
  { label: "Show showtimes",      icon: "fa-solid fa-clock",        prompt: "What are the showtimes available?" },
  { label: "Ticket prices",       icon: "fa-solid fa-ticket",       prompt: "What are the ticket prices?" },
  { label: "Branch locations",    icon: "fa-solid fa-location-dot", prompt: "Where are your cinema branches located?" },
  { label: "Refund policy",       icon: "fa-solid fa-rotate-left",  prompt: "What is your refund and cancellation policy?" },
  { label: "Seat availability",   icon: "fa-solid fa-couch",        prompt: "How can I check seat availability?" },
]

const SYSTEM_PROMPT = `You are CineBot, a friendly and knowledgeable AI assistant for CineBook — a cinema ticket booking platform.

Your role is to help users with:
1. **Movie Recommendations** — Suggest movies based on user preferences, genres they enjoy, mood, or trending popularity. Ask clarifying questions if needed (e.g. "Do you prefer action, romance, or horror?").
2. **Showtimes** — Guide users to check the Showtimes page at /showtimes. Explain that showtimes are updated daily and cover a 7-day window.
3. **Ticket Pricing** — Standard tickets are typically 200–350 BDT depending on hall type (regular, premium, IMAX). Concessions and student discounts may apply.
4. **Branch Information** — CineBook operates across multiple cinema branches. Users can select their preferred branch from the navbar dropdown.
5. **Refund & Cancellation Policy** — Bookings can be cancelled up to 2 hours before showtime for a full refund. After that, no refund is issued. Contact support@cinebook.com for disputes.
6. **Seat Availability** — Users can view real-time seat maps during the booking flow at /book/:movieId.
7. **General Navigation** — Help users find pages: Home (/), Showtimes (/showtimes), About (/about), Contact (/contact), Ticket Prices (/ticket-price).

Tone: Warm, concise, cinema-enthusiast energy. Use occasional movie references or emojis to keep it fun. Never make up specific movie schedules — guide users to the live pages instead.

If asked something outside your scope, politely redirect: "That's beyond my popcorn-powered brain 🍿 — try reaching our support team at support@cinebook.com"`

// ── Helpers ────────────────────────────────────────────
const formatTime = (): string => {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const TypingDots = () => (
  <div className="cb-typing-dots" aria-label="CineBot is typing">
    <span /><span /><span />
  </div>
)

// ── Main Component ─────────────────────────────────────
export default function AIChatbot() {
  const [isOpen,    setIsOpen]    = useState(false)
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showChips, setShowChips] = useState(true)
  const [hasUnread, setHasUnread] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
      setHasUnread(false)
    }
  }, [isOpen])

  // Show unread badge after 3s if closed
  useEffect(() => {
    if (!isOpen && messages.length === 0) {
      const t = setTimeout(() => setHasUnread(true), 3000)
      return () => clearTimeout(t)
    }
  }, [])

  const handleToggle = () => setIsOpen(prev => !prev)

  const handleSend = async (text?: string) => {
    const userText = (text ?? input).trim()
    if (!userText || isLoading) return

    const userMsg: Message = { role: "user", content: userText }
    const nextMessages = [...messages, userMsg]

    setMessages(nextMessages)
    setInput("")
    setShowChips(false)
    setIsLoading(true)

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: nextMessages,
        }),
      })

      const data = await response.json()
      const assistantText =
        data?.content?.find((b: any) => b.type === "text")?.text ??
        "Sorry, I couldn't process that. Please try again!"

      setMessages(prev => [...prev, { role: "assistant", content: assistantText }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Oops! Looks like the projector broke — please try again shortly." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChipClick = (chip: QuickChip) => {
    handleSend(chip.prompt)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReset = () => {
    setMessages([])
    setShowChips(true)
    setInput("")
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        className={`cb-fab ${isOpen ? "cb-fab--open" : ""}`}
        onClick={handleToggle}
        aria-label={isOpen ? "Close CineBot" : "Open CineBot AI Assistant"}
        tabIndex={0}
      >
        {isOpen ? (
          <i className="fa-solid fa-xmark cb-fab-icon" />
        ) : (
          <>
            <i className="fa-solid fa-robot cb-fab-icon" />
            {hasUnread && <span className="cb-fab-badge" aria-label="New message">1</span>}
          </>
        )}
        <div className="cb-fab-ring" aria-hidden="true" />
      </button>

      {/* ── Chat Panel ── */}
      <div
        className={`cb-panel ${isOpen ? "cb-panel--open" : ""}`}
        role="dialog"
        aria-label="CineBot AI Chat"
        aria-modal="true"
      >
        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-left">
            <div className="cb-avatar" aria-hidden="true">
              <i className="fa-solid fa-robot" />
              <span className="cb-avatar-dot" />
            </div>
            <div>
              <p className="cb-header-name">CineBot</p>
              <p className="cb-header-status">AI Assistant · Online</p>
            </div>
          </div>
          <div className="cb-header-actions">
            <button
              className="cb-icon-btn"
              onClick={handleReset}
              aria-label="Reset conversation"
              title="New conversation"
              tabIndex={0}
            >
              <i className="fa-solid fa-rotate-left" />
            </button>
            <button
              className="cb-icon-btn"
              onClick={handleToggle}
              aria-label="Close chat"
              tabIndex={0}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="cb-messages" role="log" aria-live="polite">
          {/* Welcome */}
          {messages.length === 0 && (
            <div className="cb-welcome">
              <div className="cb-welcome-icon" aria-hidden="true">
                <i className="fa-solid fa-clapperboard" />
              </div>
              <p className="cb-welcome-title">Hey there, moviegoer!</p>
              <p className="cb-welcome-sub">
                I'm CineBot — your AI guide for everything CineBook.
                Ask me about movies, tickets, showtimes, or anything else!
              </p>
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
              <div className={`cb-bubble ${msg.role === "user" ? "cb-bubble--user" : "cb-bubble--bot"}`}>
                <p className="cb-bubble-text">{msg.content}</p>
                <span className="cb-bubble-time">{formatTime()}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="cb-msg-row cb-msg-row--bot">
              <div className="cb-msg-avatar" aria-hidden="true">
                <i className="fa-solid fa-robot" />
              </div>
              <div className="cb-bubble cb-bubble--bot">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        {showChips && messages.length === 0 && (
          <div className="cb-chips" role="list" aria-label="Quick questions">
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip.label}
                className="cb-chip"
                onClick={() => handleChipClick(chip)}
                role="listitem"
                tabIndex={0}
                aria-label={chip.label}
              >
                <i className={`${chip.icon} cb-chip-icon`} aria-hidden="true" />
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="cb-input-row">
          <textarea
            ref={inputRef}
            className="cb-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about movies…"
            rows={1}
            aria-label="Chat input"
            disabled={isLoading}
          />
          <button
            className={`cb-send-btn ${input.trim() && !isLoading ? "cb-send-btn--active" : ""}`}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            tabIndex={0}
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>

        <p className="cb-footer-note">Powered by Claude AI · CineBook 2026</p>
      </div>

      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="cb-backdrop"
          onClick={handleToggle}
          aria-hidden="true"
        />
      )}
    </>
  )
}