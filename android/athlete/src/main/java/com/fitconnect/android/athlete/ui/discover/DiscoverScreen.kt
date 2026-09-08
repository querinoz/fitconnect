package com.fitconnect.android.athlete.ui.discover

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.fitconnect.android.athlete.data.canonicalAthleteId
import com.fitconnect.android.athlete.demo.AthleteContentResolver
import com.fitconnect.android.athlete.demo.AthleteDemoBanner
import com.fitconnect.android.athlete.demo.AthleteDemoCatalog
import com.fitconnect.android.athlete.domain.CoachCard
import com.fitconnect.android.athlete.domain.DiscoverMapPreviewUi
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.charts.EliteChartPalette
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.charts.EliteHrvTrendChart
import com.fitconnect.android.designui.charts.EliteWeeklyLoadBar
import com.fitconnect.android.designui.charts.EliteWeeklyLoadChart
import com.fitconnect.android.designui.charts.EliteZoneRingChart
import com.fitconnect.android.designui.charts.EliteZoneSegment
import com.fitconnect.android.designui.components.EliteAvatar
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteEmptyState
import com.fitconnect.android.designui.components.EliteErrorView
import com.fitconnect.android.designui.components.EliteMarketplaceCard
import com.fitconnect.android.designui.components.EliteSectionHeader
import com.fitconnect.android.designui.components.EliteSwitch
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.components.EliteZenithHeader
import com.fitconnect.android.designui.components.HexBadge
import com.fitconnect.android.designui.components.HexBadgeTone
import com.fitconnect.android.designui.components.HexStatus
import com.fitconnect.android.designui.neumorphic.EosGlassBadge
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.neumorphic.EosPremiumWell
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.geo.booking.BookingRequest
import com.fitconnect.android.geo.domain.BookingLifecycle
import com.fitconnect.android.geo.domain.BookingTargetKind
import com.fitconnect.android.geo.domain.MapStyleKind
import com.fitconnect.android.geo.domain.SessionMode
import com.fitconnect.android.geo.maps.DiscoverMapUiLogic
import com.fitconnect.android.geo.maps.DiscoverMapUiState
import com.fitconnect.android.geo.maps.MapCamera
import com.fitconnect.android.geo.maps.MapMarker
import com.fitconnect.android.geo.maps.MapScene
import kotlinx.coroutines.launch

private data class BookingDraft(
    val coach: CoachCard,
    val dayOffset: Int = 2,
    val hour: Int = 10,
    val durationMin: Int = 60,
)

