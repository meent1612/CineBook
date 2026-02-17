import { useState } from "react";
import { useParams } from "react-router-dom";
import { movies, DAYS } from "../data/movies";

const ROWS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const COLS = 14;

type SeatStatus = "available" | "selected" | "taken" | "reserved";

function generateSeats(): { [key: string]: SeatStatus } {
  const seats: { [key: string]: SeatStatus } = {};
  const takenSeats = new Set(
    ["A3","A4","B6","B7","C2","C8","D5","E9","F3","F4","F5","G7","G8","H1","H2","I6","J3","J4","K9","L5","L6","L7"]
  );
  ROWS.forEach(row => {
    for (let c = 1; c <= COLS; c++) {
      const key = `${row}${c}`;
      seats[key] = takenSeats.has(key) ? "taken" : "available";
    }
  });
  return seats;
}

export default function BookTicket() {
  const { id } = useParams();
  const movie = movies.find(m => m.id === Number(id)) || movies[4];

  const [selectedDate, setSelectedDate] = useState(DAYS[6]); // "23 Jan"
  const [selectedShowtime, setSelectedShowtime] = useState(
    movie.showtimes[DAYS[0]]?.[0] || "12:15pm"
  );
  const [seatType, setSeatType] = useState<"Premium" | "Semi-recliner">("Premium");
  const [quantity, setQuantity] = useState(6);
  const [seats, setSeats] = useState<{ [k: string]: SeatStatus }>(generateSeats);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const HALL = "Hall 3";
  const PRICE = seatType === "Premium" ? 815 : 615;
  const TOTAL = quantity * PRICE;

  const toggleSeat = (key: string) => {
    if (seats[key] === "taken") return;
    setSeats(s => ({
      ...s,
      [key]: s[key] === "selected" ? "available" : "selected",
    }));
    setSelectedSeats(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const seatColor = (status: SeatStatus) => {
    switch (status) {
      case "available": return "#4CAF50";
      case "selected": return "#FF9800";
      case "taken": return "#9E9E9E";
      default: return "#4CAF50";
    }
  };

  const dateLabels = [
    { date: "23 Jan", day: "Fri" },
    { date: "24 Jan", day: "Sat" },
    { date: "25 Jan", day: "Sat." },
    { date: "26 Jan", day: "Sun." },
  ];

  return (
    <div style={{ background: "#f0f0f0", minHeight: "100vh" }}>
      {/* Location Bar */}
      <div style={{ background: "#2a2a2a", padding: "0.5rem 1.5rem" }}>
        <div style={{ color: "#aaa", fontSize: "0.7rem" }}>Location</div>
        <div style={{ color: "white", fontSize: "0.9rem", fontWeight: 700 }}>Love Road, Tejgaon</div>
        <button style={{ background: "none", border: "none", color: "#6B9ED2", fontSize: "0.72rem", cursor: "pointer" }}>
          Change Location 🔄
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", padding: "1rem", maxWidth: "900px", margin: "0 auto" }}>
        {/* Left: Form */}
        <div style={{ flex: 1 }}>
          {/* Select Date */}
          <Section title="Select Date">
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {dateLabels.map(({ date, day }) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: selectedDate === date ? "#6B1829" : "#ddd",
                    background: selectedDate === date ? "#6B1829" : "white",
                    color: selectedDate === date ? "white" : "#333",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    textAlign: "center",
                    minWidth: "55px",
                  }}
                >
                  <div style={{ fontSize: "0.65rem" }}>{day}</div>
                  <div>{date.split(" ")[0]}</div>
                  <div style={{ fontSize: "0.65rem" }}>{date.split(" ")[1]}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* Select Movie */}
          <Section title="Select Movie">
            <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
              {movies.map(m => (
                <img
                  key={m.id}
                  src={m.poster}
                  alt={m.title}
                  style={{
                    width: "60px",
                    height: "85px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: m.id === movie.id ? "3px solid #6B1829" : "2px solid transparent",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onError={e => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/60x85/2a2a2a/white?text=M`;
                  }}
                />
              ))}
            </div>
          </Section>

          {/* Select Showtime */}
          <Section title="Select Showtime">
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div
                style={{
                  background: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#333",
                }}
              >
                {HALL}
              </div>
              {(movie.showtimes[selectedDate] || ["12:15pm", "02:30pm"]).map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedShowtime(time)}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    border: "2px solid",
                    borderColor: selectedShowtime === time ? "#6B1829" : "#ddd",
                    background: selectedShowtime === time ? "#6B1829" : "white",
                    color: selectedShowtime === time ? "white" : "#333",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </Section>

          {/* Seat Type & Quantity */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <Section title="Select Seat Type" style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", marginBottom: "0.4rem", fontSize: "0.82rem" }}>
                <input type="radio" checked={seatType === "Premium"} onChange={() => setSeatType("Premium")} />
                <span>Premium</span>
                <span style={{ color: "#888", fontSize: "0.72rem" }}>BDT {815}</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.82rem" }}>
                <input type="radio" checked={seatType === "Semi-recliner"} onChange={() => setSeatType("Semi-recliner")} />
                <span>Semi-recliner</span>
                <span style={{ color: "#888", fontSize: "0.72rem" }}>BDT {615}</span>
              </label>
            </Section>

            <Section title="Ticket Quantity" style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={qBtnStyle}
                >−</button>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", minWidth: "80px", textAlign: "center" }}>
                  {quantity} Ticket{quantity > 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  style={qBtnStyle}
                >+</button>
              </div>
            </Section>
          </div>

          {/* Select Seats */}
          <Section title="Select Seats">
            {/* Legend */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", fontSize: "0.72rem" }}>
              {[["#4CAF50","Available"],["#FF9800","Selected"],["#9E9E9E","Taken"],["#2196F3","Reserved"]].map(([color, label]) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: 12, height: 12, background: color, borderRadius: 2, display: "inline-block" }} />
                  {label}
                </span>
              ))}
            </div>

            {/* Seat map */}
            <div style={{ overflowX: "auto" }}>
              {ROWS.map(row => (
                <div key={row} style={{ display: "flex", gap: "3px", marginBottom: "3px", alignItems: "center" }}>
                  <span style={{ width: "16px", fontSize: "0.65rem", color: "#888", textAlign: "right", marginRight: "4px" }}>{row}</span>
                  {Array.from({ length: COLS }, (_, i) => {
                    const key = `${row}${i + 1}`;
                    const status = seats[key] || "available";
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSeat(key)}
                        title={key}
                        style={{
                          width: "18px",
                          height: "16px",
                          borderRadius: "3px 3px 0 0",
                          background: seatColor(status),
                          border: "none",
                          cursor: status === "taken" ? "not-allowed" : "pointer",
                          opacity: status === "taken" ? 0.5 : 1,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
              <div
                style={{
                  marginTop: "0.75rem",
                  background: "#555",
                  borderRadius: "4px",
                  textAlign: "center",
                  color: "white",
                  fontSize: "0.7rem",
                  padding: "0.2rem",
                  maxWidth: "280px",
                  marginLeft: "20px",
                }}
              >
                THEATRE SCREEN
              </div>
            </div>
          </Section>
        </div>

        {/* Right: Ticket Summary */}
        <div style={{ width: "240px", flexShrink: 0 }}>
          <div
            style={{
              background: "white",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              position: "sticky",
              top: "80px",
            }}
          >
            <div style={{ background: "#6B1829", color: "white", padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.9rem" }}>
              Tickets Summary
            </div>
            <div style={{ padding: "0.75rem" }}>
              {/* Movie poster + title */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{ width: 50, height: 70, objectFit: "cover", borderRadius: "4px" }}
                  onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/50x70/2a2a2a/white?text=M"; }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>{movie.title}</div>
                  <div style={{ color: "#888", fontSize: "0.68rem" }}>{movie.genre}</div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #eee", paddingTop: "0.5rem" }}>
                {[
                  ["Location", "LBT"],
                  ["Show Date", `Jan ${selectedDate.split(" ")[0]}, 28`],
                  ["Hall Name", HALL],
                  ["Show Time", selectedShowtime],
                  ["Seat Type", seatType],
                  ["Ticket Quantity", String(quantity)],
                  ["Selected Seat", selectedSeats.join(", ") || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: "0.3rem" }}>
                    <span style={{ color: "#888" }}>{k}</span>
                    <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "110px", wordBreak: "break-all" }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", borderTop: "1px solid #eee", paddingTop: "0.4rem", marginTop: "0.4rem", fontWeight: 700 }}>
                  <span>Total Amount</span>
                  <span style={{ color: "#6B1829" }}>{TOTAL.toLocaleString()} BDT</span>
                </div>
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  background: "#6B1829",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  marginTop: "0.75rem",
                  letterSpacing: "0.03em",
                }}
              >
                PURCHASE TICKET
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#1a1a1a", color: "#aaa", textAlign: "center", padding: "1rem", fontSize: "0.78rem" }}>
        Copyright© 2026 CineBook Limited . All Rights Reserved.
      </div>
    </div>
  );
}

function Section({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: "1rem", ...style }}>
      <h3 style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: "0.5rem", color: "#222" }}>{title}</h3>
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "0.75rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const qBtnStyle: React.CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  border: "2px solid #6B1829",
  background: "white",
  color: "#6B1829",
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};