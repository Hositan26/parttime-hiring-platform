package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.SavedJobService;

@RestController @RequestMapping("/api/users/saved-jobs") @RequiredArgsConstructor
public class SavedJobController {
    private final SavedJobService service;
    // Lists the current account's saved opportunities.
    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobPostResponse>>> list(Principal principal,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.list(principal.getName(), page, size)));
    }
    // Saves an available opportunity for the current account.
    @PutMapping("/{jobId}")
    public ResponseEntity<ApiResponse<String>> save(Principal principal, @PathVariable Integer jobId) {
        service.save(principal.getName(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job saved"));
    }
    // Removes only the current account's saved opportunity.
    @DeleteMapping("/{jobId}")
    public ResponseEntity<ApiResponse<String>> remove(Principal principal, @PathVariable Integer jobId) {
        service.remove(principal.getName(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Saved job removed"));
    }
}
