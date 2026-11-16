package ug.tutorug.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/** A single chat message exchanged between the two parties of a session. */
@Entity
@Table(name = "session_messages")
public class SessionMessage {

    @Id
    private String id;

    @PrePersist
    void assignId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private TutoringSession session;

    @Column(nullable = false)
    private String senderId;

    @Column(nullable = false)
    private String senderName;

    @Column(length = 1000, nullable = false)
    private String body;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public TutoringSession getSession() {
        return session;
    }

    public void setSession(TutoringSession session) {
        this.session = session;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
