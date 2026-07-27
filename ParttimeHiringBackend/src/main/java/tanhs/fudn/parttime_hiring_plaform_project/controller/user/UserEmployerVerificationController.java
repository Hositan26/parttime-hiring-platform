package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.VerifyBusinessRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerVerificationService;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users/employer-verifications")
public class UserEmployerVerificationController {

    private final EmployerVerificationService verificationService;

    public UserEmployerVerificationController(EmployerVerificationService verificationService) {
        this.verificationService = verificationService;
    }

    /**
     * API Nộp hồ sơ xác minh doanh nghiệp
     * @param request Form dữ liệu và ảnh
     * @param authentication Authentication
     * @return Kết quả
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> submitVerification(
            @Valid @ModelAttribute VerifyBusinessRequest request,
            Authentication authentication
    ) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            
            verificationService.submitVerification(request, username);
            
            return ResponseEntity.status(201).body(Map.of("message", "Nộp hồ sơ xác minh thành công!"));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi tải ảnh lên hệ thống."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * API Lấy trạng thái đơn xác minh mới nhất của người dùng hiện tại
     */
    @GetMapping("/my-status")
    public ResponseEntity<?> getMyVerificationStatus(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        var status = verificationService.getMyVerificationStatus(userDetails.getUsername());
        
        if (status == null) {
            return ResponseEntity.ok(Map.of("hasRequest", false));
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("hasRequest", true);
        responseData.put("status", status.getStatus());
        responseData.put("submittedAt", status.getSubmittedAt() != null ? status.getSubmittedAt().toString() : null);
        responseData.put("rejectionReason", status.getRejectionReason());

        return ResponseEntity.ok(responseData);
    }
}
