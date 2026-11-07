package tanhs.fudn.parttime_hiring_plaform_project.controller.admin;

import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.InteractionResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.RecruitmentInteractionService;

@RestController @RequestMapping("/api/admin/job-reports") @RequiredArgsConstructor
public class AdminJobReportController {
    private final RecruitmentInteractionService service;
    // Lists private recruitment complaints for administrator review.
    @GetMapping
    public ResponseEntity<ApiResponse<Page<InteractionResponse>>> reports(@RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) InteractionStatus status) {
        return ResponseEntity.ok(ApiResponse.success(service.adminReports(page, status)));
    }
    // Resolves a reviewed complaint while retaining its original content.
    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<String>> resolve(@PathVariable Long id) {
        service.resolveReport(id);
        return ResponseEntity.ok(ApiResponse.success("Report resolved"));
    }
}
