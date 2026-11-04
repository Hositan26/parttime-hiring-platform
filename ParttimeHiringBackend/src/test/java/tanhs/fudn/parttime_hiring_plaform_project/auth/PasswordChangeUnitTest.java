package tanhs.fudn.parttime_hiring_plaform_project.auth;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.PasswordResetTokenRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RefreshSessionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.auth.PasswordServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PasswordChangeUnitTest {
    // Rejects incorrect current passwords without changing account data.
    @Test
    void requiresCurrentPassword() {
        var users = mock(UserRepository.class);
        var user = User.builder().id(1L).password("hash").build();
        when(users.findByUsername("candidate")).thenReturn(Optional.of(user));
        var service = new PasswordServiceImpl(users, mock(PasswordResetTokenRepository.class),
                mock(RefreshSessionRepository.class), mock(PasswordEncoder.class), mock(JavaMailSender.class));
        assertThrows(BusinessException.class, () -> service.change("candidate", "wrong", "NewPass123"));
        verify(users, never()).save(user);
    }

    // Increments credential version and invalidates all refresh sessions after change.
    @Test
    void revokesOldSessions() {
        var users = mock(UserRepository.class);
        var user = User.builder().id(1L).password("hash").build();
        when(users.findByUsername("candidate")).thenReturn(Optional.of(user));
        var encoder = mock(PasswordEncoder.class);
        when(encoder.matches("old", "hash")).thenReturn(true);
        when(encoder.encode("NewPass123")).thenReturn("new-hash");
        var sessions = mock(RefreshSessionRepository.class);
        var service = new PasswordServiceImpl(users, mock(PasswordResetTokenRepository.class),
                sessions, encoder, mock(JavaMailSender.class));
        service.change("candidate", "old", "NewPass123");
        assertEquals(1, user.getAuthVersion());
        assertEquals("new-hash", user.getPassword());
        verify(sessions).revokeUser(1L);
    }
}
