# FitConnect — Notification spec

## Existing

`CommunityNotifier` → `NotificationGateway` with burst cap (20/hour/recipient).  
Categories include SOCIAL. FCM production = PENDING_HUMAN.

## Quality rule

If the payload cannot answer “why should I care?” do not send.

## Missing

Quiet/sleep mode, per-category prefs, in-app notification center polish (athlete Notifications screen exists as list).

## Forbidden

Fake “your squad is online”, fake PBs, unread badge inflation.
