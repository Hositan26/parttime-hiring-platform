package tanhs.fudn.parttime_hiring_plaform_project.service.user;
public interface UserEmailVerificationService {
    // Sends an email challenge bound to the authenticated applicant.
    void generateAndSendOtp(String email, String username);
    // Confirms a challenge without consuming its submission permission.
    void confirmOtp(String email, String code, String username);
    // Consumes a confirmed challenge during verification submission.
    void verifyOtp(String email, String code, String username);
}
