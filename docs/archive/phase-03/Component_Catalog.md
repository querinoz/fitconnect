# Phase 03 — Component Catalog

Living UI: in-app route `fitconnect://app/catalog` → `DesignSystemCatalog`.

| Component | API | Variants |
|-----------|-----|----------|
| `EliteButton` | label, onClick | Primary, Secondary, Ghost |
| `EliteIconButton` | onClick, contentDescription | — |
| `EliteFab` | onClick, contentDescription | — |
| `EliteCard` | content | Solid, Glass, Metric, Person |
| `EliteMetricCard` | label, value, accent | — |
| `ElitePersonCard` | title, subtitle | Athlete/Coach shell (no feature data) |
| `EliteTextField` / `EliteSearchField` | value, onValueChange | — |
| `EliteSwitch` / `EliteCheckbox` / `EliteRadio` / `EliteSlider` | standard | — |
| `EliteSegmentedControl` | options, selectedIndex | — |
| `EliteBadge` / `EliteChip` / `EliteTag` | — | — |
| `EliteAvatar` | initials | — |
| `EliteDivider` | — | — |
| `EliteProgress` / `EliteLoading` / `EliteSkeleton` | — | — |
| `EliteEmptyState` / `EliteErrorView` | title, body, action | — |
| `EliteDialog` | title, body, confirm/dismiss | — |
| `EliteSnackbarHostContent` | message | — |
| `EliteBottomSheet` | title, content | — |
| `EliteLazyList` | items, P2R, loadMore, skeleton | — |
| `EliteChart` | `EliteChartModel` | 9 kinds |

### Usage rule

```kotlin
EliteButton("Continue", onClick = { })
// NOT MaterialTheme Button with Color(0xFFC8FF00)
```

### Common mistakes

1. Hardcoding hex/dp in feature modules  
2. Creating a second `MaterialTheme` root  
3. Building athlete/coach cards without `ElitePersonCard` / `EliteCard`
