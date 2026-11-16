package ug.tutorug.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sessions")
public class TutoringSession {

    @Id
    private String id;

    @PrePersist
    void assignId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @Column(nullable = false)
    private String subject;

    /**
     * Wall-clock start of the session. Stored without a zone so the value the
     * student picked in their browser is returned unchanged (the UI slices the
     * ISO string for the date and time).
     */
    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionStatus status = SessionStatus.REQUESTED;

    @Column(length = 2000)
    private String message;

    private Long fee;

    @Column(length = 2000)
    private String notes;

    private Instant studentConfirmedAt;

    private Instant tutorConfirmedAt;

    @Column(nullable = false)
    private boolean hasReview;

    private String reviewId;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public User getTutor() {
        return tutor;
    }

    public void setTutor(User tutor) {
        this.tutor = tutor;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getFee() {
        return fee;
    }

    public void setFee(Long fee) {
        this.fee = fee;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getStudentConfirmedAt() {
        return studentConfirmedAt;
    }

    public void setStudentConfirmedAt(Instant studentConfirmedAt) {
        this.studentConfirmedAt = studentConfirmedAt;
    }

    public Instant getTutorConfirmedAt() {
        return tutorConfirmedAt;
    }

    public void setTutorConfirmedAt(Instant tutorConfirmedAt) {
        this.tutorConfirmedAt = tutorConfirmedAt;
    }

    public boolean isHasReview() {
        return hasReview;
    }

    public void setHasReview(boolean hasReview) {
        this.hasReview = hasReview;
    }

    public String getReviewId() {
        return reviewId;
    }

    public void setReviewId(String reviewId) {
        this.reviewId = reviewId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
