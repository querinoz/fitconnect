/** Decode Google encoded polyline → [lat, lng][] (Strava map format). */
export function decodePolyline(encoded: string, precision = 5): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const factor = Math.pow(10, precision);

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}

/** Encode [lat, lng][] → Google polyline string. */
export function encodePolyline(coordinates: [number, number][], precision = 5): string {
  const factor = Math.pow(10, precision);
  let output = "";
  let prevLat = 0;
  let prevLng = 0;

  for (const [lat, lng] of coordinates) {
    const ilat = Math.round(lat * factor);
    const ilng = Math.round(lng * factor);
    output += encodeSigned(ilat - prevLat);
    output += encodeSigned(ilng - prevLng);
    prevLat = ilat;
    prevLng = ilng;
  }

  return output;
}

function encodeSigned(value: number): string {
  let s = value < 0 ? ~(value << 1) : value << 1;
  let output = "";
  while (s >= 0x20) {
    output += String.fromCharCode((0x20 | (s & 0x1f)) + 63);
    s >>= 5;
  }
  output += String.fromCharCode(s + 63);
  return output;
}

/** Build elevation profile pairs from altitude + distance streams. */
export function buildElevationProfile(
  distanceM: number[],
  altitudeM: number[]
): { distanceKm: number; elevationM: number }[] {
  const len = Math.min(distanceM.length, altitudeM.length);
  return Array.from({ length: len }, (_, i) => ({
    distanceKm: distanceM[i]! / 1000,
    elevationM: altitudeM[i]!
  }));
}
