import { useEffect, useRef, useState } from "react";

const AD_CLIENT = "ca-pub-7763187849877535";
const ADSENSE_SCRIPT_SELECTOR = 'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

let adsenseScriptPromise: Promise<void> | null = null;

const isPreviewAdEnvironment = () => {
  if (typeof window === "undefined") return false;

  const { hostname } = window.location;
  return (
    hostname.includes("lovable.app") ||
    hostname.includes("lovableproject.com") ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
};

const loadAdsenseScript = async () => {
  if (typeof window === "undefined") return;
  if ((window as any).adsbygoogle) return;
  if (adsenseScriptPromise) return adsenseScriptPromise;

  adsenseScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(ADSENSE_SCRIPT_SELECTOR);

    if (existingScript) {
      let attempts = 0;

      const waitForAdsense = () => {
        if ((window as any).adsbygoogle) {
          resolve();
          return;
        }

        attempts += 1;
        if (attempts >= 20) {
          reject(new Error("Failed to load AdSense script"));
          return;
        }

        window.setTimeout(waitForAdsense, 100);
      };

      waitForAdsense();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load AdSense script"));
    document.head.appendChild(script);
  }).catch((error) => {
    adsenseScriptPromise = null;
    throw error;
  });

  return adsenseScriptPromise;
};

type AdProps = {
  className?: string;
  density?: "default" | "compact";
  adSlot: string; // now required — pass the right slot per placement
  isPaidUser?: boolean;
};

export default function Ad({
  className = "",
  density = "default",
  adSlot,
  isPaidUser = false,
}: AdProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const isPreview = isPreviewAdEnvironment();

  useEffect(() => {
    if (isPaidUser || isPreview) return;

    let isCancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        await loadAdsenseScript();
        if (isCancelled || !adRef.current) return;

        const adStatus = adRef.current.getAttribute("data-adsbygoogle-status");
        if (!adStatus) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadFailed(true);
        }
        console.error("AdSense error:", error);
      }
    }, 500);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [adSlot, isPaidUser, isPreview]);

  // Don't render anything for paid users
  if (isPaidUser) return null;

  const heightClasses = density === "compact" ? "min-h-[150px]" : "min-h-[250px]";

  if (isPreview || loadFailed) {
    const title = isPreview ? "Sponsored placement preview" : "Sponsored section reserved";
    const description = isPreview
      ? "This slot is active and will render your Google ad on the live domain."
      : "Google AdSense is still loading, so this slot is being kept visible for the sponsored placement.";

    return (
      <div className={`w-full my-2 ${className}`}>
        <div className={`flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-4 text-center ${heightClasses}`}>
          <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full my-2 flex flex-col items-center justify-center overflow-hidden ${heightClasses} ${className}`}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
