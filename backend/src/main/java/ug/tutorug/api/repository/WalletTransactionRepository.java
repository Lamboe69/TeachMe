package ug.tutorug.api.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.tutorug.api.domain.WalletTransaction;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, String> {

    List<WalletTransaction> findByUser_IdOrderByCreatedAtDesc(String userId);
}
