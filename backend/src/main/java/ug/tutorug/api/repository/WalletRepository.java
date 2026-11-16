package ug.tutorug.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ug.tutorug.api.domain.Wallet;

public interface WalletRepository extends JpaRepository<Wallet, String> {
}
