import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Syncs Clerk account details (first_name, last_name, phone, email)
 * into the public.profiles table whenever the signed-in user changes.
 * Runs once per session per user signature to avoid redundant writes.
 */
export const useClerkProfileSync = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const lastSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;

    const email = user.primaryEmailAddress?.emailAddress || "";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const phone = user.primaryPhoneNumber?.phoneNumber || "";

    const signature = `${user.id}|${email}|${firstName}|${lastName}|${phone}`;
    if (lastSyncedRef.current === signature) return;
    lastSyncedRef.current = signature;

    (async () => {
      try {
        const { error } = await supabase.from("profiles").upsert(
          [
            {
              id: user.id,
              email,
              first_name: firstName,
              last_name: lastName,
              phone,
            },
          ],
          { onConflict: "id" }
        );
        if (error) console.warn("[ClerkProfileSync] upsert failed:", error.message);
      } catch (err) {
        console.warn("[ClerkProfileSync] unexpected error:", err);
      }
    })();
  }, [isLoaded, isSignedIn, user?.id, user?.firstName, user?.lastName, user?.primaryEmailAddress?.emailAddress, user?.primaryPhoneNumber?.phoneNumber]);
};
