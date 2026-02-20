import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ShowTimes from "./pages/Showtimes";
import TicketPrice from "./pages/TicketPrice";
import BookTicket from "./pages/Bookticket";
import AdminDashboard from "./pages/AdminDashboard";
import AboutUs from "./pages/AboutUs";
import Contacts from "./pages/Contacts"; 

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
        <Route path="/about" element={<AboutUs />} />  
        <Route path="/contact" element={<Contacts />} />
             </Routes>
    </BrowserRouter>
  );
}