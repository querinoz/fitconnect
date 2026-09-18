# Unified Athlete Model

Conceptual single athlete entity consumed by all surfaces:

| Facet | Source |
| --- | --- |
| Identity | auth user + sports identity profile |
| Sport | `SPORT_REGISTRY` + primary/secondary |
| Goals | sports identity / nutrition profile |
| Training | TRAIN machine + completions + events |
| Nutrition | targets / diary / meal plan |
| Recovery | readiness / recovery events |
| Devices | device registry + FitnessProvider |
| Social | network spots/events (non-Strava) |
| Schedule | available time / competition |
| AI context | MCP actor-scoped tools |
| Privacy | coach ACL + share flags + channel policy |

Ownership: athlete is root owner; coach reads only via explicit scopes.
