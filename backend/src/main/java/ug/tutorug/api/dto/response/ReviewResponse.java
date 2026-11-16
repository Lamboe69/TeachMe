package ug.tutorug.api.dto.response;

import ug.tutorug.api.domain.Review;

public record ReviewResponse(
        String id,
        String sessionId,
        String tutorId,
        String studentId,
        String studentName,
        int rating,
        String comment,
        String createdAt) {

    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getSession() == null ? null : review.getSession().getId(),
                review.getTutor().getId(),
                review.getStudent().getId(),
                review.getStudent().getFullName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt() == null ? null : review.getCreatedAt().toString());
    }
}
