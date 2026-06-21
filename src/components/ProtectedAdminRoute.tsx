import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !userId) {
        toast({
          title: "Access Denied",
          description: "Please sign in to access this page",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (error || data?.role !== "admin") {
          toast({
            title: "Access Denied",
            description: "You do not have permission to access this page",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        console.error("Error checking admin access:", err);
        navigate("/");
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [isLoaded, isSignedIn, userId, navigate, toast]);

  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : null;
};

export default ProtectedAdminRoute;
