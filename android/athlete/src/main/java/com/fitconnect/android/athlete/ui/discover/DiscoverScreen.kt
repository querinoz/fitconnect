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
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.demo.AthleteContentResolver
import com.fitconnect.android.athlete.demo.AthleteDemoBanner
import com.fitconnect.android.athlete.demo.AthleteDemoCatalog
import com.fitconnect.android.athlete.domain.CoachCard
import com.fitconnect.android.athlete.domain.DiscoverMapPreviewUi
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteAvatar
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteMarketplaceCard
import com.fitconnect.android.designui.components.EliteSectionHeader
import com.fitconnect.android.designui.components.EliteSwitch
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.geo.booking.BookingRequest
import com.fitconnect.android.geo.catalog.PlacesCatalog
import com.fitconnect.android.geo.domain.BookingLifecycle
import com.fitconnect.android.geo.domain.BookingTargetKind
import com.fitconnect.android.geo.domain.MapStyleKind
import com.fitconnect.android.geo.domain.SessionMode
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
    var specialty by remember { mutableStateOf("") }
    var language by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var verifiedOnly by remember { mutableStateOf(false) }
    var result by remember { mutableStateOf<AppResult<List<CoachCard>>?>(null) }
    var markers by remember { mutableStateOf<List<MapMarker>>(emptyList()) }
    var selectedCoach by remember { mutableStateOf<CoachCard?>(null) }
    var bookingDraft by remember { mutableStateOf<BookingDraft?>(null) }
    var lastBookingId by remember { mutableStateOf<String?>(null) }
    var statusMessage by remember { mutableStateOf<String?>(null) }

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

    LaunchedEffect(specialty, language, verifiedOnly) {
        container.platform.analytics.screen("athlete_discover")
        val anchor = PlacesCatalog.defaultDevAnchor()
        reload()
    }

    LaunchedEffect(result) {
        val coaches = (result as? AppResult.Ok)?.value.orEmpty()
        val anchor = PlacesCatalog.defaultDevAnchor()
        val coachMarkers = buildList {
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
        markers = coachMarkers
        val controller = container.geo.maps.preferredProvider().createController()
        controller.render(
            MapScene(
                style = MapStyleKind.DARK,
                camera = MapCamera(anchor, 12.0),
                markers = coachMarkers,
                livePosition = anchor,
            ),
        )
    }

    AthleteLoad(result, ::reload) { coaches ->
        val filtered = coaches.filter { coach ->
            city.isBlank() || coach.city.contains(city, ignoreCase = true)
        }
        AthleteScreenScaffold(
            title = "Analysis · Coach marketplace",
            subtitle = "Discover coaches · ${DemoPersona.MODE_LABEL}",
            overline = "ATHLETE OS · ANALYSIS",
            testTag = "athlete_discover",
        ) {
            item {
                AthleteDemoBanner(visible = true, modifier = Modifier.testTag("discover_demo_banner"))
            }
            item {
                val route = container.geo.routes.all().firstOrNull()
                val mapUi = AthleteContentResolver.discoverMapPreview(
                    routeDistanceKm = route?.distanceKm,
                    routeDurationMin = route?.estimatedMinutes,
                )
                LocalMapPreview(
                    preview = mapUi,
                    markerCount = markers.size.coerceAtLeast(2),
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
                        onDay = { bookingDraft = draft.copy(dayOffset = it) },
                        onHour = { bookingDraft = draft.copy(hour = it) },
                        onDismiss = { bookingDraft = null },
                        onConfirm = {
                            scope.launch {
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
                                val created = container.geo.booking.create(
                                    BookingRequest(
                                        targetKind = BookingTargetKind.COACH,
                                        targetId = draft.coach.id,
                                        clientId = LocalAthleteRepository.ATHLETE_ID,
                                        clientName = AthleteDemoCatalog.DEMO_ATHLETE_DISPLAY_NAME,
                                        startEpochMs = start,
                                        durationMin = draft.durationMin,
                                        mode = SessionMode.PRIVATE,
                                        notes = "LOCAL_DEMO booking",
                                        autoConfirm = true,
                                    ),
                                )
                                when (created) {
                                    is AppResult.Ok -> {
                                        lastBookingId = created.value.id
                                        statusMessage = "Booked ${created.value.status} · ${created.value.id}"
                                        bookingDraft = null
                                        selectedCoach = null
                                    }
                                    is AppResult.Err -> statusMessage = "Booking failed — try another slot"
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
                        onClose = { selectedCoach = null },
                        onBook = { bookingDraft = BookingDraft(coach) },
                        onMessage = {
                            statusMessage = "Message queued (LOCAL_DEMO) → ${coach.name}"
                        },
                    )
                }
            }

            if (filtered.isEmpty()) {
                item {
                    EliteCard {
                        Text("No coaches match these filters", style = MaterialTheme.typography.bodyLarge)
                    }
                }
            } else {
                items(filtered, key = { it.id }) { coach ->
                    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
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
                        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                            EliteButton(
                                label = "View profile",
                                variant = EliteButtonVariant.Ghost,
                                onClick = { selectedCoach = coach },
                            )
                            EliteButton(
                                label = "Book intro",
                                variant = EliteButtonVariant.Secondary,
                                enabled = coach.available,
                                onClick = { bookingDraft = BookingDraft(coach) },
                            )
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
            EliteButton(label = "Book intro", enabled = coach.available, onClick = onBook)
            EliteButton(label = "Message", variant = EliteButtonVariant.Secondary, onClick = onMessage)
            EliteButton(label = "Close", variant = EliteButtonVariant.Ghost, onClick = onClose)
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
            EliteButton(label = "Confirm booking", onClick = onConfirm)
            EliteButton(label = "Cancel", variant = EliteButtonVariant.Ghost, onClick = onDismiss)
        }
    }
}

@Composable
private fun LocalMapPreview(
    preview: DiscoverMapPreviewUi,
    markerCount: Int,
) {
    val floor = MaterialTheme.colorScheme.background
    val elevated = MaterialTheme.colorScheme.surface
    val volt = MaterialTheme.colorScheme.primary
    val teal = MaterialTheme.colorScheme.secondary
    val alert = MaterialTheme.colorScheme.error
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
            .background(elevated, RoundedCornerShape(EliteRadius.Lg))
            .testTag("athlete_map_panel"),
    ) {
        Canvas(modifier = Modifier.fillMaxWidth().height(200.dp)) {
            drawRect(floor)
            val step = size.width / 8f
            for (i in 1 until 8) {
                drawLine(elevated.copy(alpha = 0.6f), Offset(step * i, 0f), Offset(step * i, size.height), 2f)
                drawLine(elevated.copy(alpha = 0.6f), Offset(0f, step * i * 0.5f), Offset(size.width, step * i * 0.5f), 2f)
            }
            // Deterministic LOCAL_DEMO activity path (not live GPS)
            val path = listOf(
                Offset(size.width * 0.18f, size.height * 0.72f),
                Offset(size.width * 0.32f, size.height * 0.55f),
                Offset(size.width * 0.48f, size.height * 0.58f),
                Offset(size.width * 0.62f, size.height * 0.42f),
                Offset(size.width * 0.78f, size.height * 0.38f),
            )
            for (i in 0 until path.lastIndex) {
                drawLine(volt.copy(alpha = 0.85f), path[i], path[i + 1], strokeWidth = 5f)
            }
            // Zone bands (demo)
            drawCircle(alert.copy(alpha = 0.25f), radius = 28f, center = path[2])
            drawCircle(teal.copy(alpha = 0.3f), radius = 22f, center = path[3])
            drawCircle(volt, radius = 10f, center = path.last())
            drawCircle(teal, radius = 8f, center = path.first())
        }
        Column(modifier = Modifier.padding(EliteSpace.Md)) {
            EliteBadge(text = "LOCAL MAP · ${AthleteDemoCatalog.MODE_LABEL}")
            EliteSysLabel("GPS · DEMO INSTRUMENT")
            Text(
                "Route · ${"%.1f".format(preview.distanceKm.value)} km · ${preview.durationMin.value} min",
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                "HR ${preview.heartRateBpm.value} bpm · Pace ${preview.paceLabel.value} · Markers $markerCount · not live GPS",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.testTag("discover_map_provenance"),
            )
        }
    }
}
