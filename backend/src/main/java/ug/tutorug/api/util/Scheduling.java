package ug.tutorug.api.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import ug.tutorug.api.domain.AvailabilitySlot;

/**
 * Pure helpers for availability and wall-clock scheduling. Mirrors the
 * frontend's {@code src/utils/availability.ts} so booking rules agree on both
 * sides.
 */
public final class Scheduling {

    private Scheduling() {
    }

    private static int toMinutes(String time) {
        if (time == null || !time.contains(":")) return 0;
        String[] parts = time.split(":");
        int hours = parts.length > 0 ? parse(parts[0]) : 0;
        int minutes = parts.length > 1 ? parse(parts[1]) : 0;
        return hours * 60 + minutes;
    }

    private static int parse(String value) {
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private static String toTime(int minutes) {
        return String.format("%02d:%02d", minutes / 60, minutes % 60);
    }

    /** Bookable start times for one availability entry. */
    public static List<String> expand(AvailabilitySlot slot) {
        if (slot == null || !slot.isEnabled()) return List.of();
        if (slot.getSlots() != null && !slot.getSlots().isEmpty()) {
            return slot.getSlots().stream().distinct().sorted().toList();
        }
        int start = toMinutes(slot.getStart());
        int end = toMinutes(slot.getEnd());
        List<String> times = new ArrayList<>();
        for (int current = start; current < end; current += 60) {
            times.add(toTime(current));
        }
        return times;
    }

    /** Every bookable start time for a given weekday. */
    public static List<String> forDay(List<AvailabilitySlot> availability, String day) {
        if (availability == null || availability.isEmpty()) return List.of();
        return availability.stream()
                .filter(slot -> day.equals(slot.getDay()))
                .flatMap(slot -> expand(slot).stream())
                .sorted()
                .toList();
    }

    /** English weekday name (Monday, Tuesday, ...) for a date. */
    public static String weekdayForDate(LocalDate date) {
        return date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
    }

    /** HH:mm for the wall-clock time of a date-time. */
    public static String timeOf(LocalDateTime dateTime) {
        return String.format("%02d:%02d", dateTime.getHour(), dateTime.getMinute());
    }

    /**
     * Parses the wall-clock string the booking form sends
     * ({@code 2026-06-10T10:00:00}), tolerating a trailing offset or {@code Z}.
     * Returns {@code null} when the value cannot be understood.
     */
    public static LocalDateTime parseScheduledAt(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String value = raw.trim();
        try {
            return LocalDateTime.parse(value);
        } catch (RuntimeException ignored) {
            // fall through
        }
        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (RuntimeException ignored) {
            // fall through
        }
        try {
            return Instant.parse(value).atZone(ZoneOffset.UTC).toLocalDateTime();
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
