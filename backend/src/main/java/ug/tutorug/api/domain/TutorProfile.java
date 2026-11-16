package ug.tutorug.api.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Tutor-specific profile data. Shares the primary key with {@link User}, so a
 * tutor is a {@code User} with {@code role = TUTOR} plus one of these rows.
 */
@Entity
@Table(name = "tutor_profiles")
public class TutorProfile {

    @Id
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tutor_subjects", joinColumns = @JoinColumn(name = "tutor_id"))
    @Column(name = "subject", nullable = false)
    private Set<String> subjects = new LinkedHashSet<>();

    @Column(nullable = false)
    private long hourlyRate;

    private String location;

    private Integer yearsExperience;

    private Double rating;

    @Column(nullable = false)
    private int reviewCount;

    @Column(nullable = false)
    private int sessionCount;

    @OneToMany(mappedBy = "tutorProfile", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.EAGER)
    @OrderColumn(name = "slot_order")
    private List<AvailabilitySlot> availability = new ArrayList<>();

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

    public Set<String> getSubjects() {
        return subjects;
    }

    public void setSubjects(Set<String> subjects) {
        this.subjects = subjects;
    }

    public long getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(long hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public void setYearsExperience(Integer yearsExperience) {
        this.yearsExperience = yearsExperience;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

    public int getSessionCount() {
        return sessionCount;
    }

    public void setSessionCount(int sessionCount) {
        this.sessionCount = sessionCount;
    }

    public List<AvailabilitySlot> getAvailability() {
        return availability;
    }

    public void setAvailability(List<AvailabilitySlot> availability) {
        this.availability = availability;
    }
}
