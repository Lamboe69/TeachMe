package ug.tutorug.api.error;

import java.time.Instant;
import java.util.Map;

/**
 * Error body returned by {@link GlobalExceptionHandler}. The frontend reads
 * {@code message} and {@code fieldErrors}, so those keys are stable.
 */
public record ErrorResponse(
        int status,
        String message,
        Map<String, String> fieldErrors,
        Instant timestamp) {

    public static ErrorResponse of(int status, String message, Map<String, String> fieldErrors) {
        return new ErrorResponse(status, message, fieldErrors, Instant.now());
    }
}
