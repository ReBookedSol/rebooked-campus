import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedLandlordRouteProps {
  children: React.ReactNode;
}

const ProtectedLandlordRoute = ({ children }: ProtectedLandlordRouteProps) => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [isLandlord, setIsLandlord] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (!isLoaded) return;
      if (!isSignedIn || !userId) {
        setIsLoadingRole(false);
        return;
      }

      try {
        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (!error && roleData) {
          setIsLandlord(roleData.role === "landlord" || roleData.role === "admin");
        }
      } catch (err) {
        console.error("Error checking user role:", err);
      } finally {
        setIsLoadingRole(false);
      }
    };

    checkRole();
  }, [isLoaded, isSignedIn, userId]);

  if (!isLoaded || isLoadingRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedLandlordRoute;
