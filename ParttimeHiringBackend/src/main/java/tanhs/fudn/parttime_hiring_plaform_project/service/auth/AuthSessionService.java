package tanhs.fudn.parttime_hiring_plaform_project.service.auth;
import jakarta.servlet.http.HttpServletResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

public interface AuthSessionService {
    // Starts a browser session after successful account authentication.
    void start(User user, HttpServletResponse response);
    // Revokes the credentials belonging to the current browser session.
    void logout(String refresh, String access, HttpServletResponse response);
    // Rotates a refresh credential and replaces authentication cookies.
    void refresh(String token, HttpServletResponse response);
}

