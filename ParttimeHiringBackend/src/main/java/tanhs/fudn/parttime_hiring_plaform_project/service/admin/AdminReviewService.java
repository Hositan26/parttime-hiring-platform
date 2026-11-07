package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminReviewService;
import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.review.AdminReviewResponse;

public interface AdminReviewService {
    // Searches reviews by store or author.
    Page<AdminReviewResponse> getAllReviews(int page, int size, String query);
    // Preserves the existing unfiltered review listing contract.
    default Page<AdminReviewResponse> getAllReviews(int page, int size) {
        return getAllReviews(page, size, "");
    }
    // Hides or restores reviews while retaining their employment reference.
    AdminReviewResponse updateVisibility(Integer id, boolean visible);
    void deleteReview(Integer id);
}