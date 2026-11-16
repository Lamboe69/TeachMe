package ug.tutorug.api.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.tutorug.api.domain.SessionStatus;
import ug.tutorug.api.domain.TutoringSession;

public interface SessionRepository extends JpaRepository<TutoringSession, String> {

    List<TutoringSession> findByStudent_IdOrTutor_Id(String studentId, String tutorId);

    List<TutoringSession> findByTutor_IdAndStudent_IdAndStatus(
            String tutorId, String studentId, SessionStatus status);

    long countByTutor_IdAndStatus(String tutorId, SessionStatus status);
}
