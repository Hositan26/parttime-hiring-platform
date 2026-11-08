package tanhs.fudn.parttime_hiring_plaform_project;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class DebugDataTest {
    @Autowired EmploymentRecordRepository records;
    @Autowired UserRepository users;

    // Queries employment data without dumping personal account information.
    @Test
    void queriesEmploymentRecords() {
        assertNotNull(records.findByEmployerIdWithDetails(1));
    }

    // Confirms isolated test accounts exist without exposing their password hashes.
    @Test
    void initializesDevelopmentAccounts() {
        assertTrue(users.existsByUsername("admin"));
        assertTrue(users.existsByUsername("employer"));
    }
}
