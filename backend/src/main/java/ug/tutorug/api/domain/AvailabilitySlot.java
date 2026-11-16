package ug.tutorug.api.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * One weekly teaching window for a tutor. When {@code slots} is empty the
 * window expands to hourly start times between {@code start} and {@code end};
 * otherwise {@code slots} lists the exact bookable start times.
 */
@Entity
@Table(name = "availability_slots")
public class AvailabilitySlot {

    @Id
    private String id;

    @PrePersist
    void assignId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id")
    private TutorProfile tutorProfile;

    @Column(name = "weekday", nullable = false)
    private String day;

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "start_time")
    private String start;

    @Column(name = "end_time")
    private String end;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "availability_slot_times", joinColumns = @JoinColumn(name = "slot_id"))
    @Column(name = "time_value")
    private List<String> slots = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public TutorProfile getTutorProfile() {
        return tutorProfile;
    }

    public void setTutorProfile(TutorProfile tutorProfile) {
        this.tutorProfile = tutorProfile;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getStart() {
        return start;
    }

    public void setStart(String start) {
        this.start = start;
    }

    public String getEnd() {
        return end;
    }

    public void setEnd(String end) {
        this.end = end;
    }

    public List<String> getSlots() {
        return slots;
    }

    public void setSlots(List<String> slots) {
        this.slots = slots;
    }
}
