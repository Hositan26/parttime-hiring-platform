package tanhs.fudn.parttime_hiring_plaform_project.service.auth;

import jakarta.servlet.http.HttpServletResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.auth.LoginResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.LoginRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.RegisterRequest;


public interface AuthService {
    LoginResponse login(LoginRequest request, HttpServletResponse response);
    void register(RegisterRequest request);
    void logout(HttpServletResponse response);
}