package ug.tutorug.api.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.tutorug.api.domain.SessionMessage;

public interface SessionMessageRepository extends JpaRepository<SessionMessage, String> {

    List<SessionMessage> findBySession_IdOrderByCreatedAtAsc(String sessionId);
}
