package ug.tutorug.api.dto.response;

import ug.tutorug.api.domain.UserRole;

/**
 * Login / registration result. The frontend accepts the token under
 * {@code token} and the user under {@code user}.
 */
public record AuthResponse(
        String token,
        String tokenType,
        String userId,
        UserRole role,
        UserResponse user) {
}
