package ug.tutorug.api.dto.response;

import ug.tutorug.api.domain.Wallet;

public record WalletResponse(
        String userId,
        long availableBalance,
        long escrowBalance,
        String currency,
        String updatedAt) {

    public static WalletResponse from(Wallet wallet) {
        return new WalletResponse(
                wallet.getUser() == null ? wallet.getId() : wallet.getUser().getId(),
                wallet.getAvailableBalance(),
                wallet.getEscrowBalance(),
                wallet.getCurrency(),
                wallet.getUpdatedAt() == null ? null : wallet.getUpdatedAt().toString());
    }
}
