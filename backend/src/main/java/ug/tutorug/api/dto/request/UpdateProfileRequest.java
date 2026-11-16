package ug.tutorug.api.dto.request;

import java.util.List;

/**
 * Partial profile update. A {@code null} field means "leave unchanged"; an
 * empty string clears a text field. Tutor-only fields are ignored for
 * students.
 */
public record UpdateProfileRequest(
        String fullName,
        String phone,
        String bio,
        List<String> subjects,
        Long hourlyRate,
        String location,
        Integer yearsExperience,
        List<AvailabilitySlotRequest> availability) {

    public record AvailabilitySlotRequest(
            String day,
            Boolean enabled,
            String start,
            String end,
            List<String> slots) {
    }
}
