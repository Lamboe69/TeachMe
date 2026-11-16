package ug.tutorug.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @NotBlank(message = "Write a message before sending.")
        @Size(max = 1000, message = "Keep messages under 1,000 characters.")
        String body) {
}
