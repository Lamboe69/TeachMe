package ug.tutorug.api.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;
import ug.tutorug.api.domain.AvailabilitySlot;
import ug.tutorug.api.domain.Review;
import ug.tutorug.api.domain.TutorProfile;
import ug.tutorug.api.domain.TutoringSession;
import ug.tutorug.api.domain.User;
import ug.tutorug.api.dto.response.AvailabilityResponse;
import ug.tutorug.api.dto.response.ReviewResponse;
import ug.tutorug.api.dto.response.SessionResponse;
import ug.tutorug.api.dto.response.TutorResponse;
import ug.tutorug.api.dto.response.UserResponse;

/** Converts domain entities into the response DTOs the frontend consumes. */
@Component
public class DtoMapper {

    public UserResponse toUser(User user) {
        return UserResponse.from(user);
    }

    public TutorResponse toTutor(User tutor, List<Review> reviews) {
        TutorProfile profile = tutor.getTutorProfile();

        List<String> subjects = profile == null ? List.of() : new ArrayList<>(profile.getSubjects());

        List<AvailabilityResponse> availability = List.of();
        if (profile != null) {
            availability = profile.getAvailability().stream()
                    .map(this::toAvailability)
                    .toList();
        }

        List<ReviewResponse> reviewDtos = reviews == null
                ? List.of()
                : reviews.stream().map(ReviewResponse::from).toList();

        return new TutorResponse(
                tutor.getId(),
                tutor.getFullName(),
                tutor.getEmail(),
                subjects,
                tutor.getBio(),
                profile == null ? 0L : profile.getHourlyRate(),
                profile == null ? null : profile.getRating(),
                profile == null ? 0 : profile.getReviewCount(),
                profile == null ? 0 : profile.getSessionCount(),
                profile == null ? null : profile.getYearsExperience(),
                profile == null ? null : profile.getLocation(),
                tutor.getAvatarUrl(),
                availability,
                reviewDtos);
    }

    public AvailabilityResponse toAvailability(AvailabilitySlot slot) {
        return new AvailabilityResponse(
                slot.getDay(),
                slot.isEnabled(),
                slot.getStart(),
                slot.getEnd(),
                new ArrayList<>(slot.getSlots()));
    }

    public SessionResponse toSession(TutoringSession session) {
        return SessionResponse.from(
                session,
                toTutor(session.getTutor(), List.of()),
                UserResponse.from(session.getStudent()));
    }
}
