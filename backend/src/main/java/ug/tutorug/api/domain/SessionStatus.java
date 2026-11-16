package ug.tutorug.api.domain;

/**
 * Lifecycle of a tutoring session.
 *
 * <p>{@code REQUESTED -> ACCEPTED -> COMPLETED}, with {@code CANCELLED} and
 * {@code REJECTED} as terminal outcomes. The backend is the authority on which
 * transitions are allowed (see {@code SessionService}).
 */
public enum SessionStatus {
    REQUESTED,
    ACCEPTED,
    COMPLETED,
    CANCELLED,
    REJECTED
}
