package ug.tutorug.api.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.tutorug.api.config.AppProperties;
import ug.tutorug.api.domain.AvailabilitySlot;
import ug.tutorug.api.domain.SessionMessage;
import ug.tutorug.api.domain.SessionStatus;
import ug.tutorug.api.domain.TutorProfile;
import ug.tutorug.api.domain.TutoringSession;
import ug.tutorug.api.domain.User;
import ug.tutorug.api.domain.UserRole;
import ug.tutorug.api.dto.request.CreateSessionRequest;
import ug.tutorug.api.dto.response.MessageResponse;
import ug.tutorug.api.dto.response.SessionResponse;
import ug.tutorug.api.error.ApiException;
import ug.tutorug.api.repository.SessionMessageRepository;
import ug.tutorug.api.repository.SessionRepository;
import ug.tutorug.api.repository.UserRepository;
import ug.tutorug.api.security.CurrentUser;
import ug.tutorug.api.util.Scheduling;

@Service
public class SessionService {

    private static final Map<SessionStatus, List<SessionStatus>> ALLOWED_TRANSITIONS = Map.of(
            SessionStatus.REQUESTED, List.of(SessionStatus.ACCEPTED, SessionStatus.REJECTED,
                    SessionStatus.CANCELLED),
            SessionStatus.ACCEPTED, List.of(SessionStatus.COMPLETED, SessionStatus.CANCELLED),
            SessionStatus.COMPLETED, List.of(),
            SessionStatus.CANCELLED, List.of(),
            SessionStatus.REJECTED, List.of());

    private final SessionRepository sessionRepository;
    private final SessionMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final CurrentUser currentUser;
    private final DtoMapper dtoMapper;
    private final AppProperties properties;

