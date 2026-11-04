package tanhs.fudn.parttime_hiring_plaform_project.auth;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.RefreshSession;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.UnauthorizedException;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RefreshSessionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.AuthCookieService;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;
import tanhs.fudn.parttime_hiring_plaform_project.security.TokenDigests;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.auth.AuthSessionServiceImpl;
import java.time.Instant;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class RefreshUnitTest {
    // Rejects unknown refresh credentials without minting access tokens.
    @Test
    void rejectsMissingOrUnknownCredentials() {
        var repository = mock(RefreshSessionRepository.class);
        var tokens = mock(JwtTokenProvider.class);
        var service = new AuthSessionServiceImpl(repository, tokens, mock(tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RevokedAccessTokenRepository.class), new AuthCookieService(false));
        assertThrows(UnauthorizedException.class, () -> service.refresh(null, new MockHttpServletResponse()));
        when(repository.lockByHash(anyString())).thenReturn(Optional.empty());
        assertThrows(UnauthorizedException.class, () -> service.refresh("unknown", new MockHttpServletResponse()));
        verifyNoInteractions(tokens);
    }

    // Revokes the entire family when a consumed credential is replayed.
    @Test
    void revokesReplayedFamily() {
        var repository = mock(RefreshSessionRepository.class);
        var session = new RefreshSession();
        session.setConsumed(true);
        session.setFamily("family");
        when(repository.lockByHash(TokenDigests.hash("old"))).thenReturn(Optional.of(session));
        var service = new AuthSessionServiceImpl(repository, mock(JwtTokenProvider.class), mock(tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RevokedAccessTokenRepository.class), new AuthCookieService(false));
        assertThrows(UnauthorizedException.class, () -> service.refresh("old", new MockHttpServletResponse()));
        verify(repository).revokeFamily("family");
    }

    // Consumes the current credential and stores a different hashed successor.
    @Test
    void rotatesValidCredential() {
        var repository = mock(RefreshSessionRepository.class);
        var session = new RefreshSession();
        session.setUser(User.builder().username("user").build());
        session.setFamily("family");
        session.setExpiresAt(Instant.now().plusSeconds(600));
        when(repository.lockByHash(anyString())).thenReturn(Optional.of(session));
        var tokens = mock(JwtTokenProvider.class);
        when(tokens.generateTokenFromUsername("user")).thenReturn("access");
        var service = new AuthSessionServiceImpl(repository, tokens, mock(tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RevokedAccessTokenRepository.class), new AuthCookieService(false));
        var response = new MockHttpServletResponse();
        service.refresh("valid", response);
        assertTrue(session.isConsumed());
        verify(repository, times(2)).save(any());
        assertEquals(2, response.getHeaders("Set-Cookie").size());
    }
}

