package tanhs.fudn.parttime_hiring_plaform_project.auth;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RefreshSessionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RevokedAccessTokenRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.AuthCookieService;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.auth.AuthSessionServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RevocationUnitTest {
    // Persists access revocation and clears cookies even without refresh credentials.
    @Test
    void revokesAccessOnLogout() {
        var repository = mock(RevokedAccessTokenRepository.class);
        var tokens = new JwtTokenProvider("x".repeat(64), 60, "test");
        String token = tokens.generateTokenFromUsername("candidate");
        var response = new MockHttpServletResponse();
        var service = new AuthSessionServiceImpl(mock(RefreshSessionRepository.class), tokens,
                repository, new AuthCookieService(false));
        service.logout(null, token, response);
        verify(repository).save(org.mockito.ArgumentMatchers.argThat(value ->
                tokens.parseClaims(token).getId().equals(value.getId())));
        assertEquals(2, response.getHeaders("Set-Cookie").size());
    }
}
