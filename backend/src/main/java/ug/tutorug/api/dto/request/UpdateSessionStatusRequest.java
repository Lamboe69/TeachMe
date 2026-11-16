package ug.tutorug.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateSessionStatusRequest(
        @NotBlank(message = "Choose a session status.") String status,
        @Size(max = 2000, message = "Keep the reason under 2000 characters.") String reason) {
}
