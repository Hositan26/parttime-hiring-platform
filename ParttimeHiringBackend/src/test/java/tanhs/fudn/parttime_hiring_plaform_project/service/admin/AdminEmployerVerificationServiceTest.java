package tanhs.fudn.parttime_hiring_plaform_project.service.admin;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class AdminEmployerVerificationServiceTest {
    @Autowired AdminEmployerVerificationService service;

    // Queries pending applications without depending on development MySQL records.
    @Test
    void listsPendingApplications() {
        assertNotNull(service.getVerifications(VerificationStatus.PENDING, 0, 10).getContent());
    }
}
