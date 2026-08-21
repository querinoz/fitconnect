# Human final actions

**Date:** 2026-08-19

**Status:** SNAPSHOT — canonical human list: [../master-plan/17_HUMAN_ACTION_PLAN.md](../master-plan/17_HUMAN_ACTION_PLAN.md)

**Athlete IA (current):** Today · Analysis · Achievements · Profile + Train FAB (not the HOME/DISCOVER/ACTIVITY row below).

**Context:** Engineering gate is **NO-GO**. Do not start Play / Firebase / production signing until the next GO.

## Unblocks the next GO (engineering, then human)

1. **Boot devices** — `fitconnect_phone` reached `offline` this run. Human: Hypervisor/AVD health, then recapture Android + Wear matrix with `sys.boot_completed=1`.  
2. **One demo identity** — decide a single LOCAL_DEMO athlete (`id` + name) for Android, Wear, Web, and the matching coach-roster row. Do not ship three Inês.  
3. **XP** — either wire web to Ascend or label web Helium as **not** Ascend.  
4. **Product cut or ship** — Squad, in-app Social, cross-platform Ascend: implement as one graph **or** remove from landing “one OS” claims.  
5. **Navigation** — align Web with Android HOME · DISCOVER · ACTIVITY · COMMUNITY · PROFILE, or publish a deliberate IA split.  
6. **Marketing numbers** — remaining `12,418` strings still invent roster size. Replace with LOCAL_DEMO or real counts.  
7. **Demo mode** — staging/prod `NEXT_PUBLIC_DEMO_MODE=false` plus real Supabase session. **PENDING_HUMAN.**

## Production (only after GO)

Do these in order. Do not mix with feature work.

1. Production signing keystore (never commit passwords).  
2. Supabase production URL + **anon** key (never `service_role` on device).  
3. Google OAuth + Apple Sign-In.  
4. Firebase + FCM.  
5. Production realtime (not `broadcast`).  
6. Crashlytics + analytics.  
7. Signed AAB → internal testing → closed testing → RC.  
8. Test Lab if credentials exist.

If a production test finds a P0/P1: **do not workaround to publish**. Unfreeze, fix, retest, refreeze.

## Tools not installed this session

- Maestro  
- Firebase CLI  

Install when a human is ready to authenticate them. They did not block the NO-GO decision.
