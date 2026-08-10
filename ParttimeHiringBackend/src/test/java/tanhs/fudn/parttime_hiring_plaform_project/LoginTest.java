package tanhs.fudn.parttime_hiring_plaform_project;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

@SpringBootTest
public class LoginTest {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserDetailsService userDetailsService;
    @Test
    public void testLogin() {
        try {
            System.out.println("Loading user by username...");
            UserDetails user = userDetailsService.loadUserByUsername("admin");
            System.out.println("User loaded: " + user.getUsername() + ", enabled: " + user.isEnabled() + ", password: " + user.getPassword());
            System.out.println("Authenticating...");
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken("admin", "admin")
            );
            System.out.println("Login Success: " + auth.getName());
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Exception: " + e.getClass().getName() + " - " + e.getMessage());
        }
    }
}
