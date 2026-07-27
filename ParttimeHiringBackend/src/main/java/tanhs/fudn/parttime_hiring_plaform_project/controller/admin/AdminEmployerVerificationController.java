package tanhs.fudn.parttime_hiring_plaform_project.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.verification.RejectVerificationRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationListResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminEmployerVerificationService;

import java.security.Principal;

@RestController
@RequestMapping("/api/admin/verifications")
@RequiredArgsConstructor
public class AdminEmployerVerificationController {

    private final AdminEmployerVerificationService adminVerificationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<VerificationListResponse>>> getVerifications(
            @RequestParam(defaultValue = "PENDING") VerificationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<VerificationListResponse> verifications = adminVerificationService.getVerifications(status, page, size);
        return ResponseEntity.ok(ApiResponse.success(verifications));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VerificationDetailResponse>> getVerificationDetail(
            @PathVariable Integer id
    ) {
        VerificationDetailResponse detail = adminVerificationService.getVerificationDetail(id);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> approveVerification(
            @PathVariable Integer id,
            Principal principal
    ) {
        adminVerificationService.approveVerification(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Duyệt hồ sơ xác minh thành công"));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> rejectVerification(
            @PathVariable Integer id,
            @RequestBody RejectVerificationRequest request,
            Principal principal
    ) {
        adminVerificationService.rejectVerification(id, request.getReason(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối hồ sơ xác minh"));
    }
}
