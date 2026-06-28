package tanhs.fudn.parttime_hiring_plaform_project.controller.employer;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.UpdateEmploymentStatusRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.EmployerEmploymentResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.employment.EmployerEmploymentService;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/employments")
@RequiredArgsConstructor
public class EmployerEmploymentController {

    private final EmployerEmploymentService employmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployerEmploymentResponse>>> getAllEmployments(
            @RequestParam(required = false) Integer storeId,
            Authentication authentication) {
        
        List<EmployerEmploymentResponse> responses;
        if (storeId != null && storeId > 0) {
            responses = employmentService.getEmploymentsByStore(storeId, authentication.getName());
        } else {
            responses = employmentService.getAllEmployments(authentication.getName());
        }

        return ResponseEntity.ok(ApiResponse.<List<EmployerEmploymentResponse>>builder()
                .message("Lấy danh sách nhân sự thành công")
                .result(responses)
                .build());
    }

    @PatchMapping("/{recordId}/status")
    public ResponseEntity<ApiResponse<Void>> updateEmploymentStatus(
            @PathVariable Integer recordId,
            @Valid @RequestBody UpdateEmploymentStatusRequest request,
            Authentication authentication) {
        
        employmentService.updateEmploymentStatus(recordId, request, authentication.getName());

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Cập nhật trạng thái nhân sự thành công")
                .build());
    }
}
