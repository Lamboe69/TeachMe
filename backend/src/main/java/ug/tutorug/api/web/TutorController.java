package ug.tutorug.api.web;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ug.tutorug.api.dto.response.PageResponse;
import ug.tutorug.api.dto.response.ReviewResponse;
import ug.tutorug.api.dto.response.TutorResponse;
import ug.tutorug.api.service.TutorService;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    private final TutorService tutorService;

    public TutorController(TutorService tutorService) {
        this.tutorService = tutorService;
    }

    @GetMapping
    public PageResponse<TutorResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Long maxRate,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return tutorService.list(search, subject, minRating, maxRate, page, size);
    }

    @GetMapping("/subjects")
    public List<String> subjects() {
        return tutorService.getSubjects();
    }

    @GetMapping("/{id}")
    public TutorResponse get(@PathVariable String id) {
        return tutorService.get(id);
    }

    @GetMapping("/{id}/reviews")
    public List<ReviewResponse> reviews(@PathVariable String id) {
        return tutorService.getReviews(id);
    }
}
