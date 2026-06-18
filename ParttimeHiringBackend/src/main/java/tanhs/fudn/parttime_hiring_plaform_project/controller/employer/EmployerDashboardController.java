package tanhs.fudn.parttime_hiring_plaform_project.controller.employer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.dashboard.DashboardOverviewResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerDashboardService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;

@Slf4j
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployerDashboardController {

    EmployerDashboardService employerDashboardService;

    @GetMapping("/overview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DashboardOverviewResponse>> getOverview(Principal principal) {
        DashboardOverviewResponse overview = employerDashboardService.getDashboardOverview(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(overview));
    }
}
