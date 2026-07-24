/**
 * EXIF GPS extraction from uploaded photos.
 * Uses the exifr library (lightweight, browser-compatible).
 */
import exifr from 'exifr'

export interface ExifGps {
  latitude: number
  longitude: number
}

/**
 * Extract GPS coordinates from a photo file's EXIF data.
 * Returns null if no GPS data is found.
 */
export async function extractGps(file: File): Promise<ExifGps | null> {
  try {
    const gps = await exifr.gps(file)
    if (
      gps &&
      typeof gps.latitude === 'number' &&
      typeof gps.longitude === 'number' &&
      isFinite(gps.latitude) &&
      isFinite(gps.longitude)
    ) {
      return { latitude: gps.latitude, longitude: gps.longitude }
    }
    return null
  } catch {
    return null
  }
}
