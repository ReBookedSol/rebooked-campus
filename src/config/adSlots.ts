/**
 * AdSense slot IDs per placement.
 *
 * To improve fill rate and per-placement reporting, create a distinct ad unit
 * for each placement in your Google AdSense dashboard
 * (https://www.google.com/adsense/new/u/0/pub-7763187849877535/myads/units/display)
 * and replace the slot id below with the one AdSense gives you.
 *
 * Until you do, every placement falls back to the default slot, which still
 * works but will all report under the same unit in AdSense.
 */

export const AD_CLIENT = "ca-pub-7763187849877535";

// Default fallback slot — replace any slot below with a real distinct unit id.
const DEFAULT_SLOT = "8895459763";

export const AD_SLOTS = {
  // Browse page — interleaved between listing cards in the left sidebar
  browseFeed: DEFAULT_SLOT,

  // Listing detail — small ad above the gallery
  listingTop: DEFAULT_SLOT,

  // Listing detail — full-width ad below the description / amenities
  listingBottom: DEFAULT_SLOT,

  // Standalone /ad page — three slots stacked
  rewardedSlot1: DEFAULT_SLOT,
  rewardedSlot2: DEFAULT_SLOT,
  rewardedSlot3: DEFAULT_SLOT,
} as const;

export type AdPlacement = keyof typeof AD_SLOTS;
