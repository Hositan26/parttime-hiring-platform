package tanhs.fudn.parttime_hiring_plaform_project.service.auth;
public interface PasswordService {
    // Requests a reset without revealing whether an account exists.
    void requestReset(String email);
    // Changes a password after verifying the current authenticated credentials.
    void change(String username, String currentPassword, String password);
    // Consumes a reset credential and invalidates existing account sessions.
    void reset(String token, String password);
}

