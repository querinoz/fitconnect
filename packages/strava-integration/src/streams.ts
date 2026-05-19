import type { StravaStream, StravaStreamType } from "@fitconnect/types";

export type ParsedStreams = Partial<Record<StravaStreamType, StravaStream>>;

/** Index streams by type for O(1) lookup. */
export function indexStreamsByType(streams: StravaStream[]): ParsedStreams {
  const map: ParsedStreams = {};
  for (const s of streams) {
    map[s.type as StravaStreamType] = s;
  }
  return map;
}

export function getHeartRateSeries(streams: ParsedStreams): number[] {
  return (streams.heartrate?.data as number[] | undefined) ?? [];
}

export function getAltitudeSeries(streams: ParsedStreams): number[] {
  return (streams.altitude?.data as number[] | undefined) ?? [];
}

export function getDistanceSeries(streams: ParsedStreams): number[] {
  return (streams.distance?.data as number[] | undefined) ?? [];
}

export function getLatLngSeries(streams: ParsedStreams): [number, number][] {
  return (streams.latlng?.data as [number, number][] | undefined) ?? [];
}

export function getPaceSeries(streams: ParsedStreams): number[] {
  const velocity = (streams.velocity_smooth?.data as number[] | undefined) ?? [];
  return velocity.map((v) => (v > 0 ? 1000 / v : 0));
}

export function summarizeStreams(streams: ParsedStreams) {
  const hr = getHeartRateSeries(streams);
  const alt = getAltitudeSeries(streams);
  return {
    pointCount: hr.length || alt.length,
    avgHr: hr.length ? hr.reduce((a, b) => a + b, 0) / hr.length : null,
    maxHr: hr.length ? Math.max(...hr) : null,
    elevationGainM:
      alt.length > 1
        ? alt.reduce((gain, v, i) => {
            const d = v - alt[i - 1]!;
            return d > 0 ? gain + d : gain;
          }, 0)
        : null
  };
}
