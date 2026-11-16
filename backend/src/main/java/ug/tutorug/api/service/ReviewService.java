package ug.tutorug.api.service;

import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.tutorug.api.domain.Review;
import ug.tutorug.api.domain.SessionStatus;
import ug.tutorug.api.domain.TutorProfile;
import ug.tutorug.api.domain.TutoringSession;
import ug.tutorug.api.domain.User;
import ug.tutorug.api.dto.request.CreateReviewRequest;
import ug.tutorug.api.dto.response.ReviewResponse;
import ug.tutorug.api.error.ApiException;
import ug.tutorug.api.repository.ReviewRepository;
import ug.tutorug.api.repository.SessionRepository;
import ug.tutorug.api.repository.TutorProfileRepository;
import ug.tutorug.api.security.CurrentUser;

@Service
public class ReviewService {

    private final SessionRepository sessionRepository;
    private final ReviewRepository reviewRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final CurrentUser currentUser;

    public ReviewService(
            SessionRepository sessionRepository,
            ReviewRepository reviewRepository,
            TutorProfileRepository tutorProfileRepository,
            CurrentUser currentUser) {
        this.sessionRepository = sessionRepository;
        this.reviewRepository = reviewRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.currentUser = currentUser;
    }

    @Transactional
    public ReviewResponse create(String sessionId, CreateReviewRequest request) {
        User student = currentUser.requireUser();

        TutoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> ApiException.notFound("We could not find that session."));

        if (!session.getStudent().getId().equals(student.getId())) {
            throw ApiException.forbidden(
                    "Only the student who attended this session can review it.");
        }
        if (session.getStatus() != SessionStatus.COMPLETED) {
            throw ApiException.conflict(
                    "You can only review a session once it has been completed.");
        }
        if (reviewRepository.existsBySession_Id(sessionId)) {
            throw ApiException.conflict("You have already reviewed this session.");
        }

        Review review = new Review();
        review.setSession(session);
        review.setTutor(session.getTutor());
        review.setStudent(student);
        review.setRating(request.rating());
        review.setComment(request.comment().trim());
        review.setCreatedAt(Instant.now());
        reviewRepository.save(review);

        session.setHasReview(true);
        session.setReviewId(review.getId());
        sessionRepository.save(session);

        updateTutorRating(session.getTutor());

        return ReviewResponse.from(review);
    }

    private void updateTutorRating(User tutor) {
        List<Review> reviews = reviewRepository.findByTutor_IdOrderByCreatedAtDesc(tutor.getId());
        TutorProfile profile = tutor.getTutorProfile();
        if (profile == null) return;
        profile.setReviewCount(reviews.size());
        double average = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        profile.setRating(Math.round(average * 10) / 10.0);
        tutorProfileRepository.save(profile);
    }
}
