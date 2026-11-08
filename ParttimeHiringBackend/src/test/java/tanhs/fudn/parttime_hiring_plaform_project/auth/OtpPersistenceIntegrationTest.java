package tanhs.fudn.parttime_hiring_plaform_project.auth;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.user.EmailVerificationOtpRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmailService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserEmailVerificationService;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class OtpPersistenceIntegrationTest {
    @Autowired UserEmailVerificationService service;
    @Autowired EmailVerificationOtpRepository challenges;
    @Autowired UserRepository users;
    @MockitoBean EmailService email;

    // Confirms and consumes a code while preventing cross-account reuse.
    @Test
    void confirmsAccountBoundChallengeOnce() {
        String address = UUID.randomUUID() + "@example.com";
        service.generateAndSendOtp(address, "admin");
        var code = ArgumentCaptor.forClass(String.class);
        verify(email).sendOtpEmail(eq(address), code.capture());
        assertEquals(6, code.getValue().length());
        var row = challenges.findAll().stream().filter(value -> address.equals(value.getEmail())).findFirst().orElseThrow();
        assertNotEquals(code.getValue(), row.getOtpCode());
        assertThrows(BusinessException.class, () -> service.confirmOtp(address, code.getValue(), "employer"));
        service.confirmOtp(address, code.getValue(), "admin");
        service.verifyOtp(address, code.getValue(), "admin");
        assertThrows(BusinessException.class, () -> service.verifyOtp(address, code.getValue(), "admin"));
    }

    // Commits failed attempts so repeated requests cannot bypass the attempt limit.
    @Test
    void persistsFailedAttemptsAcrossTransactions() {
        String address = UUID.randomUUID() + "@example.com";
        service.generateAndSendOtp(address, "admin");
        for (int attempt = 0; attempt < 5; attempt++) {
            assertThrows(BusinessException.class, () -> service.confirmOtp(address, "invalid", "admin"));
        }
        var row = challenges.findAll().stream().filter(value -> address.equals(value.getEmail())).findFirst().orElseThrow();
        assertEquals(5, row.getAttempts());
    }
}
