package tanhs.fudn.parttime_hiring_plaform_project.auth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.OAuth2AuthenticationSuccessHandler;
import tanhs.fudn.parttime_hiring_plaform_project.service.auth.AuthSessionService;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OAuthSuccessUnitTest {
    // Issues a browser session and redirects to the configured frontend without tokens.
    @Test
    void redirectsWithoutLeakingTokens() throws Exception {
        var user = User.builder().id(7L).username("google_user").build();
        var users = mock(UserRepository.class);
        when(users.findByUsername("google_user")).thenReturn(Optional.of(user));
        var sessions = mock(AuthSessionService.class);
        var handler = new OAuth2AuthenticationSuccessHandler(sessions, users);
        ReflectionTestUtils.setField(handler, "frontendUrl", "https://frontend.example");
        var principal = new DefaultOAuth2User(List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("localUsername", "google_user"), "localUsername");
        var authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        var response = new MockHttpServletResponse();
        handler.onAuthenticationSuccess(new MockHttpServletRequest(), response, authentication);
        verify(sessions).start(user, response);
        assertEquals("https://frontend.example/oauth2/redirect", response.getRedirectedUrl());
    }
}
