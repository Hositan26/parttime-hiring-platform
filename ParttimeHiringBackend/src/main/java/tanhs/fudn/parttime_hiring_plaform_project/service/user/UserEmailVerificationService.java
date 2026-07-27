package tanhs.fudn.parttime_hiring_plaform_project.service.user;

import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserEmailVerificationService;

public interface UserEmailVerificationService {
    void generateAndSendOtp(String email);
    void verifyOtp(String email, String otpCode);
}