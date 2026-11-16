package ug.tutorug.api.dto.response;

import ug.tutorug.api.domain.SessionMessage;

public record MessageResponse(
        String id,
        String sessionId,
        String senderId,
        String senderName,
        String body,
        String createdAt) {

    public static MessageResponse from(SessionMessage message) {
        return new MessageResponse(
                message.getId(),
                message.getSession().getId(),
                message.getSenderId(),
                message.getSenderName(),
                message.getBody(),
                message.getCreatedAt() == null ? null : message.getCreatedAt().toString());
    }
}
