package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.application.JobApplicationRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.application.JobApplicationService;

import java.util.Map;

@RestController
@RequestMapping("/api/users/applications")
public class UserJobApplicationController {

    private final JobApplicationService applicationService;

    public UserJobApplicationController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<?> applyForJob(
            @Valid @RequestBody JobApplicationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            applicationService.applyForJob(request, userDetails.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Ứng tuyển thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            var applications = applicationService.getMyApplications(userDetails.getUsername());
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}
