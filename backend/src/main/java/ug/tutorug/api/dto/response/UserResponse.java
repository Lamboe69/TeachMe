package ug.tutorug.api.dto.response;

import ug.tutorug.api.domain.User;
import ug.tutorug.api.domain.UserRole;

public record UserResponse(
        String id,
        String fullName,
        String email,
        UserRole role,
        String phone,
        String bio,
        String avatarUrl,
        String createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getPhone(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getCreatedAt() == null ? null : user.getCreatedAt().toString());
    }
}
