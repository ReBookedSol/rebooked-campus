import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <h1 className="mb-2 text-6xl md:text-7xl font-bold text-primary">404</h1>
          <h2 className="mb-4 text-2xl md:text-3xl font-semibold text-foreground">Page Not Found</h2>
          <p className="mb-8 text-base md:text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button size="lg" className="rounded-full px-8">
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
