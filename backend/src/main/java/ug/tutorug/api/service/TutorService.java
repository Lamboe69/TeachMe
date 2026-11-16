package ug.tutorug.api.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.tutorug.api.domain.Review;
import ug.tutorug.api.domain.TutorProfile;
import ug.tutorug.api.domain.User;
import ug.tutorug.api.domain.UserRole;
import ug.tutorug.api.dto.response.PageResponse;
import ug.tutorug.api.dto.response.ReviewResponse;
import ug.tutorug.api.dto.response.TutorResponse;
import ug.tutorug.api.error.ApiException;
import ug.tutorug.api.repository.ReviewRepository;
import ug.tutorug.api.repository.TutorProfileRepository;
import ug.tutorug.api.repository.UserRepository;

@Service
public class TutorService {

    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final DtoMapper dtoMapper;

    public TutorService(
            TutorProfileRepository tutorProfileRepository,
            UserRepository userRepository,
            ReviewRepository reviewRepository,
            DtoMapper dtoMapper) {
        this.tutorProfileRepository = tutorProfileRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.dtoMapper = dtoMapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<TutorResponse> list(
            String search, String subject, Double minRating, Long maxRate, Integer page, Integer size) {

        List<TutorResponse> all = new ArrayList<>();
        for (TutorProfile profile : tutorProfileRepository.findAll()) {
            User user = profile.getUser();
            if (user == null || user.getRole() != UserRole.TUTOR) continue;
            TutorResponse dto = dtoMapper.toTutor(user, List.of());
            if (matches(dto, search, subject, minRating, maxRate)) {
                all.add(dto);
            }
        }

        all.sort(Comparator
                .comparing((TutorResponse t) -> t.rating() == null ? 0.0 : t.rating())
                .reversed()
                .thenComparing(TutorResponse::fullName, String.CASE_INSENSITIVE_ORDER));

        int pageNumber = page == null || page < 0 ? 0 : page;
        int pageSize = size == null || size <= 0 ? Math.max(all.size(), 1) : size;

        int from = Math.min(pageNumber * pageSize, all.size());
        int to = Math.min(from + pageSize, all.size());
        List<TutorResponse> content = all.subList(from, to);

        int totalPages = all.isEmpty() ? 0 : (int) Math.ceil(all.size() / (double) pageSize);
        return new PageResponse<>(content, all.size(), totalPages, pageNumber, pageSize);
    }

    @Transactional(readOnly = true)
    public TutorResponse get(String id) {
        User user = userRepository.findById(id)
                .filter(u -> u.getRole() == UserRole.TUTOR)
                .orElseThrow(() -> ApiException.notFound(
                        "We could not find that tutor. They may no longer be on Tutor UG."));
        List<Review> reviews = reviewRepository.findByTutor_IdOrderByCreatedAtDesc(id);
        return dtoMapper.toTutor(user, reviews);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviews(String tutorId) {
        if (!userRepository.existsById(tutorId)) {
            throw ApiException.notFound("We could not find that tutor.");
        }
        return reviewRepository.findByTutor_IdOrderByCreatedAtDesc(tutorId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getSubjects() {
        Set<String> subjects = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        for (TutorProfile profile : tutorProfileRepository.findAll()) {
            subjects.addAll(profile.getSubjects());
        }
        return new ArrayList<>(subjects);
    }

    private boolean matches(
            TutorResponse tutor, String search, String subject, Double minRating, Long maxRate) {

        if (search != null && !search.isBlank()) {
            String needle = search.trim().toLowerCase(Locale.ROOT);
            String haystack = String.join(" ",
                    tutor.fullName() == null ? "" : tutor.fullName(),
                    tutor.bio() == null ? "" : tutor.bio(),
                    String.join(" ", tutor.subjects()),
                    tutor.location() == null ? "" : tutor.location())
                    .toLowerCase(Locale.ROOT);
            if (!haystack.contains(needle)) return false;
        }

        if (subject != null && !subject.isBlank()) {
            String wanted = subject.trim().toLowerCase(Locale.ROOT);
            boolean hasSubject = tutor.subjects().stream()
                    .anyMatch(s -> s.toLowerCase(Locale.ROOT).equals(wanted));
            if (!hasSubject) return false;
        }

        if (minRating != null && (tutor.rating() == null ? 0.0 : tutor.rating()) < minRating) {
            return false;
        }

        if (maxRate != null && tutor.hourlyRate() > maxRate) {
            return false;
        }

        return true;
    }
}
