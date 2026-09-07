# Route Visualization

## Live

1. OutdoorCapture accepts GPS → Room upsert
2. `observeAcceptedPoints(activityId)` Flow
3. `FitConnectRouteMap` updates line + current marker

## Completed

`ActivityRouteDetailScreen(activityId)` loads Room session + accepted points offline.

## Markers

| Marker | Rule |
|--------|------|
| Start | first accepted point |
| Finish | last accepted when `completed=true` and ≥2 points |
| Current | last accepted while live |

Never fabricate markers.

## Camera

See `RouteCameraLogic` / `RouteCameraPolicy`.
