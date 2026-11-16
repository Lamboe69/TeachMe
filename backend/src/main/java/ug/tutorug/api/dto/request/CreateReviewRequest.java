package ug.tutorug.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReviewRequest(
        @NotNull(message = "Choose a rating between 1 and 5 stars.")
        @Min(value = 1, message = "Choose a rating between 1 and 5 stars.")
        @Max(value = 5, message = "Choose a rating between 1 and 5 stars.")
        Integer rating,

        @NotBlank(message = "Please write a short review.")
        @Size(max = 1000, message = "Reviews can be at most 1000 characters long.")
        String comment) {
}
