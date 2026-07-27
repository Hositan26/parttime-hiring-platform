package tanhs.fudn.parttime_hiring_plaform_project.controller.employer;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.EmployerProfileResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.EmployerProfileUpdateRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerProfileService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;

import java.security.Principal;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class EmployerProfileController {

    private final EmployerProfileService employerProfileService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<EmployerProfileResponse>> getProfile(Principal principal) {
        EmployerProfileResponse profile = employerProfileService.getEmployerProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<EmployerProfileResponse>> updateProfile(
            Principal principal,
            @RequestBody EmployerProfileUpdateRequest request) {
        EmployerProfileResponse updatedProfile = employerProfileService.updateEmployerProfile(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(updatedProfile));
    }
}
