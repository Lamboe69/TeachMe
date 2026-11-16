package ug.tutorug.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ug.tutorug.api.domain.UserRole;

public record RegisterRequest(
        @NotBlank(message = "Enter your full name.")
        @Size(min = 2, max = 80, message = "Enter your full name.")
        String fullName,

        @NotBlank(message = "Enter your email address.")
        @Email(message = "Enter a valid email address.")
        String email,

        @NotBlank(message = "Choose a password.")
        @Size(min = 8, max = 72, message = "Use at least 8 characters.")
        String password,

        @NotNull(message = "Choose whether you are joining as a student or a tutor.")
        UserRole role) {
}
