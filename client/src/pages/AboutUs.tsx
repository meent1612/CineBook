export default function AboutUs() {
  const team = [
    { name: "Shayma Sarmeen", role: "CEO & Founder", icon: "fa-solid fa-user" },
    { name: "Zumaina Tahsin", role: "Head of Operations", icon: "fa-solid fa-user" },
    { name: "Rahnuma Azra Mahajabin", role: "Lead Developer", icon: "fa-solid fa-user" },
    { name: "Farzana Mim", role: "Marketing Director", icon: "fa-solid fa-user" },
  ];

  const stats = [
    { value: "6+", label: "Movies Showing" },
    { value: "500+", label: "Weekly Screenings" },
    { value: "15K+", label: "Happy Customers" },
    { value: "2026", label: "Est. Year" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0" }}>
      
      <div
        style={{
          background: "#6B1829",
          padding: "3.5rem 2rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 40px)" }} />
        <i className="fa-solid fa-film" style={{ fontSize: "2.8rem", color: "rgba(255,255,255,0.9)", marginBottom: "0.75rem", display: "block" }} />
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", color: "white", marginBottom: "0.75rem" }}>
          About CineBook
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", maxWidth: "540px", margin: "0 auto", lineHeight: 1.7 }}>
          Dhaka's premier cinema booking platform — bringing you the best movies, the smoothest booking experience, and unforgettable moments on the big screen.
        </p>
      </div>

      
      <div style={{ background: "#1a1a1a", display: "flex", justifyContent: "center" }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ padding: "1.25rem 2.5rem", textAlign: "center", borderRight: i < stats.length - 1 ? "1px solid #333" : "none" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#6B1829", fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
            <div style={{ color: "#aaa", fontSize: "0.72rem", marginTop: "0.2rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

    
      <div style={{ maxWidth: "800px", margin: "3rem auto", padding: "0 2rem" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#6B1829", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <i className="fa-solid fa-bullseye" /> Our Mission
          </h2>
          <p style={{ color: "#555", lineHeight: 1.8, fontSize: "0.92rem", marginBottom: "1rem" }}>
            CineBook was founded with a simple mission: to make going to the movies effortless. We believe great cinema should be accessible to everyone in Dhaka — from choosing your film, to picking your seat, to collecting your ticket.
          </p>
          <p style={{ color: "#555", lineHeight: 1.8, fontSize: "0.92rem" }}>
            Our platform connects movie lovers with the best local cinemas, offering real-time seat selection, transparent pricing, and a seamless checkout experience. Whether you're booking for a family night out or a solo escape, CineBook has you covered.
          </p>
        </div>

        
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { icon: "fa-solid fa-star", title: "Quality First", desc: "Only the best cinema experiences, curated for you." },
            { icon: "fa-solid fa-lock", title: "Secure Booking", desc: "Your payment and personal data are always protected." },
            { icon: "fa-solid fa-bolt", title: "Fast & Easy", desc: "Book your tickets in under 60 seconds, any time." },
          ].map(v => (
            <div key={v.title} style={{ background: "white", borderRadius: "10px", padding: "1.5rem", flex: 1, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              <i className={v.icon} style={{ fontSize: "1.8rem", color: "#6B1829", marginBottom: "0.6rem", display: "block" }} />
              <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.35rem", color: "#222" }}>{v.title}</div>
              <div style={{ fontSize: "0.76rem", color: "#777", lineHeight: 1.6 }}>{v.desc}</div>
            </div>
          ))}
        </div>

        
        <div style={{ background: "white", borderRadius: "12px", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#6B1829", marginBottom: "1.5rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}>
            <i className="fa-solid fa-users" /> Meet the Team
          </h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {team.map(member => (
              <div
                key={member.name}
                style={{ textAlign: "center", padding: "1.25rem 1.5rem", borderRadius: "10px", border: "1px solid #eee", width: "150px", transition: "box-shadow 0.2s, transform 0.2s", cursor: "default" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(107,24,41,0.15)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <i className={member.icon} style={{ fontSize: "2.2rem", color: "#6B1829", marginBottom: "0.6rem", display: "block" }} />
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#222", marginBottom: "0.25rem" }}>{member.name}</div>
                <div style={{ fontSize: "0.7rem", color: "#6B1829", fontWeight: 600 }}>{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#1a1a1a", color: "#aaa", textAlign: "center", padding: "1rem", fontSize: "0.78rem" }}>
        Copyright© 2026 CineBook Limited . All Rights Reserved.
      </div>
    </div>
  );
}