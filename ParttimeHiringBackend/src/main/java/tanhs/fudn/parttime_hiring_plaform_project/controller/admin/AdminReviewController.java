package tanhs.fudn.parttime_hiring_plaform_project.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.review.AdminReviewResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminReviewService;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    // Searches reviews by store and reviewer names.
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminReviewResponse>>> getReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String query
    ) {
        Page<AdminReviewResponse> reviews = adminReviewService.getAllReviews(page, size, query);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    // Hides or restores review visibility without deleting employment history.
    @PutMapping("/{id}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> visibility(@PathVariable Integer id, @RequestParam boolean visible) {
        return ResponseEntity.ok(ApiResponse.success(adminReviewService.updateVisibility(id, visible)));
    }

    // Deletes the review while retaining the associated employment record.
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Integer id) {
        adminReviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
