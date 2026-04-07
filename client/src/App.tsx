import { BrowserRouter, Routes, Route } from "react-router-dom"
import { BranchProvider } from "./context/BranchContext"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ShowTimes from "./pages/Showtimes"
import TicketPrice from "./pages/TicketPrice"
import AdminDashboard from "./pages/AdminDashboard"
import UserDashboard from "./pages/UserDashboard"
import AboutUs from "./pages/AboutUs"
import Contacts from "./pages/Contacts"
import Showmovies from "./pages/Showmovies"
import BookTicket from "./pages/Bookticket"
import MovieDetail from "./pages/MovieDetail"
import Payment from "./pages/Payment"
import AIChatbot from "./pages/Aichatbot"

export default function App() {
  return (
    <BrowserRouter>
      <BranchProvider>
        <Navbar />
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/showtimes"    element={<ShowTimes />} />
          <Route path="/about"        element={<AboutUs />} />
          <Route path="/contact"      element={<Contacts />} />
          <Route path="/ticket-price" element={<TicketPrice />} />
          <Route path="/showmovies"   element={<Showmovies />} />
          <Route path="/movie/:id"    element={<MovieDetail />} />
          <Route path="/book/:id"     element={<BookTicket />} />
          <Route path="/payment"      element={<Payment />} />
          <Route path= '/aichatbot'    element={<AIChatbot />} />
          <Route path="/user" element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BranchProvider>
    </BrowserRouter>
  )
}