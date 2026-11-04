package tanhs.fudn.parttime_hiring_plaform_project.auth;
import java.util.Optional;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.PasswordResetToken;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.PasswordResetTokenRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RefreshSessionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.auth.PasswordServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class PasswordResetUnitTest {
    // Keeps unknown email requests indistinguishable without sending messages.
    @Test
    void ignoresUnknownEmail() {
        var users = mock(UserRepository.class);
        var mail = mock(JavaMailSender.class);
        var service = new PasswordServiceImpl(users, mock(PasswordResetTokenRepository.class),
                mock(RefreshSessionRepository.class), mock(PasswordEncoder.class), mail);
        service.requestReset("unknown@example.com");
        verifyNoInteractions(mail);
    }

    // Rejects expired tokens before changing passwords or sessions.
    @Test
    void rejectsExpiredToken() {
        var resets = mock(PasswordResetTokenRepository.class);
        var user = User.builder().id(1L).build();
        var token = new PasswordResetToken();
        token.setUser(user);
        token.setExpiresAt(Instant.now().minusSeconds(1));
        when(resets.lockByHash(anyString())).thenReturn(Optional.of(token));
        var users = mock(UserRepository.class);
        var service = new PasswordServiceImpl(users, resets, mock(RefreshSessionRepository.class),
                mock(PasswordEncoder.class), mock(JavaMailSender.class));
        assertThrows(BusinessException.class, () -> service.reset("expired", "NewPass123"));
        verify(users, never()).save(any());
    }
}
