package ug.tutorug.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import ug.tutorug.api.domain.MobileNetwork;

public record MobileMoneyRequest(
        @NotNull(message = "Enter an amount.") Double amount,
        @NotBlank(message = "Enter your mobile money number.") String phone,
        @NotNull(message = "Choose a mobile money network.") MobileNetwork network) {
}
