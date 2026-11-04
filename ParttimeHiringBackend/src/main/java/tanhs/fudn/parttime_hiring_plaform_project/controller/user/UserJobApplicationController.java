package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import java.security.Principal;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.application.ApplicationUpdateRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.application.JobApplicationRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.application.JobApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.application.JobApplicationService;

@RestController
@RequestMapping("/api/users/applications")
@RequiredArgsConstructor
public class UserJobApplicationController {
    private final JobApplicationService applicationService;

    // Updates contact information for an owned pending application.
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> edit(@PathVariable Integer id,
            @Valid @RequestBody ApplicationUpdateRequest request, Principal principal) {
        applicationService.editApplication(id, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application updated"));
    }

    // Withdraws an owned pending application without deleting its history.
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<ApiResponse<String>> withdraw(@PathVariable Integer id, Principal principal) {
        applicationService.withdrawApplication(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn"));
    }

    // Submits validated contact details for the authenticated candidate.
    @PostMapping
    public ResponseEntity<ApiResponse<String>> applyForJob(
            @Valid @RequestBody JobApplicationRequest request, Principal principal) {
        applicationService.applyForJob(request, principal.getName());
        return ResponseEntity.status(201).body(ApiResponse.success("Application submitted"));
    }

    // Lists only applications belonging to the authenticated candidate.
    @GetMapping("/my-applications")
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> getMyApplications(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getMyApplications(principal.getName())));
    }
}