    public SessionService(
            SessionRepository sessionRepository,
            SessionMessageRepository messageRepository,
            UserRepository userRepository,
            WalletService walletService,
            CurrentUser currentUser,
            DtoMapper dtoMapper,
            AppProperties properties) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.currentUser = currentUser;
        this.dtoMapper = dtoMapper;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> listMine() {
        User user = currentUser.requireUser();
        return sessionRepository.findByStudent_IdOrTutor_Id(user.getId(), user.getId()).stream()
                .sorted(Comparator.comparing(TutoringSession::getScheduledAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(dtoMapper::toSession)
                .toList();
    }

    @Transactional(readOnly = true)
    public SessionResponse get(String id) {
        User user = currentUser.requireUser();
        return dtoMapper.toSession(requireParticipant(id, user));
    }

    @Transactional
    public SessionResponse create(CreateSessionRequest request) {
        User student = currentUser.requireUser();

        User tutor = userRepository.findById(request.tutorId())
                .filter(u -> u.getRole() == UserRole.TUTOR)
                .orElseThrow(() -> ApiException.notFound("We could not find that tutor."));

        if (tutor.getId().equals(student.getId())) {
            throw ApiException.badRequest("You cannot book a session with yourself.");
        }

        LocalDateTime scheduled = Scheduling.parseScheduledAt(request.scheduledAt());
        if (scheduled == null) {
            throw ApiException.badRequest("Please choose a valid date and time.",
                    "scheduledAt", "Please choose a valid date and time.");
        }
        if (!scheduled.isAfter(LocalDateTime.now(zone()))) {
            throw ApiException.badRequest("Please choose a date and time in the future.",
                    "scheduledAt", "Please choose a date and time in the future.");
        }

        TutorProfile profile = tutor.getTutorProfile();
        boolean hasAvailability = profile != null
                && profile.getAvailability().stream().anyMatch(AvailabilitySlot::isEnabled);
        if (!hasAvailability) {
            throw ApiException.badRequest("This tutor has not published any available times yet.",
                    "scheduledAt", "Booking opens once the tutor publishes their availability.");
        }

        List<String> availableTimes = Scheduling.forDay(
                profile.getAvailability(), Scheduling.weekdayForDate(scheduled.toLocalDate()));
        if (!availableTimes.contains(Scheduling.timeOf(scheduled))) {
            throw ApiException.badRequest("That time is outside the tutor's availability.",
                    "scheduledAt", "Choose a time the tutor has marked as available.");
        }

        LocalDateTime requestedSlot = scheduled.truncatedTo(ChronoUnit.MINUTES);
        boolean duplicate = sessionRepository
                .findByTutor_IdAndStudent_IdAndStatus(tutor.getId(), student.getId(),
                        SessionStatus.REQUESTED)
                .stream()
                .anyMatch(existing -> existing.getScheduledAt() != null
                        && existing.getScheduledAt().truncatedTo(ChronoUnit.MINUTES)
                                .equals(requestedSlot));
        if (duplicate) {
            throw ApiException.conflict(
                    "You already have a pending request for that tutor at that time.");
        }

        TutoringSession session = new TutoringSession();
        session.setStudent(student);
        session.setTutor(tutor);
        session.setSubject(request.subject().trim());
        session.setScheduledAt(scheduled);
        session.setDurationMinutes(request.durationMinutes());
        session.setStatus(SessionStatus.REQUESTED);
        session.setMessage(blankToNull(request.message()));
        session.setFee(profile.getHourlyRate());
        session.setCreatedAt(Instant.now());
        session.setUpdatedAt(Instant.now());
        sessionRepository.save(session);

        walletService.holdSessionFunds(session);

        return dtoMapper.toSession(session);
    }

    @Transactional
    public SessionResponse updateStatus(String id, String status, String reason) {
        User actor = currentUser.requireUser();
        TutoringSession session = sessionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("We could not find that session."));

        boolean isTutor = session.getTutor().getId().equals(actor.getId());
        boolean isStudent = session.getStudent().getId().equals(actor.getId());
        if (!isTutor && !isStudent) {
            throw ApiException.forbidden("You do not have permission to update this session.");
        }

        SessionStatus next;
        try {
            next = SessionStatus.valueOf(status.trim().toUpperCase());
        } catch (RuntimeException ex) {
            throw ApiException.badRequest("That session status is not supported.");
        }
        if (next != SessionStatus.ACCEPTED && next != SessionStatus.REJECTED
                && next != SessionStatus.COMPLETED && next != SessionStatus.CANCELLED) {
            throw ApiException.badRequest("That session status is not supported.");
        }

        if (next == SessionStatus.ACCEPTED || next == SessionStatus.REJECTED) {
            if (!isTutor) {
                throw ApiException.forbidden(
                        "Only the tutor can accept or decline a booking request.");
            }
            if (session.getStatus() != SessionStatus.REQUESTED) {
                throw ApiException.conflict("This request has already been handled.");
            }
        }

        if (next == SessionStatus.CANCELLED && session.getStatus() == SessionStatus.COMPLETED) {
            throw ApiException.conflict("A completed session cannot be cancelled.");
        }

        List<SessionStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(session.getStatus(), List.of());
        if (!allowed.contains(next)) {
            throw ApiException.conflict("This session cannot move from "
                    + session.getStatus().name().toLowerCase() + " to " + next.name().toLowerCase()
                    + ".");
        }

        if (next == SessionStatus.COMPLETED) {
            if (session.getScheduledAt() != null
                    && session.getScheduledAt().isAfter(LocalDateTime.now(zone()))) {
                throw ApiException.badRequest(
                        "You can only confirm after the scheduled session time.");
            }
            Instant alreadyConfirmed = isTutor
                    ? session.getTutorConfirmedAt()
                    : session.getStudentConfirmedAt();
            if (alreadyConfirmed != null) {
                throw ApiException.conflict("You have already confirmed this session.");
            }

            Instant now = Instant.now();
            if (isTutor) {
                session.setTutorConfirmedAt(now);
            } else {
                session.setStudentConfirmedAt(now);
            }
            session.setUpdatedAt(now);

            if (session.getStudentConfirmedAt() != null && session.getTutorConfirmedAt() != null) {
                session.setStatus(SessionStatus.COMPLETED);
                walletService.releaseSessionEarnings(session);
            }
            sessionRepository.save(session);
            return dtoMapper.toSession(session);
        }

        session.setStatus(next);
        session.setUpdatedAt(Instant.now());
        if (next == SessionStatus.CANCELLED && reason != null && !reason.isBlank()) {
            session.setNotes(reason.trim());
        }
        if (next == SessionStatus.CANCELLED || next == SessionStatus.REJECTED) {
            walletService.refundSessionFunds(session);
        }
        sessionRepository.save(session);
        return dtoMapper.toSession(session);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> listMessages(String sessionId) {
        User user = currentUser.requireUser();
        requireParticipant(sessionId, user);
        return messageRepository.findBySession_IdOrderByCreatedAtAsc(sessionId).stream()
                .map(MessageResponse::from)
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(String sessionId, String body) {
        User user = currentUser.requireUser();
        TutoringSession session = requireParticipant(sessionId, user);

        String text = body == null ? "" : body.trim();
        if (text.isEmpty()) {
            throw ApiException.badRequest("Write a message before sending.",
                    "body", "Write a message.");
        }
        if (text.length() > 1000) {
            throw ApiException.badRequest("Keep messages under 1,000 characters.",
                    "body", "Message is too long.");
        }

        SessionMessage message = new SessionMessage();
        message.setSession(session);
        message.setSenderId(user.getId());
        message.setSenderName(user.getFullName());
        message.setBody(text);
        message.setCreatedAt(Instant.now());
        messageRepository.save(message);

        return MessageResponse.from(message);
    }

    private TutoringSession requireParticipant(String id, User user) {
        TutoringSession session = sessionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("We could not find that session."));
        boolean isParticipant = session.getStudent().getId().equals(user.getId())
                || session.getTutor().getId().equals(user.getId());
        if (!isParticipant) {
            throw ApiException.forbidden("You do not have permission to view this session.");
        }
        return session;
    }

    private ZoneId zone() {
        return ZoneId.of(properties.getTimeZone());
    }

    private String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
