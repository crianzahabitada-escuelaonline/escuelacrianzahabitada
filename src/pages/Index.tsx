import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Landing from "./Landing";

export default function Index() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}
