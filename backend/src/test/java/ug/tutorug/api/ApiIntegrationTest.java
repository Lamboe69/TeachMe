package ug.tutorug.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import ug.tutorug.api.domain.TutoringSession;
import ug.tutorug.api.repository.SessionRepository;

/**
 * End-to-end walk through the booking, escrow, completion, review and wallet
 * flows against the seeded demo data.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {

    private static final ZoneId KAMPALA = ZoneId.of("Africa/Kampala");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SessionRepository sessionRepository;

    private JsonNode json(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private String login(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"Demo1234\"}"))
                .andReturn();
        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        return json(result).get("token").asText();
    }

    @Test
    void fullSessionLifecycleMovesMoneyThroughEscrowAndBack() throws Exception {
        String studentToken = login("mary.demo@tutorug.ug");
        String tutorToken = login("sarah.demo@tutorug.ug");

        // Authenticated profile.
        MvcResult me = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + studentToken))
                .andReturn();
        assertThat(me.getResponse().getStatus()).isEqualTo(200);
        assertThat(json(me).get("role").asText()).isEqualTo("STUDENT");

        // Directory and subjects.
        MvcResult tutors = mockMvc.perform(get("/api/tutors?search=Sarah")).andReturn();
        assertThat(json(tutors).get("totalElements").asInt()).isGreaterThan(0);
        JsonNode sarah = json(tutors).get("content").get(0);
        String tutorId = sarah.get("id").asText();

        MvcResult subjects = mockMvc.perform(get("/api/tutors/subjects")).andReturn();
        assertThat(subjects.getResponse().getStatus()).isEqualTo(200);

        long availableBefore = json(mockMvc.perform(get("/api/wallet")
                        .header("Authorization", "Bearer " + studentToken)).andReturn())
                .get("availableBalance").asLong();

        // Book a session at an available slot (next Tuesday 10:00).
        String scheduledAt = nextTuesdayAtTen();
        MvcResult booking = mockMvc.perform(post("/api/sessions")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tutorId\":\"" + tutorId + "\",\"subject\":\"Physics\","
                                + "\"scheduledAt\":\"" + scheduledAt + "\","
                                + "\"message\":\"Help with optics\"}"))
                .andReturn();
        assertThat(booking.getResponse().getStatus()).isEqualTo(200);
        JsonNode created = json(booking);
        String sessionId = created.get("id").asText();
        long fee = created.get("fee").asLong();
        assertThat(created.get("status").asText()).isEqualTo("REQUESTED");

        // Fee left the available balance and entered escrow.
        JsonNode walletAfterBooking = json(mockMvc.perform(get("/api/wallet")
                .header("Authorization", "Bearer " + studentToken)).andReturn());
        assertThat(walletAfterBooking.get("availableBalance").asLong())
                .isEqualTo(availableBefore - fee);
        assertThat(walletAfterBooking.get("escrowBalance").asLong()).isGreaterThanOrEqualTo(fee);

        // A student cannot accept their own request.
        MvcResult forbidden = mockMvc.perform(patch("/api/sessions/" + sessionId + "/status")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACCEPTED\"}"))
                .andReturn();
        assertThat(forbidden.getResponse().getStatus()).isEqualTo(403);

        // The tutor accepts.
        MvcResult accepted = mockMvc.perform(patch("/api/sessions/" + sessionId + "/status")
                        .header("Authorization", "Bearer " + tutorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACCEPTED\"}"))
                .andReturn();
        assertThat(json(accepted).get("status").asText()).isEqualTo("ACCEPTED");

        // Chat.
        MvcResult message = mockMvc.perform(post("/api/sessions/" + sessionId + "/messages")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"Looking forward to it\"}"))
                .andReturn();
        assertThat(message.getResponse().getStatus()).isEqualTo(200);

        // Move the session into the past so it can be confirmed.
        TutoringSession session = sessionRepository.findById(sessionId).orElseThrow();
        session.setScheduledAt(LocalDateTime.now(KAMPALA).minusHours(2));
        sessionRepository.save(session);

        long tutorAvailableBefore = json(mockMvc.perform(get("/api/wallet")
                        .header("Authorization", "Bearer " + tutorToken)).andReturn())
                .get("availableBalance").asLong();

        // Both parties confirm; only the second confirmation completes it.
        MvcResult firstConfirm = mockMvc.perform(patch("/api/sessions/" + sessionId + "/status")
                        .header("Authorization", "Bearer " + tutorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andReturn();
        assertThat(json(firstConfirm).get("status").asText()).isEqualTo("ACCEPTED");

        MvcResult secondConfirm = mockMvc.perform(patch("/api/sessions/" + sessionId + "/status")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andReturn();
        assertThat(json(secondConfirm).get("status").asText()).isEqualTo("COMPLETED");

        // Escrow released to the tutor minus the 10% platform fee.
        long tutorAvailableAfter = json(mockMvc.perform(get("/api/wallet")
                        .header("Authorization", "Bearer " + tutorToken)).andReturn())
                .get("availableBalance").asLong();
        assertThat(tutorAvailableAfter - tutorAvailableBefore).isEqualTo(Math.round(fee * 0.9));

        // Review, then a duplicate is rejected.
        MvcResult review = mockMvc.perform(post("/api/sessions/" + sessionId + "/reviews")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5,\"comment\":\"Excellent session, very clear.\"}"))
                .andReturn();
        assertThat(review.getResponse().getStatus()).isEqualTo(200);
        assertThat(json(review).get("rating").asInt()).isEqualTo(5);

        MvcResult duplicate = mockMvc.perform(post("/api/sessions/" + sessionId + "/reviews")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":4,\"comment\":\"Second review should fail.\"}"))
                .andReturn();
        assertThat(duplicate.getResponse().getStatus()).isEqualTo(409);

        // Top-up and withdraw.
        long beforeTopUp = json(mockMvc.perform(get("/api/wallet")
                .header("Authorization", "Bearer " + studentToken)).andReturn())
                .get("availableBalance").asLong();
        MvcResult topUp = mockMvc.perform(post("/api/wallet/top-up")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":100000,\"phone\":\"+256772445019\",\"network\":\"MTN\"}"))
                .andReturn();
        assertThat(json(topUp).get("availableBalance").asLong()).isEqualTo(beforeTopUp + 100_000);

        MvcResult withdraw = mockMvc.perform(post("/api/wallet/withdraw")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":50000,\"phone\":\"+256772445019\",\"network\":\"AIRTEL\"}"))
                .andReturn();
        assertThat(json(withdraw).get("availableBalance").asLong()).isEqualTo(beforeTopUp + 50_000);

        // Over-withdrawing is rejected.
        MvcResult tooMuch = mockMvc.perform(post("/api/wallet/withdraw")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":5000000,\"phone\":\"+256772445019\",\"network\":\"MTN\"}"))
                .andReturn();
        assertThat(tooMuch.getResponse().getStatus()).isEqualTo(400);
    }

    @Test
    void bookingOutsideAvailabilityIsRejected() throws Exception {
        String studentToken = login("mary.demo@tutorug.ug");
        String tutorId = json(mockMvc.perform(get("/api/tutors?search=Sarah")).andReturn())
                .get("content").get(0).get("id").asText();

        LocalDate nextTuesday = nextTuesday();
        String outsideHours = nextTuesday + "T03:00:00";

        MvcResult result = mockMvc.perform(post("/api/sessions")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tutorId\":\"" + tutorId + "\",\"subject\":\"Physics\","
                                + "\"scheduledAt\":\"" + outsideHours + "\"}"))
                .andReturn();
        assertThat(result.getResponse().getStatus()).isEqualTo(400);
        assertThat(json(result).get("fieldErrors").has("scheduledAt")).isTrue();
    }

    private LocalDate nextTuesday() {
        LocalDate date = LocalDate.now(KAMPALA);
        while (date.getDayOfWeek() != DayOfWeek.TUESDAY) {
            date = date.plusDays(1);
        }
        return date;
    }

    private String nextTuesdayAtTen() {
        LocalDate date = nextTuesday();
        if (!date.atTime(10, 0).isAfter(LocalDateTime.now(KAMPALA))) {
            date = date.plusWeeks(1);
        }
        return date + "T10:00:00";
    }
}
