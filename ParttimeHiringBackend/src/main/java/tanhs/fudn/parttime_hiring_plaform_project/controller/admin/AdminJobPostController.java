package tanhs.fudn.parttime_hiring_plaform_project.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.jobpost.AdminJobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminJobPostService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
public class AdminJobPostController {

    private final AdminJobPostService adminJobPostService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminJobPostResponse>>> getAllJobPosts(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminJobPostResponse> jobPosts = adminJobPostService.getAllJobPosts(page, size, status);
        return ResponseEntity.ok(ApiResponse.success(jobPosts));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminJobPostResponse>> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload
    ) {
        String statusStr = payload.get("status");
        if (statusStr == null) {
            throw new IllegalArgumentException("Thiếu trường status");
        }
        JobStatus status = JobStatus.valueOf(statusStr);
        AdminJobPostResponse response = adminJobPostService.updateJobPostStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteJobPost(@PathVariable Integer id) {
        adminJobPostService.deleteJobPost(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa tin tuyển dụng thành công"));
    }
}
