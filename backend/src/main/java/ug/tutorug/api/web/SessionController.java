package ug.tutorug.api.web;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.tutorug.api.dto.request.CreateReviewRequest;
import ug.tutorug.api.dto.request.CreateSessionRequest;
import ug.tutorug.api.dto.request.SendMessageRequest;
import ug.tutorug.api.dto.request.UpdateSessionStatusRequest;
import ug.tutorug.api.dto.response.MessageResponse;
import ug.tutorug.api.dto.response.ReviewResponse;
import ug.tutorug.api.dto.response.SessionResponse;
import ug.tutorug.api.service.ReviewService;
import ug.tutorug.api.service.SessionService;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final ReviewService reviewService;

    public SessionController(SessionService sessionService, ReviewService reviewService) {
        this.sessionService = sessionService;
        this.reviewService = reviewService;
    }

    @GetMapping("/my")
    public List<SessionResponse> mine() {
        return sessionService.listMine();
    }

    @PostMapping
    public SessionResponse create(@Valid @RequestBody CreateSessionRequest request) {
        return sessionService.create(request);
    }

    @GetMapping("/{id}")
    public SessionResponse get(@PathVariable String id) {
        return sessionService.get(id);
    }

    @PatchMapping("/{id}/status")
    public SessionResponse updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateSessionStatusRequest request) {
        return sessionService.updateStatus(id, request.status(), request.reason());
    }

    @PostMapping("/{id}/reviews")
    public ReviewResponse review(
            @PathVariable String id,
            @Valid @RequestBody CreateReviewRequest request) {
        return reviewService.create(id, request);
    }

    @GetMapping("/{id}/messages")
    public List<MessageResponse> messages(@PathVariable String id) {
        return sessionService.listMessages(id);
    }

    @PostMapping("/{id}/messages")
    public MessageResponse sendMessage(
            @PathVariable String id,
            @Valid @RequestBody SendMessageRequest request) {
        return sessionService.sendMessage(id, request.body());
    }
}
