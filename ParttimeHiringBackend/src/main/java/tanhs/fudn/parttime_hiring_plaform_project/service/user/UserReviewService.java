package tanhs.fudn.parttime_hiring_plaform_project.service.user;

import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.ReviewRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserReviewResponse;

public interface UserReviewService {
    // Reads the authenticated worker's review for one employment record.
    UserReviewResponse get(String username, Integer employmentId);
    // Creates or updates one review for an owned verified employment.
    UserReviewResponse save(String username, Integer employmentId, ReviewRequest request);
    // Removes the authenticated worker's review for one employment record.
    void delete(String username, Integer employmentId);
}
