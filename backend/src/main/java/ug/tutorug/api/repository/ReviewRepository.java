package ug.tutorug.api.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.tutorug.api.domain.Review;

public interface ReviewRepository extends JpaRepository<Review, String> {

    List<Review> findByTutor_IdOrderByCreatedAtDesc(String tutorId);

    Optional<Review> findBySession_Id(String sessionId);

    boolean existsBySession_Id(String sessionId);

    long countByTutor_Id(String tutorId);
}
