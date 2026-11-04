package tanhs.fudn.parttime_hiring_plaform_project.controller.user;
import java.security.Principal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.UserProfileUpdateRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserProfileResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserProfileService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserProfileService profiles;

    // Returns profile details for the account authenticated by Spring Security.
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> current(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(profiles.getCurrentUserProfile(principal.getName())));
    }

    // Updates validated profile fields without changing the immutable account identity.
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> update(
            Principal principal, @Valid @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(profiles.updateCurrentUserProfile(principal.getName(), request)));
    }
}
