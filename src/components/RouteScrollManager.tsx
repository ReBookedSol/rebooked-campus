import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { restoreScrollFor } from "@/lib/scrollMemory";

/**
 * Mounts once near the app root. On every route change it tries to restore
 * a previously-saved scroll position for the current pathname+search.
 */
const RouteScrollManager = () => {
  const location = useLocation();
  useEffect(() => {
    restoreScrollFor(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
};

export default RouteScrollManager;
