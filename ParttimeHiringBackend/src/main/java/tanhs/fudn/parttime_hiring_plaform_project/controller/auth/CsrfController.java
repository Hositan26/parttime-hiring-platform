package tanhs.fudn.parttime_hiring_plaform_project.controller.auth;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class CsrfController {
    // Materializes a CSRF token before cookie-authenticated browser mutations.
    @GetMapping("/csrf")
    public ResponseEntity<ApiResponse<String>> csrf(CsrfToken token) {
        return ResponseEntity.ok(ApiResponse.success(token.getToken()));
    }
}
