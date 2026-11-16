package ug.tutorug.api.dto.response;

import java.time.format.DateTimeFormatter;
import ug.tutorug.api.domain.SessionStatus;
import ug.tutorug.api.domain.TutoringSession;

public record SessionResponse(
        String id,
        UserResponse student,
        TutorResponse tutor,
        String subject,
        String scheduledAt,
        Integer durationMinutes,
        SessionStatus status,
        String message,
        Long fee,
        String notes,
        String studentConfirmedAt,
        String tutorConfirmedAt,
        boolean hasReview,
        String reviewId,
        String createdAt,
        String updatedAt) {

    public static SessionResponse from(
            TutoringSession session, TutorResponse tutor, UserResponse student) {
        return new SessionResponse(
                session.getId(),
                student,
                tutor,
                session.getSubject(),
                session.getScheduledAt() == null
                        ? null
                        : session.getScheduledAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                session.getDurationMinutes(),
                session.getStatus(),
                session.getMessage(),
                session.getFee(),
                session.getNotes(),
                session.getStudentConfirmedAt() == null
                        ? null
                        : session.getStudentConfirmedAt().toString(),
                session.getTutorConfirmedAt() == null
                        ? null
                        : session.getTutorConfirmedAt().toString(),
                session.isHasReview(),
                session.getReviewId(),
                session.getCreatedAt() == null ? null : session.getCreatedAt().toString(),
                session.getUpdatedAt() == null ? null : session.getUpdatedAt().toString());
    }
}
