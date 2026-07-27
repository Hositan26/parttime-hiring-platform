package tanhs.fudn.parttime_hiring_plaform_project.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.employer.AdminEmployerResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminEmployerService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/employers")
@RequiredArgsConstructor
public class AdminEmployerController {

    private final AdminEmployerService adminEmployerService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminEmployerResponse>>> getEmployers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminEmployerResponse> employers = adminEmployerService.getAllEmployers(page, size);
        return ResponseEntity.ok(ApiResponse.success(employers));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminEmployerResponse>> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload
    ) {
        String statusStr = payload.get("status");
        if (statusStr == null) {
            throw new IllegalArgumentException("Thiếu trường status");
        }
        EmployerStatus status = EmployerStatus.valueOf(statusStr);
        AdminEmployerResponse response = adminEmployerService.updateEmployerStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
