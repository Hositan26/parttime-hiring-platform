package tanhs.fudn.parttime_hiring_plaform_project.service.impl.auth;
import java.time.Instant;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.PasswordResetToken;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.PasswordResetTokenRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RefreshSessionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.TokenDigests;
import tanhs.fudn.parttime_hiring_plaform_project.service.auth.PasswordService;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordServiceImpl implements PasswordService {
    private final UserRepository users;
    private final PasswordResetTokenRepository resets;
    private final RefreshSessionRepository sessions;
    private final PasswordEncoder encoder;
    private final JavaMailSender mail;
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // Sends a short-lived reset link without disclosing account existence.
    @Transactional
    public void requestReset(String email) {
        var account = users.findByEmail(email.trim().toLowerCase(Locale.ROOT));
        if (account.isEmpty() || !Boolean.TRUE.equals(account.get().getIsActive())) return;
        String raw = TokenDigests.randomToken();
        var token = new PasswordResetToken();
        token.setTokenHash(TokenDigests.hash(raw));
        token.setUser(account.get());
        token.setExpiresAt(Instant.now().plusSeconds(900));
        resets.deleteByUser_Id(account.get().getId());
        resets.saveAndFlush(token);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(account.get().getEmail());
        message.setSubject("Reset your password");
        message.setText("Reset your password within 15 minutes: " + frontendUrl + "/reset-password?token=" + raw);
        try {
            mail.send(message);
        } catch (org.springframework.mail.MailException exception) {
            log.warn("Password reset email could not be delivered");
        }
    }

    // Changes credentials only after reauthentication and revokes existing sessions.
    @Transactional
    public void change(String username, String currentPassword, String password) {
        var user = users.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Account is unavailable"));
        if (!Boolean.TRUE.equals(user.getIsActive()) || user.getPassword() == null
                || !encoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException("Current password is incorrect");
        }
        if (encoder.matches(password, user.getPassword())) {
            throw new BusinessException("New password must differ from the current password");
        }
        user.setPassword(encoder.encode(password));
        user.setAuthVersion(user.getAuthVersion() + 1);
        users.save(user);
        sessions.revokeUser(user.getId());
        resets.deleteByUser_Id(user.getId());
    }
    // Consumes a valid reset token and revokes all existing account credentials.
    @Transactional
    public void reset(String raw, String password) {
        var token = resets.lockByHash(TokenDigests.hash(raw))
                .orElseThrow(() -> new BusinessException("Reset link is invalid or expired"));
        if (!token.getExpiresAt().isAfter(Instant.now()) || !Boolean.TRUE.equals(token.getUser().getIsActive())) {
            throw new BusinessException("Reset link is invalid or expired");
        }
        var user = token.getUser();
        user.setPassword(encoder.encode(password));
        user.setAuthVersion(user.getAuthVersion() + 1);
        users.save(user);
        sessions.revokeUser(user.getId());
        resets.deleteByUser_Id(user.getId());
    }
}

