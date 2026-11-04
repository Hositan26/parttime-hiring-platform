package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import java.security.Principal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserReviewResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.ReviewRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserReviewService;

@RestController @RequestMapping("/api/users/employments/{id}/review") @RequiredArgsConstructor
public class UserReviewController {
    private final UserReviewService service;
    // Reads an owned employment's review, including its moderation state.
    @GetMapping
    public ResponseEntity<ApiResponse<UserReviewResponse>> get(Principal principal, @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(service.get(principal.getName(), id)));
    }
    // Creates or edits a review after validating the worker's employment.
    @PutMapping
    public ResponseEntity<ApiResponse<UserReviewResponse>> save(Principal principal, @PathVariable Integer id,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.save(principal.getName(), id, request)));
    }
    // Deletes the worker's own review without deleting employment history.
    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> delete(Principal principal, @PathVariable Integer id) {
        service.delete(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted"));
    }
}
