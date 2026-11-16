package ug.tutorug.api.dto.response;

public record AvailabilityResponse(
        String day,
        boolean enabled,
        String start,
        String end,
        java.util.List<String> slots) {
}
