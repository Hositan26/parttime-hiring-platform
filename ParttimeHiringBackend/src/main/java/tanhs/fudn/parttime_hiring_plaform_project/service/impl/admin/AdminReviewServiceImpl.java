package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminReviewService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.review.AdminReviewResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ReviewStatus;
import tanhs.fudn.parttime_hiring_plaform_project.repository.review.StoreReviewRepository;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.AdminReviewMapper;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class AdminReviewServiceImpl implements AdminReviewService {
    private final StoreReviewRepository reviewRepository;
    private final AdminReviewMapper mapper;

    // Searches reviews before applying bounded moderation pagination.
    public Page<AdminReviewResponse> getAllReviews(int page, int size, String query) {
        if (page < 0 || size < 1 || size > 50) throw new IllegalArgumentException("Invalid pagination");
        return reviewRepository.searchAdministration(query == null ? "" : query.trim(),
                PageRequest.of(page, size, Sort.by("reviewId").descending())).map(mapper::toResponse);
    }

    // Retains content and employment history when hiding or restoring reviews.
    @Transactional
    public AdminReviewResponse updateVisibility(Integer id, boolean visible) {
        var review = reviewRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setStatus(visible ? ReviewStatus.VISIBLE : ReviewStatus.HIDDEN);
        return mapper.toResponse(reviewRepository.save(review));
    }

    // Deletes only the review while preserving its associated employment history.
    @Transactional
    public void deleteReview(Integer id) {
        if (!reviewRepository.existsById(id)) throw new ResourceNotFoundException("Review not found");
        reviewRepository.deleteById(id);
    }
}
