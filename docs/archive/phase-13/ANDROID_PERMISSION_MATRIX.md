# ANDROID_PERMISSION_MATRIX.md

| Permission | Why | Dangerous? | UX | Feature if denied |
|------------|-----|------------|-----|-------------------|
| INTERNET | API / maps tiles | no | n/a | app unusable online |
| ACCESS_NETWORK_STATE | offline coordinator | no | n/a | degraded connectivity detection |
| ACCESS_COARSE_LOCATION | nearby coaches / map | yes | request on map/discover | map without user pin |
| ACCESS_FINE_LOCATION | precise training location | yes | request on map | approximate / none |
| CAMERA | session / media (future) | yes | on feature entry | feature disabled |
| RECORD_AUDIO | LiveKit (future) | yes | on join | audio-less / blocked |
| POST_NOTIFICATIONS | push (API 33+) | yes | settings / onboarding | silent app |
| ACTIVITY_RECOGNITION | wearable activity | yes | telemetry connect | no activity metrics |
| BLUETOOTH_CONNECT | wearables | yes | device center | cannot pair |
| READ_MEDIA_IMAGES / VISUAL_USER_SELECTED | community media | yes | upload flow | text-only |
| READ_EXTERNAL_STORAGE (≤32) | legacy media | yes | upload | same |

Manifest: `android/app/src/main/AndroidManifest.xml`  
Gateway: `AndroidPermissionGateway`  
**Device permission UX matrix:** NOT RUN this session.
