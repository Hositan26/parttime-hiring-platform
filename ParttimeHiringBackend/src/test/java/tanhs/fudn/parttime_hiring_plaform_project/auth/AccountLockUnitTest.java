package tanhs.fudn.parttime_hiring_plaform_project.auth;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RevokedAccessTokenRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.CustomUserDetailsService;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtAuthenticationFilter;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AccountLockUnitTest {
    // Removes authentication between independent security scenarios.
    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    // Rejects a previously valid access cookie after an account is disabled.
    @Test
    void blocksDisabledAccount() throws Exception {
        var tokens = new JwtTokenProvider("x".repeat(64), 60, "test");
        var users = mock(UserRepository.class);
        when(users.findById(7L)).thenReturn(Optional.of(
                User.builder().username("candidate").isActive(false).build()));
        var details = mock(CustomUserDetailsService.class);
        var filter = new JwtAuthenticationFilter(tokens, details, users, mock(RevokedAccessTokenRepository.class));
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("access_token", tokens.generateTokenForUser(tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User.builder().id(7L).username("candidate").build())));
        filter.doFilter(request, new MockHttpServletResponse(), mock(FilterChain.class));
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(details);
    }
}
