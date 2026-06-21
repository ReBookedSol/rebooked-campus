import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";

export interface AccessStatus {
  accessLevel: "free" | "paid";
  hasActivePayment: boolean;
  paymentType?: "weekly" | "monthly";
  expiresAt?: string;
  isLoading: boolean;
}

export const useAccessControl = () => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [status, setStatus] = useState<AccessStatus>({
    accessLevel: "free",
    hasActivePayment: false,
    isLoading: true,
  });

  const checkAccess = useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      setStatus({
        accessLevel: "free",
        hasActivePayment: false,
        isLoading: false,
      });
      return;
    }

    try {
      // Check for successful or active payment directly in database
      const { data: payments, error } = await supabase
        .from("user_payments")
        .select("status, payment_type, access_expires_at")
        .eq("user_id", userId)
        .in("status", ["successful", "active"])
        .gt("access_expires_at", new Date().toISOString()) // Only fetch non-expired payments
        .order("access_expires_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error checking access:", error.message || JSON.stringify(error));
        setStatus({
          accessLevel: "free",
          hasActivePayment: false,
          isLoading: false,
        });
        return;
      }

      if (payments && payments.length > 0) {
        const payment = payments[0];
        const expiresAt = new Date(payment.access_expires_at);
        const now = new Date();

        if (expiresAt > now) {
          setStatus({
            accessLevel: "paid",
            hasActivePayment: true,
            paymentType: payment.payment_type as "weekly" | "monthly",
            expiresAt: expiresAt.toISOString(),
            isLoading: false,
          });
        } else {
          setStatus({
            accessLevel: "free",
            hasActivePayment: false,
            isLoading: false,
          });
        }
      } else {
        setStatus({
          accessLevel: "free",
          hasActivePayment: false,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error("Access check error:", err);
      setStatus({
        accessLevel: "free",
        hasActivePayment: false,
        isLoading: false,
      });
    }
  }, [isLoaded, isSignedIn, userId]);

  useEffect(() => {
    checkAccess();

    // Check access on page focus to ensure fresh data
    const handleFocus = () => {
      checkAccess();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkAccess]);

  return {
    accessLevel: status.accessLevel,
    hasActivePayment: status.hasActivePayment,
    paymentType: status.paymentType,
    expiresAt: status.expiresAt,
    isLoading: status.isLoading,
    refresh: checkAccess,
  };
};

// Constants for free tier limits
export const FREE_TIER_LIMITS = {
  MAX_PHOTOS: 3,
  MAX_REVIEWS: 1,
  MAP_ENABLED: false,
  SATELLITE_ENABLED: false,
  ADS_ENABLED: true,
};

export const PAID_TIER_LIMITS = {
  MAX_PHOTOS: Infinity,
  MAX_REVIEWS: Infinity,
  MAP_ENABLED: true,
  SATELLITE_ENABLED: true,
  ADS_ENABLED: false,
};

// Helper to get limits based on access level
export const getAccessLimits = (accessLevel: "free" | "paid") => {
  return accessLevel === "paid" ? PAID_TIER_LIMITS : FREE_TIER_LIMITS;
};
