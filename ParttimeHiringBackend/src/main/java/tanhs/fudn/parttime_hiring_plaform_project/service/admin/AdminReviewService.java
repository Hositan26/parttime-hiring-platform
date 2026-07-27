package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminReviewService;
import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.review.AdminReviewResponse;

public interface AdminReviewService {
    Page<AdminReviewResponse> getAllReviews(int page, int size);
    void deleteReview(Integer id);
}