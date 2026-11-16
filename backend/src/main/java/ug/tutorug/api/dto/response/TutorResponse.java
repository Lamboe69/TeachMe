package ug.tutorug.api.dto.response;

import java.util.List;

/**
 * Tutor view. Used for both the directory (with an empty {@code reviews} list)
 * and the profile page (with reviews embedded).
 */
public record TutorResponse(
        String id,
        String fullName,
        String email,
        List<String> subjects,
        String bio,
        long hourlyRate,
        Double rating,
        int reviewCount,
        int sessionCount,
        Integer yearsExperience,
        String location,
        String avatarUrl,
        List<AvailabilityResponse> availability,
        List<ReviewResponse> reviews) {
}
