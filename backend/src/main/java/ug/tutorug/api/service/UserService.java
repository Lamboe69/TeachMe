package ug.tutorug.api.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.tutorug.api.domain.AvailabilitySlot;
import ug.tutorug.api.domain.TutorProfile;
import ug.tutorug.api.domain.User;
import ug.tutorug.api.domain.UserRole;
import ug.tutorug.api.dto.request.UpdateProfileRequest;
import ug.tutorug.api.dto.response.UserResponse;
import ug.tutorug.api.repository.TutorProfileRepository;
import ug.tutorug.api.repository.UserRepository;
import ug.tutorug.api.security.CurrentUser;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final CurrentUser currentUser;

    public UserService(
            UserRepository userRepository,
            TutorProfileRepository tutorProfileRepository,
            CurrentUser currentUser) {
        this.userRepository = userRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public UserResponse getMe() {
        return UserResponse.from(currentUser.requireUser());
    }

    @Transactional
    public UserResponse updateMe(UpdateProfileRequest request) {
        User user = currentUser.requireUser();

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.phone() != null) {
            user.setPhone(blankToNull(request.phone()));
        }
        if (request.bio() != null) {
            user.setBio(blankToNull(request.bio()));
        }
        userRepository.save(user);

        if (user.getRole() == UserRole.TUTOR) {
            updateTutorProfile(user, request);
        }

        return UserResponse.from(user);
    }

    private void updateTutorProfile(User user, UpdateProfileRequest request) {
        TutorProfile profile = user.getTutorProfile();
        if (profile == null) {
            profile = new TutorProfile();
            profile.setUser(user);
            user.setTutorProfile(profile);
        }

        if (request.subjects() != null) {
            profile.getSubjects().clear();
            request.subjects().stream()
                    .map(String::trim)
                    .filter(subject -> !subject.isEmpty())
                    .forEach(profile.getSubjects()::add);
        }
        if (request.hourlyRate() != null) {
            profile.setHourlyRate(Math.max(0, Math.round(request.hourlyRate())));
        }
        if (request.location() != null) {
            profile.setLocation(blankToNull(request.location()));
        }
        if (request.yearsExperience() != null) {
            profile.setYearsExperience(request.yearsExperience());
        }
        if (request.availability() != null) {
            profile.getAvailability().clear();
            List<AvailabilitySlot> slots = new ArrayList<>();
            for (UpdateProfileRequest.AvailabilitySlotRequest slotRequest : request.availability()) {
                AvailabilitySlot slot = new AvailabilitySlot();
                slot.setTutorProfile(profile);
                slot.setDay(slotRequest.day());
                slot.setEnabled(Boolean.TRUE.equals(slotRequest.enabled()));
                slot.setStart(slotRequest.start());
                slot.setEnd(slotRequest.end());
                if (slotRequest.slots() != null) {
                    slot.setSlots(new ArrayList<>(slotRequest.slots()));
                }
                slots.add(slot);
            }
            profile.getAvailability().addAll(slots);
        }

        tutorProfileRepository.save(profile);
    }

    private String blankToNull(String value) {
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
