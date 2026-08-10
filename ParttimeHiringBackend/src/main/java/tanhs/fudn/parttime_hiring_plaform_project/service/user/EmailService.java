package tanhs.fudn.parttime_hiring_plaform_project.service.user;

import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmailService;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);
    void sendVerificationStatusEmail(String toEmail, String companyName, boolean isApproved, String reason);
}