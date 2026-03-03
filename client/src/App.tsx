import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ShowTimes from "./pages/Showtimes";
import TicketPrice from "./pages/TicketPrice";
import BookTicket from "./pages/Bookticket";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import AboutUs from "./pages/AboutUs";
import Contacts from "./pages/Contacts";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/showtimes" element={<ShowTimes />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contacts />} />
        <Route path="/ticket-price" element={<TicketPrice />} />

        {/* Protected: login required */}
        <Route path="/book/:id" element={
          <ProtectedRoute>
            <BookTicket />
          </ProtectedRoute>
        } />

        {/* Protected: user only */}
        <Route path="/user" element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        } />

        {/* Protected: admin only */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}