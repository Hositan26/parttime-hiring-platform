package tanhs.fudn.parttime_hiring_plaform_project;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class LoginTest {
    @Autowired AuthenticationManager authenticationManager;

    // Authenticates the isolated development administrator without logging credentials.
    @Test
    void authenticatesAdministrator() {
        var authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken("admin", "admin"));
        assertTrue(authentication.isAuthenticated());
        assertEquals("admin", authentication.getName());
    }
}
