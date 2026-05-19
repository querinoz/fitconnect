import { z } from "zod";
import { STRAVA_SPORT_TYPES } from "@fitconnect/types";

export const stravaSportTypeSchema = z.enum(
  STRAVA_SPORT_TYPES as unknown as [string, ...string[]]
);

export const stravaMapSchema = z.object({
  id: z.string(),
  polyline: z.string().optional().nullable(),
  summary_polyline: z.string().optional().nullable()
});

export const stravaSummaryActivitySchema = z.object({
  id: z.number(),
  name: z.string(),
  sport_type: z.string().optional(),
  type: z.string().optional(),
  distance: z.number(),
  moving_time: z.number(),
  elapsed_time: z.number(),
  total_elevation_gain: z.number().optional().nullable(),
  start_date: z.string(),
  start_date_local: z.string(),
  timezone: z.string().optional(),
  average_speed: z.number().optional().nullable(),
  max_speed: z.number().optional().nullable(),
  average_heartrate: z.number().optional().nullable(),
  max_heartrate: z.number().optional().nullable(),
  has_heartrate: z.boolean().optional(),
  device_name: z.string().optional().nullable(),
  map: stravaMapSchema.optional().nullable(),
  suffer_score: z.number().optional().nullable(),
  average_watts: z.number().optional().nullable(),
  max_watts: z.number().optional().nullable(),
  weighted_average_watts: z.number().optional().nullable()
});

export const stravaLapSchema = z.object({
  id: z.number(),
  name: z.string(),
  lap_index: z.number(),
  distance: z.number(),
  moving_time: z.number(),
  elapsed_time: z.number(),
  average_speed: z.number().optional().nullable(),
  max_speed: z.number().optional().nullable(),
  average_heartrate: z.number().optional().nullable(),
  max_heartrate: z.number().optional().nullable(),
  total_elevation_gain: z.number().optional().nullable()
});

export const stravaDetailedActivitySchema = stravaSummaryActivitySchema.extend({
  description: z.string().optional().nullable(),
  calories: z.number().optional().nullable(),
  device_watts: z.boolean().optional(),
  trainer: z.boolean().optional(),
  commute: z.boolean().optional(),
  manual: z.boolean().optional(),
  private: z.boolean().optional(),
  flagged: z.boolean().optional(),
  workout_type: z.number().optional().nullable(),
  laps: z.array(stravaLapSchema).optional(),
  segment_efforts: z.array(z.record(z.unknown())).optional()
});

export const stravaTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
  token_type: z.string().optional(),
  athlete: z.object({
    id: z.number(),
    firstname: z.string().optional(),
    lastname: z.string().optional()
  })
});

export const stravaAthleteSchema = z.object({
  id: z.number(),
  username: z.string().optional().nullable(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  measurement_preference: z.enum(["feet", "meters"]).optional()
});

export const stravaWebhookEventSchema = z.object({
  aspect_type: z.enum(["create", "update", "delete"]),
  event_time: z.number(),
  object_id: z.number(),
  object_type: z.enum(["activity", "athlete"]),
  owner_id: z.number(),
  subscription_id: z.number(),
  updates: z.record(z.unknown()).optional()
});

export const stravaStreamSchema = z.object({
  type: z.string(),
  data: z.array(z.union([z.number(), z.tuple([z.number(), z.number()])])),
  series_type: z.enum(["time", "distance"]),
  original_size: z.number(),
  resolution: z.enum(["low", "medium", "high"])
});

export type StravaSummaryActivityInput = z.infer<typeof stravaSummaryActivitySchema>;
export type StravaDetailedActivityInput = z.infer<typeof stravaDetailedActivitySchema>;
export type StravaTokenResponseInput = z.infer<typeof stravaTokenResponseSchema>;
export type StravaWebhookEventInput = z.infer<typeof stravaWebhookEventSchema>;
