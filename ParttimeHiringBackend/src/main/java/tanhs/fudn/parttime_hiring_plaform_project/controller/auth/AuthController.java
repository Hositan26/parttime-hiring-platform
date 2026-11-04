package tanhs.fudn.parttime_hiring_plaform_project.controller.auth;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.auth.LoginResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.LoginRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.RegisterRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.auth.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    AuthService authService;
    tanhs.fudn.parttime_hiring_plaform_project.service.auth.AuthSessionService sessionService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công!"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request, response);
        return ResponseEntity.ok(ApiResponse.success(loginResponse));
    }
    
    // Rotates the refresh cookie without exposing credentials in JSON.
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refresh(@CookieValue(name = "refresh_token", required = false) String token, HttpServletResponse response) {
        sessionService.refresh(token, response);
        return ResponseEntity.ok(ApiResponse.success("Session refreshed"));
    }
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@CookieValue(name = "refresh_token", required = false) String refresh, @CookieValue(name = "access_token", required = false) String access, HttpServletResponse response) {
        sessionService.logout(refresh, access, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công!"));
    }
}


