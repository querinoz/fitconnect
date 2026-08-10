# ANDROID_NAVIGATION_MATRIX.md

| Route / surface | Entry | Auth | Role | Back | Deep link | Notes |
|-----------------|-------|------|------|------|-----------|-------|
| splash | cold start | — | — | — | — | restore session |
| guest | splash/logout | guest | any | — | fitconnect://app/guest | |
| auth | guest | guest | any | back→guest | fitconnect://app/auth | AuthScreen |
| onboarding | athlete home first run | logged | ATHLETE | finish→home | — | PreferenceKeys.ONBOARDING_DONE |
| home / athlete OS | auth | ACCESS_APP_SHELL | ATHLETE | tabs | fitconnect://app/home | |
| home / coach OS | auth | ACCESS_APP_SHELL | COACH | tabs | same | |
| athlete/home | tab | athlete | ATHLETE | — | athlete/home | |
| athlete/recovery | tab | athlete | ATHLETE | — | athlete/recovery | |
| athlete/training | tab | athlete | ATHLETE | — | — | |
| athlete/discover | tab | athlete | ATHLETE | — | — | map panel |
| athlete/profile | tab | athlete | ATHLETE | — | — | sign out |
| athlete/community | home CTA | athlete | ATHLETE | back | — | seeded feed |
| athlete/sports | home | athlete | ATHLETE | back | — | |
| athlete/telemetry | profile | athlete | ATHLETE | back | athlete/telemetry | |
| athlete/programs | home | athlete | ATHLETE | back | — | |
| athlete/ai | home/profile | athlete | ATHLETE | back | athlete/ai | |
| coach/overview | coach home | coach | COACH | — | coach/overview | |
| coach/athletes | tab | coach | COACH | — | — | |
| coach/calendar | tab | coach | COACH | — | — | |
| coach/inbox | tab | coach | COACH | — | — | |
| coach/profile (More) | tab | coach | COACH | — | — | bookings/sessions/revenue |
| catalog | deep link | logged | shell | — | fitconnect://app/catalog | design system |
| role gate | denied | logged | mismatch | guest | — | |
| error | auth failure | — | — | pop | — | |

Anonymous users never enter Athlete/Coach OS (ACCESS_APP_SHELL).
