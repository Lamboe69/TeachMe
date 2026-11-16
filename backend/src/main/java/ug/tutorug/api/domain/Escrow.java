package ug.tutorug.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * The money TutorUG holds for a booked session. One row per session, keyed by
 * the session id.
 */
@Entity
@Table(name = "escrows")
public class Escrow {

    @Id
    private String sessionId;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String tutorId;

    @Column(nullable = false)
    private long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EscrowStatus status = EscrowStatus.HELD;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getTutorId() {
        return tutorId;
    }

    public void setTutorId(String tutorId) {
        this.tutorId = tutorId;
    }

    public long getAmount() {
        return amount;
    }

    public void setAmount(long amount) {
        this.amount = amount;
    }

    public EscrowStatus getStatus() {
        return status;
    }

    public void setStatus(EscrowStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
