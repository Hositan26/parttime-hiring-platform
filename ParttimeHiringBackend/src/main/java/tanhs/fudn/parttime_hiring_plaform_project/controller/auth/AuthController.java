package tanhs.fudn.parttime_hiring_plaform_project.controller.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.AuthResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.LoginRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.RegisterRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.auth.AuthService;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller cung cấp các API cho Đăng nhập và Đăng ký.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * API Đăng ký tài khoản mới.
     * @param request Payload chứa thông tin username và password.
     * @return Thông báo thành công hoặc lỗi.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đăng ký thành công!");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * API Đăng nhập.
     * @param request Payload chứa thông tin username và password.
     * @return AuthResponse chứa chuỗi JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Sai tài khoản hoặc mật khẩu");
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }
}
