export default function TicketPrice() {
  const prices = [
    {
      type: "Standard",
      price: 400,
      desc: "Regular comfortable seating for the everyday movie lover.",
      icon: "fa-solid fa-chair",
      features: ["Standard seat", "Regular screen", "Basic amenities"],
      highlight: false,
    },
    {
      type: "Semi-Recliner",
      price: 615,
      desc: "Upgraded seating with partial recliner function for extra comfort.",
      icon: "fa-solid fa-couch",
      features: ["Semi-recliner seat", "Premium screen", "Armrest table"],
      highlight: false,
    },
    {
      type: "Premium",
      price: 815,
      desc: "Full recliner seats with extra legroom and a superior view.",
      icon: "fa-solid fa-star",
      features: ["Full recliner seat", "4K screen", "Extra legroom", "Priority entry"],
      highlight: true,
    },
    {
      type: "VIP",
      price: 1200,
      desc: "Luxury private lounge seating with dedicated concierge service.",
      icon: "fa-solid fa-crown",
      features: ["Private lounge pod", "IMAX screen", "Concierge service", "Complimentary snacks"],
      highlight: false,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", fontFamily: "'Georgia', serif" }}>

      
      <div style={{ background: "linear-gradient(160deg, #1a0008 0%, #6B1829 50%, #1a0008 100%)", padding: "4rem 2rem 5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "18px", background: "repeating-linear-gradient(90deg, #000 0px, #000 18px, #1a0008 18px, #1a0008 36px)" }} />

        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,200,100,0.04) 0%, transparent 50%)" }} />

        <p style={{ color: "rgba(255,200,120,0.8)", fontSize: "0.75rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem" }}>
          <i className="fa-solid fa-ticket" style={{ marginRight: "0.5rem" }} />
          CineBook Pricing
          <i className="fa-solid fa-ticket" style={{ marginLeft: "0.5rem" }} />
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", marginBottom: "1rem", lineHeight: 1.15, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
          Choose Your<br />
          <span style={{ color: "#f5c842", fontStyle: "italic" }}>Cinema Experience</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", maxWidth: "420px", margin: "0 auto" }}>
          From everyday screenings to luxury lounges — find the perfect seat for every occasion.
        </p>

        
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "18px", background: "repeating-linear-gradient(90deg, #000 0px, #000 18px, #0f0f0f 18px, #0f0f0f 36px)" }} />
      </div>

     
      <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap", padding: "3.5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        {prices.map(p => (
          <div
            key={p.type}
            style={{
              background: p.highlight ? "linear-gradient(160deg, #6B1829 0%, #9a2035 100%)" : "linear-gradient(160deg, #1a1a1a 0%, #222 100%)",
              borderRadius: "16px",
              width: "230px",
              boxShadow: p.highlight ? "0 20px 60px rgba(107,24,41,0.6), 0 0 0 1px rgba(245,200,66,0.3)" : "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
              transform: p.highlight ? "translateY(-12px) scale(1.03)" : "translateY(0)",
              transition: "transform 0.3s, box-shadow 0.3s",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              if (!p.highlight) {
                el.style.transform = "translateY(-8px)";
                el.style.boxShadow = "0 16px 48px rgba(107,24,41,0.4), 0 0 0 1px rgba(107,24,41,0.5)";
              } else {
                el.style.transform = "translateY(-16px) scale(1.04)";
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = p.highlight ? "translateY(-12px) scale(1.03)" : "translateY(0)";
              el.style.boxShadow = p.highlight ? "0 20px 60px rgba(107,24,41,0.6), 0 0 0 1px rgba(245,200,66,0.3)" : "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)";
            }}
          >
           
            {p.highlight && (
              <div style={{ background: "#f5c842", color: "#1a0008", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center", padding: "0.35rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <i className="fa-solid fa-star" style={{ fontSize: "0.6rem" }} /> Most Popular
              </div>
            )}

            <div style={{ padding: "1.75rem 1.5rem" }}>
              <i className={p.icon} style={{ fontSize: "2rem", color: p.highlight ? "#f5c842" : "#6B1829", marginBottom: "1rem", display: "block" }} />

              <div style={{ fontSize: "0.68rem", color: p.highlight ? "rgba(255,255,255,0.7)" : "#888", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                {p.type}
              </div>

              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", fontWeight: 800, color: p.highlight ? "#f5c842" : "white", lineHeight: 1, marginBottom: "0.2rem" }}>
                {p.price.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.7rem", color: p.highlight ? "rgba(255,255,255,0.6)" : "#666", marginBottom: "1rem" }}>BDT / ticket</div>

              <div style={{ height: "1px", background: p.highlight ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)", marginBottom: "1rem" }} />

              <p style={{ fontSize: "0.76rem", color: p.highlight ? "rgba(255,255,255,0.8)" : "#999", lineHeight: 1.65, marginBottom: "1.25rem" }}>
                {p.desc}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.5rem" }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <i className="fa-solid fa-check" style={{ fontSize: "0.65rem", color: p.highlight ? "#f5c842" : "#6B1829" }} />
                    <span style={{ fontSize: "0.75rem", color: p.highlight ? "rgba(255,255,255,0.85)" : "#bbb" }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                style={{ width: "100%", padding: "0.65rem", background: p.highlight ? "#f5c842" : "transparent", color: p.highlight ? "#1a0008" : "white", border: p.highlight ? "none" : "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", transition: "opacity 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                onClick={() => window.location.href = "/showtimes"}
              >
                Book Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: "0.3rem" }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "0 2rem 3rem" }}>
        <p style={{ color: "#555", fontSize: "0.78rem" }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: "0.4rem" }} />
          Prices may vary during special screenings and premieres. All prices inclusive of VAT.
        </p>
      </div>

      <div style={{ background: "#0a0a0a", borderTop: "1px solid #1a1a1a", color: "#555", textAlign: "center", padding: "1rem", fontSize: "0.78rem" }}>
        Copyright© 2026 CineBook Limited . All Rights Reserved.
      </div>
    </div>
  );
}