package tanhs.fudn.parttime_hiring_plaform_project.controller.auth;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.ForgotPasswordRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.ResetPasswordRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.security.AuthCookieService;
import tanhs.fudn.parttime_hiring_plaform_project.service.auth.PasswordService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordController {
    private final PasswordService passwords;
    private final AuthCookieService cookies;

    // Accepts reset requests with the same public response for every address.
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgot(@Valid @RequestBody ForgotPasswordRequest request) {
        passwords.requestReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("If the account is eligible, a reset link will be sent"));
    }

    // Changes an authenticated account password and clears browser credentials.
    @PostMapping("/change-password")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> change(
            @Valid @RequestBody tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.ChangePasswordRequest request,
            java.security.Principal principal, HttpServletResponse response) {
        passwords.change(principal.getName(), request.getCurrentPassword(), request.getPassword());
        cookies.clear(response);
        return ResponseEntity.ok(ApiResponse.success("Password changed. Please sign in again"));
    }
    // Updates a password and removes browser credentials after successful reset.
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> reset(@Valid @RequestBody ResetPasswordRequest request, HttpServletResponse response) {
        passwords.reset(request.getToken(), request.getPassword());
        cookies.clear(response);
        return ResponseEntity.ok(ApiResponse.success("Password reset. Please sign in again"));
    }
}

