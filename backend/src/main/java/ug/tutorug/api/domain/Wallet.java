package ug.tutorug.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * A user's money. {@code availableBalance} can be spent or withdrawn;
 * {@code escrowBalance} is held by TutorUG for sessions that are not finished.
 */
@Entity
@Table(name = "wallets")
public class Wallet {

    @Id
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Column(nullable = false)
    private long availableBalance;

    @Column(nullable = false)
    private long escrowBalance;

    @Column(nullable = false, length = 3)
    private String currency = "UGX";

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public long getAvailableBalance() {
        return availableBalance;
    }

    public void setAvailableBalance(long availableBalance) {
        this.availableBalance = availableBalance;
    }

    public long getEscrowBalance() {
        return escrowBalance;
    }

    public void setEscrowBalance(long escrowBalance) {
        this.escrowBalance = escrowBalance;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
