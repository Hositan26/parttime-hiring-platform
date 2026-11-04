package tanhs.fudn.parttime_hiring_plaform_project.auth;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.EmailVerificationOtp;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.user.EmailVerificationOtpRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmailService;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.user.UserEmailVerificationServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class OtpUnitTest {
    // Persists incorrect attempts and refuses consumed verification codes.
    @Test
    void rejectsWrongAndConsumedCodes() {
        var users = mock(UserRepository.class);
        var owner = User.builder().id(7L).build();
        when(users.findByUsername("user")).thenReturn(Optional.of(owner));
        var repository = mock(EmailVerificationOtpRepository.class);
        var challenge = new EmailVerificationOtp();
        challenge.setOwner(owner);
        challenge.setEmail("u@example.com");
        challenge.setOtpCode("not-the-correct-hash");
        challenge.setExpirationTime(LocalDateTime.now().plusMinutes(5));
        when(repository.findTopByOwner_IdAndEmailOrderByExpirationTimeDesc(7L, "u@example.com"))
                .thenReturn(Optional.of(challenge));
        var service = new UserEmailVerificationServiceImpl(repository, mock(EmailService.class), users);
        assertThrows(BusinessException.class, () -> service.confirmOtp("u@example.com", "000000", "user"));
        assertEquals(1, challenge.getAttempts());
        challenge.setUsed(true);
        assertThrows(BusinessException.class, () -> service.confirmOtp("u@example.com", "000000", "user"));
        assertEquals(1, challenge.getAttempts());
    }

    // Prevents submission from bypassing the separate email confirmation step.
    @Test
    void requiresConfirmationBeforeSubmission() {
        var users = mock(UserRepository.class);
        when(users.findByUsername("user")).thenReturn(Optional.of(User.builder().id(7L).build()));
        var repository = mock(EmailVerificationOtpRepository.class);
        when(repository.findTopByOwner_IdAndEmailOrderByExpirationTimeDesc(anyLong(), anyString()))
                .thenReturn(Optional.of(new EmailVerificationOtp()));
        var service = new UserEmailVerificationServiceImpl(repository, mock(EmailService.class), users);
        assertThrows(BusinessException.class, () -> service.verifyOtp("u@example.com", "000000", "user"));
    }
}
