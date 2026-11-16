package ug.tutorug.api.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import ug.tutorug.api.domain.User;
import ug.tutorug.api.error.ApiException;
import ug.tutorug.api.repository.UserRepository;

/** Resolves the authenticated user from the security context. */
@Component
public class CurrentUser {

    private final UserRepository userRepository;

    public CurrentUser(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String requireUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw ApiException.unauthorized("Your session has expired. Please sign in again.");
        }
        Object principal = authentication.getPrincipal();
        if (principal == null || "anonymousUser".equals(principal)) {
            throw ApiException.unauthorized("Your session has expired. Please sign in again.");
        }
        return principal.toString();
    }

    public User requireUser() {
        String userId = requireUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized(
                        "Your session has expired. Please sign in again."));
    }
}
