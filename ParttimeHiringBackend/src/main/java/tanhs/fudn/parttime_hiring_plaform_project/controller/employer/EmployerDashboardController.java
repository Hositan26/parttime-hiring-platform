package tanhs.fudn.parttime_hiring_plaform_project.controller.employer;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.dashboard.DashboardOverviewDTO;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerDashboardService;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/employer/dashboard")
@RequiredArgsConstructor
public class EmployerDashboardController {

    private final EmployerDashboardService employerDashboardService;
    private final UserRepository userRepository;

    @GetMapping("/overview")
    public ResponseEntity<DashboardOverviewDTO> getOverview(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        DashboardOverviewDTO overview = employerDashboardService.getDashboardOverview(user.getId().intValue());
        return ResponseEntity.ok(overview);
    }
}
