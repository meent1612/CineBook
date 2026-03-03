import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user } = useAuth();

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → go to home
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}