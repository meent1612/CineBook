import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ShowTimes from "./pages/Showtimes";
import TicketPrice from "./pages/TicketPrice";
import BookTicket from "./pages/Bookticket";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/showtimes" element={<ShowTimes />} />
        <Route path="/ticket-price" element={<TicketPrice />} />
        <Route path="/book/:id" element={<BookTicket />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/about" element={<div style={{ padding: "2rem", textAlign: "center" }}><h2>About CineBook</h2><p style={{ marginTop: "1rem", color: "#666" }}>CineBook is your premier cinema ticketing platform.</p></div>} />
        <Route path="/contact" element={<div style={{ padding: "2rem", textAlign: "center" }}><h2>Contact Us</h2><p style={{ marginTop: "1rem", color: "#666" }}>Email: support@cinebook.com | Phone: +880-1234-567890</p></div>} />
      </Routes>
    </BrowserRouter>
  );
}