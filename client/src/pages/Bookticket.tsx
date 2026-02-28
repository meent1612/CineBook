import { useState } from "react";
import { useParams } from "react-router-dom";
import { movies, DAYS } from "../data/movies";
import "../CSSfiles/Bookticket.css";

const ROWS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const COLS = 14;

type SeatStatus = "available" | "selected" | "taken" | "reserved";

function generateSeats(): { [key: string]: SeatStatus } {
  const seats: { [key: string]: SeatStatus } = {};
  const takenSeats = new Set([
    "A3","A4","B6","B7","C2","C8","D5","E9","F3","F4","F5",
    "G7","G8","H1","H2","I6","J3","J4","K9","L5","L6","L7",
  ]);
  ROWS.forEach((row) => {
    for (let c = 1; c <= COLS; c++) {
      const key = `${row}${c}`;
      seats[key] = takenSeats.has(key) ? "taken" : "available";
    }
  });
  return seats;
}

const SEAT_COLORS: Record<SeatStatus, string> = {
  available: "#4CAF50",
  selected: "#FF9800",
  taken: "#9E9E9E",
  reserved: "#2196F3",
};

const LEGEND = [
  { color: "#4CAF50", label: "Available" },
  { color: "#FF9800", label: "Selected" },
  { color: "#9E9E9E", label: "Taken" },
  { color: "#2196F3", label: "Reserved" },
];

const dateLabels = [
  { date: "23 Jan", day: "Fri" },
  { date: "24 Jan", day: "Sat" },
  { date: "25 Jan", day: "Sat." },
  { date: "26 Jan", day: "Sun." },
];

export default function BookTicket() {
  const { id } = useParams();
  const movie = movies.find((m) => m.id === Number(id)) || movies[4];

  const [selectedDate, setSelectedDate] = useState(DAYS[6]);
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
    setSeats((s) => ({
      ...s,
      [key]: s[key] === "selected" ? "available" : "selected",
    }));
    setSelectedSeats((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="book-wrapper">
      {/* Location Bar */}
      <div className="book-location-bar">
        <div className="book-location-label">Location</div>
        <div className="book-location-name">Love Road, Tejgaon</div>
        <button className="book-change-location-btn">Change Location 🔄</button>
      </div>

      <div className="book-main">
        {/* Left: Form */}
        <div className="book-left">

          {/* Select Date */}
          <Section title="Select Date">
            <div className="date-btn-row">
              {dateLabels.map(({ date, day }) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`date-btn ${selectedDate === date ? "active" : ""}`}
                >
                  <div className="date-btn-day">{day}</div>
                  <div>{date.split(" ")[0]}</div>
                  <div className="date-btn-month">{date.split(" ")[1]}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* Select Movie */}
          <Section title="Select Movie">
            <div className="movie-poster-strip">
              {movies.map((m) => (
                <img
                  key={m.id}
                  src={m.poster}
                  alt={m.title}
                  className={`movie-strip-poster ${m.id === movie.id ? "active" : ""}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/60x85/2a2a2a/white?text=M";
                  }}
                />
              ))}
            </div>
          </Section>

          {/* Select Showtime */}
          <Section title="Select Showtime">
            <div className="showtime-row">
              <div className="hall-badge">{HALL}</div>
              {(movie.showtimes[selectedDate] || ["12:15pm", "02:30pm"]).map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedShowtime(time)}
                  className={`showtime-btn ${selectedShowtime === time ? "active" : ""}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </Section>

          {/* Seat Type & Quantity */}
          <div className="seat-type-quantity-row">
            <Section title="Select Seat Type">
              <label className="seat-type-option">
                <input
                  type="radio"
                  checked={seatType === "Premium"}
                  onChange={() => setSeatType("Premium")}
                />
                <span>Premium</span>
                <span className="seat-type-price">BDT 815</span>
              </label>
              <label className="seat-type-option">
                <input
                  type="radio"
                  checked={seatType === "Semi-recliner"}
                  onChange={() => setSeatType("Semi-recliner")}
                />
                <span>Semi-recliner</span>
                <span className="seat-type-price">BDT 615</span>
              </label>
            </Section>

            <Section title="Ticket Quantity">
              <div className="quantity-controls">
                <button className="q-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span className="quantity-label">
                  {quantity} Ticket{quantity > 1 ? "s" : ""}
                </span>
                <button className="q-btn" onClick={() => setQuantity((q) => Math.min(10, q + 1))}>
                  +
                </button>
              </div>
            </Section>
          </div>

          {/* Select Seats */}
          <Section title="Select Seats">
            {/* Legend */}
            <div className="seat-legend">
              {LEGEND.map(({ color, label }) => (
                <span key={label} className="legend-item">
                  <span className="legend-dot" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>

            {/* Seat Map */}
            <div className="seat-map-wrapper">
              {ROWS.map((row) => (
                <div key={row} className="seat-row">
                  <span className="seat-row-label">{row}</span>
                  {Array.from({ length: COLS }, (_, i) => {
                    const key = `${row}${i + 1}`;
                    const status = seats[key] || "available";
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSeat(key)}
                        title={key}
                        className={`seat-btn ${status}`}
                        style={{ background: SEAT_COLORS[status] }}
                      />
                    );
                  })}
                </div>
              ))}
              <div className="theatre-screen">THEATRE SCREEN</div>
            </div>
          </Section>
        </div>

        {/* Right: Ticket Summary */}
        <div className="book-right">
          <div className="summary-card">
            <div className="summary-header">Tickets Summary</div>
            <div className="summary-body">
              <div className="summary-movie-row">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="summary-poster"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/50x70/2a2a2a/white?text=M";
                  }}
                />
                <div>
                  <div className="summary-movie-title">{movie.title}</div>
                  <div className="summary-movie-genre">{movie.genre}</div>
                </div>
              </div>

              <div className="summary-details">
                {[
                  ["Location", "LBT"],
                  ["Show Date", `Jan ${selectedDate.split(" ")[0]}, 28`],
                  ["Hall Name", HALL],
                  ["Show Time", selectedShowtime],
                  ["Seat Type", seatType],
                  ["Ticket Quantity", String(quantity)],
                  ["Selected Seat", selectedSeats.join(", ") || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="summary-row">
                    <span className="summary-row-key">{k}</span>
                    <span className="summary-row-value">{v}</span>
                  </div>
                ))}
                <div className="summary-total">
                  <span>Total Amount</span>
                  <span className="summary-total-amount">{TOTAL.toLocaleString()} BDT</span>
                </div>
              </div>

              <button className="purchase-btn">PURCHASE TICKET</button>
            </div>
          </div>
        </div>
      </div>

      <div className="book-footer">
        Copyright© 2026 CineBook Limited . All Rights Reserved.
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`book-section${className ? ` ${className}` : ""}`}>
      <h3>{title}</h3>
      <div className="book-section-body">{children}</div>
    </div>
  );
}