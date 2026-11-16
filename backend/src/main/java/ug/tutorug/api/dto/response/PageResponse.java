package ug.tutorug.api.dto.response;

import java.util.List;
import java.util.function.Function;
import org.springframework.data.domain.Page;

/** Spring-{@code Page}-compatible envelope the frontend already understands. */
public record PageResponse<T>(
        List<T> content,
        long totalElements,
        int totalPages,
        int number,
        int size) {

    public static <E, T> PageResponse<T> from(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize());
    }

    public static <T> PageResponse<T> of(List<T> content) {
        return new PageResponse<>(content, content.size(), content.isEmpty() ? 0 : 1, 0, content.size());
    }
}
