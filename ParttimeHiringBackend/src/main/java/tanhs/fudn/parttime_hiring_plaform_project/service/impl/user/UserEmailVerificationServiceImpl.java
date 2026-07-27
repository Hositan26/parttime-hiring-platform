package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;

import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserEmailVerificationService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmailService;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.EmailVerificationOtp;
import tanhs.fudn.parttime_hiring_plaform_project.repository.user.EmailVerificationOtpRepository;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserEmailVerificationServiceImpl implements UserEmailVerificationService {

    EmailVerificationOtpRepository otpRepository;
    EmailService emailService;

    @Transactional
    public void generateAndSendOtp(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email không hợp lệ.");
        }

        // Tạo OTP 6 số ngẫu nhiên
        String otpCode = String.format("%06d", new Random().nextInt(999999));
        
        // Lưu vào DB (Hạn 1 phút)
        EmailVerificationOtp otp = EmailVerificationOtp.builder()
                .email(email)
                .otpCode(otpCode)
                .expirationTime(LocalDateTime.now().plusMinutes(1))
                .isUsed(false)
                .build();
        
        otpRepository.save(otp);
        
        // Gửi mail
        emailService.sendOtpEmail(email, otpCode);
    }

    @Transactional
    public void verifyOtp(String email, String otpCode) {
        EmailVerificationOtp otp = otpRepository.findTopByEmailAndIsUsedFalseOrderByExpirationTimeDesc(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã OTP nào đang chờ xác nhận cho email này."));

        if (otp.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn.");
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Mã OTP không chính xác.");
        }

        // Đánh dấu OTP đã dùng
        otp.setUsed(true);
        otpRepository.save(otp);
    }
}
