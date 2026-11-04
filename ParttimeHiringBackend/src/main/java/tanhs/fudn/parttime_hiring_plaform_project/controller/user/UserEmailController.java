package tanhs.fudn.parttime_hiring_plaform_project.controller.user;
import java.security.Principal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.ConfirmEmailRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.SendOtpRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserEmailVerificationService;

@RestController
@RequestMapping("/api/employers/verifications/email")
@RequiredArgsConstructor
public class UserEmailController {
    private final UserEmailVerificationService verification;

    // Sends a verification challenge for the authenticated applicant.
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> send(@Valid @RequestBody SendOtpRequest request, Principal principal) {
        verification.generateAndSendOtp(request.getEmail(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Verification code sent"));
    }

    // Confirms the applicant's code before accepting business verification documents.
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> confirm(@Valid @RequestBody ConfirmEmailRequest request, Principal principal) {
        verification.confirmOtp(request.getEmail(), request.getOtpCode(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Email confirmed"));
    }
}
