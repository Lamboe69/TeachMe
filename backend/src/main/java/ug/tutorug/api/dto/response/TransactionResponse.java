package ug.tutorug.api.dto.response;

import ug.tutorug.api.domain.WalletTransaction;
import ug.tutorug.api.domain.WalletTransactionType;

public record TransactionResponse(
        String id,
        String userId,
        WalletTransactionType type,
        long amount,
        long balanceAfter,
        String sessionId,
        String description,
        String reference,
        String createdAt) {

    public static TransactionResponse from(WalletTransaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getUser().getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getBalanceAfter(),
                transaction.getSessionId(),
                transaction.getDescription(),
                transaction.getReference(),
                transaction.getCreatedAt() == null ? null : transaction.getCreatedAt().toString());
    }
}
