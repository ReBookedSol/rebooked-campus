import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Search, Menu, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const Layout = ({ children, showFooter = true, fixedHeight = false, noPaddingTop = false }: { children: React.ReactNode, showFooter?: boolean, fixedHeight?: boolean, noPaddingTop?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const isLoggedIn = !!isSignedIn;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const scrollToTopSmooth = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToTopSmooth();
  }, [location.pathname]);

  const [subscriber, setSubscriber] = useState({ firstname: '', lastname: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (err: any) {
      console.error("Sign out failed:", err);
      toast({ title: "Error", description: err?.message || "Failed to sign out.", variant: "destructive" });
    }
  };

  const handleFooterNav = (e: React.MouseEvent, path: string) => {
    if (location.pathname === path) {
      e.preventDefault();
      scrollToTopSmooth();
    }
  };

  const handleSubscribe = async (e: any) => {
    e.preventDefault();
    if (!subscriber.email) { toast({ title: 'Error', description: 'Email is required', variant: 'destructive' }); return; }
    setIsSubmitting(true);
    try {
      const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL || (import.meta.env as any).SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
      const functionsOrigin = supabaseUrl.replace('.supabase.co', '.functions.supabase.co');
      const url = `${functionsOrigin.replace(/\/+$/, '')}/add-subscriber`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscriber.email, firstname: subscriber.firstname, lastname: subscriber.lastname }),
      });
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};
      if (!res.ok) throw new Error(data?.error || 'Subscription failed');
      toast({ title: 'Subscribed', description: 'Thanks for subscribing!' });
      setSubscriber({ firstname: '', lastname: '', email: '' });
    } catch (err: any) {
      toast({ title: 'Subscription failed', description: err.message || 'Could not subscribe', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setIsMobileMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className={`flex flex-col ${noPaddingTop ? "pt-0" : "pt-20"} ${fixedHeight ? "h-screen overflow-hidden" : "min-h-screen"}`}>
        <nav className={`fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-500 flex justify-center ${
          scrolled ? "py-2" : "py-4"
        }`}>
          <div className={`w-full transition-all duration-500 flex items-center justify-between ${
            scrolled 
              ? "max-w-4xl bg-white/85 border border-white/40 rounded-full shadow-lg px-4 py-2 scale-95 backdrop-blur-lg" 
              : "max-w-full bg-transparent border-transparent px-2 py-0 backdrop-blur-none"
          }`}>
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md flex-shrink-0 ${
                scrolled ? "bg-primary text-white" : "bg-white text-zinc-950"
              }`}>
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <span className={`text-xs sm:text-sm font-bold tracking-tight flex items-center gap-1 transition-colors duration-500 ${
                scrolled ? "text-zinc-950" : "text-white"
              }`}>
                ReBooked <span className="text-primary font-bold">Campus</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {[
                { to: "/student-accommodation", label: "Accommodation" },
                { to: "/campus-guide", label: "Campus" },
                { to: "/rebooked-travel", label: "Travel" },
                { to: "/pricing", label: "Pricing" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    location.pathname === to
                      ? scrolled
                        ? "text-zinc-950 bg-black/10"
                        : "text-white bg-white/20"
                      : scrolled
                        ? "text-zinc-600 hover:text-zinc-950 hover:bg-black/5"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link
                to={isLoggedIn ? "/profile" : "/auth"}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 shadow-sm inline-block truncate max-w-[200px] ${
                  scrolled
                    ? "bg-zinc-950 text-white hover:bg-zinc-900"
                    : "bg-white text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                {isLoggedIn ? (user?.primaryEmailAddress?.emailAddress || "Profile") : "Sign In"}
              </Link>
              {isLoggedIn && (
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 rounded-full transition-colors duration-300 ${
                    scrolled ? "text-zinc-500 hover:text-zinc-950 hover:bg-black/5" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <Link
                to={isLoggedIn ? "/profile" : "/auth"}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-300 shadow-sm truncate max-w-[120px] ${
                  scrolled
                    ? "bg-zinc-950 text-white hover:bg-zinc-900"
                    : "bg-white text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                {isLoggedIn ? (user?.firstName || "Profile") : "Sign In"}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`h-8 w-8 rounded-full transition-colors duration-300 ${
                  scrolled ? "text-zinc-950 hover:bg-black/5" : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`fixed md:hidden left-4 right-4 z-40 bg-white/95 border border-zinc-200/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out origin-top ${
          scrolled ? "top-16" : "top-20"
        } ${isMobileMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"} backdrop-blur-md`}>
          <div className="px-4 py-3 space-y-1">
            {[
              { to: "/student-accommodation", label: "Accommodation" },
              { to: "/campus-guide", label: "Campus" },
              { to: "/rebooked-travel", label: "Travel" },
              { to: "/pricing", label: "Pricing" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-black/5 transition-all text-sm font-semibold"
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-zinc-200/60 my-1.5 pt-1.5">
              <Link
                to={isLoggedIn ? "/profile" : "/auth"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-black/5 transition-all text-sm font-semibold"
              >
                {isLoggedIn ? "Profile Dashboard" : "Sign In"}
              </Link>
              {isLoggedIn && (
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start px-4 py-2.5 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-black/5 transition-all text-sm font-semibold h-auto flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>


      <main className={`flex-1 ${fixedHeight ? "overflow-hidden" : ""}`}>
        {children}
      </main>

      {showFooter && (
        <footer className="border-t bg-gradient-to-b from-background/50 to-background/30 backdrop-blur mt-auto">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Home className="text-primary-foreground w-4 h-4" />
                  </div>
                  <span className="font-bold text-lg">ReBooked <span style={{ color: "#2d6e55" }}>Campus</span></span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Finding quality student accommodation made simple and affordable.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <a href="https://www.instagram.com/rebooked.living/" target="_blank" rel="noopener noreferrer" className="inline-flex w-10 h-10 rounded-full bg-primary items-center justify-center text-primary-foreground hover:shadow-lg transition-all hover:scale-110" title="Follow us on Instagram">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61585625007986" target="_blank" rel="noopener noreferrer" className="inline-flex w-10 h-10 rounded-full bg-primary items-center justify-center text-primary-foreground hover:shadow-lg transition-all hover:scale-110" title="Follow us on Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-5">Our Platforms</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="https://rebookedsolutions.co.za" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      ReBooked Solutions
                    </a>
                  </li>
                  <li>
                    <a href="https://living.rebookedsolutions.co.za" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      ReBooked Campus
                    </a>
                  </li>
                  <li>
                    <a href="https://genius.rebookedsolutions.co.za" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      ReBooked Genius
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-5">Explore</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/student-accommodation" onClick={(e) => handleFooterNav(e, '/student-accommodation')} className="text-muted-foreground hover:text-primary transition-colors">Browse Listings</Link></li>
                  <li><Link to="/campus-guide" onClick={(e) => handleFooterNav(e, '/campus-guide')} className="text-muted-foreground hover:text-primary transition-colors">ReBooked Campus</Link></li>
                  <li><Link to="/pricing" onClick={(e) => handleFooterNav(e, '/pricing')} className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                  <li><Link to="/profile" onClick={(e) => handleFooterNav(e, '/profile')} className="text-muted-foreground hover:text-primary transition-colors">My Profile</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-5">Guides</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/guides/how-to-find-student-accommodation-in-south-africa" className="text-muted-foreground hover:text-primary transition-colors">Accommodation Guide</Link></li>
                  <li><Link to="/nsfas-accommodation-guide" className="text-muted-foreground hover:text-primary transition-colors">NSFAS Guide</Link></li>
                  <li><Link to="/rebooked-travel" className="text-muted-foreground hover:text-primary transition-colors">Rebooked Travel</Link></li>
                  <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-5">Support</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                  <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/20 pt-6 text-center text-sm text-muted-foreground">
              <p>&copy; 2025 Rebooked Solutions. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
      </div>
    </>
  );
};

export default Layout;
