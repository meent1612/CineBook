export default function TicketPrice() {
  const prices = [
    { type: "Standard", price: "BDT 400", desc: "Regular seating" },
    { type: "Premium", price: "BDT 815", desc: "Comfortable recliner seats with extra legroom" },
    { type: "Semi-Recliner", price: "BDT 615", desc: "Upgraded seating with partial recliner function" },
    { type: "VIP", price: "BDT 1,200", desc: "Luxury private lounge seating with concierge service" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0", padding: "2rem" }}>
      <h2
        style={{
          textAlign: "center",
          fontFamily: "'Playfair Display', serif",
          fontSize: "2rem",
          color: "#6B1829",
          marginBottom: "2rem",
        }}
      >
        Ticket Prices
      </h2>
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        {prices.map(p => (
          <div
            key={p.type}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              width: "220px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
              border: "2px solid transparent",
              transition: "border-color 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#6B1829";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.type}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#6B1829", fontFamily: "'Playfair Display', serif", marginBottom: "0.75rem" }}>{p.price}</div>
            <div style={{ fontSize: "0.78rem", color: "#555" }}>{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}