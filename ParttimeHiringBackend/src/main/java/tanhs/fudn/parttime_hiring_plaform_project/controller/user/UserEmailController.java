package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.SendOtpRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserEmailVerificationService;

@RestController
@RequestMapping("/api/employers/verifications/email")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserEmailController {

    UserEmailVerificationService verificationService;

    @PostMapping("/send-otp")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        verificationService.generateAndSendOtp(request.getEmail());
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .message("Đã gửi mã OTP đến email " + request.getEmail())
                .result("SUCCESS")
                .build());
    }
}
