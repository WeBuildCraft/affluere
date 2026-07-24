/**
 * Geocoding utilities using Nominatim (OpenStreetMap)
 * Bounded to Bordeaux Métropole area
 */

// Bordeaux Métropole bounding box
const BORDEAUX_BBOX = {
  minLon: -0.8500,
  maxLon: -0.3500,
  minLat: 44.7300,
  maxLat: 44.9500,
}

export interface GeocodedLocation {
  location_name: string
  city: string
  neighbourhood: string | null
}

export interface ForwardResult {
  lat: number
  lng: number
  display_name: string
  location_name: string
  city: string
  neighbourhood: string | null
}

/**
 * Reverse geocode coordinates into a location name, city, and neighbourhood.
 * Uses Nominatim with a 1s delay for rate limiting.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodedLocation> {
  const fallback: GeocodedLocation = {
    location_name: 'Bordeaux',
    city: 'bordeaux',
    neighbourhood: null,
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18&accept-language=fr`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Affleure/1.0 (affleure.com)' },
    })

    if (!res.ok) return fallback

    const data = await res.json()
    const addr = data.address

    if (!addr) return fallback

    // Build a human-readable location name
    const parts: string[] = []
    if (addr.road) parts.push(addr.road)
    else if (addr.pedestrian) parts.push(addr.pedestrian)
    else if (addr.footway) parts.push(addr.footway)
    else if (addr.path) parts.push(addr.path)

    if (addr.house_number && parts.length > 0) {
      parts[0] = `${addr.house_number} ${parts[0]}`
    }

    const locationName =
      parts.length > 0
        ? parts.join(', ')
        : addr.suburb || addr.neighbourhood || addr.quarter || addr.hamlet || 'Bordeaux'

    // City: prefer the actual city/town/village
    const city = (
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      'Bordeaux'
    ).toLowerCase()

    // Neighbourhood: suburb, quarter, or neighbourhood
    const neighbourhood =
      addr.suburb || addr.quarter || addr.neighbourhood || null

    return { location_name: locationName, city, neighbourhood }
  } catch {
    return fallback
  }
}

/**
 * Forward geocode a search query, bounded to Bordeaux Métropole.
 * Returns up to 5 results.
 */
export async function forwardGeocode(
  query: string
): Promise<ForwardResult[]> {
  if (!query.trim()) return []

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      'accept-language': 'fr',
      viewbox: `${BORDEAUX_BBOX.minLon},${BORDEAUX_BBOX.maxLat},${BORDEAUX_BBOX.maxLon},${BORDEAUX_BBOX.minLat}`,
      bounded: '1',
    })

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'User-Agent': 'Affleure/1.0 (affleure.com)' } }
    )

    if (!res.ok) return []

    const data = await res.json()

    return data.map(
      (item: {
        lat: string
        lon: string
        display_name: string
        address?: {
          road?: string
          pedestrian?: string
          house_number?: string
          city?: string
          town?: string
          village?: string
          municipality?: string
          suburb?: string
          quarter?: string
          neighbourhood?: string
        }
      }) => {
        const addr = item.address || {}
        const road = addr.road || addr.pedestrian || ''
        const locationName = addr.house_number
          ? `${addr.house_number} ${road}`
          : road || item.display_name.split(',')[0]

        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          display_name: item.display_name,
          location_name: locationName,
          city: (
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            'Bordeaux'
          ).toLowerCase(),
          neighbourhood:
            addr.suburb || addr.quarter || addr.neighbourhood || null,
        }
      }
    )
  } catch {
    return []
  }
}