@Composable
fun DiscoverScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var isLocalDemo by remember { mutableStateOf(false) }
    var specialty by remember { mutableStateOf("") }
    var language by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var verifiedOnly by remember { mutableStateOf(false) }
    var result by remember { mutableStateOf<AppResult<List<CoachCard>>?>(null) }
    var markers by remember { mutableStateOf<List<MapMarker>>(emptyList()) }
    var selectedCoach by remember { mutableStateOf<CoachCard?>(null) }
    var bookingDraft by remember { mutableStateOf<BookingDraft?>(null) }
    var bookingSubmitting by remember { mutableStateOf(false) }
    var messageSending by remember { mutableStateOf(false) }
    var lastBookingId by remember { mutableStateOf<String?>(null) }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    val locationPermission by container.geo.location.permission.collectAsState()
    val locationFix by container.geo.location.current.collectAsState()

    fun reload() {
        scope.launch {
            result = container.athleteRepository.discoverCoaches(
                specialty = specialty.ifBlank { null },
                language = language.ifBlank { null },
                verifiedOnly = verifiedOnly,
                maxDistanceKm = 25.0,
            )
        }
    }

    LaunchedEffect(Unit) {
        isLocalDemo = container.platform.sessionStore.snapshot().isLocalDemo
    }

    LaunchedEffect(specialty, language, verifiedOnly) {
        container.platform.analytics.screen("athlete_discover")
        reload()
    }

    LaunchedEffect(result, locationFix, locationPermission, isLocalDemo) {
        val coaches = (result as? AppResult.Ok)?.value.orEmpty()
        val fix = locationFix ?: container.geo.location.lastKnown()
        // Production: never invent a Lisbon self-pin. Demo may use catalog anchor when mocked.
        val anchor = fix?.point
        val coachMarkers = buildList {
            if (anchor != null) {
                add(MapMarker("self", anchor, "You"))
                coaches.take(5).forEachIndexed { i, coach ->
                    add(
                        MapMarker(
                            coach.id,
                            anchor.copy(
                                latitude = anchor.latitude + 0.008 * (i + 1),
                                longitude = anchor.longitude + 0.006 * (i % 3),
                            ),
                            coach.name,
                        ),
                    )
                }
            }
        }
        markers = coachMarkers
        if (anchor != null) {
            val controller = container.geo.maps.preferredProvider().createController()
            controller.render(
                MapScene(
                    style = MapStyleKind.DARK,
                    camera = MapCamera(anchor, 12.0),
                    markers = coachMarkers,
                    livePosition = anchor,
                    showUserLocation = !fix.mocked || isLocalDemo,
                ),
            )
        }
    }

    AthleteLoad(result, ::reload) { coaches ->
        val filtered = coaches.filter { coach ->
            city.isBlank() || coach.city.contains(city, ignoreCase = true)
        }
        var analysis by remember { mutableStateOf(AthleteContentResolver.analysisSurface()) }
        var analysisLoading by remember { mutableStateOf(!isLocalDemo) }
        LaunchedEffect(isLocalDemo) {
            if (isLocalDemo) {
                analysis = AthleteContentResolver.analysisSurface()
                analysisLoading = false
            } else {
                analysisLoading = true
                val uid = container.platform.sessionStore.canonicalAthleteId()
                analysis = AthleteContentResolver.analysisFromTelemetry(
                    athleteId = uid,
                    telemetry = container.telemetry.athleteFacade,
                )
                analysisLoading = false
            }
        }
        AthleteScreenScaffold(
            title = "Analysis",
            subtitle = if (isLocalDemo) {
                "Load · HRV · zones · ${DemoPersona.MODE_LABEL}"
            } else {
                "Coach marketplace · telemetry when synced"
            },
            overline = "ATHLETE OS · ANALYSIS",
            testTag = "athlete_discover",
            showTitle = false,
        ) {
            item {
                AthleteDemoBanner(
                    visible = !container.platform.config.visualQaChromeDiet &&
                        isLocalDemo &&
                        analysis.isAnyDemo,
                    modifier = Modifier.testTag("discover_demo_banner"),
                )
            }
            item {
                EosPremiumCard {
                    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
                        EliteZenithHeader(
                            sysLabel = "ANALYSIS COMMAND",
                            title = "Analysis + discover",
                            subtitle = if (isLocalDemo) {
                                "Telemetry samples and marketplace cards stay clearly labeled in local demo mode."
                            } else {
                                "Live telemetry, coach marketplace, and booking actions from one command surface."
                            },
                            badge = {
                                HexBadge(
                                    text = filtered.size.coerceAtMost(99).toString().padStart(2, '0'),
                                    tone = HexBadgeTone.Telemetry,
                                )
                            },
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            HexStatus(if (verifiedOnly) "verified only" else "all coaches")
                            HexStatus(
                                "${DiscoverMapUiLogic.placeMarkerCount(markers)} map markers",
                            )
                        }
                    }
                }
            }
            item {
                EliteSectionHeader(
                    title = "Performance signals",
                    overline = if (isLocalDemo) AthleteDemoCatalog.MODE_LABEL else "LIVE TELEMETRY",
                )
            }
            when {
                analysisLoading -> {
                    item {
                        EliteCard(modifier = Modifier.testTag("analysis_charts_loading")) {
                            Text("Loading telemetry…", style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
                analysis.weeklyLoad.isEmpty() &&
                    analysis.hrvTrendMs.isEmpty() &&
                    analysis.zoneMinutes.all { it.value == 0 } -> {
                    item {
                        EliteCard(modifier = Modifier.testTag("analysis_charts_empty")) {
                            Text(
                                if (isLocalDemo) {
                                    "No demo analysis samples."
                                } else {
                                    "No measured load / HRV / zone samples yet. Sync Health Connect or complete a workout."
                                },
                                style = MaterialTheme.typography.bodyMedium,
                            )
                        }
                    }
                }
                else -> {
                    if (analysis.weeklyLoad.isNotEmpty()) {
                        item {
                            EosPremiumWell(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("analysis_weekly_load_chart"),
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                                    EliteSysLabel("WEEKLY LOAD")
                                    EliteWeeklyLoadChart(
                                        bars = analysis.weeklyLoad.mapIndexed { index, load ->
                                            EliteWeeklyLoadBar(
                                                label = analysis.weeklyLabels.getOrElse(index) { "D$index" },
                                                load = load.value,
                                                isToday = index == analysis.todayIndex,
                                            )
                                        },
                                    )
                                }
                            }
                        }
                    }
                    if (analysis.hrvTrendMs.isNotEmpty()) {
                        item {
                            EosPremiumWell(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("analysis_hrv_trend_chart"),
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                                    EliteSysLabel("HRV TREND · 7D")
                                    EliteHrvTrendChart(
                                        points = analysis.hrvTrendMs.mapIndexed { index, point ->
                                            EliteChartPoint(index.toFloat(), point.value)
                                        },
                                        deltaPercent = analysis.hrvDeltaPercent.value,
                                    )
                                }
                            }
                        }
                    }
                    if (analysis.zoneMinutes.any { it.value > 0 }) {
                        item {
                            EosPremiumWell(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("analysis_zone_ring_chart"),
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                                    EliteSysLabel("TRAINING ZONES")
                                    EliteZoneRingChart(
                                        segments = analysis.zoneMinutes.mapIndexed { index, minutes ->
                                            EliteZoneSegment(
                                                zone = index + 1,
                                                minutes = minutes.value,
                                            )
                                        },
                                    )
                                }
                            }
                        }
                    }
                }
            }
            item {
                EliteSectionHeader(title = "Coach marketplace", overline = "DISCOVER")
            }
            item {
                val route = container.geo.routes.all().firstOrNull()
                val mapUi = AthleteContentResolver.discoverMapPreview(
                    routeDistanceKm = route?.distanceKm,
                    routeDurationMin = route?.estimatedMinutes,
                )
                val mapState = DiscoverMapUiLogic.resolve(
                    permission = locationPermission,
                    hasLocationFix = locationFix != null || container.geo.location.lastKnown() != null,
                    markerCount = DiscoverMapUiLogic.placeMarkerCount(markers),
                    loadFailed = result is AppResult.Err,
                )
                LocalMapPreview(
                    preview = mapUi,
                    markerCount = DiscoverMapUiLogic.placeMarkerCount(markers),
                    mapState = mapState,
                    isLocalDemo = isLocalDemo,
                    onRetry = ::reload,
                )
            }
            item {
                EliteSectionHeader(title = "Filters", overline = "QUERY")
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                    listOf("Running", "Cycling", "Strength").forEach { chip ->
                        EliteChip(
                            label = chip,
                            selected = specialty.equals(chip, ignoreCase = true),
                            onClick = { specialty = chip },
                        )
                    }
                }
                EliteTextField(value = specialty, onValueChange = { specialty = it }, label = "Specialty")
                EliteTextField(value = language, onValueChange = { language = it }, label = "Language")
                EliteTextField(value = city, onValueChange = { city = it }, label = "City")
                Row(
                    horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    EliteSwitch(checked = verifiedOnly, onCheckedChange = { verifiedOnly = it })
                    Text("Verified only", style = MaterialTheme.typography.bodyLarge)
                }
                statusMessage?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                }
            }

            bookingDraft?.let { draft ->
                item {
                    BookingSheet(
                        draft = draft,
                        submitting = bookingSubmitting,
                        onDay = { if (!bookingSubmitting) bookingDraft = draft.copy(dayOffset = it) },
                        onHour = { if (!bookingSubmitting) bookingDraft = draft.copy(hour = it) },
                        onDismiss = {
                            if (!bookingSubmitting) bookingDraft = null
                        },
                        onConfirm = {
                            if (bookingSubmitting) return@BookingSheet
                            scope.launch {
                                bookingSubmitting = true
                                try {
                                    val start = nextOpenSlot(
                                        coachId = draft.coach.id,
                                        dayOffset = draft.dayOffset,
                                        preferredHour = draft.hour,
                                        durationMin = draft.durationMin,
                                        isOpen = { id, epoch, dur ->
                                            container.geo.availability.isOpen(id, epoch, dur, SessionMode.PRIVATE)
                                        },
                                    )
                                    if (container.geo.booking.conflicts(draft.coach.id, start, draft.durationMin)) {
                                        statusMessage = "Slot conflict — pick another time"
                                        return@launch
                                    }
                                    when (
                                        val created = container.athleteRepository.createBooking(
                                            coachId = draft.coach.id,
                                            scheduledAtEpochMs = start,
                                            durationMin = draft.durationMin,
                                            notes = if (isLocalDemo) "LOCAL_DEMO booking" else null,
                                            idempotencyKey = java.util.UUID.randomUUID().toString(),
                                        )
                                    ) {
                                        is AppResult.Ok -> {
                                            lastBookingId = created.value
                                            statusMessage = if (created.value == "queued-offline") {
                                                "Booking queued · will sync when online"
                                            } else {
                                                "Booked · ${created.value}"
                                            }
                                            bookingDraft = null
                                            selectedCoach = null
                                        }
                                        is AppResult.Err -> {
                                            statusMessage = "Booking failed · ${created.error}"
                                        }
                                    }
                                } finally {
                                    bookingSubmitting = false
                                }
                            }
                        },
                    )
                }
            }

            selectedCoach?.let { coach ->
                item {
                    CoachProfileCard(
                        coach = coach,
                        messageSending = messageSending,
                        onClose = { if (!messageSending) selectedCoach = null },
                        onBook = { bookingDraft = BookingDraft(coach) },
                        onMessage = {
                            if (messageSending) return@CoachProfileCard
                            scope.launch {
                                messageSending = true
                                statusMessage = "Sending…"
                                try {
                                    when (
                                        val sent = container.athleteRepository.sendMessage(
                                            coachId = coach.id,
                                            preview = "Hi ${coach.name} — interested in coaching.",
                                        )
                                    ) {
                                        is AppResult.Ok -> {
                                            statusMessage = if (sent.value == "queued-offline") {
                                                "Message queued · will send when online → ${coach.name}"
                                            } else {
                                                "Message sent → ${coach.name}"
                                            }
                                        }
                                        is AppResult.Err -> {
                                            statusMessage = "Message failed · try again"
                                        }
                                    }
                                } finally {
                                    messageSending = false
                                }
                            }
                        },
                    )
                }
            }

            if (filtered.isEmpty()) {
                item {
                    EliteEmptyState(
                        title = "No coaches match",
                        body = "Clear filters or widen specialty, city, or language to see more coaches.",
                        actionLabel = "Reset filters",
                        onAction = {
                            specialty = ""
                            language = ""
                            city = ""
                            verifiedOnly = false
                        },
                    )
                }
            } else {
                items(filtered, key = { it.id }) { coach ->
                    EosPremiumCard {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
                        EliteMarketplaceCard(
                            name = coach.name,
                            sport = coach.specialties.firstOrNull().orEmpty(),
                            specialty = coach.specialties.drop(1).joinToString().ifBlank { "Performance" },
                            city = "${coach.city} · ${"%.1f".format(coach.distanceKm)} km",
                            rating = "%.1f".format(coach.rating),
                            price = "TIER 0${coach.priceTier}",
                            verified = coach.verified,
                            available = coach.available,
                            coverImageName = coachCover(coach.id),
                            onClick = { selectedCoach = coach },
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            HexStatus(if (coach.verified) "VERIFIED" else "OPEN PROFILE")
                            HexStatus(if (coach.available) "AVAILABLE" else "BUSY")
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            EliteButton(
                                label = "Book",
                                variant = EliteButtonVariant.Primary,
                                enabled = coach.available,
                                onClick = { bookingDraft = BookingDraft(coach) },
                            )
                            EliteButton(
                                label = "Message",
                                variant = EliteButtonVariant.Secondary,
                                onClick = { selectedCoach = coach },
                            )
                            EliteButton(
                                label = "Profile",
                                variant = EliteButtonVariant.Ghost,
                                onClick = { selectedCoach = coach },
                            )
                        }
                        }
                    }
                }
            }

            lastBookingId?.let { id ->
                item {
                    EliteCard {
                        Text("Last booking", style = MaterialTheme.typography.titleMedium)
                        Text(id, style = MaterialTheme.typography.bodyMedium)
                        EliteButton(
                            label = "Cancel booking",
                            variant = EliteButtonVariant.Ghost,
                            onClick = {
                                scope.launch {
                                    when (val cancelled = container.geo.booking.cancel(id)) {
                                        is AppResult.Ok -> {
                                            statusMessage = "Cancelled · ${cancelled.value.status}"
                                            if (cancelled.value.status == BookingLifecycle.CANCELLED) {
                                                lastBookingId = null
                                            }
                                        }
                                        is AppResult.Err -> statusMessage = "Cancel failed"
                                    }
                                }
                            },
                        )
                    }
                }
            }
        }
    }
}

