package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;

import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmailService;


import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailServiceImpl implements EmailService {

    JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Xác thực Email - Ứng dụng Tìm Việc Làm Thêm");
            
            String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;\">"
                    + "<h2 style=\"color: #0f172a; text-align: center;\">Xác thực địa chỉ Email</h2>"
                    + "<p style=\"color: #334155; font-size: 16px;\">Chào bạn,</p>"
                    + "<p style=\"color: #334155; font-size: 16px;\">Mã xác nhận (OTP) của bạn là:</p>"
                    + "<div style=\"text-align: center; margin: 30px 0;\">"
                    + "<span style=\"font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 5px; background: #ecfdf5; padding: 10px 20px; border-radius: 8px;\">" + otpCode + "</span>"
                    + "</div>"
                    + "<p style=\"color: #334155; font-size: 16px;\">Mã này có hiệu lực trong <strong>1 phút</strong>. Vui lòng không chia sẻ mã này cho người khác.</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;\">"
                    + "<p style=\"color: #94a3b8; font-size: 12px; text-align: center;\">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>"
                    + "</div>";

            helper.setText(htmlContent, true); // true = HTML
            
            mailSender.send(message);
            log.info("Sent OTP email to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }
}
