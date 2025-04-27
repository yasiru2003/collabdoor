
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  const { user, loading } = useAuth();
  
  // If still loading, show nothing
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }
  
  // Redirect authenticated users to the dashboard, others to the landing page
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
};

export default Index;
