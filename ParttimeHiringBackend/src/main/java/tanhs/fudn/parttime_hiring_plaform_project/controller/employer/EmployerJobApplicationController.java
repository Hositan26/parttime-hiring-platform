package tanhs.fudn.parttime_hiring_plaform_project.controller.employer;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.application.EmployerApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.application.UpdateApplicationStatusRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.application.JobApplicationService;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;

import java.util.List;

@RestController
@RequestMapping("/applications")
public class EmployerJobApplicationController {

    private final JobApplicationService applicationService;

    public EmployerJobApplicationController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployerApplicationResponse>>> getEmployerApplications(
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) ApplicationStatus status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        List<EmployerApplicationResponse> responses = applicationService.getApplicationsForEmployer(username, storeId, status);

        ApiResponse<List<EmployerApplicationResponse>> apiResponse = ApiResponse.<List<EmployerApplicationResponse>>builder()
                .code("200")
                .message("Lấy danh sách đơn ứng tuyển thành công")
                .result(responses)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<ApiResponse<Void>> updateApplicationStatus(
            @PathVariable Integer applicationId,
            @Valid @RequestBody UpdateApplicationStatusRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        applicationService.updateApplicationStatus(applicationId, request.getStatus(), username);

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .code("200")
                .message("Cập nhật trạng thái đơn ứng tuyển thành công")
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
