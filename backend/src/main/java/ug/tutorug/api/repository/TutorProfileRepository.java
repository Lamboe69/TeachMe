package ug.tutorug.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ug.tutorug.api.domain.TutorProfile;

public interface TutorProfileRepository extends JpaRepository<TutorProfile, String> {
}
