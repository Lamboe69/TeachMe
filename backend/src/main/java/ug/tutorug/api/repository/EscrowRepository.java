package ug.tutorug.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ug.tutorug.api.domain.Escrow;

public interface EscrowRepository extends JpaRepository<Escrow, String> {
}
