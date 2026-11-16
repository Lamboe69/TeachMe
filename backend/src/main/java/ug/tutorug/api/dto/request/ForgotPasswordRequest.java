package ug.tutorug.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Enter your email address.") String email) {
}