private fun nextOpenSlot(
    coachId: String,
    dayOffset: Int,
    preferredHour: Int,
    durationMin: Int,
    isOpen: (String, Long, Int) -> Boolean,
): Long {
    val base = System.currentTimeMillis() + dayOffset * 86_400_000L + preferredHour * 3_600_000L
    var t = base
    repeat(48) {
        if (isOpen(coachId, t, durationMin)) return t
        t += 3_600_000L
    }
    return base
}

private fun coachCover(coachId: String): String {
    val covers = listOf(
        "demo_coach_track",
        "demo_run_waterfront",
        "demo_ride_ridge",
        "demo_gym_iron",
        "demo_swim_lanes",
        "demo_squad_track",
    )
    val index = (coachId.hashCode().toLong() and Long.MAX_VALUE) % covers.size
    return covers[index.toInt()]
}

@Composable
private fun CoachProfileCard(
    coach: CoachCard,
    onClose: () -> Unit,
    onBook: () -> Unit,
    onMessage: () -> Unit,
    messageSending: Boolean = false,
) {
    EliteCard(modifier = Modifier.testTag("coach_profile_sheet")) {
        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md), verticalAlignment = Alignment.CenterVertically) {
            EliteAvatar(initials = coach.name.take(2))
            Column {
                Text(coach.name, style = MaterialTheme.typography.titleLarge)
                Text(
                    coach.specialties.joinToString(),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        Text("City: ${coach.city}", style = MaterialTheme.typography.bodyMedium)
        Text("Rating: ★ ${coach.rating}", style = MaterialTheme.typography.bodyMedium)
        Text("Price tier: ${coach.priceTier} · Languages: ${coach.languages.joinToString()}", style = MaterialTheme.typography.bodyMedium)
        Text(
            if (coach.available) "Status: Available for intro" else "Status: Busy",
            style = MaterialTheme.typography.bodyMedium,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
            EliteButton(label = "Book intro", enabled = coach.available && !messageSending, onClick = onBook)
            EliteButton(
                label = if (messageSending) "Sending…" else "Message",
                variant = EliteButtonVariant.Secondary,
                enabled = !messageSending,
                loading = messageSending,
                onClick = onMessage,
            )
            EliteButton(label = "Close", variant = EliteButtonVariant.Ghost, enabled = !messageSending, onClick = onClose)
        }
    }
}

@Composable
private fun BookingSheet(
    draft: BookingDraft,
    onDay: (Int) -> Unit,
    onHour: (Int) -> Unit,
    onDismiss: () -> Unit,
    onConfirm: () -> Unit,
    submitting: Boolean = false,
) {
    EliteCard(modifier = Modifier.testTag("booking_sheet")) {
        Text("Book intro · ${draft.coach.name}", style = MaterialTheme.typography.titleLarge)
        Text("Select day", style = MaterialTheme.typography.titleMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
            listOf(1 to "Tomorrow", 2 to "+2d", 3 to "+3d").forEach { (offset, label) ->
                EliteChip(label = label, onClick = { onDay(offset) })
            }
        }
        Text("Select time", style = MaterialTheme.typography.titleMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
            listOf(9, 10, 14, 18).forEach { hour ->
                EliteChip(label = "%02d:00".format(hour), onClick = { onHour(hour) })
            }
        }
        Text(
            "Day +${draft.dayOffset} · ${"%02d:00".format(draft.hour)} · ${draft.durationMin} min",
            style = MaterialTheme.typography.bodyMedium,
        )
        com.fitconnect.android.designui.components.EliteFlowRow {
            EliteButton(
                label = "Confirm booking",
                onClick = onConfirm,
                loading = submitting,
                enabled = !submitting,
            )
            EliteButton(
                label = "Cancel",
                variant = EliteButtonVariant.Ghost,
                onClick = onDismiss,
                enabled = !submitting,
            )
        }
    }
}

@Composable
private fun LocalMapPreview(
    preview: DiscoverMapPreviewUi,
    markerCount: Int,
    mapState: DiscoverMapUiState,
    isLocalDemo: Boolean,
    onRetry: () -> Unit,
) {
    val copy = DiscoverMapUiLogic.copy(mapState)
    val elevated = EosNeumorphicColors.MoldSurface
    when (mapState) {
        DiscoverMapUiState.PermissionDenied -> {
            EliteErrorView(
                title = copy.title,
                body = copy.body,
                retryLabel = "Retry",
                onRetry = onRetry,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("athlete_map_permission_denied"),
            )
            return
        }
        DiscoverMapUiState.GpsUnavailable -> {
            EliteEmptyState(
                title = copy.title,
                body = copy.body,
                actionLabel = "Retry",
                onAction = onRetry,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("athlete_map_gps_unavailable"),
            )
            return
        }
        DiscoverMapUiState.EmptyMarkers -> {
            EliteEmptyState(
                title = copy.title,
                body = copy.body,
                actionLabel = "Retry search",
                onAction = onRetry,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("athlete_map_empty_markers"),
            )
            return
        }
        DiscoverMapUiState.Error -> {
            EliteErrorView(
                title = copy.title,
                body = copy.body,
                retryLabel = "Try again",
                onRetry = onRetry,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("athlete_map_error"),
            )
            return
        }
        DiscoverMapUiState.Ready -> Unit
    }
    val floor = EosNeumorphicColors.Floor
    val route = EliteChartPalette.Secondary
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
            .background(elevated, RoundedCornerShape(EliteRadius.Lg))
            .testTag("athlete_map_panel"),
    ) {
        // Decorative instrument only when Ready + local demo; never invent GPS for production.
        if (isLocalDemo) {
            Canvas(modifier = Modifier.fillMaxWidth().height(200.dp)) {
                drawRect(floor)
                val step = size.width / 8f
                for (i in 1 until 8) {
                    drawLine(
                        EliteChartPalette.Axis.copy(alpha = 0.15f),
                        Offset(step * i, 0f),
                        Offset(step * i, size.height),
                        2f,
                    )
                    drawLine(
                        EliteChartPalette.Axis.copy(alpha = 0.15f),
                        Offset(0f, step * i * 0.5f),
                        Offset(size.width, step * i * 0.5f),
                        2f,
                    )
                }
                val path = listOf(
                    Offset(size.width * 0.18f, size.height * 0.72f),
                    Offset(size.width * 0.32f, size.height * 0.55f),
                    Offset(size.width * 0.48f, size.height * 0.58f),
                    Offset(size.width * 0.62f, size.height * 0.42f),
                    Offset(size.width * 0.78f, size.height * 0.38f),
                )
                for (i in 0 until path.lastIndex) {
                    drawLine(route.copy(alpha = 0.85f), path[i], path[i + 1], strokeWidth = 5f)
                }
                drawCircle(EliteChartPalette.zone(4).copy(alpha = 0.25f), radius = 28f, center = path[2])
                drawCircle(EliteChartPalette.zone(2).copy(alpha = 0.3f), radius = 22f, center = path[3])
                drawCircle(EliteChartPalette.Muted, radius = 10f, center = path.last())
                drawCircle(EliteChartPalette.Secondary, radius = 8f, center = path.first())
            }
        } else {
            Canvas(modifier = Modifier.fillMaxWidth().height(200.dp)) {
                drawRect(floor)
            }
        }
        Column(modifier = Modifier.padding(EliteSpace.Md)) {
            EosGlassBadge(
                text = if (isLocalDemo) {
                    "LOCAL MAP · ${AthleteDemoCatalog.MODE_LABEL}"
                } else {
                    "MARKETPLACE MAP"
                },
            )
            EliteSysLabel(copy.sysLabel)
            Text(
                "Route · ${"%.1f".format(preview.distanceKm.value)} km · ${preview.durationMin.value} min",
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                "HR ${preview.heartRateBpm.value} bpm · Pace ${preview.paceLabel.value} · Markers $markerCount · not live GPS",
                style = MaterialTheme.typography.bodySmall,
                color = EliteSurfaceColors.CHART_AXIS.toColor(),
                modifier = Modifier.testTag("discover_map_provenance"),
            )
        }
    }
}
