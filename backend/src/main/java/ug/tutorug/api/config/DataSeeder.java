package ug.tutorug.api.config;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ug.tutorug.api.domain.AvailabilitySlot;
import ug.tutorug.api.domain.Review;
import ug.tutorug.api.domain.SessionStatus;
import ug.tutorug.api.domain.TutorProfile;
import ug.tutorug.api.domain.TutoringSession;
import ug.tutorug.api.domain.User;
import ug.tutorug.api.domain.UserRole;
import ug.tutorug.api.domain.Wallet;
import ug.tutorug.api.repository.ReviewRepository;
import ug.tutorug.api.repository.SessionRepository;
import ug.tutorug.api.repository.TutorProfileRepository;
import ug.tutorug.api.repository.UserRepository;
import ug.tutorug.api.repository.WalletRepository;
import ug.tutorug.api.service.WalletService;

/**
 * Seeds sample data so the app is usable the moment the API starts. Only runs
 * when the database is empty and {@code app.seed.enabled} is true.
 *
 * <p>Demo accounts (password {@code Demo1234}):
 * <ul>
 *   <li>Student — {@code mary.demo@tutorug.ug}</li>
 *   <li>Tutor — {@code sarah.demo@tutorug.ug}</li>
 * </ul>
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEMO_PASSWORD = "Demo1234";

    private final AppProperties properties;
    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final SessionRepository sessionRepository;
    private final ReviewRepository reviewRepository;
    private final WalletRepository walletRepository;
    private final WalletService walletService;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            AppProperties properties,
            UserRepository userRepository,
            TutorProfileRepository tutorProfileRepository,
            SessionRepository sessionRepository,
            ReviewRepository reviewRepository,
            WalletRepository walletRepository,
            WalletService walletService,
            PasswordEncoder passwordEncoder) {
        this.properties = properties;
        this.userRepository = userRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.sessionRepository = sessionRepository;
        this.reviewRepository = reviewRepository;
        this.walletRepository = walletRepository;
        this.walletService = walletService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!properties.getSeed().isEnabled() || userRepository.count() > 0) {
            return;
        }

        User mary = createUser("Mary Namutebi", "mary.demo@tutorug.ug", UserRole.STUDENT);

        User sarah = createTutor("Sarah Namutebi", "sarah.demo@tutorug.ug",
                List.of("Mathematics", "Physics"), 40_000, "Kampala", 6, 4.8);
        User brian = createTutor("Brian Odong", "brian.demo@tutorug.ug",
                List.of("Chemistry", "Biology"), 35_000, "Kampala", 4, 4.6);
        User grace = createTutor("Grace Nakimera", "grace.demo@tutorug.ug",
                List.of("English", "Literature"), 30_000, "Kampala", 5, 4.9);
        createTutor("Isaac Mugisha", "isaac.demo@tutorug.ug",
                List.of("Computer Science", "Mathematics"), 55_000, "Kampala", 8, 4.7);
        createTutor("Juliet Achieng", "juliet.demo@tutorug.ug",
                List.of("Economics", "Statistics"), 45_000, "Kampala", 3, 4.4);
        createTutor("Peter Wasswa", "peter.demo@tutorug.ug",
                List.of("Mathematics", "Chemistry"), 30_000, "Entebbe", 7, 4.5);

        Wallet maryWallet = walletService.getOrCreate(mary.getId());
        maryWallet.setAvailableBalance(500_000);
        walletRepository.save(maryWallet);

        LocalDateTime now = LocalDateTime.now();

        TutoringSession completed = createSession(mary, sarah, "Mathematics",
                now.minusDays(6).withHour(14).withMinute(0).withSecond(0).withNano(0),
                "Struggling with integration by parts.", 40_000, SessionStatus.ACCEPTED);
        completed.setStudentConfirmedAt(Instant.now().minusSeconds(60 * 60 * 24 * 6L));
        completed.setTutorConfirmedAt(Instant.now().minusSeconds(60 * 60 * 24 * 6L));
        completed.setStatus(SessionStatus.COMPLETED);
        sessionRepository.save(completed);
        walletService.holdSessionFunds(completed);
        walletService.releaseSessionEarnings(completed);

        Review review = new Review();
        review.setSession(completed);
        review.setTutor(sarah);
        review.setStudent(mary);
        review.setRating(5);
        review.setComment("Sarah explained integration by parts so clearly. Booked again!");
        review.setCreatedAt(Instant.now().minusSeconds(60 * 60 * 24 * 5L));
        reviewRepository.save(review);
        completed.setHasReview(true);
        completed.setReviewId(review.getId());
        sessionRepository.save(completed);

        TutorProfile sarahProfile = sarah.getTutorProfile();
        sarahProfile.setReviewCount(1);
        sarahProfile.setRating(5.0);
        sarahProfile.setSessionCount(1);
        tutorProfileRepository.save(sarahProfile);

        TutoringSession accepted = createSession(mary, brian, "Biology",
                now.plusDays(2).withHour(10).withMinute(0).withSecond(0).withNano(0),
                "Preparing for the end-of-term test on cell division.", 35_000,
                SessionStatus.ACCEPTED);
        walletService.holdSessionFunds(accepted);

        TutoringSession requested = createSession(mary, grace, "English",
                now.plusDays(3).withHour(12).withMinute(0).withSecond(0).withNano(0),
                "Would like help structuring my essay.", 30_000, SessionStatus.REQUESTED);
        walletService.holdSessionFunds(requested);

        log.info("Seeded Tutor UG demo data: {} users, {} sessions",
                userRepository.count(), sessionRepository.count());
    }

    private User createUser(String fullName, String email, UserRole role) {
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email.toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
        user.setRole(role);
        user.setPhone("+256 772 445 019");
        userRepository.save(user);
        walletService.getOrCreate(user.getId());
        return user;
    }

    private User createTutor(
            String fullName,
            String email,
            List<String> subjects,
            long hourlyRate,
            String location,
            int yearsExperience,
            double rating) {
        User user = createUser(fullName, email, UserRole.TUTOR);
        user.setBio(fullName.split(" ")[0]
                + " tutors " + String.join(" and ", subjects) + " in " + location + ".");
        userRepository.save(user);

        TutorProfile profile = new TutorProfile();
        profile.setUser(user);
        profile.getSubjects().addAll(subjects);
        profile.setHourlyRate(hourlyRate);
        profile.setLocation(location);
        profile.setYearsExperience(yearsExperience);
        profile.setRating(rating);
        profile.setReviewCount(0);
        profile.setSessionCount(0);

        for (DayOfWeek day : List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY)) {
            profile.getAvailability().add(slot(profile, day, "09:00", "17:00"));
        }
        profile.getAvailability().add(slot(profile, DayOfWeek.SATURDAY, "10:00", "13:00"));

        tutorProfileRepository.save(profile);
        user.setTutorProfile(profile);
        return user;
    }

    private AvailabilitySlot slot(TutorProfile profile, DayOfWeek day, String start, String end) {
        AvailabilitySlot slot = new AvailabilitySlot();
        slot.setTutorProfile(profile);
        slot.setDay(day.getDisplayName(TextStyle.FULL, Locale.ENGLISH));
        slot.setEnabled(true);
        slot.setStart(start);
        slot.setEnd(end);
        return slot;
    }

    private TutoringSession createSession(
            User student,
            User tutor,
            String subject,
            LocalDateTime scheduledAt,
            String message,
            long fee,
            SessionStatus status) {
        TutoringSession session = new TutoringSession();
        session.setStudent(student);
        session.setTutor(tutor);
        session.setSubject(subject);
        session.setScheduledAt(scheduledAt);
        session.setDurationMinutes(60);
        session.setStatus(status);
        session.setMessage(message);
        session.setFee(fee);
        session.setCreatedAt(Instant.now());
        session.setUpdatedAt(Instant.now());
        return sessionRepository.save(session);
    }
}
