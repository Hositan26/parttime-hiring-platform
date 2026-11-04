package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.EmailVerificationOtp;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.UnauthorizedException;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.user.EmailVerificationOtpRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.TokenDigests;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmailService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserEmailVerificationService;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserEmailVerificationServiceImpl implements UserEmailVerificationService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MAX_ATTEMPTS = 5;
    private final EmailVerificationOtpRepository repository;
    private final EmailService email;
    private final UserRepository users;
    @Value("${jwt.signerKey}")
    private String pepper;

    // Issues a fresh account-bound challenge with a resend cooldown.
    @Transactional
    public void generateAndSendOtp(String address, String username) {
        User user = account(username);
        String normalized = address.trim().toLowerCase(Locale.ROOT);
        repository.findTopByOwner_IdAndEmailOrderByExpirationTimeDesc(user.getId(), normalized).ifPresent(previous -> {
            if (previous.getExpirationTime().minusMinutes(5).plusSeconds(60).isAfter(LocalDateTime.now())) {
                throw new BusinessException("Wait before requesting another code");
            }
        });
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        var challenge = new EmailVerificationOtp();
        challenge.setOwner(user);
        challenge.setEmail(normalized);
        challenge.setOtpCode(hash(user.getId(), normalized, code));
        challenge.setExpirationTime(LocalDateTime.now().plusMinutes(5));
        repository.save(challenge);
        email.sendOtpEmail(normalized, code);
    }

    // Confirms the code and persists failed attempts even when validation fails.
    @Transactional(noRollbackFor = BusinessException.class)
    public void confirmOtp(String address, String code, String username) {
        var challenge = challenge(address, username);
        validate(challenge, code);
        challenge.setVerified(true);
        repository.save(challenge);
    }

    // Consumes a previously confirmed code exactly once during submission.
    @Transactional
    public void verifyOtp(String address, String code, String username) {
        var challenge = challenge(address, username);
        if (!challenge.isVerified()) throw new BusinessException("Confirm your email first");
        validate(challenge, code);
        challenge.setUsed(true);
        repository.save(challenge);
    }

    // Retrieves the latest challenge exclusively for the authenticated applicant.
    private EmailVerificationOtp challenge(String address, String username) {
        User user = account(username);
        return repository.findTopByOwner_IdAndEmailOrderByExpirationTimeDesc(
                user.getId(), address.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new BusinessException("Code is invalid or expired"));
    }

    // Rejects expired, exhausted, consumed, or incorrect verification challenges.
    private void validate(EmailVerificationOtp challenge, String code) {
        if (challenge.isUsed() || challenge.getAttempts() >= MAX_ATTEMPTS
                || !challenge.getExpirationTime().isAfter(LocalDateTime.now())) {
            throw new BusinessException("Code is invalid or expired");
        }
        String digest = hash(challenge.getOwner().getId(), challenge.getEmail(), code);
        if (!MessageDigest.isEqual(digest.getBytes(StandardCharsets.UTF_8),
                challenge.getOtpCode().getBytes(StandardCharsets.UTF_8))) {
            challenge.setAttempts(challenge.getAttempts() + 1);
            repository.save(challenge);
            throw new BusinessException("Code is invalid or expired");
        }
    }

    // Resolves only active accounts before issuing or confirming email challenges.
    private User account(String username) {
        return users.findByUsername(username).filter(user -> Boolean.TRUE.equals(user.getIsActive()))
                .orElseThrow(() -> new UnauthorizedException("Account is unavailable"));
    }

    // Binds low-entropy codes to server secret, account, and email.
    private String hash(Long userId, String address, String code) {
        return TokenDigests.hash(pepper + ":" + userId + ":" + address + ":" + code);
    }
}
