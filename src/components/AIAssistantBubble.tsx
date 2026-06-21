import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessControl } from "@/hooks/useAccessControl";
import { AIChat } from "@/components/AIChat";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";

interface ListingContext {
  propertyName?: string;
  university?: string;
  location?: string;
  listingId?: string;
}

export const AIAssistantBubble = () => {
  const { accessLevel, isLoading } = useAccessControl();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [context, setContext] = useState<ListingContext>({});
  const location = useLocation();
  const { id } = useParams();

  const isPaidUser = accessLevel === "paid";

  // Fetch listing context when on listing page (supports both old /listing/:id and new /accommodation/city/uni/slug)
  useEffect(() => {
    const fetchListingContext = async () => {
      // Old format: /listing/:id
      const listingIdMatch = location.pathname.match(/^\/listing\/(.+)$/);
      // New format: /accommodation/:city/:uni/:slug
      const slugMatch = location.pathname.match(/^\/accommodation\/[^/]+\/[^/]+\/([^/]+)$/);

      if (listingIdMatch) {
        const listingId = listingIdMatch[1];
        const { data: listing } = await supabase
          .from('accommodations')
          .select('property_name, university, city, province')
          .eq('id', listingId)
          .single();
        
        if (listing) {
          setContext({
            propertyName: listing.property_name,
            university: listing.university || undefined,
            location: [listing.city, listing.province].filter(Boolean).join(', '),
            listingId: listingId,
          });
        }
      } else if (slugMatch) {
        const slug = slugMatch[1];
        // Look up by slugified property name
        const words = slug.split('-').filter(w => w.length > 1);
        let query: any = supabase.from('accommodations').select('id, property_name, university, city, province');
        for (const word of words.slice(0, 5)) {
          query = query.ilike('property_name', `%${word}%`);
        }
        const { data } = await query.limit(20);
        const match = data?.find((a: any) => slugify(a.property_name) === slug);
        if (match) {
          setContext({
            propertyName: match.property_name,
            university: match.university || undefined,
            location: [match.city, match.province].filter(Boolean).join(', '),
            listingId: match.id,
          });
        }
      } else {
        setContext({});
      }
    };

    fetchListingContext();
  }, [location.pathname]);

  if (isLoading || !isPaidUser) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
            "bg-primary hover:bg-primary/90 hover:shadow-xl hover:scale-105",
            isOpen && "rotate-90"
          )}
          size="icon"
        >
          <div className={cn(
            "transition-all duration-300",
            isOpen ? "rotate-90 scale-100" : "rotate-0 scale-100"
          )}>
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <div className="relative">
                <MessageCircle className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </Button>
      </div>

      {/* Chat Panel with animations */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-80 shadow-2xl rounded-2xl border bg-background overflow-hidden",
          "transition-all duration-300 ease-out origin-bottom-right",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        <AIChat onUnreadChange={setUnreadCount} context={context} />
      </div>
    </>
  );
};
