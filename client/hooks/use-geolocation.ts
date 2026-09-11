"use client";

// Ephemeral browser-geolocation prefill for /explore.
//
// - Asks the browser for permission once per tab session using the secure
//   Geolocation API (navigator.geolocation.getCurrentPosition — Chrome 134+ /
//   Android). Denied or unsupported browsers no-op silently.
// - A sessionStorage flag is set BEFORE prompting, so a denied prompt is never
//   re-asked on every visit to /explore.
// - Reverse-geocodes via OpenStreetMap Nominatim (free, no API key — this
//   portfolio app intentionally has no geocoding key).
// - Nothing is persisted server-side: the resolved city only pre-fills the
//   session's FilterState.locationQuery. See the "no preferredLatitude/
//   preferredLongitude" product decision in the schema.
//
// Usage:
//   requestLocationOncePerSession((city) => setFilters((p) => ({ ...p, locationQuery: city })))

const GEO_ASKED_KEY = "habitat.geo.asked";

export type GeolocationPosition = { latitude: number; longitude: number };

type NavigatorWithGeolocation = Navigator & {
  geolocation?: { getCurrentPosition?: unknown };
};

function requestCurrentPosition(): Promise<GeolocationPosition | null> {
  try {
    const geo = (navigator as NavigatorWithGeolocation).geolocation;
    const getCurrentPosition = geo?.getCurrentPosition;
    if (!geo || typeof getCurrentPosition !== "function") {
      return Promise.resolve(null);
    }

    // Modern Chrome-style secure API is promise-based with no arguments
    // (legacy Gecko used callbacks); detect which by checking the return.
    const call = getCurrentPosition as () => unknown;
    const result = call();
    if (result && typeof (result as Promise<unknown>).then === "function") {
      return (result as Promise<GeolocationPosition>).catch(() => null);
    }
  } catch {
    // Permission prompt denied or API blocked before the call.
  }
  return Promise.resolve(null);
}

// Nominatim reverse geocoding — see
// https://operations.osmfoundation.org/policies/nominatim/ . Free for low
// volume; a single per-session call is well within the usage policy.
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const url =
    "https://nominatim.openstreetmap.org/reverse?format=jsonv2" +
    `&lat=${encodeURIComponent(String(latitude))}` +
    `&lon=${encodeURIComponent(String(longitude))}&zoom=10`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      address?: { city?: string; town?: string; village?: string };
    };
    const city =
      body.address?.city ?? body.address?.town ?? body.address?.village;
    return city?.trim() ? city.trim() : null;
  } catch {
    return null;
  }
}

// Requests the browser location once per tab session; when granted,
// reverse-geocodes to a city and calls `onResolved` with it. Safe to call on
// every mount — the sessionStorage flag short-circuits after the first ask.
export function requestLocationOncePerSession(
  onResolved: (city: string) => void,
): void {
  if (typeof navigator === "undefined" || typeof sessionStorage === "undefined")
    return;

  try {
    if (sessionStorage.getItem(GEO_ASKED_KEY)) return;
    sessionStorage.setItem(GEO_ASKED_KEY, "1");
  } catch {
    // Storage unavailable (private mode) — still attempt the ask once.
  }

  void requestCurrentPosition()
    .then(async (position) => {
      if (!position) return;
      const city = await reverseGeocode(position.latitude, position.longitude);
      if (city) onResolved(city);
    })
    .catch(() => {
      // Prefill is a best-effort enhancement — never surface errors.
    });
}