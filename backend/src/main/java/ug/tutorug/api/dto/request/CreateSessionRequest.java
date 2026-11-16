package ug.tutorug.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSessionRequest(
        @NotBlank(message = "Choose a tutor to book with.") String tutorId,
        @NotBlank(message = "Choose the subject you want help with.") String subject,
        @NotBlank(message = "Choose a date and time for your session.") String scheduledAt,
        @Size(max = 500, message = "Keep your message under 500 characters.") String message,
        Integer durationMinutes) {
}
