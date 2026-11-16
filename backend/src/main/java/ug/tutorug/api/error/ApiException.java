package ug.tutorug.api.error;

import java.util.Collections;
import java.util.Map;

/**
 * A user-safe error raised by the service layer. The message is written to be
 * shown directly in the UI; it never contains stack traces or internals.
 */
public class ApiException extends RuntimeException {

    private final int status;
    private final Map<String, String> fieldErrors;

    public ApiException(int status, String message) {
        this(status, message, Collections.emptyMap());
    }

    public ApiException(int status, String message, Map<String, String> fieldErrors) {
        super(message);
        this.status = status;
        this.fieldErrors = fieldErrors == null ? Collections.emptyMap() : fieldErrors;
    }

    public int getStatus() {
        return status;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public static ApiException badRequest(String message) {
        return new ApiException(400, message);
    }

    public static ApiException badRequest(String message, String field, String fieldMessage) {
        return new ApiException(400, message, Map.of(field, fieldMessage));
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(401, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(403, message);
    }

    public static ApiException notFound(String message) {
        return new ApiException(404, message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(409, message);
    }
}
