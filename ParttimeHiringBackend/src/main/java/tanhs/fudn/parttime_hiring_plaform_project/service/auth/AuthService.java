package tanhs.fudn.parttime_hiring_plaform_project.service.auth;

import jakarta.servlet.http.HttpServletResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.auth.LoginResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.LoginRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.RegisterRequest;

public interface AuthService {
    // Authenticates credentials and starts a browser session.
    LoginResponse login(LoginRequest request, HttpServletResponse response);
    // Registers a candidate with the default user role.
    void register(RegisterRequest request);
    // Clears the browser context after session revocation.
    void logout(HttpServletResponse response);
}
