package tanhs.fudn.parttime_hiring_plaform_project.auth;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;
import static org.junit.jupiter.api.Assertions.*;

class JwtUnitTest {
    private final String secret = "x".repeat(64);

    // Accepts signed tokens only for the configured issuer and purpose.
    @Test
    void validatesSignedClaims() {
        var provider = new JwtTokenProvider(secret, 60, "test");
        String token = provider.generateTokenForUser(tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User.builder().id(7L).username("candidate").build());
        assertTrue(provider.validateToken(token));
        assertEquals("7", provider.getSubject(token));
        assertNotNull(provider.parseClaims(token).getId());
        assertFalse(new JwtTokenProvider(secret, 60, "another").validateToken(token));
        assertFalse(new JwtTokenProvider("y".repeat(64), 60, "test").validateToken(token));
        assertFalse(provider.validateToken(token + "tampered"));
        assertFalse(provider.validateToken("malformed"));
    }

    // Fails startup when signing configuration cannot protect access tokens.
    @Test
    void rejectsWeakConfiguration() {
        assertThrows(IllegalArgumentException.class, () -> new JwtTokenProvider("short", 60, "test"));
        assertThrows(IllegalArgumentException.class, () -> new JwtTokenProvider(secret, 0, "test"));
    }
}

