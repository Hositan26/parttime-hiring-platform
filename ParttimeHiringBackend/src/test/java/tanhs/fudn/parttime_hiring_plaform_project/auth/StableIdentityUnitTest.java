package tanhs.fudn.parttime_hiring_plaform_project.auth;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;
import static org.junit.jupiter.api.Assertions.*;

class StableIdentityUnitTest {
    // Keeps signed account identity valid when the display username changes.
    @Test
    void usernameChangesDoNotInvalidateIdentity() {
        var tokens = new JwtTokenProvider("x".repeat(64), 60, "test");
        var user = User.builder().id(7L).username("old_name").build();
        String token = tokens.generateTokenForUser(user);
        user.setUsername("new_name");
        assertTrue(tokens.validateToken(token));
        assertEquals("7", tokens.getSubject(token));
        assertFalse(tokens.parseClaims(token).containsValue("old_name"));
    }
}
